const { DB, COLLECTION } = require("./lib/index.cjs");

const CONTACT_KEYS_TO_DELETE = ["contactDistrict"];

const GHN_SENDER_KEYS = [
  "GHN_SENDER_ADDRESS",
  "GHN_SENDER_PROVINCE_ID",
  "GHN_SENDER_PROVINCE_NAME",
  "GHN_SENDER_DISTRICT_ID",
  "GHN_SENDER_DISTRICT_NAME",
  "GHN_SENDER_WARD_CODE",
  "GHN_SENDER_WARD_NAME",
];

module.exports.up = async function () {
  const deleteResult = await DB.collection(COLLECTION.SETTING).deleteMany({
    key: { $in: CONTACT_KEYS_TO_DELETE },
  });
  console.log(
    `Deleted ${deleteResult.deletedCount || 0} settings: ${CONTACT_KEYS_TO_DELETE.join(
      ", ",
    )}`,
  );

  const updateResult = await DB.collection(COLLECTION.SETTING).updateMany(
    { key: { $in: GHN_SENDER_KEYS } },
    { $set: { visible: true, updatedAt: new Date() } },
  );
  console.log(
    `Updated GHN sender settings visibility: matched ${updateResult.matchedCount || 0}, modified ${updateResult.modifiedCount || 0}`,
  );
};

module.exports.down = async function () {
  const updateResult = await DB.collection(COLLECTION.SETTING).updateMany(
    { key: { $in: GHN_SENDER_KEYS } },
    { $set: { visible: false, updatedAt: new Date() } },
  );
  console.log(
    `Rollback GHN sender settings visibility: matched ${updateResult.matchedCount || 0}, modified ${updateResult.modifiedCount || 0}`,
  );
};

