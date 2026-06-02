import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Calendar, CheckSquare, Sparkles, Send, CheckCircle2 } from 'lucide-react';

interface ContactUsProps {
  onNewRequest: (details: string, style: string) => Promise<void>;
  user: any;
  onLoginClick: () => void;
  setActiveTab: (tab: string) => void;
}

export default function ContactUs({ onNewRequest, user, onLoginClick, setActiveTab }: ContactUsProps) {
  const [details, setDetails] = useState('');
  const [style, setStyle] = useState('Contemporary');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onLoginClick();
      return;
    }

    if (!details.trim()) {
      setError('Please provide room layout description or space requirements.');
      return;
    }

    setError('');
    setLoading(true);
    setSuccess(false);

    try {
      await onNewRequest(details, style);
      setSuccess(true);
      setDetails('');
      setTimeout(() => {
        setSuccess(false);
        setActiveTab('customer_dashboard');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="max-w-xl space-y-3">
        <span className="text-[10px] font-mono tracking-widest text-amber-600 font-bold uppercase">CONNECT SECURELY</span>
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
          Contact Us
        </h1>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Book virtual or on-site inspections, or ask general questions about woodwork parameters and upholstery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Contact info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-neutral-150 p-6 rounded-3xl space-y-6">
            <h3 className="font-display font-bold text-neutral-900 text-sm">Corporate Office & Studio Gallery</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex gap-3">
                <div className="bg-amber-50 text-amber-600 p-2.5 rounded-xl shrink-0 h-fit">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900">Physical Gallery HQ</h4>
                  <p className="text-neutral-500 mt-1 leading-normal">
                    Ujjain<br />
                    Madhya Pradesh
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <div className="bg-amber-50 text-amber-600 p-2.5 rounded-xl shrink-0 h-fit">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900">Direct Support Line</h4>
                  <p className="text-neutral-500 mt-1 font-mono hover:text-amber-600 cursor-pointer">******</p>
                  <p className="text-[9px] text-neutral-400 font-mono">Mon-Fri: 9:00 AM - 6:00 PM EST</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <div className="bg-amber-50 text-amber-600 p-2.5 rounded-xl shrink-0 h-fit">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900">Correspondence Email Address</h4>
                  <p className="text-neutral-500 mt-1 font-mono hover:text-amber-600 cursor-pointer">contact@gmail.com</p>
                  <p className="text-[9px] text-neutral-400 font-mono">Always on duty for visual uploads</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 text-white p-6 rounded-3xl space-y-3 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center"></div>
            <div className="relative space-y-2">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">White-glove Assembly</span>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Remember: We assemble and position all timber frameworks completely free of charge at physical handovers.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Form */}
        <div className="lg:col-span-7 bg-white border border-neutral-150 p-6 md:p-8 rounded-3xl shadow-2xs space-y-6">
          <div className="space-y-1.5 pb-2 border-b border-neutral-100">
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-700 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DIRECT DESIGN CONSULTATION INQUIRY</span>
            </span>
            <h3 className="font-display font-semibold text-neutral-900 text-sm">Schedule Room Space Layout Designing</h3>
          </div>

          {success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>Bespoke design inquiry recorded! Redirecting to Your dashboard...</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Preferred Room Architectural Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full text-xs font-semibold px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none"
              >
                {['Scandinavian Cozy', 'Minimalist Modern', 'Industrial Loft', 'Contemporary Bold', 'Classic Editorial', 'Tropical Resort'].map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Layout Requirements & Spatial Dimensions
              </label>
              <textarea
                rows={4}
                required
                placeholder="E.g., Master bedroom (Width 14ft x Length 16ft). Need to configure American Walnut platform beds with soft beige light-woven upholstery and floating wood drawer units."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full text-xs p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none"
              ></textarea>
              <span className="text-[9px] text-neutral-400 font-semibold block mt-1">Specify room dimensions, desired wood types, and target palettes.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-1.5 px-6 py-3 bg-neutral-950 hover:bg-neutral-850 text-white font-semibold text-xs rounded-xl cursor-pointer disabled:opacity-45"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Submitting inquiry...' : user ? 'Book Appointment Now' : 'Sign In to Book Consultation'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
