import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { businessProfileAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Image,
  FileText,
  Hash,
  Briefcase,
  Save,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

export default function BusinessProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    businessType: '',
    registrationNumber: '',
    website: '',
    logoUrl: '',
    description: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await businessProfileAPI.get();
      const business = response.data?.data || {};

      setForm({
        name: business.name || user?.name || '',
        email: business.email || user?.email || '',
        phone: business.phone || user?.phone || '',
        address: business.address || user?.address || '',
        businessType: business.businessType || '',
        registrationNumber: business.registrationNumber || '',
        website: business.website || '',
        logoUrl: business.logoUrl || '',
        description: business.description || '',
      });
    } catch (error) {
      console.error(error);
      // Fallback to user data if profile endpoint is not ready
      if (user) {
        setForm(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await businessProfileAPI.update({
        name: form.name,
        phone: form.phone,
        address: form.address,
        businessType: form.businessType,
        registrationNumber: form.registrationNumber,
        website: form.website,
        logoUrl: form.logoUrl,
        description: form.description,
      });

      toast.success('Business profile updated successfully');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading business profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Back to Dashboard Button */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-gray-200 rounded-xl transition-all shadow-sm group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1 border border-indigo-100">
          <Building2 size={13} />
          <span>Organization Settings</span>
        </div>
        <h1 className="text-2xl font-display font-extrabold text-gray-900 tracking-tight">
          Business Profile
        </h1>
        <p className="text-gray-500 text-xs mt-0.5">
          Manage your company information, branding, and contact details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
        {/* Business Hero Info */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/60 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-display font-extrabold text-xl flex items-center justify-center shrink-0 shadow-md">
            {form.name?.charAt(0)?.toUpperCase() || 'B'}
          </div>
          <div>
            <h3 className="font-display font-bold text-gray-900 text-lg">
              {form.name || 'Your Business Name'}
            </h3>
            <p className="text-xs text-gray-500">
              {form.email || 'business@example.com'} • {form.businessType || 'Organization'}
            </p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building2 size={13} className="text-indigo-600" />
              Business Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Acme Enterprises"
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail size={13} className="text-indigo-600" />
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              disabled
              className="w-full text-xs bg-gray-100/80 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-500 font-medium cursor-not-allowed"
            />
            <p className="text-[10px] text-gray-400 mt-1">Managed via account login email</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone size={13} className="text-indigo-600" />
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="077 123 4567"
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Briefcase size={13} className="text-indigo-600" />
              Business Type / Category
            </label>
            <input
              type="text"
              name="businessType"
              value={form.businessType}
              onChange={handleChange}
              placeholder="e.g. Retail, Grocery, Wholesale, Pharmacy"
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Hash size={13} className="text-indigo-600" />
              Registration / BR Number
            </label>
            <input
              type="text"
              name="registrationNumber"
              value={form.registrationNumber}
              onChange={handleChange}
              placeholder="e.g. PV-123456"
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Globe size={13} className="text-indigo-600" />
              Website URL
            </label>
            <input
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MapPin size={13} className="text-indigo-600" />
            Business Address
          </label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows="2"
            placeholder="123 Galle Road, Colombo 03, Sri Lanka"
            className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium text-gray-900 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Image size={13} className="text-indigo-600" />
            Logo Image URL
          </label>
          <input
            type="url"
            name="logoUrl"
            value={form.logoUrl}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
            className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium text-gray-900"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <FileText size={13} className="text-indigo-600" />
            Company Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            placeholder="Brief description of your business and offerings..."
            className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium text-gray-900 resize-none"
          />
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50"
          >
            <Save size={14} />
            <span>{saving ? 'Saving Changes...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}