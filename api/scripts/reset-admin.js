const mongoose = require("mongoose");
const crypto = require("crypto");
const { ObjectId } = require("mongodb");
require("dotenv").config();

function genSalt() {
  return crypto.randomBytes(16).toString("base64");
}

function encrypt(pw, salt) {
  return crypto.pbkdf2Sync(pw, salt, 10000, 64, "sha1").toString("base64");
}

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const admin = await db.collection("users").findOne({ role: "admin" });
  if (!admin) {
    console.log("No admin found");
    process.exit(1);
  }

  const salt = genSalt();
  const hash = encrypt("adminadmin", salt);
  const oid = admin._id instanceof ObjectId ? admin._id : new ObjectId(admin._id);

  await db.collection("auths").deleteMany({ sourceId: admin._id });
  await db.collection("auths").deleteMany({ sourceId: oid });
  await db.collection("auths").insertMany([
    { type: "email", source: "user", sourceId: oid, key: admin.email, salt, value: hash, createdAt: new Date(), updatedAt: new Date() },
    { type: "username", source: "user", sourceId: oid, key: admin.username, salt, value: hash, createdAt: new Date(), updatedAt: new Date() },
  ]);

  console.log("Admin:", admin.username, "/", admin.email);
  console.log("Password reset to: adminadmin");
  await mongoose.disconnect();
});
