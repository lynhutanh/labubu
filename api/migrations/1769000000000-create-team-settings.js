const { DB, COLLECTION } = require('./lib/index.cjs');

const teamSettings = [
    {
        key: "team_member1_name",
        value: "Tiểu Dương Doanh",
        name: "Tên thành viên 1",
        description: "Tên của thành viên đội ngũ hỗ trợ thứ nhất",
        type: "text",
        public: true,
        visible: true,
        editable: true,
        group: "team",
    },
    {
        key: "team_member1_description",
        value:
            "Tôi có thể nói tiếng Anh và nhiều ngôn ngữ khác. Tôi làm việc với sự kiên nhẫn, kinh nghiệm và khiếu hài hước, và bạn sẽ nhận được lời khuyên chuyên nghiệp về lựa chọn sản phẩm, phản hồi nhanh chóng và giải quyết các vấn đề dịch vụ sau bán hàng. Vui lòng liên hệ với tôi!",
        name: "Mô tả thành viên 1",
        description: "Mô tả về thành viên đội ngũ hỗ trợ thứ nhất",
        type: "textarea",
        public: true,
        visible: true,
        editable: true,
        group: "team",
    },
    {
        key: "team_member1_whatsapp",
        value: "",
        name: "WhatsApp thành viên 1",
        description: "Số WhatsApp của thành viên 1",
        type: "text",
        public: true,
        visible: true,
        editable: true,
        group: "team",
    },
    {
        key: "team_member1_whatsapp_link",
        value: "",
        name: "Link WhatsApp thành viên 1",
        description: "Link WhatsApp của thành viên 1 (ví dụ: https://wa.me/84123456789)",
        type: "text",
        public: true,
        visible: true,
        editable: true,
        group: "team",
    },
    {
        key: "team_member1_telegram",
        value: "",
        name: "Telegram thành viên 1",
        description: "Username Telegram của thành viên 1",
        type: "text",
        public: true,
        visible: true,
        editable: true,
        group: "team",
    },
    {
        key: "team_member1_telegram_link",
        value: "",
        name: "Link Telegram thành viên 1",
        description: "Link Telegram của thành viên 1 (ví dụ: https://t.me/username)",
        type: "text",
        public: true,
        visible: true,
        editable: true,
        group: "team",
    },
    {
        key: "team_member1_avatar",
        value: "/logo.png",
        name: "Avatar thành viên 1",
        description: "Hình ảnh avatar của thành viên 1",
        type: "file",
        public: true,
        visible: true,
        editable: true,
        group: "team",
    },
    {
        key: "team_member2_name",
        value: "Tiểu Dương Lăng",
        name: "Tên thành viên 2",
        description: "Tên của thành viên đội ngũ hỗ trợ thứ hai",
        type: "text",
        public: true,
        visible: true,
        editable: true,
        group: "team",
    },
    {
        key: "team_member2_description",
        value:
            "Tôi thông thạo cả tiếng Anh và tiếng Pháp, luôn sẵn sàng hỗ trợ bạn mọi thắc mắc về mua hàng. Mục tiêu của cô ấy là tìm ra giải pháp tối ưu về giá cả, vận chuyển và giao hàng. Cảm ơn sự ủng hộ và tin tưởng của quý khách.",
        name: "Mô tả thành viên 2",
        description: "Mô tả về thành viên đội ngũ hỗ trợ thứ hai",
        type: "textarea",
        public: true,
        visible: true,
        editable: true,
        group: "team",
    },
    {
        key: "team_member2_whatsapp",
        value: "",
        name: "WhatsApp thành viên 2",
        description: "Số WhatsApp của thành viên 2",
        type: "text",
        public: true,
        visible: true,
        editable: true,
        group: "team",
    },
    {
        key: "team_member2_whatsapp_link",
        value: "",
        name: "Link WhatsApp thành viên 2",
        description: "Link WhatsApp của thành viên 2 (ví dụ: https://wa.me/84123456789)",
        type: "text",
        public: true,
        visible: true,
        editable: true,
        group: "team",
    },
    {
        key: "team_member2_telegram",
        value: "",
        name: "Telegram thành viên 2",
        description: "Username Telegram của thành viên 2",
        type: "text",
        public: true,
        visible: true,
        editable: true,
        group: "team",
    },
    {
        key: "team_member2_telegram_link",
        value: "",
        name: "Link Telegram thành viên 2",
        description: "Link Telegram của thành viên 2 (ví dụ: https://t.me/username)",
        type: "text",
        public: true,
        visible: true,
        editable: true,
        group: "team",
    },
    {
        key: "team_member2_avatar",
        value: "/logo.png",
        name: "Avatar thành viên 2",
        description: "Hình ảnh avatar của thành viên 2",
        type: "file",
        public: true,
        visible: true,
        editable: true,
        group: "team",
    },
];

module.exports.up = async function () {
    console.log('Team settings migration started');

    for (const setting of teamSettings) {
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
            await DB.collection(COLLECTION.SETTING).updateOne(
                { key: setting.key },
                {
                    $set: {
                        ...setting,
                        type: setting.type || 'text',
                        updatedAt: new Date()
                    }
                }
            );
            console.log(`Updated setting: ${setting.key}`);
        }
    }

    console.log('Team settings migration completed');
};

module.exports.down = async function () {
    await DB.collection(COLLECTION.SETTING).deleteMany({ group: 'team' });
    console.log('Rollback Team settings completed');
};
