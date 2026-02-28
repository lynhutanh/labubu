const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function syncUserTotalSpent() {
    try {
        console.log('--- Bắt đầu script đồng bộ hóa Total Spent và Rank (Chỉ tính PAID) ---');

        const uri = process.env.MONGO_URI || process.env.MONGODB_URL;
        if (!uri) {
            console.error('❌ Thiếu biến môi trường MONGO_URI hoặc MONGODB_URL trong file .env');
            process.exit(1);
        }

        await mongoose.connect(uri);
        console.log('✅ Đã kết nối MongoDB');

        const db = mongoose.connection.db;

        // 1. Lấy danh sách ranks
        const ranks = await db.collection('ranks').find().sort({ threshold: 1 }).toArray();
        console.log(`📊 Đã tải ${ranks.length} cấp bậc từ database.`);

        // 2. Chỉ tính các đơn hàng đã thanh toán (paymentStatus: 'paid')
        // Loại trừ đơn hàng bị hoàn tiền (status: 'refunded')
        const orderStats = await db.collection('orders').aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                    status: { $ne: 'refunded' }
                }
            },
            {
                $group: {
                    _id: '$buyerId',
                    totalSpent: { $sum: '$total' }
                }
            }
        ]).toArray();

        console.log(`🔍 Tìm thấy ${orderStats.length} khách hàng có đơn hàng đã thanh toán.`);

        // 3. Cập nhật User
        for (const stat of orderStats) {
            if (!stat._id) continue;

            const totalSpent = stat.totalSpent || 0;

            let newRank = ranks[0]?.key || 'copper';
            for (let i = ranks.length - 1; i >= 0; i--) {
                if (totalSpent >= ranks[i].threshold) {
                    newRank = ranks[i].key;
                    break;
                }
            }

            await db.collection('users').updateOne(
                { _id: stat._id },
                {
                    $set: {
                        totalSpent: totalSpent,
                        rank: newRank,
                        updatedAt: new Date()
                    }
                }
            );
            console.log(`✅ User: ${stat._id} -> totalSpent: ${totalSpent.toLocaleString()} -> Rank: ${newRank}`);
        }

        // 4. Reset
        const userIdsWithSpend = orderStats.map(s => s._id);
        const resetResult = await db.collection('users').updateMany(
            { _id: { $nin: userIdsWithSpend } },
            {
                $set: {
                    totalSpent: 0,
                    rank: ranks[0]?.key || 'copper',
                    updatedAt: new Date()
                }
            }
        );
        console.log(`✅ Đã reset cho ${resetResult.modifiedCount} người dùng không có lịch sử thanh toán.`);

        console.log('\n--- Hoàn tất đồng bộ hóa! ---');
        process.exit(0);

    } catch (error) {
        console.error('❌ Lỗi thực thi script:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

syncUserTotalSpent();
