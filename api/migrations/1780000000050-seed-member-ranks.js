const { DB } = require('./lib/index.cjs');

const ranks = [
    {
        key: 'copper',
        name: 'Đồng',
        threshold: 0,
        order: 1,
        color: '#cd7f32',
        logoPath: '/ranks/copper.png',
        description: 'Thành viên Đồng'
    },
    {
        key: 'silver',
        name: 'Bạc',
        threshold: 10000,
        order: 2,
        color: '#c0c0c0',
        logoPath: '/ranks/silver.png',
        description: 'Thành viên Bạc'
    },
    {
        key: 'gold',
        name: 'Vàng',
        threshold: 30000,
        order: 3,
        color: '#ffd700',
        logoPath: '/ranks/gold.png',
        description: 'Thành viên Vàng'
    },
    {
        key: 'diamond',
        name: 'Kim Cương',
        threshold: 100000,
        order: 4,
        color: '#b9f2ff',
        logoPath: '/ranks/diamond.png',
        description: 'Thành viên Kim Cương'
    },
    {
        key: 'emerald',
        name: 'Lục Bảo',
        threshold: 500000,
        order: 5,
        color: '#50c878',
        logoPath: '/ranks/emerald.png',
        description: 'Thành viên Lục Bảo'
    }
];

module.exports.up = async function up() {
    console.log('--- Bắt đầu cập nhật cấp bậc thành viên ---');

    // Xóa toàn bộ dữ liệu cũ trong collection 'ranks' nếu có
    await DB.collection('ranks').deleteMany({});
    console.log('✅ Đã xóa toàn bộ cấp bậc cũ');

    // Thêm mới toàn bộ dữ liệu từ danh sách
    for (const rank of ranks) {
        await DB.collection('ranks').insertOne({
            ...rank,
            rewardVoucherCode: '',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log(`✅ Đã tạo mới cấp bậc: ${rank.name} (${rank.key})`);
    }

    console.log('--- Hoàn tất cập nhật cấp bậc! ---');
};

module.exports.down = async function down() {
    await DB.collection('ranks').deleteMany({
        key: { $in: ranks.map((r) => r.key) }
    });
    console.log('✅ Đã xóa các cấp bậc đã tạo');
};
