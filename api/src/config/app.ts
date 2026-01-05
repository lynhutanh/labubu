export default () => ({
  port: parseInt(process.env.HTTP_PORT ?? "5001", 10),
  baseUrl: process.env.BASE_URL ?? "http://localhost:5001",
  userUrl: process.env.USER_URL ?? "http://localhost:3000",
  adminUrl: process.env.ADMIN_URL ?? "http://localhost:3001",
});
