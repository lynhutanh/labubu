const { DB, COLLECTION } = require('./lib/index.cjs');

const settings = [
  {
    key: 'sepay2Account',
    value: '',
    name: 'Số tài khoản ngân hàng (Tài khoản 2)',
    description: 'Số tài khoản nhận tiền (SePay - Tài khoản thứ 2)',
    public: false,
    group: 'payment',
    editable: true,
    visible: true,
    type: 'text',
    order: 5
  },
  {
    key: 'sepay2Bank',
    value: 'VIB',
    name: 'Tên ngân hàng (Tài khoản 2)',
    description: 'Tên ngân hàng (VD: VIB, MBBank, TPBank...) - Tài khoản thứ 2',
    public: false,
    group: 'payment',
    editable: true,
    visible: true,
    type: 'text',
    order: 6
  }
];

module.exports.up = async function () {
  console.log('SePay second account settings migration started');

  for (const setting of settings) {
    const exists = await DB.collection(COLLECTION.SETTING).findOne({ key: setting.key });

    if (!exists) {
      await DB.collection(COLLECTION.SETTING).insertOne({
        ...setting,
        type: setting.type || 'text',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log(`Inserted setting: ${setting.key}`);
    } else {
      console.log(`Setting exists: ${setting.key}`);
    }
  }

  const paypalSettings = [
    { key: 'sepayWebhookTimeout', order: 7 },
    { key: 'paypalEnabled', order: 8 },
    { key: 'paypalClientId', order: 9 },
    { key: 'paypalClientSecret', order: 10 },
    { key: 'paypalMode', order: 11 },
    { key: 'paypalReturnUrl', order: 12 },
    { key: 'paypalCancelUrl', order: 13 },
    { key: 'paypalWebhookId', order: 14 }
  ];

  for (const paypalSetting of paypalSettings) {
    await DB.collection(COLLECTION.SETTING).updateOne(
      { key: paypalSetting.key },
      { $set: { order: paypalSetting.order, updatedAt: new Date() } }
    );
    console.log(`Updated order for ${paypalSetting.key} to ${paypalSetting.order}`);
  }

  console.log('SePay second account settings migration completed');
};

module.exports.down = async function () {
  await DB.collection(COLLECTION.SETTING).deleteMany({ 
    key: { $in: ['sepay2Account', 'sepay2Bank'] } 
  });
  console.log('Rollback SePay second account settings completed');
};
