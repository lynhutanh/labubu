const { DB, COLLECTION } = require('./lib/index.cjs');

const SETTING_KEYS = {
  PAYPAL_CLIENT_ID: 'paypalClientId',
  PAYPAL_CLIENT_SECRET: 'paypalClientSecret',
  PAYPAL_MODE: 'paypalMode',
  PAYPAL_RETURN_URL: 'paypalReturnUrl',
  PAYPAL_CANCEL_URL: 'paypalCancelUrl',
  PAYPAL_WEBHOOK_ID: 'paypalWebhookId',
  PAYPAL_ENABLED: 'paypalEnabled'
};

const settings = [
  {
    key: SETTING_KEYS.PAYPAL_CLIENT_ID,
    value: '',
    name: 'PayPal Client ID',
    description: 'PayPal Client ID from PayPal Developer Dashboard',
    public: false,
    group: 'paymentPaypal',
    editable: true,
    visible: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.PAYPAL_CLIENT_SECRET,
    value: '',
    name: 'PayPal Client Secret',
    description: 'PayPal Client Secret from PayPal Developer Dashboard',
    public: false,
    group: 'paymentPaypal',
    editable: true,
    visible: true,
    type: 'password'
  },
  {
    key: SETTING_KEYS.PAYPAL_MODE,
    value: 'sandbox',
    name: 'PayPal Mode',
    description: 'PayPal Environment (sandbox = Test, live = Production)',
    public: false,
    group: 'paymentPaypal',
    editable: true,
    visible: true,
    type: 'select',
    meta: {
      options: [
        { label: 'Sandbox (Test)', value: 'sandbox' },
        { label: 'Live (Production)', value: 'live' }
      ]
    }
  },
  {
    key: SETTING_KEYS.PAYPAL_RETURN_URL,
    value: 'http://localhost:3000/payment/paypal/success',
    name: 'PayPal Return URL',
    description: 'URL to return after successful payment',
    public: false,
    group: 'paymentPaypal',
    editable: true,
    visible: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.PAYPAL_CANCEL_URL,
    value: 'http://localhost:3000/payment/paypal/cancel',
    name: 'PayPal Cancel URL',
    description: 'URL to return when payment is cancelled',
    public: false,
    group: 'paymentPaypal',
    editable: true,
    visible: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.PAYPAL_WEBHOOK_ID,
    value: '',
    name: 'PayPal Webhook ID',
    description: 'PayPal Webhook ID for payment notifications',
    public: false,
    group: 'paymentPaypal',
    editable: true,
    visible: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.PAYPAL_ENABLED,
    value: 'false',
    name: 'PayPal Enabled',
    description: 'Enable PayPal payment gateway',
    public: false,
    group: 'paymentPaypal',
    editable: true,
    visible: true,
    type: 'boolean'
  }
];

module.exports.up = async function () {
  console.log('PayPal settings migration started');

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

  console.log('PayPal settings migration completed');
};

module.exports.down = async function () {
  await DB.collection(COLLECTION.SETTING).deleteMany({ group: 'paymentPaypal' });
  console.log('Rollback PayPal settings completed');
};

