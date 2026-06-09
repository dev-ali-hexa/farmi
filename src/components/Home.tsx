import React from 'react';
import { Sofa, Compass, ShieldCheck, Clock, Award, Users, ThumbsUp, Calendar, ArrowRight, Star, Heart, Check, Play, MapPin, Phone, Mail, Sparkles, Truck } from 'lucide-react';
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
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-300 bg-neutral-100" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150/F5F5F5/BDBDBD?text=Category'; }} />
                </div>
                <h4 className="text-xs font-bold text-neutral-900 group-hover:text-amber-600 transition">{c.name}</h4>
                <span className="text-[10px] text-neutral-400 font-mono mt-0.5">{count} {count === 1 ? 'product' : 'products'}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* 3. WHY CHOOSE US - FEATURES */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6"
      >
        {[
          { icon: Truck, title: 'Free White-Glove Delivery', desc: 'Complimentary shipping, placement & assembly on all orders.' },
          { icon: ShieldCheck, title: '10-Year Guarantee', desc: 'Premium structural warranty on all timber and joinery.' },
          { icon: Phone, title: '24/7 Expert Support', desc: 'Direct access to our interior design consultants anytime.' },
          { icon: Sparkles, title: 'Sustainable Materials', desc: 'Eco-friendly woods and organic premium upholstery.' }
        ].map((feature, idx) => (
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            key={idx} className="bg-white p-6 rounded-3xl border border-neutral-100 text-center space-y-3 shadow-xs hover:shadow-md transition duration-300 hover:-translate-y-1">
            <div className="mx-auto w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
              <feature.icon className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-neutral-900 text-sm">{feature.title}</h4>
            <p className="text-[11px] text-neutral-500 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* 4. PREMIUM CRAFTSMANSHIP / STUDIO CTA */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white rounded-3xl p-6 md:p-10 border border-neutral-100 shadow-sm"
      >
        <motion.div 
          variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } }}
          transition={{ duration: 0.5 }}
          className="relative aspect-square md:aspect-4/3 overflow-hidden rounded-2xl"
        >
          <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800" alt="Interior Design Studio" referrerPolicy="no-referrer" className="w-full h-full object-cover bg-neutral-100" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800/F5F5F5/BDBDBD?text=Design+Studio'; }} />
          <div className="absolute inset-0 bg-neutral-900/10"></div>
        </motion.div>
        <motion.div 
          variants={{ hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0 } }}
          transition={{ duration: 0.5 }}
          className="space-y-6 md:pl-8"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-amber-600 font-bold uppercase">MÄSTER DESIGN STUDIO</span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-neutral-900 leading-tight">Elevate Your Living Experience</h2>
            <p className="text-sm text-neutral-500 leading-relaxed pt-2">
              Our in-house master decorators and woodcraft artisans collaborate to bring your vision to life. From initial 3D spacial rendering to the final white-glove installation, experience a seamless journey to your perfect home.
            </p>
          </div>
          <ul className="space-y-3 pt-2">
            {['Personalized 3D Room Layouts', 'Custom Upholstery & Wood Finishes', 'Dedicated Project Manager'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-xs font-semibold text-neutral-700">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                {item}
              </li>
            ))}
          </ul>
          <div className="pt-4">
            <button 
              onClick={() => {
                if (!user) {
                  onLoginClick();
                } else {
                  setActiveTab('consultation_request');
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl text-xs transition cursor-pointer shadow-md"
            >
              <span>Start Your Project</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
