import { useState } from 'react';
import { aiAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Sparkles, Send, FileText, Mail, ShoppingBag, BarChart3, Loader } from 'lucide-react';

const FEATURES = [
  { id: 'INSIGHTS', label: 'Business Insights', icon: BarChart3, color: 'from-blue-500 to-indigo-600', placeholder: 'Ask anything about your business... e.g. "How can I improve my sales this month?"' },
  { id: 'EMAIL', label: 'Email Composer', icon: Mail, color: 'from-emerald-500 to-teal-600', placeholder: 'Describe the email you need... e.g. "Write a thank-you email to a loyal customer"' },
  { id: 'INVOICE_SUMMARY', label: 'Invoice Summary', icon: FileText, color: 'from-amber-500 to-orange-600', placeholder: 'Describe the invoice... e.g. "Invoice #42 for 10 laptops at $999 each"' },
  { id: 'SOCIAL_MEDIA', label: 'Social Media Post', icon: ShoppingBag, color: 'from-pink-500 to-rose-600', placeholder: 'Describe your post... e.g. "Write a Facebook post for 30% off weekend sale"' },
];

export default function AiAssistant() {
  const [feature, setFeature] = useState('INSIGHTS');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const activeFeature = FEATURES.find(f => f.id === feature);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse('');
    try {
      const res = await aiAPI.generate({ feature, prompt });
      setResponse(res.data.data.response);
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI request failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-indigo-900 flex items-center gap-2">
          <Sparkles size={24} className="text-primary-500" />
          AI Assistant
        </h1>
        <p className="text-gray-400 text-sm mt-1">Powered by OpenAI — Get intelligent insights, emails, and content for your business</p>
      </div>

      {/* Feature Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {FEATURES.map(f => (
          <button
            key={f.id}
            onClick={() => { setFeature(f.id); setResponse(''); }}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              feature === f.id
                ? 'border-primary-400 bg-primary-50'
                : 'border-indigo-50 bg-white hover:border-primary-200'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-3`}>
              <f.icon size={18} className="text-white" />
            </div>
            <p className={`text-sm font-semibold ${feature === f.id ? 'text-primary-700' : 'text-indigo-900'}`}>{f.label}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="card">
          <h3 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2">
            <activeFeature.icon size={16} className="text-primary-500" />
            {activeFeature.label}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              className="input resize-none h-48 font-mono text-sm"
              placeholder={activeFeature.placeholder}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              required
            />
            <button
              type="submit"
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? <><Loader size={16} className="animate-spin" /> Generating...</>
               : <><Send size={16} /> Generate</>}
            </button>
          </form>
        </div>

        {/* Output */}
        <div className="card">
          <h3 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-primary-500" />
            AI Response
          </h3>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-10 h-10 border-3 border-primary-400 border-t-transparent rounded-full animate-spin border-[3px]" />
              <p className="text-sm text-gray-400 animate-pulse">AI is thinking...</p>
            </div>
          ) : response ? (
            <div className="bg-indigo-50/50 rounded-xl p-4 h-64 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{response}</pre>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-300">
              <Sparkles size={36} />
              <p className="text-sm">Your AI response will appear here</p>
            </div>
          )}

          {response && (
            <button
              onClick={() => { navigator.clipboard.writeText(response); toast.success('Copied to clipboard!'); }}
              className="btn-secondary mt-3 w-full text-xs"
            >
              Copy Response
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
