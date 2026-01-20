const { DB, COLLECTION } = require("./lib/index.cjs");

const now = () => new Date();

const settings = [
    {
        key: "GHN_SENDER_ADDRESS",
        value: "",
        name: "Địa chỉ gửi hàng",
        description: "Số nhà/đường (dùng cho GHN)",
        public: false,
        group: "ghn",
        editable: true,
        visible: true,
        type: "text",
        order: 100,
    },
    {
        key: "GHN_SENDER_PROVINCE_ID",
        value: "",
        name: "Tỉnh/Thành phố (ID)",
        description: "ProvinceID GHN (dùng cho GHN)",
        public: false,
        group: "ghn",
        editable: true,
        visible: true,
        type: "text",
        order: 101,
    },
    {
        key: "GHN_SENDER_PROVINCE_NAME",
        value: "",
        name: "Tỉnh/Thành phố",
        description: "Tên tỉnh/thành từ GHN (dùng cho GHN)",
        public: false,
        group: "ghn",
        editable: true,
        visible: true,
        type: "text",
        order: 102,
    },
    {
        key: "GHN_SENDER_DISTRICT_ID",
        value: "",
        name: "Quận/Huyện (ID)",
        description: "DistrictID GHN (dùng cho GHN)",
        public: false,
        group: "ghn",
        editable: true,
        visible: true,
        type: "text",
        order: 103,
    },
    {
        key: "GHN_SENDER_DISTRICT_NAME",
        value: "",
        name: "Quận/Huyện",
        description: "Tên quận/huyện từ GHN (dùng cho GHN)",
        public: false,
        group: "ghn",
        editable: true,
        visible: true,
        type: "text",
        order: 104,
    },
    {
        key: "GHN_SENDER_WARD_CODE",
        value: "",
        name: "Phường/Xã (Code)",
        description: "WardCode GHN (dùng cho GHN)",
        public: false,
        group: "ghn",
        editable: true,
        visible: true,
        type: "text",
        order: 105,
    },
    {
        key: "GHN_SENDER_WARD_NAME",
        value: "",
        name: "Phường/Xã",
        description: "Tên phường/xã từ GHN (dùng cho GHN)",
        public: false,
        group: "ghn",
        editable: true,
        visible: true,
        type: "text",
        order: 106,
    },
];

module.exports.up = async function () {
    for (const setting of settings) {
        const exists = await DB.collection(COLLECTION.SETTING).findOne({
            key: setting.key,
        });
        if (exists) continue;
        await DB.collection(COLLECTION.SETTING).insertOne({
            ...setting,
            createdAt: now(),
            updatedAt: now(),
        });
        console.log(`Inserted setting: ${setting.key}`);
    }
};

module.exports.down = async function () {
    await DB.collection(COLLECTION.SETTING).deleteMany({
        key: { $in: settings.map((s) => s.key) },
    });
    console.log("Rollback GHN sender settings completed");
};

