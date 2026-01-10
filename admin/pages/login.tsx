import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Lock, Mail, Loader2 } from "lucide-react";
import { authService } from "../src/services";
import { storage } from "../src/utils/storage";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "admin",
    password: "adminadmin",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(formData);
      storage.setToken(response.data.token);
      storage.setUser(response.data.user);
      toast.success("Đăng nhập thành công!");
      router.push("/dashboard");
    } catch (error: any) {
      let message = "Đăng nhập thất bại. Vui lòng thử lại.";

      if (error.response) {
        const errorData = error.response.data;
        if (errorData?.message) {
          message = errorData.message;
        } else if (error.response.status === 401) {
          message = "Username hoặc mật khẩu không đúng.";
        }
      } else if (error.message) {
        message = error.message;
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Đăng nhập Admin - Labubu</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Galaxy Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-black -z-10">
          {/* Stars Effect */}
          {[...Array(200)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                opacity: Math.random() * 0.8 + 0.2,
                animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
              }}
            />
          ))}

          {/* Nebula Clouds */}
          <div className="absolute top-0 left-0 w-full h-full">
            <motion.div
              className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full opacity-20 blur-3xl"
              animate={{
                x: [0, 50, 0],
                y: [0, 30, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            <motion.div
              className="absolute top-40 right-20 w-80 h-80 bg-pink-500 rounded-full opacity-20 blur-3xl"
              animate={{
                x: [0, -40, 0],
                y: [0, 50, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            <motion.div
              className="absolute bottom-20 left-1/3 w-72 h-72 bg-indigo-500 rounded-full opacity-15 blur-3xl"
              animate={{
                x: [0, 60, 0],
                y: [0, -40, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          </div>
        </div>

        <div className="w-full max-w-md px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="galaxy-card rounded-2xl p-8 backdrop-blur-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(79, 70, 229, 0.15) 50%, rgba(0, 0, 0, 0.4) 100%)",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 40px rgba(168, 85, 247, 0.2)",
            }}
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                style={{
                  boxShadow: "0 0 30px rgba(236, 72, 153, 0.6)",
                }}
              >
                <span className="text-white text-3xl">⭐</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold mb-2"
                style={{
                  background:
                    "linear-gradient(135deg, #fbbf24, #f59e0b, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Labubu Admin
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-purple-200"
              >
                Đăng nhập để quản lý hệ thống
              </motion.p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="admin"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-purple-300 backdrop-blur-sm transition-all"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-white placeholder-purple-300 backdrop-blur-sm transition-all"
                    required
                  />
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg relative overflow-hidden"
                style={{
                  boxShadow: "0 0 25px rgba(236, 72, 153, 0.5)",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </span>
                ) : (
                  "Đăng nhập"
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
}
