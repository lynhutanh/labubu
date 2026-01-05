import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { authService } from '../src/services';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSuccess(true);
      toast.success('If that email exists, we\'ve sent a password reset link to it.');
    } catch (error: any) {
      let errorMessage = 'Failed to send reset email. Please try again.';
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

  return (
    <>
      <Head>
        <title>Forgot Password - Labubu Store</title>
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
                  <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
                  <p className="text-white/80 text-sm">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="relative mb-4">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(220,10%,60%)] transition-colors" />
                    <input
                      type="email"
                      placeholder="Email address"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className="w-full h-12 pl-12 pr-4 rounded-lg bg-[hsla(220,20%,18%,0.5)] border border-[hsl(220,15%,25%,0.5)] text-white text-sm placeholder:text-[hsl(220,10%,60%)] focus:outline-none focus:border-[hsl(16,85%,60%)] focus:shadow-[0_0_0_2px_hsla(16,85%,60%,0.2)] transition-all hover:bg-[hsla(220,20%,18%,0.7)]"
                    />
                    {errors.email && (
                      <p className="mt-1 text-red-400 text-xs">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-lg bg-[hsl(16,85%,60%)] text-white text-base font-semibold transition-all hover:shadow-[0_0_20px_hsla(16,85%,60%,0.4),0_0_40px_hsla(16,85%,60%,0.2)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                  <p className="text-white/80 text-sm">
                    We've sent a password reset link to your email address.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-[hsl(220,10%,60%)] hover:text-[hsl(16,85%,60%)] transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </div>
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


