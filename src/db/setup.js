'use strict';
const path = require('node:path');
const { defaultRootDir } = require('../server');
const { SqliteDatabase } = require('./database');
const { runMigrations } = require('./migrations');
const { seedDatabase } = require('./seed');
async function setup() {
    const db = new SqliteDatabase(
        process.env.DB_PATH ||
            path.join(process.env.DATA_DIR || path.join(defaultRootDir, 'data'), 'learnity.sqlite'),
    );
    try {
        await runMigrations(db);
        if (process.argv[2] === 'seed') await seedDatabase(db);
    } finally {
        await db.close();
    }
}
setup().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
