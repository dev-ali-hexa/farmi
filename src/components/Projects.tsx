import React, { useState } from 'react';
import { LayoutGrid, Layers, ArrowRight, Sparkles, Star, Maximize2, Tag } from 'lucide-react';

export default function Projects() {
  const [filter, setFilter] = useState<'All' | 'Living Room' | 'Bedroom' | 'Kitchen' | 'Office'>('All');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const categoriesAndIcons = [
    { label: 'All', icon: LayoutGrid },
    { label: 'Living Room', icon: Layers },
    { label: 'Bedroom', icon: Layers },
    { label: 'Kitchen', icon: Layers },
    { label: 'Office', icon: Layers },
  ];

  const projectsList = [
    {
      title: "Chic Minimalist Lounge Room",
      category: "Living Room",
      scope: "Full 2D floor zoning, ambient cove light integration, custom Emerald Green Velvet tuxedo sofa.",
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800",
      budget: "₹5,400",
      rating: 5,
      designer: "Danielle Creative",
    },
    {
      title: "American Walnut Bedroom Oasis",
      category: "Bedroom",
      scope: "Sustainably-harvested oak headboard framing, organic light-woven beige linen, space-saving geometric drawers.",
      image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800",
      budget: "₹4,200",
      rating: 5,
      designer: "David Minimalist",
    },
    {
      title: "Chic Executive Office Hub",
      category: "Office",
      scope: "Symmetrical workspace plan, matte charcoal partition shields, ergonomic mesh adaptive chairs, cove power channels.",
      image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800",
      budget: "₹8,900",
      rating: 5,
      designer: "Sarah Space",
    },
    {
      title: "Bespoke Golden Kitchen Studio",
      category: "Kitchen",
      scope: "Custom light pine storage cabinets, solid white terrazzo countertops, gilded brass drawers handles.",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800",
      budget: "₹12,400",
      rating: 4.9,
      designer: "Danielle Creative",
    },
    {
      title: "Urban Loft Velvet Suite",
      category: "Living Room",
      scope: "Custom floating console cabinets, brick wall alignment, dark neutral accent pillows, soft wool rug sizing.",
      image: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&q=80&w=800",
      budget: "₹6,100",
      rating: 5,
      designer: "Danielle Creative",
    },
    {
      title: "Minimal Scandinavian Work Cabin",
      category: "Office",
      scope: "Custom floating pine writing desks, dual natural light orientations, noise-dampening felt panel configurations.",
      image: "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&q=80&w=800",
      budget: "₹3,300",
      rating: 5,
      designer: "Sarah Space",
    }
  ];

  const filtered = filter === 'All' ? projectsList : projectsList.filter(p => p.category === filter);

  return (
    <div className="space-y-12 animate-[fadeIn_0.3s_ease-out]">
      {/* Header text */}
      <div className="max-w-xl space-y-3">
        <span className="text-[10px] font-mono tracking-widest text-amber-600 font-bold uppercase">PORTFOLIO OF EXCELLENCE</span>
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
          Completed Projects
        </h1>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Walk through our historically verified room designs. From full scale office integrations to cozy residential bedrooms.
        </p>
      </div>

      {/* Category Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 pb-5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {categoriesAndIcons.map((cat) => {
            const Icon = cat.icon;
            const isActive = filter === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setFilter(cat.label as any)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-150 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-neutral-900 border-neutral-900 text-white shadow-xs'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
        <div className="text-neutral-400 text-[10px] font-mono">
          Showing {filtered.length} curated design cases
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((p, index) => (
          <div
            key={index}
            className="group bg-white rounded-3xl border border-neutral-200/60 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            {/* Top image section */}
            <div className="relative aspect-4/3 overflow-hidden bg-neutral-100">
              <img
                src={p.image}
                alt={p.title}
                className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs border border-neutral-100 px-2.5 py-1 text-[9px] uppercase font-mono font-bold text-neutral-950 rounded-full shadow-2xs">
                {p.category}
              </div>
              <button
                type="button"
                onClick={() => setSelectedImage(p.image)}
                className="absolute right-4 bottom-4 w-9 h-9 bg-white/70 backdrop-blur-xs text-neutral-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-2xs cursor-pointer hover:bg-white"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom info section */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-display font-bold text-neutral-900 leading-tight text-sm">
                    {p.title}
                  </h3>
                  <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="text-[11px] font-mono font-bold text-neutral-900">{p.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3">
                  {p.scope}
                </p>
              </div>

              {/* Badges footer */}
              <div className="pt-3 border-t border-neutral-50 flex items-center justify-between text-[10px] font-mono">
                <span className="text-neutral-400">DESIGNER: {p.designer.toUpperCase()}</span>
                <span className="text-neutral-950 font-bold">BUDGET: {p.budget}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to action card */}
      <div className="relative bg-neutral-900 text-white rounded-3xl p-8 md:p-12 overflow-hidden flex flex-col sm:flex-row items-center sm:justify-between gap-6">
        <div className="absolute inset-0 opacity-15 bg-[url('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center"></div>
        <div className="relative space-y-2 max-w-xl">
          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold">READY TO COMMENCE?</span>
          <h3 className="font-display font-bold text-lg md:text-2xl leading-snug">Let us co-design your next inspiring room blueprint</h3>
          <p className="text-xs text-neutral-400">Submit dimensions directly to engage Danielle and the studio joiners 1-on-1.</p>
        </div>
        <a
          href="#auth-modal"
          onClick={(e) => {
            e.preventDefault();
            // Let the App take care of this!
          }}
          className="relative inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition cursor-pointer shadow-md shadow-amber-500/25"
        >
          <span>Request Interior Blueprint</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Photo Viewer Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-neutral-800/80 hover:bg-neutral-700/80 p-2 rounded-full cursor-pointer"
            >
              &times;
            </button>
            <img
              src={selectedImage}
              alt="Expanded project blueprint"
              className="object-contain max-w-full max-h-full rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
