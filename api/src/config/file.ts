import { join } from "path";

export default () => ({
  publicDir: join(__dirname, "..", "..", "public"),
  publicPath: "/public",
  avatarDir: join(__dirname, "..", "..", "public", "avatars"),
  userAvatarDir: join(__dirname, "..", "..", "public", "users", "avatars"),
  sellerAvatarDir: join(__dirname, "..", "..", "public", "sellers", "avatars"),
  categoryDir: join(__dirname, "..", "..", "public", "categories"),
  brandDir: join(__dirname, "..", "..", "public", "brands"),
  settingDir: join(__dirname, "..", "..", "public", "settings"),
  imageDir: join(__dirname, "..", "..", "public", "images"),
  uploadsDir: join(__dirname, "..", "..", "public", "uploads"),
  uploadsImageDir: join(__dirname, "..", "..", "public", "uploads", "images"),
  productImageDir: join(__dirname, "..", "..", "public", "products", "images"),
  productMediaDir: join(__dirname, "..", "..", "public", "products", "media"),
  videoThumbDir: join(__dirname, "..", "..", "public", "thumbnails"),
});
