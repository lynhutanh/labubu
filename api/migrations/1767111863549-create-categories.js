'use strict';

const { COLLECTION, DB } = require('./lib/index.cjs');

const categories = [
  {
    name: 'Labubu Blind Box',
    status: 'active',
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Labubu Figure',
    status: 'active',
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Labubu Plush & Doll',
    status: 'active',
    sortOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Phụ kiện Labubu',
    status: 'active',
    sortOrder: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Labubu Pre-order',
    status: 'active',
    sortOrder: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

module.exports.up = async function up() {
  const existingCategories = await DB.collection(COLLECTION.CATEGORIES).countDocuments();

  if (existingCategories > 0) {
    console.log('Categories already exist, skipping...');
    return;
  }

  await DB.collection(COLLECTION.CATEGORIES).insertMany(categories);
  console.log(`✅ Created ${categories.length} Labubu categories`);
};

module.exports.down = async function down() {
  const names = categories.map(c => c.name);
  await DB.collection(COLLECTION.CATEGORIES).deleteMany({ name: { $in: names } });
  console.log('✅ Deleted Labubu categories');
};
