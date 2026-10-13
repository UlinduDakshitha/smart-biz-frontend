
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Zap,
  ArrowLeft,
  ArrowRight,
  Mail,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { authAPI } from "../../services/api";
import AuthBackground from "../../components/layout/AuthBackground";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "otp"
          ? value.replace(/\D/g, "").slice(0, 6)
          : value,
    }));
  };

  // Step 1: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await authAPI.forgotPassword({
        email: form.email.trim(),
      });

      toast.success(
        "If the email is registered, a password-reset OTP has been sent."
      );

      setStep(2);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (form.otp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      await authAPI.verifyOtp({
        email: form.email.trim(),
        otp: form.otp,
      });

      toast.success("OTP verified successfully.");
      setStep(3);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Invalid or expired OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (form.newPassword.length < 8) {
      toast.error("Password must contain at least 8 characters.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await authAPI.resetPassword({
        email: form.email.trim(),
        otp: form.otp,
        newPassword: form.newPassword,
      });

      toast.success("Password reset successfully. Please sign in.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to reset password. Please request a new OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, label: "Email" },
    { number: 2, label: "Verify OTP" },
    { number: 3, label: "New Password" },
  ];

  return (
    <>
      <AuthBackground />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/90 p-6 shadow-2xl backdrop-blur-xl sm:p-9">
          <Link
            to="/login"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-indigo-600"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>

          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <Zap size={23} className="text-white" />
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-indigo-950">
                SmartBiz
              </h1>
              <p className="text-xs text-gray-500">
                Account Recovery
              </p>
            </div>
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-extrabold text-indigo-950">
              {step === 1 && "Forgot password?"}
              {step === 2 && "Verify your email"}
              {step === 3 && "Create new password"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {step === 1 &&
                "Enter your account email address and we'll send instructions to reset your password."}
              {step === 2 &&
                `Enter the 6-digit OTP sent to ${form.email}.`}
              {step === 3 &&
                "Choose a new password for your SmartBiz account."}
            </p>
          </div>

          <div className="mb-8 grid grid-cols-3 gap-2">
            {steps.map((item) => {
              const active = step === item.number;
              const completed = step > item.number;

              return (
                <div key={item.number} className="space-y-2">
                  <div
                    className={`h-1.5 rounded-full ${
                      active || completed
                        ? "bg-indigo-600"
                        : "bg-gray-200"
                    }`}
                  />
                  <p
                    className={`text-center text-[11px] font-bold ${
                      active || completed
                        ? "text-indigo-700"
                        : "text-gray-400"
                    }`}
                  >
                    {completed ? "✓ " : ""}
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Reset OTP"}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  6-digit OTP
                </label>

                <div className="relative">
                  <ShieldCheck
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    name="otp"
                    value={form.otp}
                    onChange={handleChange}
                    placeholder="000000"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-center font-mono text-lg font-bold tracking-[0.4em] outline-none transition focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  The OTP expires after 5 minutes.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify OTP"}
                {!loading && <ShieldCheck size={17} />}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => setStep(1)}
                className="w-full py-2 text-sm font-semibold text-gray-500 hover:text-indigo-600"
              >
                Change email address
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  New Password
                </label>

                <div className="relative">
                  <Lock
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-11 text-sm outline-none transition focus:border-indigo-500 focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Confirm New Password
                </label>

                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Resetting Password..." : "Reset Password"}
                {!loading && <CheckCircle2 size={17} />}
              </button>
            </form>
          )}

          <div className="mt-7 border-t border-gray-100 pt-5 text-center">
            <p className="text-xs text-gray-400">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-bold text-indigo-600 hover:text-indigo-700"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
