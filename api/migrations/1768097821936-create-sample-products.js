'use strict';

const { COLLECTION, DB } = require('./lib/index.cjs');

const products = [
  {
    name: 'Labubu Blind Box Series 1 - Mystery Box',
    slug: 'labubu-blind-box-series-1-mystery-box',
    description: 'Hộp mù Labubu Series 1 với nhiều nhân vật bí ẩn. Mỗi hộp chứa một figure ngẫu nhiên từ series này. Hoàn hảo cho người sưu tầm!',
    shortDescription: 'Hộp mù Labubu Series 1 với nhiều nhân vật bí ẩn',
    price: 250000,
    salePrice: 200000,
    discountPercentage: 20,
    stock: 50,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Labubu Figure - Spooky Boo',
    slug: 'labubu-figure-spooky-boo',
    description: 'Figure Labubu Spooky Boo phiên bản Halloween. Figure cao 7cm, chất lượng cao với chi tiết tinh xảo. Sản phẩm chính hãng Pop Mart.',
    shortDescription: 'Figure Labubu Spooky Boo phiên bản Halloween cao 7cm',
    price: 350000,
    salePrice: 0,
    discountPercentage: 0,
    stock: 30,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Labubu Plush Toy - Mini Size',
    slug: 'labubu-plush-toy-mini-size',
    description: 'Gấu bông Labubu size mini, mềm mại và dễ thương. Kích thước 15cm, chất liệu cao cấp, an toàn cho trẻ em. Món quà hoàn hảo cho người yêu thích Labubu!',
    shortDescription: 'Gấu bông Labubu size mini 15cm, mềm mại dễ thương',
    price: 180000,
    salePrice: 150000,
    discountPercentage: 17,
    stock: 80,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Labubu Keychain - Cute Collection',
    slug: 'labubu-keychain-cute-collection',
    description: 'Móc khóa Labubu bộ sưu tập dễ thương. Thiết kế nhỏ gọn, đáng yêu, phù hợp trang trí túi xách, ba lô. Chất liệu PVC cao cấp, bền đẹp.',
    shortDescription: 'Móc khóa Labubu bộ sưu tập dễ thương, chất liệu PVC cao cấp',
    price: 80000,
    salePrice: 0,
    discountPercentage: 0,
    stock: 100,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Labubu Blind Box Series 2 - Dream',
    slug: 'labubu-blind-box-series-2-dream',
    description: 'Hộp mù Labubu Series 2 với chủ đề Dream. Mỗi hộp chứa một figure ngẫu nhiên với thiết kế đầy màu sắc và ấn tượng. Sưu tập đầy đủ để có trải nghiệm tốt nhất!',
    shortDescription: 'Hộp mù Labubu Series 2 chủ đề Dream với thiết kế đầy màu sắc',
    price: 280000,
    salePrice: 250000,
    discountPercentage: 11,
    stock: 45,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Labubu Figure Stand Set',
    slug: 'labubu-figure-stand-set',
    description: 'Bộ đế trưng bày figure Labubu chuyên nghiệp. Bao gồm 6 đế với nhiều kích thước khác nhau. Giúp display figure một cách đẹp mắt và gọn gàng.',
    shortDescription: 'Bộ đế trưng bày figure Labubu chuyên nghiệp, 6 đế đa kích thước',
    price: 120000,
    salePrice: 0,
    discountPercentage: 0,
    stock: 60,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Labubu Plush Toy - Large Size',
    slug: 'labubu-plush-toy-large-size',
    description: 'Gấu bông Labubu size lớn, hoàn hảo để ôm và trang trí. Kích thước 40cm, chất liệu mềm mại, an toàn. Sản phẩm lý tưởng cho phòng ngủ hoặc phòng khách.',
    shortDescription: 'Gấu bông Labubu size lớn 40cm, mềm mại, an toàn',
    price: 450000,
    salePrice: 399000,
    discountPercentage: 11,
    stock: 25,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Labubu Storage Box - Premium',
    slug: 'labubu-storage-box-premium',
    description: 'Hộp bảo quản Labubu premium, bảo vệ figure khỏi bụi bẩn và hư hỏng. Thiết kế trong suốt, có thể xếp chồng. Dung tích lớn, phù hợp cho nhiều figure.',
    shortDescription: 'Hộp bảo quản Labubu premium, trong suốt, có thể xếp chồng',
    price: 150000,
    salePrice: 130000,
    discountPercentage: 13,
    stock: 70,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Labubu Pre-order - Limited Edition',
    slug: 'labubu-preorder-limited-edition',
    description: 'Đặt trước Labubu Limited Edition phiên bản đặc biệt. Chỉ sản xuất số lượng giới hạn. Giao hàng trong 2-3 tháng. Sản phẩm độc quyền, hiếm có!',
    shortDescription: 'Đặt trước Labubu Limited Edition phiên bản đặc biệt, số lượng giới hạn',
    price: 550000,
    salePrice: 0,
    discountPercentage: 0,
    stock: 15,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Labubu Blind Box Series 3 - Adventure',
    slug: 'labubu-blind-box-series-3-adventure',
    description: 'Hộp mù Labubu Series 3 với chủ đề Adventure. Khám phá những nhân vật mới với phong cách phiêu lưu. Mỗi hộp là một bất ngờ thú vị!',
    shortDescription: 'Hộp mù Labubu Series 3 chủ đề Adventure với nhân vật mới',
    price: 270000,
    salePrice: 240000,
    discountPercentage: 11,
    stock: 55,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

module.exports.up = async function up() {
  const existingProducts = await DB.collection(COLLECTION.PRODUCTS).countDocuments();

  if (existingProducts > 0) {
    console.log('Products already exist, skipping...');
    return;
  }

  // Get all categories to assign to products
  const categories = await DB.collection(COLLECTION.CATEGORIES).find({}).toArray();
  
  if (categories.length === 0) {
    console.log('⚠️  No categories found. Please run category migration first.');
    return;
  }

  // Create file records with placeholder images (using placeholder service URLs)
  // Using picsum.photos for placeholder images that can be viewed immediately
  const fileRecords = products.map((product, index) => {
    const imageId = 100 + index; // Different image IDs for variety
    const placeholderUrl = `https://picsum.photos/800/800?random=${imageId}`;
    const thumbnailUrl = `https://picsum.photos/400/400?random=${imageId}`;
    
    return {
      type: 'image',
      name: `${product.slug}.jpg`,
      description: `Image for ${product.name}`,
      mimeType: 'image/jpeg',
      server: 'external', // Use 'external' so system returns absolutePath directly
      path: placeholderUrl, // Store placeholder URL
      absolutePath: placeholderUrl, // Store placeholder URL in absolutePath
      width: 800,
      height: 800,
      size: 150000 + Math.floor(Math.random() * 200000), // Random size between 150KB - 350KB
      status: 'active',
      thumbnailPath: thumbnailUrl,
      thumbnailAbsolutePath: thumbnailUrl,
      metadata: {
        placeholder: true,
        originalUrl: placeholderUrl,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  // Insert file records
  const fileResults = await DB.collection('files').insertMany(fileRecords);
  const fileIds = Object.values(fileResults.insertedIds);

  console.log(`✅ Created ${fileIds.length} file records`);

  // Assign categories and fileIds to products
  const productsWithCategories = products.map((product, index) => {
    const categoryIndex = index % categories.length;
    const category = categories[categoryIndex];
    
    return {
      ...product,
      categoryId: category._id,
      fileIds: [fileIds[index]], // Assign one image per product
    };
  });

  await DB.collection(COLLECTION.PRODUCTS).insertMany(productsWithCategories);
  console.log(`✅ Created ${productsWithCategories.length} sample Labubu products with images`);
};

module.exports.down = async function down() {
  const slugs = products.map(p => p.slug);
  
  // Get products to find fileIds
  const productDocs = await DB.collection(COLLECTION.PRODUCTS).find({ 
    slug: { $in: slugs } 
  }).toArray();
  
  // Extract all fileIds
  const fileIds = [];
  productDocs.forEach(product => {
    if (product.fileIds && Array.isArray(product.fileIds)) {
      fileIds.push(...product.fileIds);
    }
  });

  // Delete products
  await DB.collection(COLLECTION.PRODUCTS).deleteMany({ slug: { $in: slugs } });
  console.log('✅ Deleted sample Labubu products');

  // Delete associated files
  if (fileIds.length > 0) {
    await DB.collection('files').deleteMany({ _id: { $in: fileIds } });
    console.log(`✅ Deleted ${fileIds.length} associated file records`);
  }
};
