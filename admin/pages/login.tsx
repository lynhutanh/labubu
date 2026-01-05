import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Lock, Mail } from 'lucide-react';
import { authService } from '../src/services';
import { storage } from '../src/utils/storage';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: 'admin',
    password: 'adminadmin',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(formData);
      storage.setToken(response.data.token);
      storage.setUser(response.data.user);
      toast.success('Đăng nhập thành công!');
      router.push('/dashboard');
    } catch (error: any) {
      let message = 'Đăng nhập thất bại. Vui lòng thử lại.';
      
      if (error.response) {
        const errorData = error.response.data;
        if (errorData?.message) {
          message = errorData.message;
        } else if (error.response.status === 401) {
          message = 'Username hoặc mật khẩu không đúng.';
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
        <title>Đăng nhập Admin - Cosmetics</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white text-2xl">💄</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Panel
              </h1>
              <p className="text-gray-600">
                Đăng nhập để quản lý hệ thống
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="admin"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}


