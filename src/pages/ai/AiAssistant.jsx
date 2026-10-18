import { useState } from 'react';
import { aiAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Sparkles,
  Send,
  FileText,
  Mail,
  ShoppingBag,
  BarChart3,
  Copy,
  Check,
  RotateCcw,
  Zap,
  ArrowRight,
  Bot
} from 'lucide-react';

const FEATURES = [
  {
    id: 'INSIGHTS',
    label: 'Business Insights',
    description: 'Executive guidance & strategic recommendations',
    icon: BarChart3,
    color: 'from-blue-500 to-indigo-600',
    placeholder: 'Ask anything about your business... e.g. "How can I improve my sales and customer retention this month?"',
  },
  {
    id: 'EMAIL',
    label: 'Email Composer',
    description: 'Professional client emails & formal notices',
    icon: Mail,
    color: 'from-emerald-500 to-teal-600',
    placeholder: 'Describe the email you need... e.g. "Write a friendly payment reminder email for an overdue invoice"',
  },
  {
    id: 'INVOICE_SUMMARY',
    label: 'Invoice Summary',
    description: 'Summarize items, totals & billing line items',
    icon: FileText,
    color: 'from-amber-500 to-orange-600',
    placeholder: 'Describe the invoice... e.g. "Invoice #42 for 15 units at Rs. 2,500 each with 5% VAT and delivery fee"',
  },
  {
    id: 'SOCIAL_MEDIA',
    label: 'Social Media Post',
    description: 'Engaging marketing captions & sale promos',
    icon: ShoppingBag,
    color: 'from-pink-500 to-rose-600',
    placeholder: 'Describe your post... e.g. "Write an engaging Facebook & Instagram caption for our 30% weekend flash sale"',
  },
];

const PROMPT_SUGGESTIONS = {
  INSIGHTS: [
    'How can I increase retail store sales this month?',
    'Strategies to minimize inventory holding costs',
    'Effective customer loyalty programs for local businesses',
  ],
  EMAIL: [
    'Warm thank-you email to a loyal repeat customer',
    'Polite reminder for an outstanding invoice payment',
    'Welcome note to a newly registered corporate client',
  ],
  INVOICE_SUMMARY: [
    'Invoice for 10 units of inventory at Rs. 3,500 each with 8% discount',
    'Itemized billing summary for IT and software consulting services',
    'Customer receipt summary for monthly accounting logs',
  ],
  SOCIAL_MEDIA: [
    'Exciting 20% weekend discount announcement post',
    'New product arrival teaser for Instagram & Facebook',
    'Customer appreciation post celebrating a company milestone',
  ],
};

export default function AiAssistant() {
  const [feature, setFeature] = useState('INSIGHTS');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeFeature = FEATURES.find((f) => f.id === feature) || FEATURES[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    setLoading(true);
    setResponse('');
    try {
      const res = await aiAPI.generate({ feature, prompt });
      setResponse(res.data?.data?.response || res.data?.response || '');
      toast.success('AI generation complete! ✨');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    toast.success('Copied to clipboard! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setPrompt('');
    setResponse('');
  };

  return (
    <div className="w-full min-h-full flex flex-col bg-white pb-16">
      {/* ── Page Header Bar (Full Width) ── */}
      <div className="px-6 sm:px-10 lg:px-14 py-6 border-b border-gray-200/80 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 p-0.5 shadow-xs flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Sparkles size={18} className="text-indigo-600" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-display font-black text-gray-900 tracking-tight">
                AI Business Assistant
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Generate intelligent business insights, automated customer emails, and marketing copy
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1.5 shadow-2xs">
            <Bot size={14} className="text-indigo-600" />
            <span>OpenAI Intelligence</span>
          </span>
        </div>
      </div>

      {/* ── Feature Capabilities Selector Bar (Full Width) ── */}
      <div className="px-6 sm:px-10 lg:px-14 py-5 border-b border-gray-200/80 bg-slate-50/60">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Select AI Capability
          </span>
          <span className="text-[11px] font-semibold text-gray-400 hidden sm:inline">
            Tailored prompts for commerce operations
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FEATURES.map((f) => {
            const isSelected = feature === f.id;
            const Icon = f.icon;

            return (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFeature(f.id);
                  setResponse('');
                }}
                className={`p-4 rounded-2xl text-left border transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'bg-white border-indigo-600 shadow-sm ring-2 ring-indigo-600/10'
                    : 'bg-white/80 border-gray-200 hover:bg-white hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shrink-0 shadow-xs`}
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-bold truncate ${
                      isSelected ? 'text-indigo-900' : 'text-gray-900'
                    }`}
                  >
                    {f.label}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1 leading-snug">
                    {f.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Full-Width Studio Layout (No Floating Cards) ── */}
      <div className="px-6 sm:px-10 lg:px-14 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left Column: Prompt Composer (7 cols) ── */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-6">
            <div className="border-b border-gray-200/80 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-display font-bold text-gray-900 flex items-center gap-2">
                  <activeFeature.icon size={18} className="text-indigo-600" />
                  {activeFeature.label}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Enter your prompt or select a quick starter template below
                </p>
              </div>

              {prompt && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 inline-flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  className="w-full bg-slate-50/70 focus:bg-white border border-gray-200 focus:border-indigo-600 rounded-2xl p-4 text-xs font-medium text-gray-900 focus:outline-none transition-all resize-none min-h-[220px] leading-relaxed placeholder:text-gray-400"
                  placeholder={activeFeature.placeholder}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  required
                />
              </div>

              {/* Quick Prompt Starter Templates */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Quick Prompt Templates:
                </span>
                <div className="space-y-1.5">
                  {(PROMPT_SUGGESTIONS[feature] || []).map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setPrompt(suggestion)}
                      className="w-full text-left text-xs p-2.5 rounded-xl border border-gray-200/80 bg-slate-50/60 hover:bg-indigo-50/50 hover:border-indigo-300 text-gray-600 hover:text-indigo-900 transition-all flex items-center justify-between group"
                    >
                      <span className="truncate pr-2">"{suggestion}"</span>
                      <ArrowRight size={13} className="text-gray-400 group-hover:text-indigo-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Processing with OpenAI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generate Response</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ── Right Column: AI Output Studio (5 cols) ── */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col space-y-6">
            <div className="border-b border-gray-200/80 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-display font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" />
                  Generated Output
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  AI-synthesized response ready for review and export
                </p>
              </div>

              {response && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all"
                >
                  {copied ? (
                    <>
                      <Check size={13} className="text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Output Display Area */}
            <div className="flex-1 flex flex-col">
              {loading ? (
                <div className="flex-1 min-h-[380px] rounded-2xl border border-gray-200 bg-slate-50/50 flex flex-col items-center justify-center gap-3 p-8">
                  <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-gray-700 animate-pulse">
                    AI Assistant is analyzing and drafting your content...
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Applying business parameters and enterprise formatting
                  </p>
                </div>
              ) : response ? (
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="flex-1 min-h-[380px] max-h-[560px] overflow-y-auto rounded-2xl border border-gray-200 bg-slate-50/60 p-6 shadow-2xs">
                    <pre className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed selection:bg-indigo-100">
                      {response}
                    </pre>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <span className="text-[11px] font-semibold text-gray-400">
                      {response.split(/\s+/).filter(Boolean).length} words generated
                    </span>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copied ? 'Copied to Clipboard' : 'Copy Full Response'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 min-h-[380px] rounded-2xl border border-dashed border-gray-200 bg-slate-50/30 flex flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-400">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">
                      No response generated yet
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm">
                      Choose a business capability on the left, enter a prompt or click a template, and hit Generate.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
