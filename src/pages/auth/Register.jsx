import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Zap } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      const { token, ...userData } = res.data.data;
      login(userData, token);
      toast.success('Business registered successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#312e81] via-[#4338ca] to-[#1e1b4b] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center mb-4 w-14 h-14 bg-white/15 backdrop-blur rounded-2xl">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white font-display">SmartBiz</h1>
        </div>

        <div className="p-8 bg-white shadow-2xl rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Business Name</label>
              <input className="input" placeholder="Acme Store" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@business.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+1 234 567 8900" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Address</label>
              <textarea className="h-20 resize-none input" placeholder="Business address" value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>

            <button type="submit" className="w-full py-3 text-base font-semibold btn-primary" disabled={loading}>
              {loading ? 'Registering...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
