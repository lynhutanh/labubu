import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { authService } from '../src/services';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<ResetPasswordFormData>();

  const password = watch('password');

  useEffect(() => {
    const { token: queryToken } = router.query;
    if (queryToken && typeof queryToken === 'string') {
      setToken(queryToken);
    } else if (!queryToken) {
      toast.error('Invalid reset link');
      router.push('/forgot-password');
    }
  }, [router.query]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      setIsSuccess(true);
      toast.success('Password has been reset successfully!');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      let errorMessage = 'Failed to reset password. Please try again.';
      if (error?.message) {
        errorMessage = Array.isArray(error.message) ? error.message[0] : error.message;
      } else if (error?.data?.message) {
        errorMessage = Array.isArray(error.data.message) ? error.data.message[0] : error.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !isSuccess) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Reset Password - Labubu Store</title>
        <meta name="description" content="Reset your password" />
      </Head>

      <div className="min-h-screen flex items-center justify-center p-4 relative font-['Inter',sans-serif]">
        {/* Background */}
        <div
          className="fixed inset-0 bg-cover bg-center brightness-[0.7]"
          style={{
            backgroundImage: "url('/gitduck-vs-code-extensions-animation-opt.gif')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="fixed inset-0 bg-[hsl(220,20%,8%)] opacity-60" />

        {/* Main Container */}
        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-[15px] border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-8"
          >
            {!isSuccess ? (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                  <p className="text-white/80 text-sm">
                    Enter your new password below.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="relative mb-4">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(220,10%,60%)] transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="New Password"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters'
                        }
                      })}
                      className="w-full h-12 pl-12 pr-12 rounded-lg bg-[hsla(220,20%,18%,0.5)] border border-[hsl(220,15%,25%,0.5)] text-white text-sm placeholder:text-[hsl(220,10%,60%)] focus:outline-none focus:border-[hsl(16,85%,60%)] focus:shadow-[0_0_0_2px_hsla(16,85%,60%,0.2)] transition-all hover:bg-[hsla(220,20%,18%,0.7)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(220,10%,60%)] hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                    {errors.password && (
                      <p className="mt-1 text-red-400 text-xs">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="relative mb-4">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(220,10%,60%)] transition-colors" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm New Password"
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) =>
                          value === password || 'Passwords do not match'
                      })}
                      className="w-full h-12 pl-12 pr-12 rounded-lg bg-[hsla(220,20%,18%,0.5)] border border-[hsl(220,15%,25%,0.5)] text-white text-sm placeholder:text-[hsl(220,10%,60%)] focus:outline-none focus:border-[hsl(16,85%,60%)] focus:shadow-[0_0_0_2px_hsla(16,85%,60%,0.2)] transition-all hover:bg-[hsla(220,20%,18%,0.7)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(220,10%,60%)] hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-red-400 text-xs">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-lg bg-[hsl(16,85%,60%)] text-white text-base font-semibold transition-all hover:shadow-[0_0_20px_hsla(16,85%,60%,0.4),0_0_40px_hsla(16,85%,60%,0.2)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
                  <p className="text-white/80 text-sm">
                    Your password has been reset successfully. Redirecting to login...
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Logo */}
        <div className="fixed bottom-4 right-4 z-20 pointer-events-none">
          <Image
            src="/logo.png"
            alt="Labubu Store Logo"
            width={80}
            height={80}
            className="object-contain"
            priority
          />
        </div>
      </div>
    </>
  );
}


