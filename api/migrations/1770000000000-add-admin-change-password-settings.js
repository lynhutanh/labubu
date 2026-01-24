const { DB, COLLECTION } = require('./lib/index.cjs');

const settings = [
  {
    key: 'adminNewPassword',
    value: '',
    name: 'Mật khẩu mới',
    description: 'Mật khẩu mới cho tài khoản admin',
    public: false,
    group: 'admin',
    editable: true,
    visible: true,
    type: 'password',
    order: 1
  },
  {
    key: 'adminConfirmPassword',
    value: '',
    name: 'Nhập lại mật khẩu',
    description: 'Xác nhận mật khẩu mới',
    public: false,
    group: 'admin',
    editable: true,
    visible: true,
    type: 'password',
    order: 2
  }
];

module.exports.up = async function () {
  console.log('Admin change password settings migration started');

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

  console.log('Admin change password settings migration completed');
};

module.exports.down = async function () {
  await DB.collection(COLLECTION.SETTING).deleteMany({ group: 'admin' });
  console.log('Rollback Admin change password settings completed');
};
