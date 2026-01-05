const crypto = require('crypto');
const mongoose = require('mongoose');

exports.COLLECTION = {
  SETTING: 'settings',
  MIGRATIONS: 'migrations',
  USERS: 'users',
  SELLERS: 'sellers',
  AUTHS: 'auths',
  CATEGORIES: 'categories',
  SHOPS: 'shops',
  PRODUCTS: 'products',
  CARTS: 'carts',
  ORDERS: 'orders',
  WALLETS: 'wallets',
  WALLET_TRANSACTIONS: 'wallet_transactions'
};

exports.DB = mongoose.connection;

exports.encryptPassword = (pw, salt) => {
  const defaultIterations = 10000;
  const defaultKeyLength = 64;

  return crypto
    .pbkdf2Sync(pw, salt, defaultIterations, defaultKeyLength, 'sha1')
    .toString('base64');
};

exports.generateSalt = (byteSize = 16) => crypto.randomBytes(byteSize).toString('base64');

