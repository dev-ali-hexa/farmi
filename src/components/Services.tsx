import React from 'react';
import { Sofa, Compass, Sparkles, Award, ShieldCheck, Clock, Check, HelpCircle, ArrowRight } from 'lucide-react';

interface ServicesProps {
  setActiveTab: (tab: string) => void;
  onLoginClick: () => void;
  user: any;
}

export default function Services({ setActiveTab, onLoginClick, user }: ServicesProps) {
  const serviceList = [
    {
      title: "Space Planning & Floor Layout Drafting",
      icon: Compass,
      image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=600",
      description: "Our certified draftspersons create architectural 2D floor plans. We optimize your path traffic, zoning limits, furniture scale, and structural configurations to curate comfortable, ergonomic living flows.",
      features: ["Optimal Path Zoning", "Furniture scale matching", "Architectural ergonomics analysis", "Blueprint modifications"],
    },
    {
      title: "Bespoke Wood Joinery & Cabinetry Fabrication",
      icon: Sofa,
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600",
      description: "We handcraft custom kitchen shelves, closets, platform beds and tuxedo velvet sofas inside our local wood workshops using premium sustainable oak, walnut, resort-grade teak and nickel finishes.",
      features: ["100% Solid US Walnut/Oak", "Custom textiles & fillings", "Pre-assembled joints", "Zero toxic sealers/adhesives"],
    },
    {
      title: "3D Rendering & Immersive Virtual Visualization-Renderings",
      icon: Sparkles,
      image: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&q=80&w=600",
      description: "We render beautiful 3D color layouts of your future rooms. Take step-by-step virtual tours, choose wallpaper/stain alternatives, and verify natural shadows from cove lighting before construction commences.",
      features: ["Hyper realistic textures", "Sunlight & shadow simulation", "Interactive layout adjustments", "Fast revisions"],
    },
    {
      title: "Comprehensive Construction Oversight & Painting Oversight",
      icon: Award,
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600",
      description: "We supervise the full installation on-site. Our decorators oversee structural carpenters, cove lighting electricians, wallpaper paste installers, and painters to guarantee rigid aesthetic alignments.",
      features: ["Strict milestone tracking", "Contractor vetting support", "Debris & packaging clearances", "Detailed photo check-ins"],
    }
  ];

  return (
    <div className="space-y-12 animate-[fadeIn_0.3s_ease-out]">
      {/* Page Header */}
      <div className="max-w-2xl space-y-3">
        <span className="text-[10px] font-mono tracking-widest text-amber-600 font-bold uppercase">TAILORED EXPERT SERVICE</span>
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
          Services Directory
        </h1>
        <p className="text-xs text-neutral-500 leading-relaxed">
          From full master scale structural blueprints to white-glove material procurement and site installation, we guide you.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 gap-12">
        {serviceList.map((s, index) => {
          const isEven = index % 2 === 0;
          return (
            <div
              key={index}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-neutral-100 p-6 md:p-8 rounded-3xl transition hover:shadow-md ${
                isEven ? '' : 'lg:flex-row-reverse'
              }`}
            >
              {/* Image box */}
              <div className={`lg:col-span-6 relative rounded-2xl overflow-hidden aspect-video border border-neutral-100 ${
                isEven ? 'lg:order-1' : 'lg:order-2'
              }`}>
                <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-amber-500 text-white p-2.5 rounded-xl">
                  <s.icon className="w-5 h-5" />
                </div>
              </div>

              {/* Informational Box */}
              <div className={`lg:col-span-6 space-y-6 ${
                isEven ? 'lg:order-2' : 'lg:order-1'
              }`}>
                <div className="space-y-2">
                  <span className="text-[10px] font-mono tracking-widest text-neutral-400 font-bold uppercase">SERVICE LINE 0{index + 1}</span>
                  <h3 className="font-display text-lg md:text-2xl font-bold tracking-tight text-neutral-950 leading-snug">
                    {s.title}
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                {/* Features Bullets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                  {s.features.map((f, idx) => (
                    <div key={idx} className="flex gap-2 items-center text-xs text-neutral-800">
                      <div className="bg-amber-100 text-amber-700 w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 font-semibold" />
                      </div>
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (!user) {
                      onLoginClick();
                    } else {
                      setActiveTab('consultation_request');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white font-semibold text-xs rounded-xl hover:bg-neutral-800 transition cursor-pointer"
                >
                  <span>Book {s.title.split(' ')[0]} consultation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQs */}
      <div className="bg-stone-50 rounded-3xl p-8 border border-neutral-100 space-y-6">
        <div className="text-center space-y-1 max-w-xl mx-auto">
          <h3 className="font-display font-bold text-lg text-neutral-900">Frequently Asked Questions</h3>
          <p className="text-xs text-neutral-500">Find swift clarifications about project bounds, material limits and pricing guarantees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-xs">
          {[
            { q: "How long does a standard room redesign take?", a: "Drafting 3D render layouts completes in 4-7 days. Manufacturing bespoke carpentry pieces requires 2-3 weeks, followed by immediate on-site handover." },
            { q: "Can I choose my own fabric stains or custom sizing?", a: "Yes, fully! Any element in the catalog can be restructured. Our carpentry works hand-select oak/walnut and custom velvet pigments." },
            { q: "What is your white-glove delivery policy?", a: "Our dedicated logistics staff transport products into your designated room, unwrap pieces, assemble drawers/slats, and clean up packaging debris completely free of charge." },
            { q: "Do you renovate bathroom tiling or outdoor layouts?", a: "Yes. Our team is fully certified for residential spaces, space planning, cabinetry, garden resort furniture and light installations." },
          ].map((faq, idx) => (
            <div key={idx} className="bg-white border border-neutral-100 p-5 rounded-2xl space-y-2">
              <div className="flex gap-2 items-start">
                <HelpCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                <h4 className="font-bold text-neutral-900 leading-snug">{faq.q}</h4>
              </div>
              <p className="text-neutral-500 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
