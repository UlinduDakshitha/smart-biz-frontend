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
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] flex-col justify-between p-14 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 translate-x-48 -translate-y-48 rounded-full w-96 h-96 bg-white/5" />
        <div className="absolute bottom-0 left-0 rounded-full w-72 h-72 bg-white/5 translate-y-36 -translate-x-36" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center shadow-xl w-11 h-11 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl">
            <Zap size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-none text-white font-display">SmartBiz</h1>
            <p className="text-indigo-300 text-xs mt-0.5">AI-Powered Business Suite</p>
          </div>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold leading-tight text-white font-display">
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
                <div className="flex items-center justify-center w-8 h-8 bg-white/10 rounded-xl shrink-0">
                  <Icon size={15} className="text-indigo-300" />
                </div>
                <p className="text-sm text-indigo-100">{text}</p>
              </div>
            ))}
          </div>

          {/* Role hint badges */}
          <div className="flex gap-3 pt-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur rounded-xl">
              <Building2 size={14} className="text-indigo-300" />
              <span className="text-xs font-medium text-indigo-200">Business Login</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 border bg-amber-500/20 backdrop-blur rounded-xl border-amber-500/30">
              <Shield size={14} className="text-amber-400" />
              <span className="text-xs font-medium text-amber-300">Admin Login</span>
            </div>
          </div>
          <p className="text-xs text-indigo-400">
            ✓ Use the same login form — the system auto-detects your role.
          </p>
        </div>

        <p className="relative z-10 text-xs text-indigo-500">© 2024 SmartBiz. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f8f9ff]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <Zap size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-indigo-900 font-display">SmartBiz</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-indigo-900 font-display">Sign In</h2>
           
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
                  className="text-xs font-medium transition-colors text-primary-500 hover:text-primary-700"
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
                  className="absolute text-gray-400 transition-colors -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
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
                <><div className="w-5 h-5 border-2 rounded-full border-white/40 border-t-white animate-spin" /> Signing in…</>
              ) : (
                <>Sign In <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold transition-colors text-primary-600 hover:text-primary-700">
              Register your business
            </Link>
          </p>

          {/* Admin hint */}
          <div className="pt-6 mt-8 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2"> 
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
