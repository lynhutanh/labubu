'use strict';

const { COLLECTION, DB } = require('./lib/index.cjs');

const categories = [
  {
    name: 'Chăm sóc da',
    slug: 'cham-soc-da',
    description: 'Các sản phẩm chăm sóc da mặt và cơ thể',
    icon: 'skincare',
    image: '',
    status: 'active',
    sortOrder: 1,
    subcategories: [
      { name: 'Sữa rửa mặt', slug: 'sua-rua-mat', description: 'Làm sạch da mặt', status: 'active', sortOrder: 1 },
      { name: 'Toner', slug: 'toner', description: 'Cân bằng độ pH cho da', status: 'active', sortOrder: 2 },
      { name: 'Serum & Tinh chất', slug: 'serum-tinh-chat', description: 'Tinh chất dưỡng da đậm đặc', status: 'active', sortOrder: 3 },
      { name: 'Kem dưỡng ẩm', slug: 'kem-duong-am', description: 'Cấp ẩm và dưỡng da', status: 'active', sortOrder: 4 },
      { name: 'Kem chống nắng', slug: 'kem-chong-nang', description: 'Bảo vệ da khỏi tia UV', status: 'active', sortOrder: 5 },
      { name: 'Mặt nạ', slug: 'mat-na', description: 'Mặt nạ dưỡng da các loại', status: 'active', sortOrder: 6 },
      { name: 'Kem mắt', slug: 'kem-mat', description: 'Chăm sóc vùng da quanh mắt', status: 'active', sortOrder: 7 },
      { name: 'Tẩy trang', slug: 'tay-trang', description: 'Làm sạch makeup và bụi bẩn', status: 'active', sortOrder: 8 },
      { name: 'Trị mụn', slug: 'tri-mun', description: 'Sản phẩm điều trị mụn', status: 'active', sortOrder: 9 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Trang điểm',
    slug: 'trang-diem',
    description: 'Các sản phẩm makeup và trang điểm',
    icon: 'makeup',
    image: '',
    status: 'active',
    sortOrder: 2,
    subcategories: [
      { name: 'Kem nền & Cushion', slug: 'kem-nen-cushion', description: 'Tạo nền da hoàn hảo', status: 'active', sortOrder: 1 },
      { name: 'Phấn phủ', slug: 'phan-phu', description: 'Kiềm dầu và cố định lớp nền', status: 'active', sortOrder: 2 },
      { name: 'Son môi', slug: 'son-moi', description: 'Son các loại', status: 'active', sortOrder: 3 },
      { name: 'Mascara', slug: 'mascara', description: 'Chuốt mi dày và dài', status: 'active', sortOrder: 4 },
      { name: 'Kẻ mắt', slug: 'ke-mat', description: 'Eyeliner các loại', status: 'active', sortOrder: 5 },
      { name: 'Phấn mắt', slug: 'phan-mat', description: 'Eyeshadow palette và đơn', status: 'active', sortOrder: 6 },
      { name: 'Má hồng', slug: 'ma-hong', description: 'Blush tạo sắc hồng', status: 'active', sortOrder: 7 },
      { name: 'Tạo khối & Highlight', slug: 'tao-khoi-highlight', description: 'Contour và highlight', status: 'active', sortOrder: 8 },
      { name: 'Chân mày', slug: 'chan-may', description: 'Sản phẩm kẻ và tô chân mày', status: 'active', sortOrder: 9 },
      { name: 'Primer', slug: 'primer', description: 'Lót makeup', status: 'active', sortOrder: 10 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Chăm sóc tóc',
    slug: 'cham-soc-toc',
    description: 'Các sản phẩm chăm sóc và tạo kiểu tóc',
    icon: 'haircare',
    image: '',
    status: 'active',
    sortOrder: 3,
    subcategories: [
      { name: 'Dầu gội', slug: 'dau-goi', description: 'Làm sạch tóc và da đầu', status: 'active', sortOrder: 1 },
      { name: 'Dầu xả', slug: 'dau-xa', description: 'Dưỡng ẩm và mềm mượt tóc', status: 'active', sortOrder: 2 },
      { name: 'Ủ tóc & Mặt nạ tóc', slug: 'u-toc-mat-na-toc', description: 'Phục hồi tóc hư tổn', status: 'active', sortOrder: 3 },
      { name: 'Serum & Tinh dầu tóc', slug: 'serum-tinh-dau-toc', description: 'Dưỡng tóc bóng mượt', status: 'active', sortOrder: 4 },
      { name: 'Xịt dưỡng tóc', slug: 'xit-duong-toc', description: 'Bảo vệ và dưỡng tóc', status: 'active', sortOrder: 5 },
      { name: 'Tạo kiểu tóc', slug: 'tao-kieu-toc', description: 'Gel, sáp, keo xịt tóc', status: 'active', sortOrder: 6 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Chăm sóc cơ thể',
    slug: 'cham-soc-co-the',
    description: 'Các sản phẩm chăm sóc toàn thân',
    icon: 'bodycare',
    image: '',
    status: 'active',
    sortOrder: 4,
    subcategories: [
      { name: 'Sữa tắm', slug: 'sua-tam', description: 'Làm sạch cơ thể', status: 'active', sortOrder: 1 },
      { name: 'Dưỡng thể', slug: 'duong-the', description: 'Lotion và kem dưỡng body', status: 'active', sortOrder: 2 },
      { name: 'Tẩy tế bào chết body', slug: 'tay-te-bao-chet-body', description: 'Scrub làm sạch sâu', status: 'active', sortOrder: 3 },
      { name: 'Chăm sóc tay', slug: 'cham-soc-tay', description: 'Kem tay và sản phẩm nail', status: 'active', sortOrder: 4 },
      { name: 'Chăm sóc chân', slug: 'cham-soc-chan', description: 'Kem chân và sản phẩm chăm sóc', status: 'active', sortOrder: 5 },
      { name: 'Khử mùi', slug: 'khu-mui', description: 'Lăn khử mùi và xịt thơm', status: 'active', sortOrder: 6 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Nước hoa',
    slug: 'nuoc-hoa',
    description: 'Nước hoa và hương thơm các loại',
    icon: 'fragrance',
    image: '',
    status: 'active',
    sortOrder: 5,
    subcategories: [
      { name: 'Nước hoa nữ', slug: 'nuoc-hoa-nu', description: 'Nước hoa dành cho nữ', status: 'active', sortOrder: 1 },
      { name: 'Nước hoa nam', slug: 'nuoc-hoa-nam', description: 'Nước hoa dành cho nam', status: 'active', sortOrder: 2 },
      { name: 'Nước hoa unisex', slug: 'nuoc-hoa-unisex', description: 'Nước hoa dùng chung', status: 'active', sortOrder: 3 },
      { name: 'Nước hoa mini', slug: 'nuoc-hoa-mini', description: 'Nước hoa size nhỏ tiện dụng', status: 'active', sortOrder: 4 },
      { name: 'Body mist', slug: 'body-mist', description: 'Xịt thơm toàn thân', status: 'active', sortOrder: 5 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Dụng cụ làm đẹp',
    slug: 'dung-cu-lam-dep',
    description: 'Dụng cụ và phụ kiện makeup, skincare',
    icon: 'tools',
    image: '',
    status: 'active',
    sortOrder: 6,
    subcategories: [
      { name: 'Cọ trang điểm', slug: 'co-trang-diem', description: 'Cọ makeup các loại', status: 'active', sortOrder: 1 },
      { name: 'Mút trang điểm', slug: 'mut-trang-diem', description: 'Beauty blender và mút', status: 'active', sortOrder: 2 },
      { name: 'Dụng cụ chăm sóc da', slug: 'dung-cu-cham-soc-da', description: 'Máy rửa mặt, massage', status: 'active', sortOrder: 3 },
      { name: 'Gương & Hộp đựng', slug: 'guong-hop-dung', description: 'Gương trang điểm và hộp lưu trữ', status: 'active', sortOrder: 4 },
      { name: 'Dụng cụ làm tóc', slug: 'dung-cu-lam-toc', description: 'Máy sấy, máy uốn, lược', status: 'active', sortOrder: 5 },
      { name: 'Kẹp mi & Nhíp', slug: 'kep-mi-nhip', description: 'Dụng cụ làm đẹp nhỏ', status: 'active', sortOrder: 6 },
    ],
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
  console.log(`✅ Created ${categories.length} categories with subcategories`);
};

module.exports.down = async function down() {
  const slugs = categories.map(c => c.slug);
  await DB.collection(COLLECTION.CATEGORIES).deleteMany({ slug: { $in: slugs } });
  console.log('✅ Deleted all seeded categories');
};
