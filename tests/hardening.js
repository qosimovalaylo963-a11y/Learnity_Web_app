'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { createLearnityServer } = require('../src/server');
const { validateBody } = require('../src/middleware/input');

async function check() {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'learnity-hardening-'));
    Object.assign(process.env, {
        NODE_ENV: 'production',
        OWNER_EMAIL: 'owner@example.test',
        OWNER_PASSWORD: require('node:crypto').randomBytes(30).toString('base64url'),
        SMTP_HOST: '',
        RESEND_API_KEY: '',
    });
    const { server, db } = await createLearnityServer({
        dataDir: tmp,
        dbPath: path.join(tmp, 'test.sqlite'),
        uploadDir: path.join(tmp, 'uploads'),
        backupDir: path.join(tmp, 'backups'),
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const root = 'http://127.0.0.1:' + server.address().port;
    const json = (method, data, headers = {}) => ({
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(data),
    });
    try {
        const doc = await fetch(root + '/subjects/biology'),
            markup = await doc.text();
        assert.equal(doc.status, 200);
        assert.equal(doc.headers.get('X-Content-Type-Options'), 'nosniff');
        assert.equal(doc.headers.get('Referrer-Policy'), 'no-referrer');
        assert.match(doc.headers.get('Content-Security-Policy'), /script-src-attr 'none'/);
        assert.match(doc.headers.get('Content-Security-Policy'), /frame-ancestors 'none'/);
        assert(!doc.headers.get('Content-Security-Policy').includes('unsafe-inline'));
        assert(!markup.includes('src="assets/demo.js"'));
        assert(!/\son(?:click|change|submit|blur|pointerdown|input)=/i.test(markup));
        for (const url of ['/assets/demo.js', '/.env', '/src/server.js', '/data/learnity.sqlite'])
            assert.equal((await fetch(root + url)).status, 404);
        assert.equal(
            (await fetch(root + '/assets/app.js')).headers.get('Content-Type'),
            'application/javascript; charset=utf-8',
        );
        console.log('PASS  Production shell, CSP, MIME types and static asset boundary');
        const disabled = await fetch(
            root + '/api/invitations/verify',
            json('POST', { code: 'LRN-STEM-2026-JOIN' }),
        );
        assert.equal(disabled.status, 400);
        const login = await fetch(
            root + '/api/auth/login',
            json(
                'POST',
                { email: process.env.OWNER_EMAIL, password: process.env.OWNER_PASSWORD },
                { 'X-Learnity-Client': 'browser' },
            ),
        );
        assert.equal(login.status, 200);
        const auth = await login.json();
        assert.equal(auth.sessionToken, undefined);
        const cookie = login.headers.get('set-cookie');
        assert.match(cookie, /HttpOnly/);
        assert.match(cookie, /; Secure/);
        const own = { Cookie: cookie.split(';')[0], 'X-CSRF-Token': auth.csrfToken };
        assert.equal(
            (await fetch(root + '/api/owner/backup', json('POST', {}, { Cookie: own.Cookie }))).status,
            403,
        );
        assert.equal((await fetch(root + '/api/owner/backup', json('POST', {}, own))).status, 200);
        console.log('PASS  Production credentials, browser session and CSRF enforcement');
        assert.throws(() => validateBody({ full_name: { bad: 'shape' } }));
        assert.throws(() => validateBody({ full_name: 'A'.repeat(161) }));
        assert.throws(() => validateBody({ external_url: 'urn:example:resource' }));
        assert.throws(() => validateBody({ lessonCards: [null] }));
        assert.equal(
            validateBody({ full_name: 'A & B', title: '5 < 9', external_url: 'https://example.org/' }).title,
            '5 < 9',
        );
        assert.equal(
            (await fetch(root + '/api/owner/applications?format=unsupported', { headers: own })).status,
            400,
        );
        console.log('PASS  Field lengths, typed data, URLs and filter parameters');
        const subjects = await (await fetch(root + '/api/subjects')).json();
        const sid = subjects.subjects[0].id;
        const invitation = await (
            await fetch(
                root + '/api/invitations',
                json(
                    'POST',
                    {
                        target_role: 'MEMBER',
                        max_uses: 1,
                        subject_ids: [sid],
                        permissions: { can_access_subject: true, can_view_materials: true },
                    },
                    own,
                ),
            )
        ).json();
        const code = invitation.invitationCard.plainCode;
        const registrations = await Promise.all(
            ['a', 'b'].map((label) =>
                fetch(
                    root + '/api/auth/register-invite',
                    json('POST', {
                        full_name: 'Test Learner',
                        email: label + '@example.test',
                        password: 'LocalTestPass8!',
                        invitation_code: code,
                    }),
                ),
            ),
        );
        assert.equal(registrations.filter((r) => r.status === 201).length, 1);
        const joined = registrations.find((r) => r.status === 201);
        const member = { Cookie: joined.headers.get('set-cookie').split(';')[0] };
        const documentForm = new FormData();
        for (const [key, value] of Object.entries({
            subject_id: sid,
            title: 'Handout',
            resource_type: 'pdf',
            description: 'Workshop notes',
        }))
            documentForm.set(key, String(value));
        documentForm.set(
            'file',
            new Blob([Buffer.from('%PDF-1.7\n%%EOF')], { type: 'application/pdf' }),
            'handout.pdf',
        );
        const upload = await fetch(root + '/api/resources', {
            method: 'POST',
            headers: own,
            body: documentForm,
        });
        assert.equal(upload.status, 201);
        const material = await db.get("SELECT file_url FROM resources WHERE title='Handout'");
        assert.equal((await fetch(root + material.file_url)).status, 403);
        const download = await fetch(root + material.file_url, { headers: member });
        assert.equal(download.status, 200);
        assert.match(download.headers.get('content-disposition'), /attachment/);
        console.log('PASS  Last-use invitation race and authorized file download');
        const backup = fs.readdirSync(path.join(tmp, 'backups')).find((n) => n.endsWith('.sqlite'));
        assert.equal(
            fs
                .readFileSync(path.join(tmp, 'backups', backup))
                .subarray(0, 15)
                .toString(),
            'SQLite format 3',
        );
        console.log('PASS  Restorable SQLite backup format');
    } finally {
        await new Promise((resolve) => server.close(resolve));
        await db.close();
        fs.rmSync(tmp, { recursive: true, force: true });
    }
}
check().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
