import React from 'react';
import { Award, Shield, Users, Clock, Flame, Smile } from 'lucide-react';

export default function AboutUs() {
  const values = [
    {
      title: "Pristine Craftsmanship",
      icon: Award,
      desc: "Every dowel join, oak table leg, and velvet button-tuft is hand-inspected in our local wood Workshops."
    },
    {
      title: "Sustainability At Core",
      icon: Flame,
      desc: "We prioritize American timber plantations, organic water-soluble stains, and recyclable high-density fillings."
    },
    {
      title: "Cohesive Spatial Zoning",
      icon: Users,
      desc: "A room must breathe. We construct pathways and zone layouts with strict ergonomic proportions."
    },
    {
      title: "Unquestionable Integrity",
      icon: Shield,
      desc: "All system budgets represent strict flat fees with absolutely 0% hidden commissions on timber procurement."
    }
  ];

  return (
    <div className="space-y-16 animate-[fadeIn_0.3s_ease-out]">
      {/* 1. Header */}
      <div className="max-w-xl space-y-3">
        <span className="text-[10px] font-mono tracking-widest text-amber-600 font-bold uppercase">THE FURNIDESIGN STORY</span>
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
          About Us
        </h1>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Crafting luxury residences, bespoke wooden frameworks and inspiring rooms since 2016.
        </p>
      </div>

      {/* 2. Story with side picture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-4 text-xs text-neutral-500 leading-relaxed">
          <h3 className="font-display font-bold text-[13px] uppercase text-neutral-900 tracking-wider">A Legacy of Design Excellence</h3>
          <p>
            Established as a boutique carpentry workshop, FurniDesign has scaled into a full-stack interior design powerhouse. We merge traditional hand-assembled cabinet joinery with high-fidelity modern 3D visualization. Our team guides homeowners 1-on-1, from initial zoning and material selections to on-site assembly.
          </p>
          <p>
            We believe that a well-designed home is not a catalog copy but an authentic expression of its inhabitants. We research natural light, circulation flow, and textile tactile properties in order to custom-fabricate spaces of absolute elegance and lasting comfort.
          </p>
          <div className="flex gap-4 pt-2 border-t border-neutral-100">
            <div>
              <span className="font-display text-xl font-bold text-amber-600">2016</span>
              <p className="text-[10px] font-mono uppercase text-neutral-400 mt-0.5">ESTABLISHED YEAR</p>
            </div>
            <div className="border-l border-neutral-200 pl-4">
              <span className="font-display text-xl font-bold text-amber-600">100%</span>
              <p className="text-[10px] font-mono uppercase text-neutral-400 mt-0.5">LOCAL WOODWORK ONLY</p>
            </div>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden aspect-video shadow-md">
          <img src="https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800" alt="Wood joining studio" className="w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white text-[10px] uppercase font-mono tracking-widest text-center">
            Handcrafting Sustainable American Walnut joineries
          </div>
        </div>
      </div>

      {/* 3. Core values */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-amber-600 font-bold uppercase">GUIDING STANDARDS</span>
          <h3 className="font-display font-bold text-2xl text-neutral-900">Our Core Beliefs</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, index) => (
            <div key={index} className="bg-white border border-neutral-100 p-6 rounded-2xl space-y-3 transition hover:shadow-xs hover:border-amber-400">
              <div className="bg-amber-50 text-amber-600 p-2 text-center rounded-xl w-fit">
                <v.icon className="w-5 h-5" />
              </div>
              <h4 className="text-neutral-900 font-bold text-xs">{v.title}</h4>
              <p className="text-[11px] text-neutral-500 leading-normal">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
