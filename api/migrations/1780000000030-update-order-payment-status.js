const { DB, COLLECTION } = require('./lib/index.cjs');

module.exports.up = async function () {
  const orderNumber = 'ORD-MKSHWV0E-4O79QT';
  console.log(`Updating payment status for order ${orderNumber}...`);

  const order = await DB.collection(COLLECTION.ORDERS).findOne({ orderNumber });

  if (!order) {
    console.log(`Order ${orderNumber} not found!`);
    return;
  }

  await DB.collection(COLLECTION.ORDERS).updateOne(
    { _id: order._id },
    {
      $set: {
        paymentStatus: 'paid',
        paidAt: new Date(),
        updatedAt: new Date()
      }
    }
  );

  console.log(`Successfully updated order ${orderNumber} to PAID status.`);
};

module.exports.down = async function () {
  const orderNumber = 'ORD-MKSHWV0E-4O79QT';
  console.log(`Rolling back payment status for order ${orderNumber}...`);

  await DB.collection(COLLECTION.ORDERS).updateOne(
    { orderNumber },
    {
      $set: {
        paymentStatus: 'pending',
        paidAt: null,
        updatedAt: new Date()
      }
    }
  );

  console.log(`Rolled back order ${orderNumber} to PENDING status.`);
};
