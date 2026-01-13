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
    value: '0123456789',
    name: 'Số điện thoại',
    description: 'Số điện thoại liên hệ (không có khoảng trắng, VD: 0123456789)',
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
    key: 'contactProvince',
    value: 'TP. Hồ Chí Minh',
    name: 'Tỉnh/Thành phố',
    description: 'Tỉnh/thành phố của cửa hàng (dùng cho GHN)',
    public: false,
    group: 'contact',
    editable: true,
    visible: true,
    type: 'text',
    order: 4
  },
  {
    key: 'contactDistrict',
    value: 'Quận 1',
    name: 'Quận/Huyện',
    description: 'Quận/huyện của cửa hàng (dùng cho GHN)',
    public: false,
    group: 'contact',
    editable: true,
    visible: true,
    type: 'text',
    order: 5
  },
  {
    key: 'contactWard',
    value: 'Phường Bến Nghé',
    name: 'Phường/Xã',
    description: 'Phường/xã của cửa hàng (dùng cho GHN)',
    public: false,
    group: 'contact',
    editable: true,
    visible: true,
    type: 'text',
    order: 6
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
    order: 7
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
    order: 8
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
    order: 9
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
    order: 10
  },
  // Payment Settings (SePay)
  {
    key: 'sepayMerchantId',
    value: '',
    name: 'SePay Merchant ID',
    description: 'Mã merchant từ SePay dashboard',
    public: false,
    group: 'payment',
    editable: true,
    visible: true,
    type: 'text',
    order: 1
  },
  {
    key: 'sepaySecretKey',
    value: '',
    name: 'SePay Secret Key',
    description: 'Secret key để verify webhook từ SePay',
    public: false,
    group: 'payment',
    editable: true,
    visible: true,
    type: 'password',
    order: 2
  },
  {
    key: 'sepayAccount',
    value: '',
    name: 'Số tài khoản ngân hàng',
    description: 'Số tài khoản nhận tiền (SePay)',
    public: false,
    group: 'payment',
    editable: true,
    visible: true,
    type: 'text',
    order: 3
  },
  {
    key: 'sepayBank',
    value: 'VIB',
    name: 'Tên ngân hàng',
    description: 'Tên ngân hàng (VD: VIB, MBBank, TPBank...)',
    public: false,
    group: 'payment',
    editable: true,
    visible: true,
    type: 'text',
    order: 4
  },
  {
    key: 'sepayWebhookTimeout',
    value: '900000',
    name: 'Thời gian hết hạn thanh toán (ms)',
    description: 'Thời gian hết hạn thanh toán tính bằng milliseconds (mặc định: 900000 = 15 phút)',
    public: false,
    group: 'payment',
    editable: true,
    visible: true,
    type: 'number',
    order: 5
  },
  // GHN Settings
  {
    key: 'GHN_BASE_URL',
    value: 'https://dev-online-gateway.ghn.vn',
    name: 'GHN Base URL',
    description: 'Base URL của GHN API (dev: https://dev-online-gateway.ghn.vn, prod: https://online-gateway.ghn.vn)',
    public: false,
    group: 'ghn',
    editable: true,
    visible: true,
    type: 'text',
    order: 1
  },
  {
    key: 'GHN_TOKEN',
    value: '',
    name: 'GHN Token',
    description: 'Token API từ GHN (lấy từ https://khachhang.ghn.vn/)',
    public: false,
    group: 'ghn',
    editable: true,
    visible: true,
    type: 'password',
    order: 2
  },
  {
    key: 'GHN_SHOP_ID',
    value: '',
    name: 'GHN Shop ID',
    description: 'Mã cửa hàng từ GHN (lấy từ https://khachhang.ghn.vn/)',
    public: false,
    group: 'ghn',
    editable: true,
    visible: true,
    type: 'text',
    order: 3
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
  await DB.collection(COLLECTION.SETTING).deleteMany({ group: { $in: ['site', 'contact', 'payment', 'ghn'] } });
  console.log('Rollback Site, Contact, Payment and GHN settings completed');
};

