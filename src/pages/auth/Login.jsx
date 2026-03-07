import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff, Shield, Building2, ArrowRight, Lock } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const { token, ...userData } = res.data.data;
      login(userData, token);

      // Smart redirect based on role returned from backend
      if (userData.role === 'ADMIN') {
        toast.success(`Welcome, ${userData.name}! Redirecting to Admin Panel…`, { icon: '🛡️' });
        navigate('/admin');
      } else {
        toast.success(`Welcome back, ${userData.name}!`, { icon: '⚡' });
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] flex-col justify-between p-14 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-36 -translate-x-36" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
            <Zap size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-white font-bold text-2xl leading-none">SmartBiz</h1>
            <p className="text-indigo-300 text-xs mt-0.5">AI-Powered Business Suite</p>
          </div>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-6">
          <h2 className="font-display text-4xl font-bold text-white leading-tight">
            Run your business<br />
            <span className="text-indigo-300">smarter, not harder.</span>
          </h2>
          <div className="space-y-4">
            {[
              { icon: Building2, text: 'One platform for invoices, expenses & inventory' },
              { icon: Zap, text: 'AI-powered insights and email generation' },
              { icon: Shield, text: 'Secure access for both admins and businesses' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-indigo-300" />
                </div>
                <p className="text-indigo-100 text-sm">{text}</p>
              </div>
            ))}
          </div>

          {/* Role hint badges */}
          <div className="flex gap-3 pt-2">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-xl px-3 py-2">
              <Building2 size={14} className="text-indigo-300" />
              <span className="text-xs text-indigo-200 font-medium">Business Login</span>
            </div>
            <div className="flex items-center gap-2 bg-amber-500/20 backdrop-blur rounded-xl px-3 py-2 border border-amber-500/30">
              <Shield size={14} className="text-amber-400" />
              <span className="text-xs text-amber-300 font-medium">Admin Login</span>
            </div>
          </div>
          <p className="text-indigo-400 text-xs">
            ✓ Use the same login form — the system auto-detects your role.
          </p>
        </div>

        <p className="relative z-10 text-indigo-500 text-xs">© 2024 SmartBiz. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f8f9ff]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <h1 className="font-display text-xl font-bold text-indigo-900">SmartBiz</h1>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-indigo-900">Sign In</h2>
            <p className="text-gray-400 text-sm mt-1.5">
              Access your business or admin dashboard
            </p>
          </div>

          {/* Role tip */}
          <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-6">
            <Lock size={15} className="text-indigo-400 mt-0.5 shrink-0" />
            <p className="text-xs text-indigo-500 leading-relaxed">
              <span className="font-semibold text-indigo-600">Single sign-in for everyone.</span>{' '}
              Admins and business owners use the same form — you'll be redirected to your dashboard automatically.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary-500 hover:text-primary-700 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-11"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base font-semibold flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in…</>
              ) : (
                <>Sign In <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
              Register your business
            </Link>
          </p>

          {/* Admin hint */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 justify-center">
              <Shield size={13} className="text-amber-500" />
              <p className="text-xs text-gray-400">
                Administrators — use your admin email and password above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
