import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Zap, ArrowLeft, Mail, KeyRound, ShieldCheck, Eye, EyeOff, CheckCircle2, RefreshCw } from 'lucide-react';

const STEPS = ['email', 'otp', 'reset', 'done'];

export default function ForgotPassword() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);
  const navigate = useNavigate();

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  // ── Step 1 — Submit email ───────────────────────────────────────────────
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      toast.success('OTP sent! Check your inbox.');
      setStep('otp');
      setCountdown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input handling ──────────────────────────────────────────────────
  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  // ── Step 2 — Verify OTP ─────────────────────────────────────────────────
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length < 6) return toast.error('Enter all 6 digits.');
    setLoading(true);
    try {
      await authAPI.verifyOtp({ email, otp: otpStr });
      toast.success('OTP verified!');
      setStep('reset');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      toast.success('New OTP sent!');
      setOtp(['', '', '', '', '', '']);
      setCountdown(60);
      otpRefs.current[0]?.focus();
    } catch (err) {
      toast.error('Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3 — Reset password ─────────────────────────────────────────────
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match.');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await authAPI.resetPassword({ email, otp: otp.join(''), newPassword });
      toast.success('Password reset successfully!');
      setStep('done');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] via-[#eef2ff] to-[#e0e9ff] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        {step !== 'done' && (
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-600 text-sm font-medium mb-8 transition-colors group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </Link>
        )}

        <div className="bg-white rounded-3xl shadow-xl border border-indigo-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#312e81] to-[#4f46e5] px-8 pt-8 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center">
                <Zap size={18} className="text-white" />
              </div>
              <h1 className="font-display text-white font-bold text-lg">SmartBiz</h1>
            </div>
            <h2 className="font-display text-2xl font-bold text-white">
              {step === 'email' && 'Forgot Password?'}
              {step === 'otp' && 'Check Your Email'}
              {step === 'reset' && 'Create New Password'}
              {step === 'done' && 'Password Reset!'}
            </h2>
            <p className="text-indigo-200 text-sm mt-1">
              {step === 'email' && "Enter your registered email and we'll send a 6-digit OTP."}
              {step === 'otp' && `We sent a 6-digit code to ${email}`}
              {step === 'reset' && 'Choose a strong new password for your account.'}
              {step === 'done' && 'Your password has been changed successfully.'}
            </p>

            {/* Progress bar */}
            {step !== 'done' && (
              <div className="flex gap-2 mt-5">
                {['email', 'otp', 'reset'].map((s, i) => (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      i <= stepIndex ? 'bg-white' : 'bg-white/25'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-8">
            {/* ── Step 1: Email ── */}
            {step === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-5 fade-in">
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      className="input pl-10"
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full py-3.5 font-semibold flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading
                    ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending OTP…</>
                    : <><Mail size={16} /> Send OTP</>}
                </button>
              </form>
            )}

            {/* ── Step 2: OTP ── */}
            {step === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-6 fade-in">
                <div>
                  <label className="label text-center block mb-4">Enter the 6-digit code</label>
                  <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => otpRefs.current[i] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 focus:outline-none transition-all duration-150 ${
                          digit
                            ? 'border-primary-400 bg-primary-50 text-primary-700'
                            : 'border-indigo-100 bg-white text-indigo-900 focus:border-primary-400'
                        }`}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-3.5 font-semibold flex items-center justify-center gap-2"
                  disabled={loading || otp.join('').length < 6}
                >
                  {loading
                    ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Verifying…</>
                    : <><KeyRound size={16} /> Verify OTP</>}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0 || loading}
                    className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
                      countdown > 0
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-primary-500 hover:text-primary-700'
                    }`}
                  >
                    <RefreshCw size={13} className={countdown > 0 ? '' : 'group-hover:rotate-180 transition-transform'} />
                    {countdown > 0 ? `Resend in ${countdown}s` : "Didn't receive it? Resend OTP"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => { setStep('email'); setOtp(['','','','','','']); }}
                  className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Change email address
                </button>
              </form>
            )}

            {/* ── Step 3: Reset Password ── */}
            {step === 'reset' && (
              <form onSubmit={handleResetSubmit} className="space-y-5 fade-in">
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="input pr-11"
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPass(!showPass)}
                      tabIndex={-1}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password strength */}
                  {newPassword && (
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4].map(n => (
                        <div key={n} className={`h-1 flex-1 rounded-full transition-all ${
                          newPassword.length >= n * 3
                            ? n <= 1 ? 'bg-red-400' : n <= 2 ? 'bg-amber-400' : n <= 3 ? 'bg-yellow-400' : 'bg-emerald-500'
                            : 'bg-gray-200'
                        }`} />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="label">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      className="input pr-11"
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirm(!showConfirm)}
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1.5">Passwords don't match</p>
                  )}
                  {confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0 && (
                    <p className="text-xs text-emerald-500 mt-1.5 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Passwords match
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-3.5 font-semibold flex items-center justify-center gap-2"
                  disabled={loading || newPassword !== confirmPassword}
                >
                  {loading
                    ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Resetting…</>
                    : <><ShieldCheck size={16} /> Reset Password</>}
                </button>
              </form>
            )}

            {/* ── Step 4: Done ── */}
            {step === 'done' && (
              <div className="text-center py-6 fade-in">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h3 className="font-display text-xl font-bold text-indigo-900 mb-2">All Done!</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                  Your password has been reset successfully.<br />
                  You can now sign in with your new password.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary w-full py-3.5 font-semibold"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
