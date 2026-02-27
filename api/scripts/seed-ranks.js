require('dotenv').config();
const mongoose = require('mongoose');

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

async function seedRanks() {
    try {
        console.log('--- Bắt đầu script khởi tạo cấp bậc thành viên ---');

        const uri = process.env.MONGO_URI || process.env.MONGODB_URL;
        if (!uri) {
            console.error('❌ Thiếu biến môi trường MONGO_URI hoặc MONGODB_URL trong file .env');
            process.exit(1);
        }

        await mongoose.connect(uri);
        console.log('✅ Đã kết nối MongoDB');

        const db = mongoose.connection.db;

        for (const rank of ranks) {
            const exists = await db.collection('ranks').findOne({ key: rank.key });

            if (!exists) {
                await db.collection('ranks').insertOne({
                    ...rank,
                    rewardVoucherCode: '',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                console.log(`✅ Đã thêm cấp bậc: ${rank.name} (${rank.key})`);
            } else {
                await db.collection('ranks').updateOne(
                    { key: rank.key },
                    {
                        $set: {
                            name: rank.name,
                            threshold: rank.threshold,
                            order: rank.order,
                            color: rank.color,
                            logoPath: rank.logoPath,
                            description: rank.description,
                            updatedAt: new Date()
                        }
                    }
                );
                console.log(`🔄 Đã cập nhật cấp bậc: ${rank.name} (${rank.key})`);
            }
        }

        console.log('\n--- Hoàn tất khởi tạo cấp bậc! ---');
        process.exit(0);

    } catch (error) {
        console.error('❌ Lỗi thực thi script:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

seedRanks();
