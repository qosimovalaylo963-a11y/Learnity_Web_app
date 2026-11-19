#!/usr/bin/env node
/**
 * LEARNITY — The Lively Teaching Project
 * Production Full-Stack Server (Node.js + Persistent DB + Automatic Flat/Nested Layout Detection)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

function requireFlexible(nestedRel, flatRel) {
    try {
        return require(nestedRel);
    } catch (_) {
        return require(flatRel);
    }
}

const { SqliteDatabase } = requireFlexible('./db/database', './database');
const { runMigrations } = requireFlexible('./db/migrations', './migrations');
const { seedDatabase } = requireFlexible('./db/seed', './seed');
const { handleApiRequest } = requireFlexible('./routes/api', './api');

// Load .env if present
function loadDotEnv(envPath) {
    if (!fs.existsSync(envPath)) return;
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eq = trimmed.indexOf('=');
        if (eq > 0) {
            const key = trimmed.slice(0, eq).trim();
            const val = trimmed
                .slice(eq + 1)
                .trim()
                .replace(/^['"]|['"]$/g, '');
            if (process.env[key] === undefined) {
                process.env[key] = val;
            }
        }
    });
}

const isNested = path.basename(__dirname) === 'src';
const defaultRootDir = isNested ? path.join(__dirname, '..') : __dirname;
loadDotEnv(path.join(defaultRootDir, '.env'));

const MIME_MAP = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.txt': 'text/plain; charset=utf-8',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

async function createLearnityServer(options = {}) {
    const rootDir = options.rootDir || defaultRootDir;
    const dataDir = options.dataDir || process.env.DATA_DIR || path.join(rootDir, 'data');
    const dbPath = options.dbPath || process.env.DB_PATH || path.join(dataDir, 'learnity.sqlite');
    const uploadDir = options.uploadDir || process.env.UPLOAD_DIR || path.join(dataDir, 'uploads');
    const backupDir = options.backupDir || path.join(dataDir, 'backups');
    const publicDir =
        options.publicDir ||
        (fs.existsSync(path.join(rootDir, 'public', 'index.html')) ? path.join(rootDir, 'public') : rootDir);

    fs.mkdirSync(uploadDir, { recursive: true });
    fs.mkdirSync(backupDir, { recursive: true });

    const db = new SqliteDatabase(dbPath);
    await runMigrations(db);
    await seedDatabase(db);

    const production = process.env.NODE_ENV === 'production';
    const { resolveSessionUser, hasSubjectPermission } = requireFlexible(
        './middleware/security',
        './security',
    );
    const indexFile = path.join(publicDir, 'index.html');
    const rawPage = fs.readFileSync(indexFile, 'utf8');
    const csp = rawPage.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i)[1];
    const shell = rawPage
        .replace(
            /<meta\s+name="learnity-runtime"\s+content="preview"\s*\/?>/i,
            '<base href="/"><meta name="learnity-runtime" content="' +
                (production ? 'server' : 'development') +
                '">',
        )
        .replace(/<script[^>]+src="assets\/demo.js"[^>]*><\/script>/, '');
    async function respond(req, res) {
        res.setHeader('Content-Security-Policy', csp + "; frame-ancestors 'none'");
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'no-referrer');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        res.setHeader('Cache-Control', 'no-store');
        if (production) res.setHeader('Strict-Transport-Security', 'max-age=31536000');
        if (!req.url.startsWith('/') || req.url.startsWith('//') || req.url.length > 4096) {
            res.writeHead(400);
            return res.end('Invalid request address');
        }
        let pathname;
        try {
            pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
        } catch {
            res.writeHead(400);
            return res.end('Invalid request address');
        }
        if (pathname.startsWith('/api/')) return handleApiRequest(req, res, { db, uploadDir, backupDir });
        if (!['GET', 'HEAD'].includes(req.method)) {
            res.writeHead(405, { Allow: 'GET, HEAD' });
            return res.end();
        }
        function file(filename, contentType, cache = 'no-cache') {
            if (!fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
                res.writeHead(404);
                return res.end('File not found');
            }
            res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': cache });
            if (req.method === 'HEAD') return res.end();
            fs.createReadStream(filename)
                .on('error', () => res.destroy())
                .pipe(res);
        }
        if (pathname.startsWith('/uploads/')) {
            const name = pathname.slice(9);
            if (!/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(name)) {
                res.writeHead(404);
                return res.end();
            }
            const ext = path.extname(name).toLowerCase();
            const resource = await db.get(
                'SELECT r.subject_id,r.author_user_id,r.moderation_status FROM resource_files f JOIN resources r ON f.resource_id=r.id WHERE f.stored_name=?',
                [name],
            );
            if (resource) {
                const u = await resolveSessionUser(db, req);
                if (
                    !hasSubjectPermission(u, resource.subject_id, 'can_view_materials') ||
                    (resource.moderation_status !== 'Published' &&
                        u.role !== 'OWNER' &&
                        u.id !== resource.author_user_id &&
                        !hasSubjectPermission(u, resource.subject_id, 'can_moderate'))
                ) {
                    res.writeHead(403);
                    return res.end('Subject access required');
                }
                res.setHeader('Content-Disposition', 'attachment; filename="' + name + '"');
            } else if (
                name.startsWith('resource-') ||
                !['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)
            ) {
                res.writeHead(404);
                return res.end();
            }
            res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox; frame-ancestors 'none'");
            return file(
                path.join(uploadDir, name),
                MIME_MAP[ext] || 'application/octet-stream',
                'private, no-store',
            );
        }
        if (pathname.startsWith('/assets/')) {
            const relative = pathname.slice(8);
            if (
                !/^(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.(?:js|css|svg|webp|woff2|ttf|txt)$/i.test(relative) ||
                relative === 'demo.js'
            ) {
                res.writeHead(404);
                return res.end();
            }
            return file(
                path.join(publicDir, 'assets', relative),
                MIME_MAP[path.extname(relative)],
                'public, max-age=0, must-revalidate',
            );
        }
        if (
            /^\/(?:index\.html|(?:owner|staff|portal|apply|join)\/?|subjects\/[a-z0-9-]{1,96}\/?)?$/.test(
                pathname,
            )
        ) {
            res.writeHead(200, { 'Content-Type': MIME_MAP['.html'] });
            return res.end(req.method === 'HEAD' ? '' : shell);
        }
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Page not found');
    }
    const server = http.createServer((req, res) => {
        respond(req, res).catch((error) => {
            console.error('Request failed:', error.message);
            if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Request could not be completed');
        });
    });
    return { server, db, dbPath, uploadDir, backupDir };
}

function start() {
    const port = parseInt(process.env.PORT || '3000', 10);
    createLearnityServer()
        .then(({ server, dbPath }) => {
            const host =
                process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
            server.listen(port, host, () => {
                console.log(`=========================================================`);
                console.log('  Learnity · The Lively Teaching Project');
                console.log(`  Server listening on: http://${host}:${port}`);
                console.log(`  Persistent Database: ${dbPath}`);
                console.log(`=========================================================`);
            });
        })
        .catch((err) => {
            console.error('Failed to start Learnity server:', err);
            process.exit(1);
        });
}

if (require.main === module) start();
module.exports = { createLearnityServer, defaultRootDir, start };
