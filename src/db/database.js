'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const readline = require('node:readline');
let DatabaseSync;
try {
    ({ DatabaseSync } = require('node:sqlite'));
} catch {
    /* Node 18 and 20 use the bundled SQLite worker. */
}

class PythonConnection {
    constructor(filename) {
        this.next = 0;
        this.pending = new Map();
        this.child = spawn(
            process.env.PYTHON || 'python3',
            ['-u', path.join(__dirname, 'sqlite_worker.py'), filename],
            { stdio: ['pipe', 'pipe', 'inherit'] },
        );
        const fail = (err) => {
            this.failure = err;
            for (const { reject } of this.pending.values()) reject(err);
            this.pending.clear();
        };
        this.child.on('error', fail);
        this.child.stdin.on('error', fail);
        this.child.on('exit', () => fail(new Error('SQLite worker closed.')));
        readline.createInterface({ input: this.child.stdout }).on('line', (raw) => {
            try {
                const message = JSON.parse(raw);
                if (!message || !Number.isSafeInteger(message.id) || typeof message.ok !== 'boolean')
                    throw new Error('Invalid SQLite worker response.');
                const operation = this.pending.get(message.id);
                if (!operation) return;
                this.pending.delete(message.id);
                if (message.ok) operation.resolve(message.result);
                else operation.reject(new Error(message.error || 'SQLite operation failed.'));
            } catch (error) {
                fail(error);
            }
        });
    }
    call(action, args = {}) {
        if (this.failure) return Promise.reject(this.failure);
        const id = ++this.next;
        return new Promise((resolve, reject) => {
            this.pending.set(id, { resolve, reject });
            this.child.stdin.write(JSON.stringify({ id, action, ...args }) + '\n');
        });
    }
}

const tableOrder = [
    'roles',
    'users',
    'subjects',
    'user_subjects',
    'applications',
    'invitation_codes',
    'invitation_permissions',
    'resources',
    'resource_files',
    'announcements',
    'staff_profiles',
    'media_assets',
    'activity_logs',
    'notifications',
    'user_sessions',
    'site_content',
    'schema_migrations',
];
function header(filename) {
    if (!fs.existsSync(filename)) return '';
    const fd = fs.openSync(filename, 'r');
    try {
        const data = Buffer.alloc(32);
        fs.readSync(fd, data);
        return data.toString().trimStart();
    } finally {
        fs.closeSync(fd);
    }
}

class SqliteDatabase {
    constructor(filename) {
        this.dbPath = path.resolve(filename);
        fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
        const signature = header(this.dbPath);
        const legacy = signature.startsWith('{') || (!signature && fs.existsSync(this.dbPath + '.json'));
        if (legacy) {
            this.legacyPath = fs.existsSync(this.dbPath + '.json') ? this.dbPath + '.json' : this.dbPath;
            this.dbPath += '.v4.sqlite';
        }
        if (DatabaseSync && process.env.USE_PYTHON_SQLITE !== 'true') {
            this.conn = new DatabaseSync(this.dbPath);
            this.conn.exec('PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
        } else this.worker = new PythonConnection(this.dbPath);
    }
    exec(sql) {
        return this.worker ? this.worker.call('exec', { sql }) : this.conn.exec(sql);
    }
    run(sql, params = []) {
        if (this.worker) return this.worker.call('run', { sql, params });
        const result = this.conn.prepare(sql).run(...params);
        return { changes: Number(result.changes), lastInsertRowid: Number(result.lastInsertRowid) };
    }
    get(sql, params = []) {
        return this.worker ? this.worker.call('get', { sql, params }) : this.conn.prepare(sql).get(...params);
    }
    all(sql, params = []) {
        return this.worker ? this.worker.call('all', { sql, params }) : this.conn.prepare(sql).all(...params);
    }
    transaction(statements) {
        if (this.worker) return this.worker.call('transaction', { statements });
        this.conn.exec('BEGIN IMMEDIATE');
        try {
            const results = statements.map((st) => {
                const result = this[st.type || 'run'](st.sql, st.params || []);
                if (st.requireChange && !result.changes) throw new Error('The record has already changed.');
                return result;
            });
            this.conn.exec('COMMIT');
            return results;
        } catch (error) {
            this.conn.exec('ROLLBACK');
            throw error;
        }
    }
    async importLegacy() {
        if (
            !this.legacyPath ||
            (await this.get("SELECT 1 FROM schema_migrations WHERE version='v3-json-import'"))
        )
            return;
        let source;
        try {
            source = JSON.parse(fs.readFileSync(this.legacyPath, 'utf8'));
            if (
                !source?.tables ||
                !Array.isArray(source.tables.users) ||
                !Array.isArray(source.tables.subjects) ||
                !source._seq
            )
                throw new Error();
        } catch {
            throw new Error(
                'The existing Learnity JSON database could not be read. Restore a valid copy before starting.',
            );
        }
        const statements = [{ sql: 'PRAGMA defer_foreign_keys=ON' }];
        for (const table of tableOrder) {
            const rows = source.tables[table] ?? [];
            if (!Array.isArray(rows)) throw new Error('Invalid legacy table: ' + table);
            const names = (await this.all('PRAGMA table_info(' + table + ')')).map((c) => c.name);
            for (const row of rows) {
                if (!row || typeof row !== 'object' || Array.isArray(row))
                    throw new Error('Invalid legacy row in ' + table);
                const keys = names.filter((k) => row[k] != null);
                if (!keys.length) throw new Error('Empty legacy row in ' + table);
                const params = keys.map((k) => (typeof row[k] === 'boolean' ? Number(row[k]) : row[k]));
                statements.push({
                    sql:
                        'INSERT INTO ' +
                        table +
                        ' (' +
                        keys.join(',') +
                        ') VALUES (' +
                        keys.map(() => '?').join(',') +
                        ')',
                    params,
                });
            }
        }
        statements.push({ sql: "INSERT INTO schema_migrations(version) VALUES ('v3-json-import')" });
        await this.transaction(statements);
    }
    async backup(targetPath) {
        if (this.worker) return this.worker.call('backup', { targetPath });
        const { backup } = require('node:sqlite');
        if (backup) await backup(this.conn, targetPath);
        else this.conn.prepare('VACUUM INTO ?').run(targetPath);
        return { backupPath: targetPath, timestamp: Date.now() };
    }
    close() {
        return this.worker ? this.worker.call('close') : this.conn.close();
    }
}
module.exports = { SqliteDatabase };
