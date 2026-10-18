import { useEffect, useState, useMemo } from 'react';
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
  Hash,
  Briefcase,
  Save,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

const BUSINESS_TYPE_SUGGESTIONS = [
  'Retail Store',
  'Grocery & Supermarket',
  'Restaurant & Cafe',
  'Fashion & Apparel',
  'Wholesale & Distribution',
  'Pharmacy & Healthcare',
  'Hardware & Electronics',
  'Services & Consulting'
];

export default function BusinessProfile() {
  const { user, updateUser } = useAuth();
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

  const [initialForm, setInitialForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedBR, setCopiedBR] = useState(false);
  const [logoLoadError, setLogoLoadError] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await businessProfileAPI.get();
      const business = response.data?.data || {};

      const data = {
        name: business.name || user?.name || '',
        email: business.email || user?.email || '',
        phone: business.phone || user?.phone || '',
        address: business.address || user?.address || '',
        businessType: business.businessType || '',
        registrationNumber: business.registrationNumber || '',
        website: business.website || '',
        logoUrl: business.logoUrl || '',
        description: business.description || '',
      };

      setForm(data);
      setInitialForm(data);
    } catch (error) {
      console.error(error);
      if (user) {
        const fallbackData = {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          businessType: '',
          registrationNumber: '',
          website: '',
          logoUrl: '',
          description: '',
        };
        setForm(fallbackData);
        setInitialForm(fallbackData);
      }
    } finally {
      setLoading(false);
    }
  };

  const isDirty = useMemo(() => {
    if (!initialForm) return false;
    return JSON.stringify(form) !== JSON.stringify(initialForm);
  }, [form, initialForm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'logoUrl') setLogoLoadError(false);
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectSuggestion = (type) => {
    setForm(prev => ({ ...prev, businessType: type }));
  };

  const copyRegistrationNumber = () => {
    if (!form.registrationNumber) return;
    navigator.clipboard.writeText(form.registrationNumber);
    setCopiedBR(true);
    toast.success('Registration number copied');
    setTimeout(() => setCopiedBR(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Business Name is required');
      return;
    }

    try {
      setSaving(true);
      const response = await businessProfileAPI.update({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        businessType: form.businessType.trim(),
        registrationNumber: form.registrationNumber.trim(),
        website: form.website.trim(),
        logoUrl: form.logoUrl?.trim() || '',
        description: form.description.trim(),
      });

      const updatedBusiness = response.data?.data;
      if (updatedBusiness) {
        updateUser({
          name: updatedBusiness.name,
          phone: updatedBusiness.phone,
          address: updatedBusiness.address,
        });
      }
      setInitialForm(form);
      toast.success('Business profile updated successfully! 🎉');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[75vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium animate-pulse">Loading business profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full pb-16 bg-white">
      {/* ── Sticky Top Bar with Quick Save Action ── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-6 sm:px-10 lg:px-14 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3.5">
          <Link
            to="/dashboard"
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-display font-extrabold text-gray-900 tracking-tight leading-tight">
              Business Profile Settings
            </h1>
            <p className="text-[11px] text-gray-400 hidden sm:block">
              Configure your business branding, contact details, and organization identity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertCircle size={13} />
              Unsaved Changes
            </span>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-extrabold shadow-sm shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Full-Width Executive Hero Showcase ── */}
      <div className="w-full bg-gradient-to-r from-[#1e1b4b] via-[#2d2870] to-[#1e1b4b] text-white px-6 sm:px-10 lg:px-14 py-9 relative overflow-hidden border-b border-indigo-950/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Avatar Initial Circle */}
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-500 p-1 shadow-2xl shrink-0">
              <div className="w-full h-full rounded-[22px] bg-[#1a1740] flex items-center justify-center overflow-hidden">
                {form.logoUrl && !logoLoadError ? (
                  <img
                    src={form.logoUrl}
                    alt={form.name}
                    onError={() => setLogoLoadError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-display font-black text-3xl sm:text-4xl text-white">
                    {form.name?.charAt(0)?.toUpperCase() || 'B'}
                  </span>
                )}
              </div>
            </div>

            {/* Business Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                  {form.name || 'Your Business Name'}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Verified Tenant
                </span>
              </div>

              <div className="text-indigo-200 text-xs sm:text-sm font-medium flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{form.email || user?.email}</span>
                {form.businessType && (
                  <>
                    <span className="text-indigo-400">•</span>
                    <span className="text-amber-300 font-semibold">{form.businessType}</span>
                  </>
                )}
                {form.phone && (
                  <>
                    <span className="text-indigo-400">•</span>
                    <span>{form.phone}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold text-amber-300">
              Currency: LKR (Rs.)
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-extrabold shadow-sm">
              {user?.subscription?.planName || 'Active Tier'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Form (Unified Full-Width Page - No Cards) ── */}
      <div className="w-full px-6 sm:px-10 lg:px-14 py-10">
        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Section 1: General Information */}
          <section className="space-y-6">
            <div className="border-b border-gray-200/80 pb-4">
              <h2 className="text-lg font-display font-bold text-gray-900 flex items-center gap-2">
                <Building2 size={20} className="text-indigo-600" />
                General Information
              </h2>
              <p className="text-gray-500 text-xs mt-0.5">
                Core identity, registration, and organization profile of your company
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Business Name */}
              <div className="lg:col-span-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Business Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Bandara Stores, Acme Enterprises"
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Business Type */}
              <div className="lg:col-span-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Business Type / Industry
                </label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="businessType"
                    value={form.businessType}
                    onChange={handleChange}
                    placeholder="e.g. Retail, Grocery, Restaurant"
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Registration Number */}
              <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    BR / Registration Number
                  </label>
                  {form.registrationNumber && (
                    <button
                      type="button"
                      onClick={copyRegistrationNumber}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                    >
                      {copiedBR ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{copiedBR ? 'Copied' : 'Copy BR'}</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="registrationNumber"
                    value={form.registrationNumber}
                    onChange={handleChange}
                    placeholder="e.g. PV-123456 or W/CO/98765"
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* Official Website */}
              <div className="md:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Official Website
                  </label>
                  {form.website && (
                    <a
                      href={form.website.startsWith('http') ? form.website : `https://${form.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                    >
                      <span>Visit Site</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://yourstore.lk"
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Popular Category Suggestions */}
              <div className="md:col-span-2 lg:col-span-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Quick Industry Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {BUSINESS_TYPE_SUGGESTIONS.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleSelectSuggestion(type)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                        form.businessType === type
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Business Summary & Bio
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe your business offerings, mission, or customer service slogan..."
                  className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all resize-none leading-relaxed"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Contact & Location */}
          <section className="space-y-6">
            <div className="border-b border-gray-200/80 pb-4">
              <h2 className="text-lg font-display font-bold text-gray-900 flex items-center gap-2">
                <MapPin size={20} className="text-emerald-600" />
                Contact Channels & Address
              </h2>
              <p className="text-gray-500 text-xs mt-0.5">
                Official communication channels and physical location
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Primary Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Primary Account Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    disabled
                    className="w-full text-xs font-semibold bg-gray-100/90 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  Linked to your login credentials
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="077 123 4567 or 011 234 5678"
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">Appears on invoices and customer receipts</p>
              </div>

              {/* Physical Address */}
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Physical Store / Office Address
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows="3"
                    placeholder="e.g. No. 120, Galle Road, Colombo 03, Sri Lanka"
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Subscription & Licensing */}
          <section className="space-y-6">
            <div className="border-b border-gray-200/80 pb-4">
              <h2 className="text-lg font-display font-bold text-gray-900 flex items-center gap-2">
                <CreditCard size={20} className="text-amber-500" />
                Subscription & Licensing
              </h2>
              <p className="text-gray-500 text-xs mt-0.5">
                Current platform package and licensing entitlements
              </p>
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/5 to-purple-500/10 border border-amber-200/70 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                  <CreditCard size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-display font-bold text-gray-900 text-base">
                      Active Subscription Tier
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-white shadow-xs">
                      {user?.subscription?.planName || 'Enterprise Suite'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    Your tenant account is licensed for full invoicing, AI assistants, and inventory tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <CheckCircle2 size={15} /> Active
                </span>
              </div>
            </div>
          </section>

          {/* ── Bottom Save Action Bar ── */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200/90">
            <Link
              to="/dashboard"
              className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
              Cancel & Return to Dashboard
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Saving Profile Changes...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Business Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}