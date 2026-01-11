const { DB, COLLECTION } = require('./lib/index.cjs');

const settings = [
  // Site Settings
  {
    key: 'siteName',
    value: 'Labubu Shop',
    name: 'Tên website',
    description: 'Tên hiển thị của website',
    public: true,
    group: 'site',
    editable: true,
    visible: true,
    type: 'text',
    order: 1
  },
  {
    key: 'siteTitle',
    value: 'Labubu - chính hãng',
    name: 'Tiêu đề website',
    description: 'Tiêu đề SEO của website',
    public: true,
    group: 'site',
    editable: true,
    visible: true,
    type: 'text',
    order: 2
  },
  {
    key: 'siteDescription',
    value: 'Labubu chính hãng với đa dạng sản phẩm ',
    name: 'Mô tả website',
    description: 'Mô tả SEO của website',
    public: true,
    group: 'site',
    editable: true,
    visible: true,
    type: 'textarea',
    order: 3
  },
  {
    key: 'siteLogo',
    value: '',
    name: 'Logo website',
    description: 'URL logo của website',
    public: true,
    group: 'site',
    editable: true,
    visible: true,
    type: 'text',
    order: 4
  },
  {
    key: 'siteFavicon',
    value: '',
    name: 'Favicon',
    description: 'URL favicon của website',
    public: true,
    group: 'site',
    editable: true,
    visible: true,
    type: 'text',
    order: 5
  },
  {
    key: 'maintenanceMode',
    value: 'false',
    name: 'Chế độ bảo trì',
    description: 'Bật/tắt chế độ bảo trì website',
    public: true,
    group: 'site',
    editable: true,
    visible: true,
    type: 'boolean',
    order: 6
  },
  // Contact Settings
  {
    key: 'contactEmail',
    value: 'contact@labubu.com',
    name: 'Email liên hệ',
    description: 'Email liên hệ chính của cửa hàng',
    public: true,
    group: 'contact',
    editable: true,
    visible: true,
    type: 'text',
    order: 1
  },
  {
    key: 'contactPhone',
    value: '0123 456 789',
    name: 'Số điện thoại',
    description: 'Số điện thoại liên hệ',
    public: true,
    group: 'contact',
    editable: true,
    visible: true,
    type: 'text',
    order: 2
  },
  {
    key: 'contactAddress',
    value: '123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh',
    name: 'Địa chỉ',
    description: 'Địa chỉ cửa hàng/văn phòng',
    public: true,
    group: 'contact',
    editable: true,
    visible: true,
    type: 'textarea',
    order: 3
  },
  {
    key: 'workingHours',
    value: '8:00 - 22:00 (Thứ 2 - Chủ nhật)',
    name: 'Giờ làm việc',
    description: 'Thời gian làm việc',
    public: true,
    group: 'contact',
    editable: true,
    visible: true,
    type: 'text',
    order: 4
  },
  {
    key: 'facebookUrl',
    value: '',
    name: 'Facebook',
    description: 'Link Facebook fanpage',
    public: true,
    group: 'contact',
    editable: true,
    visible: true,
    type: 'text',
    order: 5
  },
  {
    key: 'instagramUrl',
    value: '',
    name: 'Instagram',
    description: 'Link Instagram',
    public: true,
    group: 'contact',
    editable: true,
    visible: true,
    type: 'text',
    order: 6
  },
  {
    key: 'zaloUrl',
    value: '',
    name: 'Zalo',
    description: 'Link/số Zalo',
    public: true,
    group: 'contact',
    editable: true,
    visible: true,
    type: 'text',
    order: 7
  }
];

module.exports.up = async function () {
  console.log('Site and Contact settings migration started');

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

  console.log('Site and Contact settings migration completed');
};

module.exports.down = async function () {
  await DB.collection(COLLECTION.SETTING).deleteMany({ group: { $in: ['site', 'contact'] } });
  console.log('Rollback Site and Contact settings completed');
};

