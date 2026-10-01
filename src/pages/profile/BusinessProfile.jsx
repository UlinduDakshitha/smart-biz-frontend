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
  Image as ImageIcon,
  FileText,
  Hash,
  Briefcase,
  Save,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Sparkles,
  Camera,
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
      await businessProfileAPI.update({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        businessType: form.businessType.trim(),
        registrationNumber: form.registrationNumber.trim(),
        website: form.website.trim(),
        logoUrl: form.logoUrl.trim(),
        description: form.description.trim(),
      });

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
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* ── Top Bar: Back Action & Save CTA ── */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-700 hover:text-indigo-600 bg-white hover:bg-indigo-50/70 border border-gray-200/80 rounded-xl transition-all shadow-sm group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>

        {isDirty && (
          <div className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 animate-fadeIn">
            <AlertCircle size={14} className="text-amber-600 shrink-0" />
            <span>Unsaved Changes</span>
          </div>
        )}
      </div>

      {/* ── Executive Profile Showcase Hero ── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#2d2a6e] to-[#1e1b4b] text-white shadow-xl border border-indigo-950/40">
        {/* Decorative backdrop shapes */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Cover strip */}
        <div className="h-28 sm:h-36 bg-gradient-to-r from-indigo-700/40 via-purple-700/30 to-amber-600/30 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Verified Tenant
            </span>
          </div>
        </div>

        {/* Hero Content Container */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 -mt-14 sm:-mt-16">
            {/* Avatar & Title */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              {/* Logo / Avatar Display */}
              <div className="relative group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 p-1 shadow-2xl ring-4 ring-[#1e1b4b]">
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
              </div>

              {/* Title & Metadata */}
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                  {form.name || 'Your Business Name'}
                </h1>
                <p className="text-indigo-200 text-xs sm:text-sm font-medium flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span>{form.email || user?.email}</span>
                  {form.businessType && (
                    <>
                      <span>•</span>
                      <span className="text-amber-300 font-semibold">{form.businessType}</span>
                    </>
                  )}
                  {form.address && (
                    <>
                      <span>•</span>
                      <span className="text-slate-300">{form.address}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center justify-center sm:justify-end gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 font-bold text-amber-300">
                Operating in Rs. (LKR)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Profile Form ── */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: General Business Details */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-display font-bold text-gray-900 flex items-center gap-2">
                <Building2 size={19} className="text-indigo-600" />
                General Information
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">
                Core identity and organization profile of your company
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Name */}
            <div>
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
                  className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-gray-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Business Category */}
            <div>
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
                  className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-gray-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Quick Category Suggestions */}
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Popular Industry Categories:
            </span>
            <div className="flex flex-wrap gap-2">
              {BUSINESS_TYPE_SUGGESTIONS.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleSelectSuggestion(type)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-semibold border transition-all ${
                    form.businessType === type
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Registration Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Registration / BR Number
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
                  className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-gray-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Official Website */}
            <div>
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
                  className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-gray-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Business Summary & Bio
            </label>
            <div className="relative">
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                placeholder="Describe your business offerings, mission, or customer service slogan..."
                className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Location */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-display font-bold text-gray-900 flex items-center gap-2">
                <MapPin size={19} className="text-emerald-600" />
                Contact & Address
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">
                Customer communication channels and physical location
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full text-xs font-semibold bg-gray-100/80 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-500" />
                Linked to authentication credentials
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
                  className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-gray-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">Appears on invoices and customer receipts</p>
            </div>
          </div>

          {/* Physical Address */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Physical Store / Office Address
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="2"
                placeholder="e.g. No. 120, Galle Road, Colombo 03, Sri Lanka"
                className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-gray-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Visual Branding & Logo URL */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-display font-bold text-gray-900 flex items-center gap-2">
                <ImageIcon size={19} className="text-purple-600" />
                Branding & Assets
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">
                Customize your brand logo for invoices, receipts, and client portal
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Live Logo Preview Box */}
            <div className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
              {form.logoUrl && !logoLoadError ? (
                <img
                  src={form.logoUrl}
                  alt="Brand preview"
                  onError={() => setLogoLoadError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2">
                  <Camera size={22} className="mx-auto text-gray-300 mb-1" />
                  <span className="text-[10px] text-gray-400 font-bold block leading-tight">Preview</span>
                </div>
              )}
            </div>

            {/* Logo URL Input */}
            <div className="flex-1 w-full space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Logo Image Web URL
              </label>
              <div className="relative">
                <ImageIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  name="logoUrl"
                  value={form.logoUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/assets/logo.png"
                  className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-gray-900 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-gray-400">
                Provide a direct HTTPS image URL (.png, .jpg, or .svg recommended)
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Subscription & System Status */}
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/5 to-purple-500/10 rounded-3xl border border-amber-200/50 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
              <CreditCard size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-gray-900 text-base">
                  Active Subscription Tier
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-white shadow-sm">
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

        {/* ── Sticky/Prominent Save Bar ── */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Link
            to="/dashboard"
            className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
          >
            Cancel & Return
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
  );
}