const { DB, COLLECTION } = require("./lib/index.cjs");

const KEYS_TO_DELETE = [
  "contactAddress",
  "contactProvince",
  "contactDistrict",
  "contactWard",
];

module.exports.up = async function () {
  const result = await DB.collection(COLLECTION.SETTING).deleteMany({
    key: { $in: KEYS_TO_DELETE },
  });
  console.log(
    `Deleted ${result.deletedCount || 0} settings: ${KEYS_TO_DELETE.join(", ")}`,
  );
};

module.exports.down = async function () {
  console.log(
    `No rollback for deleted settings: ${KEYS_TO_DELETE.join(", ")}`,
  );
};

