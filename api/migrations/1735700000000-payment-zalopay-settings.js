const { DB, COLLECTION } = require('./lib/index.cjs');

const SETTING_KEYS = {
  ZALOPAY_APP_ID: 'zalopayAppId',
  ZALOPAY_KEY1: 'zalopayKey1',
  ZALOPAY_KEY2: 'zalopayKey2',
  ZALOPAY_ENDPOINT: 'zalopayEndpoint',
  ZALOPAY_REDIRECT_URL: 'zalopayRedirectUrl',
  ZALOPAY_ENABLED: 'zalopayEnabled'
};

const settings = [
  {
    key: SETTING_KEYS.ZALOPAY_APP_ID,
    value: '2553',
    name: 'ZaloPay App ID',
    description: 'ZaloPay Application ID (Sandbox: 2553)',
    public: false,
    group: 'paymentZalopay',
    editable: true,
    visible: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.ZALOPAY_KEY1,
    value: 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
    name: 'ZaloPay Key1',
    description: 'ZaloPay Key1 for signature generation',
    public: false,
    group: 'paymentZalopay',
    editable: true,
    visible: true,
    type: 'password'
  },
  {
    key: SETTING_KEYS.ZALOPAY_KEY2,
    value: 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz',
    name: 'ZaloPay Key2',
    description: 'ZaloPay Key2 for signature verification',
    public: false,
    group: 'paymentZalopay',
    editable: true,
    visible: true,
    type: 'password'
  },
  {
    key: SETTING_KEYS.ZALOPAY_ENDPOINT,
    value: 'https://sb-openapi.zalopay.vn/v2/create',
    name: 'ZaloPay Endpoint',
    description: 'ZaloPay API v2 endpoint URL (Sandbox: sb-openapi.zalopay.vn)',
    public: false,
    group: 'paymentZalopay',
    editable: true,
    visible: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.ZALOPAY_REDIRECT_URL,
    value: 'http://localhost:3000/payment/zalopay/result',
    name: 'ZaloPay Redirect URL',
    description: 'URL to redirect user after payment',
    public: false,
    group: 'paymentZalopay',
    editable: true,
    visible: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.ZALOPAY_ENABLED,
    value: 'true',
    name: 'ZaloPay Enabled',
    description: 'Enable ZaloPay payment gateway',
    public: false,
    group: 'paymentZalopay',
    editable: true,
    visible: true,
    type: 'boolean'
  }
];

module.exports.up = async function () {
  console.log('ZaloPay settings migration started');

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

  console.log('ZaloPay settings migration completed');
};

module.exports.down = async function () {
  await DB.collection(COLLECTION.SETTING).deleteMany({ group: 'paymentZalopay' });
  console.log('Rollback ZaloPay settings completed');
};

