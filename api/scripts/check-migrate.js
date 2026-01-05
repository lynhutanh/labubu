const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');
const MIGRATIONS_COLLECTION = 'migrations';
const DB_URL = process.env.MONGO_URI || 'mongodb://localhost:27017/cosmetics';

async function migrate() {
  console.log('Starting migration...');
  await mongoose.connect(DB_URL);
  const db = mongoose.connection;
  const collection = db.collection(MIGRATIONS_COLLECTION);

  const state = await collection.findOne({});
  const appliedMigrations = Array.isArray(state?.migrations) ? state.migrations : [];
  const appliedTitles = new Set(appliedMigrations.map((m) => m.title));

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.js') && /^\d{13}-/.test(file))
    .sort();

  const newMigrations = [];

  for (const file of files) {
    if (appliedTitles.has(file)) {
      console.log(`[SKIP] ${file}`);
      continue;
    }

    const migration = require(path.join(MIGRATIONS_DIR, file));
    if (typeof migration.up !== 'function') {
      console.warn(`[SKIP] ${file} (missing 'up')`);
      continue;
    }

    console.log(`[RUN] ${file}`);
    try {
      await migration.up();
      newMigrations.push({
        title: file,
        description: null,
        timestamp: parseInt(file.split('-')[0], 10)
      });
      console.log(`[DONE] ${file}`);
    } catch (err) {
      console.error(`[ERROR] ${file}:`, err);
      break;
    }
  }

  if (newMigrations.length > 0) {
    const last = newMigrations.at(-1).title;

    const mergedMigrations = [
      ...appliedMigrations.filter((m) => typeof m.title === 'string'),
      ...newMigrations
    ];

    const uniqueMigrations = Array.from(new Map(mergedMigrations.map((m) => [m.title, m])).values());

    await collection.updateOne(
      {},
      {
        $set: {
          lastRun: last,
          migrations: uniqueMigrations
        }
      },
      { upsert: true }
    );
  }

  await mongoose.disconnect();
  console.log('Migrations complete.');
}

module.exports = migrate;

if (require.main === module) {
  migrate().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}

