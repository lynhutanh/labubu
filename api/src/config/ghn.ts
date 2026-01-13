export default () => ({
    token: process.env.GHN_TOKEN || "",
    shopId: process.env.GHN_SHOP_ID || "",
    baseUrl: process.env.GHN_BASE_URL || "https://dev-online-gateway.ghn.vn",
});
