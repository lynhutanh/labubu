const { COLLECTION, DB, encryptPassword, generateSalt } = require('./lib/index.cjs');

module.exports.up = async function up() {
  const salt = generateSalt();
  const hashedPassword = encryptPassword('adminadmin', salt);

  // Check if admin user already exists
  const existingAdmin = await DB.collection(COLLECTION.USERS).findOne({
    role: 'admin'
  });

  if (existingAdmin) {
    console.log('Admin user already exists, checking wallet...');
    
    // Check and create wallet for existing admin if not exists
    const existingWallet = await DB.collection(COLLECTION.WALLETS).findOne({
      ownerId: existingAdmin._id,
      ownerType: 'user'
    });

    if (!existingWallet) {
      await DB.collection(COLLECTION.WALLETS).insertOne({
        ownerId: existingAdmin._id,
        ownerType: 'user',
        balance: 0,
        currency: 'VND',
        status: 'active',
        totalDeposited: 0,
        totalWithdrawn: 0,
        totalSpent: 0,
        lastTransactionAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Created wallet for existing admin user');
    } else {
      console.log('Admin wallet already exists, skipping...');
    }
    return;
  }

  // Create admin user
  const adminUser = {
    name: 'Admin',
    username: 'admin',
    email: 'admin@cosmetics.com',
    role: 'admin',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await DB.collection(COLLECTION.USERS).insertOne(adminUser);

  // Create auth record for admin (email)
  await DB.collection(COLLECTION.AUTHS).insertOne({
    source: 'user',
    sourceId: result.insertedId,
    type: 'email',
    key: adminUser.email,
    value: hashedPassword,
    salt: salt,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Create auth record for admin (username)
  await DB.collection(COLLECTION.AUTHS).insertOne({
    source: 'user',
    sourceId: result.insertedId,
    type: 'username',
    key: adminUser.username,
    value: hashedPassword,
    salt: salt,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Create wallet for admin
  await DB.collection(COLLECTION.WALLETS).insertOne({
    ownerId: result.insertedId,
    ownerType: 'user',
    balance: 0,
    currency: 'VND',
    status: 'active',
    totalDeposited: 0,
    totalWithdrawn: 0,
    totalSpent: 0,
    lastTransactionAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  console.log('✅ Created admin user: admin@cosmetics.com / adminadmin');
  console.log('✅ Created wallet for admin user');
};

module.exports.down = async function down() {
  const admin = await DB.collection(COLLECTION.USERS).findOne({ email: 'admin@cosmetics.com' });
  
  if (admin) {
    // Delete admin wallet
    await DB.collection(COLLECTION.WALLETS).deleteOne({ 
      ownerId: admin._id, 
      ownerType: 'user' 
    });
  }
  
  await DB.collection(COLLECTION.USERS).deleteOne({ email: 'admin@cosmetics.com' });
  await DB.collection(COLLECTION.AUTHS).deleteMany({ key: 'admin@cosmetics.com' });
  await DB.collection(COLLECTION.AUTHS).deleteMany({ key: 'admin' });
  
  console.log('✅ Rolled back admin user and wallet');
};
