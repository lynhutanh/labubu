import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { authService } from "../src/services";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";

interface LoginFormData {
  username: string;
  password: string;
}

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>();

  const {
    register: registerRegister,
    handleSubmit: handleSubmitRegister,
    formState: { errors: registerErrors },
    watch,
  } = useForm<RegisterFormData>();

  const password = watch("password");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await authService.login({
        username: data.username,
        password: data.password,
        remember: false,
      });
      toast.success("Login successful!");
      // Redirect to home page or dashboard
      router.push("/");
    } catch (error: any) {
      // Backend trả về lỗi dạng { statusCode: number, message: string | string[] }
      let errorMessage = "Login failed. Please try again.";
      if (error?.message) {
        errorMessage = Array.isArray(error.message)
          ? error.message[0]
          : error.message;
      } else if (error?.data?.message) {
        errorMessage = Array.isArray(error.data.message)
          ? error.data.message[0]
          : error.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      toast.success("Registration successful!");
      // Auto login after registration
      setIsLoginMode(true);
      // Optionally auto-login
      try {
        await authService.login({
          username: data.username,
          password: data.password,
        });
        router.push("/");
      } catch {
        // If auto-login fails, just show success message
        toast.success("Please login with your new account");
      }
    } catch (error: any) {
      // Backend trả về lỗi dạng { statusCode: number, message: string | string[] }
      let errorMessage = "Registration failed. Please try again.";
      if (error?.message) {
        errorMessage = Array.isArray(error.message)
          ? error.message[0]
          : error.message;
      } else if (error?.data?.message) {
        errorMessage = Array.isArray(error.data.message)
          ? error.data.message[0]
          : error.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  const handleGoogleLoginSuccess = async (
    credentialResponse: CredentialResponse | { credential?: string },
  ) => {
    if (!credentialResponse?.credential) {
      toast.error("Google login failed. Please try again.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.loginWithGoogle(credentialResponse.credential);
      toast.success("Login successful!");
      router.push("/");
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.data?.message ||
        "Google login failed. Please try again.";
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    toast.error("Google login failed. Please try again.");
  };

  if (!isClient) {
    return (
      <>
        <Head>
          <title>Login & Register - Alagatracker</title>
          <meta
            name="description"
            content="Login or register to Alagatracker"
          />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-[hsl(220,20%,8%)] text-white">
          Loading...
        </div>
      </>
    );
  }

  const pageContent = (
    <>
      <Head>
        <title>Login & Register - Alagatracker</title>
        <meta name="description" content="Login or register to Alagatracker" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="min-h-screen flex items-start md:items-center justify-center p-4 md:p-4 pt-12 pb-8 md:py-4 relative font-['Inter',sans-serif]">
        {/* Background */}
        <div
          className="fixed inset-0 bg-cover bg-center brightness-[0.7]"
          style={{
            backgroundImage:
              "url('/gitduck-vs-code-extensions-animation-opt.gif')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="fixed inset-0 bg-[hsl(220,20%,8%)] opacity-60" />

        {/* Main Auth Container */}
        <div className="relative z-10 w-full max-w-[900px] h-auto md:h-[600px] min-h-[500px] md:min-h-0 rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] my-4 md:my-auto">
          {/* Glass Effect */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[15px] border border-white/20 rounded-3xl pointer-events-none" />

          <div className="relative h-full flex min-h-[500px] md:min-h-0">
            {/* Forms Wrapper */}
            <div className="relative md:absolute inset-0 flex md:flex-row flex-col w-full">
              {/* Left Side - Register Form */}
              <div
                className={`w-full md:w-1/2 h-auto md:h-full flex items-start md:items-center justify-start md:justify-center pt-8 pb-8 px-6 md:p-8 ${isLoginMode ? "hidden md:flex" : "flex"}`}
              >
                <motion.div
                  className="w-full max-w-[320px] relative z-10"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: isLoginMode ? 0 : 1,
                    x: isLoginMode ? -20 : 0,
                  }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  style={{
                    pointerEvents: isLoginMode ? "none" : "auto",
                  }}
                >
                  <h2 className="text-3xl font-bold text-center mb-2 text-white">
                    Register
                  </h2>

                  <form onSubmit={handleSubmitRegister(onRegisterSubmit)}>
                    <div className="relative mb-4">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(220,10%,60%)] transition-colors" />
                      <input
                        type="text"
                        placeholder="Username"
                        {...registerRegister("username", {
                          required: "Username is required",
                        })}
                        className="w-full h-12 pl-12 pr-4 rounded-lg bg-[hsla(220,20%,18%,0.5)] border border-[hsla(220,15%,25%,0.5)] text-white text-sm placeholder:text-[hsl(220,10%,60%)] focus:outline-none focus:border-[hsl(16,85%,60%)] focus:shadow-[0_0_0_2px_hsla(16,85%,60%,0.2)] transition-all hover:bg-[hsla(220,20%,18%,0.7)]"
                      />
                      {registerErrors.username && (
                        <p className="mt-1 text-red-400 text-xs">
                          {registerErrors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="relative mb-4">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(220,10%,60%)] transition-colors" />
                      <input
                        type="email"
                        placeholder="Email"
                        {...registerRegister("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                        className="w-full h-12 pl-12 pr-4 rounded-lg bg-[hsla(220,20%,18%,0.5)] border border-[hsl(220,15%,25%,0.5)] text-white text-sm placeholder:text-[hsl(220,10%,60%)] focus:outline-none focus:border-[hsl(16,85%,60%)] focus:shadow-[0_0_0_2px_hsla(16,85%,60%,0.2)] transition-all hover:bg-[hsla(220,20%,18%,0.7)]"
                      />
                      {registerErrors.email && (
                        <p className="mt-1 text-red-400 text-xs">
                          {registerErrors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="relative mb-4">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(220,10%,60%)] transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        {...registerRegister("password", {
                          required: "Password is required",
                          minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters",
                          },
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
                      {registerErrors.password && (
                        <p className="mt-1 text-red-400 text-xs">
                          {registerErrors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="relative mb-4">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(220,10%,60%)] transition-colors" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        {...registerRegister("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (value) =>
                            value === password || "Passwords do not match",
                        })}
                        className="w-full h-12 pl-12 pr-12 rounded-lg bg-[hsla(220,20%,18%,0.5)] border border-[hsl(220,15%,25%,0.5)] text-white text-sm placeholder:text-[hsl(220,10%,60%)] focus:outline-none focus:border-[hsl(16,85%,60%)] focus:shadow-[0_0_0_2px_hsla(16,85%,60%,0.2)] transition-all hover:bg-[hsla(220,20%,18%,0.7)]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(220,10%,60%)] hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                      {registerErrors.confirmPassword && (
                        <p className="mt-1 text-red-400 text-xs">
                          {registerErrors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 rounded-lg bg-[hsl(16,85%,60%)] text-white text-base font-semibold transition-all hover:shadow-[0_0_20px_hsla(16,85%,60%,0.4),0_0_40px_hsla(16,85%,60%,0.2)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Registering..." : "Register"}
                    </button>
                  </form>

                  <div className="mt-3 text-center">
                    <p className="text-sm text-[hsl(220,10%,60%)] mb-4">
                      or register with social platforms
                    </p>
                    {googleClientId ? (
                      <div className="flex justify-center">
                        <GoogleLogin
                          onSuccess={handleGoogleLoginSuccess}
                          onError={handleGoogleLoginError}
                          type="icon"
                          shape="circle"
                          size="large"
                          theme="outline"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-red-300">
                        Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID
                      </p>
                    )}
                  </div>

                  <div className="mt-3 text-center md:hidden">
                    <p className="text-sm text-white/80 mb-4">
                      Already have an account?
                    </p>
                    <button
                      onClick={() => setIsLoginMode(true)}
                      className="px-6 py-2 rounded-full border border-white/50 bg-transparent text-white text-sm font-semibold transition-all hover:bg-white/10 hover:border-white/70"
                    >
                      Login
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Right Side - Login Form */}
              <div
                className={`w-full md:w-1/2 h-auto md:h-full flex items-start md:items-center justify-start md:justify-center pt-8 pb-8 px-6 md:p-8 ${isLoginMode ? "flex" : "hidden md:flex"}`}
              >
                <motion.div
                  className="w-full max-w-[320px]"
                  initial={{ opacity: 1, x: 0 }}
                  animate={{
                    opacity: isLoginMode ? 1 : 0,
                    x: isLoginMode ? 0 : 20,
                  }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  style={{
                    pointerEvents: isLoginMode ? "auto" : "none",
                  }}
                >
                  <h2 className="text-3xl font-bold text-center mb-2 text-white">
                    Login
                  </h2>

                  <form onSubmit={handleSubmitLogin(onLoginSubmit)}>
                    <div className="relative mb-4">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(220,10%,60%)] transition-colors" />
                      <input
                        type="text"
                        placeholder="Username"
                        {...registerLogin("username", {
                          required: "Username is required",
                        })}
                        className="w-full h-12 pl-12 pr-4 rounded-lg bg-[hsla(220,20%,18%,0.5)] border border-[hsl(220,15%,25%,0.5)] text-white text-sm placeholder:text-[hsl(220,10%,60%)] focus:outline-none focus:border-[hsl(16,85%,60%)] focus:shadow-[0_0_0_2px_hsla(16,85%,60%,0.2)] transition-all hover:bg-[hsla(220,20%,18%,0.7)]"
                      />
                      {loginErrors.username && (
                        <p className="mt-1 text-red-400 text-xs">
                          {loginErrors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="relative mb-4">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(220,10%,60%)] transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        {...registerLogin("password", {
                          required: "Password is required",
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
                      {loginErrors.password && (
                        <p className="mt-1 text-red-400 text-xs">
                          {loginErrors.password.message}
                        </p>
                      )}
                    </div>

                    <Link
                      href="/forgot-password"
                      className="block text-right text-sm text-[hsl(220,10%,60%)] mb-4 hover:text-[hsl(16,85%,60%)] transition-colors"
                    >
                      Forgot Password?
                    </Link>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 rounded-lg bg-[hsl(16,85%,60%)] text-white text-base font-semibold transition-all hover:shadow-[0_0_20px_hsla(16,85%,60%,0.4),0_0_40px_hsla(16,85%,60%,0.2)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </button>
                  </form>

                  <div className="mt-3 text-center">
                    <p className="text-sm text-[hsl(220,10%,60%)] mb-4">
                      or login with social platforms
                    </p>
                    {googleClientId ? (
                      <div className="flex justify-center">
                        <GoogleLogin
                          onSuccess={handleGoogleLoginSuccess}
                          onError={handleGoogleLoginError}
                          type="icon"
                          shape="circle"
                          size="large"
                          theme="outline"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-red-300">
                        Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID
                      </p>
                    )}
                  </div>

                  <div className="mt-3 text-center md:hidden">
                    <p className="text-sm text-white/80 mb-4">
                      {"Don't have an account?"}
                    </p>
                    <button
                      onClick={() => setIsLoginMode(false)}
                      className="px-6 py-2 rounded-full border border-white/50 bg-transparent text-white text-sm font-semibold transition-all hover:bg-white/10 hover:border-white/70"
                    >
                      Register
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Sliding Overlay Panel - Hidden on mobile */}
            <motion.div
              className="hidden md:block absolute top-0 left-0 w-1/2 h-full z-10"
              animate={{
                left: isLoginMode ? 0 : "50%",
              }}
              transition={{
                duration: 0.7,
                ease: [0.65, 0, 0.35, 1],
              }}
            >
              <div className="h-full bg-white/15 backdrop-blur-[24px] border-r border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col items-center justify-center text-center p-8">
                <motion.h1
                  className="text-3xl font-bold mb-2 text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {isLoginMode ? "Hello, Welcome To" : "Welcome Back!"}
                </motion.h1>
                <motion.h2
                  className="text-5xl font-bold mb-6 text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Labubu Store!
                </motion.h2>
                <motion.p
                  className="text-white/90 mb-8 text-base"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {isLoginMode
                    ? "Don't have an account?"
                    : "Already have an account?"}
                </motion.p>
                <motion.button
                  onClick={toggleMode}
                  className="px-8 py-3 rounded-full border border-white/50 bg-transparent text-white text-base font-semibold transition-all hover:bg-white/5 hover:border-white/70 hover:scale-105"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {isLoginMode ? "Register" : "Login"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Logo - Bottom Right */}
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-20 pointer-events-none">
          <Image
            src="/logo.png"
            alt="Labubu Store Logo"
            width={80}
            height={80}
            className="md:w-[120px] md:h-[120px] w-[80px] h-[80px] object-contain"
            priority
          />
        </div>
      </div>
    </>
  );

  return pageContent;
}
