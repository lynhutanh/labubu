'use strict';

const { COLLECTION, DB } = require('./lib/index.cjs');

const categories = [
  {
    name: 'Labubu Blind Box',
    slug: 'labubu-blind-box',
    status: 'active',
    sortOrder: 1,
  },
  {
    name: 'Labubu Figure',
    slug: 'labubu-figure',
    status: 'active',
    sortOrder: 2,
  },
  {
    name: 'Labubu Plush & Doll',
    slug: 'labubu-plush-doll',
    status: 'active',
    sortOrder: 3,
  },
  {
    name: 'Phụ kiện Labubu',
    slug: 'phu-kien-labubu',
    status: 'active',
    sortOrder: 4,
  },
  {
    name: 'Labubu Pre-order',
    slug: 'labubu-pre-order',
    status: 'active',
    sortOrder: 5,
  },
];

module.exports.up = async function up() {
  const collection = DB.collection(COLLECTION.CATEGORIES);

  for (const category of categories) {
    const now = new Date();
    await collection.updateOne(
      { slug: category.slug },
      {
        $setOnInsert: {
          ...category,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true },
    );
  }

  console.log(`✅ Ensured ${categories.length} Labubu categories exist (upsert by slug)`);
};

module.exports.down = async function down() {
  const slugs = categories.map((c) => c.slug);
  await DB.collection(COLLECTION.CATEGORIES).deleteMany({ slug: { $in: slugs } });
  console.log('✅ Deleted Labubu categories');
};
