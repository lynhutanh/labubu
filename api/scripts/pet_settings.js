const mongoose = require('mongoose');

(async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect('mongodb://127.0.0.1:27017/labubu_19');
    console.log("Connected successfully.");

    const db = mongoose.connection;
    const settings = db.collection('settings');
    
    // Setting 1: Mức khấu trừ tối đa của điểm (VNĐ)
    await settings.updateOne({ key: 'MAX_PET_REWARD_USAGE_PER_ORDER' }, {
      $set: {
        key: 'MAX_PET_REWARD_USAGE_PER_ORDER',
        value: 10000,
        name: 'Giới hạn trừ ví tối đa (VNĐ)',
        description: 'Số tiền tối đa từ ví nuôi thú có thể dùng để khấu trừ tiền cho một hóa đơn (Ví dụ: 10000).',
        type: 'number',
        public: false,
        visible: true,
        editable: true,
        group: 'pet',
        updatedAt: new Date()
      },
      $setOnInsert: { createdAt: new Date() }
    }, { upsert: true });

    // Setting 2: Chu kỳ áp dụng giới hạn
    await settings.updateOne({ key: 'PET_REWARD_USAGE_LIMIT_PERIOD' }, {
      $set: {
        key: 'PET_REWARD_USAGE_LIMIT_PERIOD',
        value: 'per_order',
        name: 'Điều kiện áp dụng thời gian',
        description: 'Chu kỳ để tính lại số tiền giới hạn này',
        type: 'select',
        meta: {
           options: [
             { label: 'Từng đơn hàng riêng biệt (Không giới hạn lần mua)', value: 'per_order' },
             { label: 'Khấu trừ theo Ngày (Giới hạn trong 1 ngày)', value: 'daily' },
             { label: 'Khấu trừ theo Tuần (Giới hạn trong 1 tuần)', value: 'weekly' },
             { label: 'Khấu trừ theo Tháng (Giới hạn trong 1 tháng)', value: 'monthly' }
           ]
        },
        public: false,
        visible: true,
        editable: true,
        group: 'pet',
        updatedAt: new Date()
      },
      $setOnInsert: { createdAt: new Date() }
    }, { upsert: true });

    // Setting 3: Số lần mua tối đa trong chu kỳ 
    await settings.updateOne({ key: 'PET_REWARD_MAX_USAGE_TIMES' }, {
      $set: {
        key: 'PET_REWARD_MAX_USAGE_TIMES',
        value: 1,
        name: 'Số lần áp dụng tối đa / chu kỳ',
        description: 'Nếu dùng chu kỳ Ngày/Tuần/Tháng, thì khách được dùng điểm này để giảm giá hóa đơn bao nhiêu lần?',
        type: 'number',
        public: false,
        visible: true,
        editable: true,
        group: 'pet',
        updatedAt: new Date()
      },
      $setOnInsert: { createdAt: new Date() }
    }, { upsert: true });


    console.log('Done inserting pet settings. You can now configure this in the Admin Panel.');
  } catch (err) {
    console.error("Error setting up pet settings:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
