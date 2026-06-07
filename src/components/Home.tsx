import React from 'react';
import { Sofa, Compass, ShieldCheck, Clock, Award, Users, ThumbsUp, Calendar, ArrowRight, Star, Heart, Check, Play, MapPin, Phone, Mail, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types.js';

interface HomeProps {
  setActiveTab: (tab: string) => void;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onLoginClick: () => void;
  user: any;
  onCategorySelect: (cat: string) => void;
  onProductClick: (id: string) => void;
}

export default function Home({
  setActiveTab,
  products,
  onAddToCart,
  onLoginClick,
  user,
  onCategorySelect,
  onProductClick
}: HomeProps) {
  const offerProducts = products.filter(p => p.isOffer);

  return (
    <div className="space-y-16 animate-[fadeIn_0.3s_ease-out]">
      {/* 1. HERO SECTION */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white min-h-[500px] flex items-center p-8 md:p-16 h-auto shadow-lg">
        {/* Ambient image background */}
        <div className="absolute inset-0 opacity-90 bg-[url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center"></div>
        {/* Vignette - Lightened to reduce black blur */}
        <div className="absolute inset-0 bg-linear-to-r from-neutral-900/40 via-neutral-900/10 to-transparent"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative max-w-2xl space-y-6 z-10"
        >
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
        </motion.div>
      </div>

      {/* EXCLUSIVE OFFERS SECTION */}
      {offerProducts.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-red-600 font-bold uppercase">LIMITED TIME DEALS</span>
              <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">Exclusive Offers</h2>
              <p className="text-xs text-neutral-500">Premium pieces currently featured at promotional values.</p>
            </div>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {offerProducts.map((prod) => (
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                key={prod.id} 
                className="group bg-white rounded-3xl border border-red-100 overflow-hidden shadow-xs hover:shadow-lg hover:border-red-300 transition flex flex-col h-full"
              >
                <div 
                  className="relative aspect-square overflow-hidden bg-neutral-50 cursor-pointer"
                  onClick={() => onProductClick(prod.id)}
                >
                  <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded shadow-sm font-mono tracking-wide">
                    {prod.originalPrice && prod.originalPrice > prod.price 
                      ? `${Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}% OFF DEAL` 
                      : 'SPECIAL OFFER'}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-display font-bold text-neutral-900 text-sm line-clamp-1">{prod.name}</h4>
                    <p className="text-[10px] text-neutral-500 mt-1 line-clamp-2">{prod.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <div className="flex flex-col">
                      {prod.originalPrice && prod.originalPrice > prod.price && (
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] text-neutral-400 line-through font-mono">₹{prod.originalPrice}</span>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">
                            {Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}% OFF
                          </span>
                        </div>
                      )}
                      <span className="text-lg font-bold text-red-600 font-mono leading-none">₹{prod.price}</span>
                    </div>
                    <button onClick={() => onProductClick(prod.id)} className="text-xs font-bold text-neutral-900 hover:text-red-600 underline cursor-pointer">View</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* 2. CATEGORY CIRCLE BENTO */}
      <div className="space-y-6 text-center">
        <div className="max-w-xl mx-auto space-y-2">
          <span className="text-[10px] font-mono tracking-widest text-amber-600 font-bold uppercase">DISCOVER THE COLLECTIONS</span>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">Shop By Category</h2>
          <p className="text-xs text-neutral-500">Pick from our state-of-the-art selections handpicked by award-winning interior designers.</p>
        </div>
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
              <motion.div
                variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
                transition={{ duration: 0.4 }}
                key={c.name}
                onClick={() => onCategorySelect(c.cat)}
                className="bg-white border border-neutral-100 rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer hover:border-amber-400 hover:shadow-xs transition-all group"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border border-neutral-100">
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                </div>
                <h4 className="text-xs font-bold text-neutral-900 group-hover:text-amber-600 transition">{c.name}</h4>
                <span className="text-[10px] text-neutral-400 font-mono mt-0.5">{count} {count === 1 ? 'product' : 'products'}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
