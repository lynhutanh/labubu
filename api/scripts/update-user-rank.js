const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function updateRank() {
    try {
        console.log('--- Bắt đầu script đồng bộ chi tiêu và cập nhật thứ hạng ---');

        const uri = process.env.MONGO_URI || process.env.MONGODB_URL;
        if (!uri) {
            console.error('❌ Thiếu biến môi trường MONGO_URI hoặc MONGODB_URL trong file .env');
            process.exit(1);
        }

        await mongoose.connect(uri);
        console.log('✅ Đã kết nối MongoDB');

        const db = mongoose.connection.db;

        // 1. Lấy danh sách cấp bậc
        const ranks = await db.collection('ranks').find({}).sort({ threshold: 1 }).toArray();
        if (ranks.length === 0) {
            console.error('❌ Không tìm thấy dữ liệu cấp bậc trong collection "ranks". Vui lòng tạo cấp bậc trước!');
            process.exit(1);
        }
        console.log(`Tìm thấy ${ranks.length} cấp bậc.`);

        // 2. Lấy danh sách người dùng
        const users = await db.collection('users').find({}).toArray();
        console.log(`Tìm thấy ${users.length} người dùng.`);

        let updatedCount = 0;

        for (const user of users) {
            // 3. Tính tổng tiền từ các đơn hàng đã thanh toán thành công
            const userOrders = await db.collection('orders').find({
                buyerId: user._id,
                paymentStatus: 'paid' // Lấy những đơn đã thanh toán
            }).toArray();

            const totalSpent = userOrders.reduce((sum, order) => sum + (order.total || 0), 0);

            // 4. Xác định hạng mới dựa trên totalSpent
            let currentRank = ranks[0]; // Mặc định là hạng thấp nhất
            for (let i = ranks.length - 1; i >= 0; i--) {
                if (totalSpent >= ranks[i].threshold) {
                    currentRank = ranks[i];
                    break;
                }
            }

            // 5. Cập nhật vào DB
            await db.collection('users').updateOne(
                { _id: user._id },
                {
                    $set: {
                        totalSpent: totalSpent,
                        rank: currentRank.key
                    }
                }
            );

            console.log(`✅ User ${user.email || user.username} -> Chi tiêu: ${totalSpent.toLocaleString()}đ -> Hạng: ${currentRank.name}`);
            updatedCount++;
        }

        console.log(`\n--- Hoàn tất! Đã cập nhật ${updatedCount} người dùng. ---`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Lỗi thực thi script:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
    }
}

updateRank();
