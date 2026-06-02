import React from 'react';
import { Sofa, Compass, ShieldCheck, Clock, Award, Users, ThumbsUp, Calendar, ArrowRight, Star, Heart, Check, Play, MapPin, Phone, Mail, Sparkles } from 'lucide-react';
import { Product } from '../types.js';

interface HomeProps {
  setActiveTab: (tab: string) => void;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onLoginClick: () => void;
  user: any;
  onCategorySelect: (cat: string) => void;
}

export default function Home({
  setActiveTab,
  products,
  onAddToCart,
  onLoginClick,
  user,
  onCategorySelect
}: HomeProps) {

  return (
    <div className="space-y-16 animate-[fadeIn_0.3s_ease-out]">
      {/* 1. HERO SECTION */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white min-h-[500px] flex items-center p-8 md:p-16 h-auto shadow-lg">
        {/* Ambient image background */}
        <div className="absolute inset-0 opacity-90 bg-[url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center"></div>
        {/* Vignette - Lightened to reduce black blur */}
        <div className="absolute inset-0 bg-linear-to-r from-neutral-900/40 via-neutral-900/10 to-transparent"></div>
        
        <div className="relative max-w-2xl space-y-6 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span>STYLE • COMFORT • ELEGANCE</span>
          </div>
          
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Transform Your Space With Our Furniture & Interior Design
          </h1>
          
          <p className="text-sm md:text-base text-neutral-300 leading-relaxed max-w-xl">
            Discover premium bespoke furniture collections and professional interior design services. We craft exquisite residential & commercial rooms with curated spatial planning, custom woodwork, and luxurious details.
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onCategorySelect('All')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-all duration-200 shadow-md shadow-amber-500/25 cursor-pointer"
            >
              <span>Shop Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (!user) {
                  onLoginClick();
                } else {
                  setActiveTab('consultation_request');
                }
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-white/15 text-white hover:bg-white/20 border border-white/20 transition-all duration-200 cursor-pointer"
            >
              <span>Book Consultation</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY CIRCLE BENTO */}
      <div className="space-y-6 text-center">
        <div className="max-w-xl mx-auto space-y-2">
          <span className="text-[10px] font-mono tracking-widest text-amber-600 font-bold uppercase">DISCOVER THE COLLECTIONS</span>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">Shop By Category</h2>
          <p className="text-xs text-neutral-500">Pick from our state-of-the-art selections handpicked by award-winning interior designers.</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: "Living Room", icon: Sofa, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=200", cat: "Living Room" },
            { name: "Bedroom", icon: Sofa, image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=200", cat: "Bedroom" },
            { name: "Dining/Kitchen", icon: Sofa, image: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=200", cat: "Kitchen" },
            { name: "Office Plan", icon: Sofa, image: "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&q=80&w=200", cat: "Office" },
            { name: "Outdoor Resort", icon: Sofa, image: "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&q=80&w=200", cat: "Outdoor" },
            { name: "Home Decor", icon: Sofa, image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=200", cat: "Decor" },
          ].map((c) => {
            const count = products.filter(p => p.category === c.cat).length;
            return (
              <div
                key={c.name}
                onClick={() => onCategorySelect(c.cat)}
                className="bg-white border border-neutral-100 rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer hover:border-amber-400 hover:shadow-xs transition-all group"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border border-neutral-100">
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                </div>
                <h4 className="text-xs font-bold text-neutral-900 group-hover:text-amber-600 transition">{c.name}</h4>
                <span className="text-[10px] text-neutral-400 font-mono mt-0.5">{count} {count === 1 ? 'product' : 'products'}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
