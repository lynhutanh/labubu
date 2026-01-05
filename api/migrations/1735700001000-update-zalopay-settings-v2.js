const { DB, COLLECTION } = require('./lib/index.cjs');

const SETTING_KEYS = {
  ZALOPAY_APP_ID: 'zalopayAppId',
  ZALOPAY_KEY1: 'zalopayKey1',
  ZALOPAY_KEY2: 'zalopayKey2',
  ZALOPAY_ENDPOINT: 'zalopayEndpoint',
  ZALOPAY_REDIRECT_URL: 'zalopayRedirectUrl',
  ZALOPAY_CALLBACK_URL: 'zalopayCallbackUrl',
  ZALOPAY_ENABLED: 'zalopayEnabled'
};

// ZaloPay Sandbox v2 credentials
const newSettings = {
  [SETTING_KEYS.ZALOPAY_APP_ID]: '2553',
  [SETTING_KEYS.ZALOPAY_KEY1]: 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
  [SETTING_KEYS.ZALOPAY_KEY2]: 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz',
  [SETTING_KEYS.ZALOPAY_ENDPOINT]: 'https://sb-openapi.zalopay.vn/v2/create',
  [SETTING_KEYS.ZALOPAY_REDIRECT_URL]: 'http://localhost:3000/payment/zalopay/result',
  [SETTING_KEYS.ZALOPAY_ENABLED]: 'true'
};

module.exports.up = async function () {
  console.log('Updating ZaloPay settings to v2 API...');

  // Update existing settings
  for (const [key, value] of Object.entries(newSettings)) {
    await DB.collection(COLLECTION.SETTING).updateOne(
      { key },
      { $set: { value, updatedAt: new Date() } }
    );
    console.log(`Updated setting: ${key} = ${key.includes('Key') ? '***' : value}`);
  }

  // Add callback URL setting if not exists
  const callbackExists = await DB.collection(COLLECTION.SETTING).findOne({ key: SETTING_KEYS.ZALOPAY_CALLBACK_URL });
  if (!callbackExists) {
    await DB.collection(COLLECTION.SETTING).insertOne({
      key: SETTING_KEYS.ZALOPAY_CALLBACK_URL,
      value: 'http://localhost:8080/api/payment/zalopay/callback',
      name: 'ZaloPay Callback URL',
      description: 'URL for ZaloPay server-to-server callback (must be publicly accessible in production)',
      public: false,
      group: 'paymentZalopay',
      editable: true,
      visible: true,
      type: 'text',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Added new setting: zalopayCallbackUrl');
  }

  console.log('ZaloPay settings updated successfully!');
};

module.exports.down = async function () {
  // Revert to old v1 settings
  const oldSettings = {
    [SETTING_KEYS.ZALOPAY_APP_ID]: '554',
    [SETTING_KEYS.ZALOPAY_KEY1]: '8NdU5pG5R2spGHGhyO99HN1OhD8IQJBn',
    [SETTING_KEYS.ZALOPAY_KEY2]: 'uUfsWgfLkRLzq6W2uNXTCxrfxs51auny',
    [SETTING_KEYS.ZALOPAY_ENDPOINT]: 'https://sandbox.zalopay.com.vn/v001/tpe/createorder',
    [SETTING_KEYS.ZALOPAY_REDIRECT_URL]: 'http://localhost:3000/payment/zalopay',
    [SETTING_KEYS.ZALOPAY_ENABLED]: 'false'
  };

  for (const [key, value] of Object.entries(oldSettings)) {
    await DB.collection(COLLECTION.SETTING).updateOne(
      { key },
      { $set: { value, updatedAt: new Date() } }
    );
  }

  // Remove callback URL setting
  await DB.collection(COLLECTION.SETTING).deleteOne({ key: SETTING_KEYS.ZALOPAY_CALLBACK_URL });

  console.log('Rollback ZaloPay settings completed');
};

