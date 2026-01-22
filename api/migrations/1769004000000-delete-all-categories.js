'use strict';

const { COLLECTION, DB } = require('./lib/index.cjs');

module.exports.up = async function up() {
  const collection = DB.collection(COLLECTION.CATEGORIES);
  
  const result = await collection.deleteMany({});
  
  console.log(`✅ Deleted ${result.deletedCount} categories from database`);
};

module.exports.down = async function down() {
  console.log('⚠️  Cannot restore deleted categories. Please re-run create-categories migration if needed.');
};
