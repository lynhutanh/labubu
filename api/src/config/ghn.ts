export default () => ({
    token: process.env.GHN_TOKEN || "",
    shopId: process.env.GHN_SHOP_ID || "",
    baseUrl: "https://online-gateway.ghn.vn",
});
