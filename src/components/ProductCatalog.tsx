import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingCart, LayoutGrid, Layers, Tag, Check, ShoppingBag, Truck, Info, Heart, Search,
  ArrowUpRight, Star, Sliders, ChevronDown, RefreshCw, X, Box, RotateCcw, 
  Eye, CornerRightUp, Compass, Move
} from 'lucide-react';
import { Product, ProductCategory } from '../types.js';

interface ProductCatalogProps {
  products: Product[];
  user: any;
  onAddToCart: (product: Product) => void;
  onOrderNow: (product: Product) => void;
  selectedCategory: ProductCategory | 'All';
  setSelectedCategory: (cat: ProductCategory | 'All') => void;
}

const CATEGORIES: (ProductCategory | 'All')[] = [
  'All',
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Office',
  'Outdoor',
  'Decor',
];

const POPULAR_TAGS = ['Modern', 'Wooden', 'Luxury', 'Minimal', 'Comfort', 'New'];

export default function ProductCatalog({ products, user, onAddToCart, onOrderNow, selectedCategory, setSelectedCategory }: ProductCatalogProps) {
  // Filter state
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>('Latest');
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  // Active Selected Product Detail Modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'Description' | 'Specs' | 'Reviews' | '3D_View'>('Description');
  const [selectedColor, setSelectedColor] = useState<string>('Beige');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [detailImageIdx, setDetailImageIdx] = useState<number>(0);

  // Interactive 3D Room planner sandbox states
  const [isometricRoomItems, setIsometricRoomItems] = useState<{
    id: string;
    name: string;
    type: string;
    x: number; // grid coordinates
    y: number;
    color: string;
    angle: number; // 0, 90, 180, 270
    icon: string;
  }[]>([
    { id: 'item_1', name: 'Master Velvet Sofa', type: 'Sofa', x: 2, y: 2, color: 'bg-emerald-600', angle: 0, icon: '🛋️' },
    { id: 'item_2', name: 'Walnut Central Table', type: 'Table', x: 2, y: 4, color: 'bg-amber-800', angle: 95, icon: '🪵' },
    { id: 'item_3', name: 'Ambient Cove Vase', type: 'Vase', x: 4, y: 2, color: 'bg-yellow-500', angle: 45, icon: '🏺' },
    { id: 'item_4', name: 'Plush Lounge Cushion', type: 'Chair', x: 4, y: 4, color: 'bg-stone-500', angle: 180, icon: '🪑' },
  ]);
  const [activeSelectedItemIdx, setActiveSelectedItemIdx] = useState<number | null>(0);

  // Rotate items in isometric sandboxes
  const rotateActiveRoomItem = () => {
    if (activeSelectedItemIdx === null) return;
    setIsometricRoomItems(prev => {
      const copy = [...prev];
      copy[activeSelectedItemIdx] = {
        ...copy[activeSelectedItemIdx],
        angle: (copy[activeSelectedItemIdx].angle + 90) % 360
      };
      return copy;
    });
  };

  // Move active items in isometric plane boundaries
  const moveActiveRoomItem = (axis: 'x' | 'y', amt: number) => {
    if (activeSelectedItemIdx === null) return;
    setIsometricRoomItems(prev => {
      const copy = [...prev];
      const link = copy[activeSelectedItemIdx];
      const nextX = axis === 'x' ? Math.max(1, Math.min(5, link.x + amt)) : link.x;
      const nextY = axis === 'y' ? Math.max(1, Math.min(5, link.y + amt)) : link.y;
      copy[activeSelectedItemIdx] = {
        ...link,
        x: nextX,
        y: nextY
      };
      return copy;
    });
  };

  // Reset interactive Room
  const reset3DRoomLayout = () => {
    setIsometricRoomItems([
      { id: 'item_1', name: 'Master Velvet Sofa', type: 'Sofa', x: 2, y: 2, color: 'bg-emerald-600', angle: 0, icon: '🛋️' },
      { id: 'item_2', name: 'Walnut Central Table', type: 'Table', x: 2, y: 4, color: 'bg-amber-800', angle: 95, icon: '🪵' },
      { id: 'item_3', name: 'Ambient Cove Vase', type: 'Vase', x: 4, y: 2, color: 'bg-yellow-500', angle: 45, icon: '🏺' },
      { id: 'item_4', name: 'Plush Lounge Cushion', type: 'Chair', x: 4, y: 4, color: 'bg-stone-500', angle: 180, icon: '🪑' },
    ]);
    setActiveSelectedItemIdx(0);
  };

  // Initial Seed reviews data
  const staticReviews = [
    { author: "Vikas Sharma", rating: 5, date: "May 12, 2026", text: "Amazing build density! The velvet touch feels luxury-level. Fits perfectly in our minimalist Living Room." },
    { author: "Anjali Mehta", rating: 5, date: "April 29, 2026", text: "Truly satisfied. Delivery team was incredibly patient, carried the parts to 4th floor, assembled and cleared everything." },
    { author: "Roger K.", rating: 4, date: "April 15, 2026", text: "Elegant solid American Walnut frames. Rich grain colors. Weighty and stable." }
  ];

  // Perform Catalog Filtering
  const filteredProducts = products.filter(p => {
    // 1. Category matches
    const categoryMatches = selectedCategory === 'All' || p.category === selectedCategory;
    // 2. Max Price bounds
    const priceMatches = p.price <= maxPrice;
    // 3. Tag checks (Simulated tags matched via categories or name substrings)
    let tagMatches = true;
    if (activeTag) {
      const lowerName = p.name.toLowerCase();
      const lowerDesc = p.description.toLowerCase();
      tagMatches = lowerName.includes(activeTag.toLowerCase()) || 
                   lowerDesc.includes(activeTag.toLowerCase()) ||
                   p.category.toLowerCase().includes(activeTag.toLowerCase());
    }
    // 4. Search Query Matches
    const searchMatches = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatches && priceMatches && tagMatches && searchMatches;
  });

  // Sorting logic handler
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === 'Price: Low to High') {
      return a.price - b.price;
    }
    if (sortOption === 'Price: High to Low') {
      return b.price - a.price;
    }
    if (sortOption === 'Popular') {
      return b.stock - a.stock; // Simulate popular using high stock/action activity
    }
    return b.createdAt.localeCompare(a.createdAt); // Latest
  });

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      {/* Curved Hero spotlight section */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white min-h-[220px] md:min-h-[280px] flex items-center p-6 md:p-12 shadow-md">
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-linear-to-r from-neutral-900/40 via-neutral-900/10 to-transparent"></div>
        
        <div className="relative max-w-xl space-y-3 z-10">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/20">
            FURNIDESIGN PORTFOLIO CREATIVE
          </span>
          <h2 className="font-display text-2xl md:text-4xl font-semibold tracking-tight leading-tight">
            Curated Furnishings & Bespoke Comforts
          </h2>
          <p className="text-xs md:text-sm text-stone-300 leading-relaxed max-w-md">
            Handcrafted local American woodwork line structures, customized velvet textures, and gold premium borders.
          </p>
        </div>
      </div>

      {/* Main Catalog body: Sidebar Filter + Catalog Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar Filters Panel */}
        <aside className="lg:col-span-3 bg-white border border-stone-100 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <span className="text-[11px] font-bold font-mono text-neutral-800 tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              <span>COLLECTION FILTERS</span>
            </span>
            {(selectedCategory !== 'All' || maxPrice !== 300000 || activeTag !== null) && (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setMaxPrice(300000);
                  setSearchQuery('');
                  setActiveTag(null);
                }}
                className="text-[10px] text-amber-600 font-bold hover:underline font-mono cursor-pointer"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Core Categories list */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-neutral-900">Categories</h4>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-semibold flex items-center justify-between cursor-pointer transition ${
                    selectedCategory === cat 
                      ? 'bg-neutral-950 text-white' 
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-stone-50'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] font-mono ${selectedCategory === cat ? 'text-amber-400' : 'text-neutral-300'}`}>
                    ({products.filter(p => cat === 'All' || p.category === cat).length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Brand Pricing Range filter */}
          <div className="space-y-3.5 pt-4 border-t border-stone-100">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-neutral-900">Filter By Price</h4>
              <div className="flex items-center gap-1">
                <span className="text-xs font-mono font-bold text-amber-600">₹</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
                  className="w-20 px-2 py-1 text-xs font-mono font-bold border border-stone-200 rounded-md focus:outline-none focus:border-amber-400 bg-stone-50"
                />
              </div>
            </div>
            <input
              type="range"
              min="500"
              max="300000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-neutral-950 cursor-pointer h-1 bg-stone-150 rounded-lg outline-none"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
            <span>₹500</span>
            <span>₹1,50,000</span>
            <span>₹3,00,000</span>
            </div>
          </div>

          {/* Popular tag filtering blocks */}
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <h4 className="text-xs font-semibold text-neutral-900">Popular Tags</h4>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`px-2.5 py-1 text-[10px] font-semibold border rounded-lg transition-all cursor-pointer ${
                    activeTag === tag 
                      ? 'bg-neutral-950 text-white border-neutral-950' 
                      : 'bg-white text-stone-500 border-stone-200 hover:border-neutral-400'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Trust assurances block */}
          <div className="bg-stone-50 border border-stone-100 p-4 rounded-2xl text-[10px] text-neutral-500 space-y-2 font-mono">
            <div className="flex gap-2 items-start">
              <Truck className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
              <span>Full white-glove transport and assemble included free.</span>
            </div>
            <div className="flex gap-2 items-start">
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>10-Year premium structural guarantee certificate.</span>
            </div>
          </div>
        </aside>

        {/* Right Catalog Products list */}
        <section className="lg:col-span-9 space-y-6">
          {/* Header Actions Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 pb-3.5">
            {/* Search Input Bar */}
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-3 w-5 h-5 text-stone-400" />
              <input
                type="text"
                placeholder="Search for furniture pieces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-sm bg-white border-2 border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
              <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider font-mono">
                {sortedProducts.length} pieces
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-neutral-400">Sort By:</span>
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-white border border-stone-200 text-stone-700 px-3 py-1.5 rounded-xl cursor-pointer focus:outline-none font-semibold hover:border-neutral-300"
                >
                  <option>Latest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Popular</option>
                </select>
              </div>
              </div>
            </div>
          </div>

          {/* Product Items Grid */}
          {sortedProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-stone-100">
              <p className="text-xs text-neutral-400 font-mono">No products match current filtering metrics.</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setMaxPrice(300000);
                  setActiveTag(null);
                }}
                className="mt-4 px-4 py-2 bg-neutral-950 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    setSelectedProduct(prod);
                    setDetailImageIdx(0);
                    setActiveDetailTab('Description');
                  }}
                  className="group bg-white rounded-3xl border border-stone-150 overflow-hidden hover:shadow-lg hover:border-neutral-200/80 transition-all duration-300 flex flex-col h-full cursor-pointer"
                  onMouseEnter={() => setHoveredProduct(prod.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  {/* Thumbnail area with tags */}
                  <div className="relative aspect-4/3 bg-stone-50 overflow-hidden border-b border-stone-100">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="object-cover w-full h-full group-hover:scale-103 transition-transform duration-500 ease-out"
                    />

                    {/* Stock rating badges on floating containers */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 text-[9px] uppercase font-mono font-bold">
                      <span className="px-2 py-0.5 bg-neutral-900/90 text-white rounded-lg border border-stone-800">
                        {prod.category}
                      </span>
                      {prod.stock === 0 ? (
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-lg">SOLD OUT</span>
                      ) : prod.stock <= 4 ? (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg animate-pulse">ONLY {prod.stock} LEFT</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border-emerald-250 border rounded-lg">IN STOCK</span>
                      )}
                    </div>

                    {/* Quick view overlap */}
                    <div className="absolute inset-0 bg-neutral-950/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <div className="bg-white/95 text-stone-950 px-4 py-2 rounded-xl text-[11px] font-bold tracking-tight shadow-sm flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-amber-600" />
                        <span>Inspect Masterpiece Detail</span>
                      </div>
                    </div>
                  </div>

                  {/* Body textual specs & ratings */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3 px-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-0.5 text-amber-500 text-[10px]">
                        <Star className="w-3 h-3 fill-amber-500" />
                        <Star className="w-3 h-3 fill-amber-500" />
                        <Star className="w-3 h-3 fill-amber-500" />
                        <Star className="w-3 h-3 fill-amber-500" />
                        <Star className="w-3 h-3 fill-amber-500" />
                        <span className="text-neutral-400 font-mono font-bold pl-1">(4.9)</span>
                      </div>

                      <h3 className="font-display font-bold text-neutral-950 text-[13px] leading-snug">
                        {prod.name}
                      </h3>

                      <p className="text-xs text-neutral-500 line-clamp-1.5 leading-normal">
                        {prod.description}
                      </p>
                    </div>

                    {/* Prancing tags and prices details */}
                    <div className="pt-2 border-t border-stone-50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-mono font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                          ₹{prod.price}
                        </span>
                        {prod.originalPrice && prod.originalPrice > prod.price && (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-mono text-neutral-400 line-through">
                              ₹{prod.originalPrice}
                            </span>
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded w-fit">
                              {Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}% OFF
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-amber-600 font-bold hover:underline font-mono inline-flex items-center gap-0.5">
                        <span>Details</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* --- SELECTED PRODUCT ADVANCED DETAIL DIALOG MODAL --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xl animate-[scaleIn_0.25s_ease-out] flex flex-col max-h-[92vh]">
            
            {/* Modal header with close */}
            <div className="px-6 py-4.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                Home / Products / {selectedProduct.category} / {selectedProduct.name}
              </span>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-full bg-white border border-stone-200 text-stone-500 hover:text-stone-900 transition hover:bg-stone-50 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Scroll area */}
            <div className="overflow-y-auto flex-1 p-6 md:p-8 space-y-8">
              
              {/* Top part: Splitted Showcase and Core checkout settings */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Product image thumbnail strip block */}
                <div className="lg:col-span-6 space-y-4">
                  
                  {/* Large Primary detail thumbnail */}
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-stone-50 border border-stone-200">
                    <img
                      src={selectedProduct.images[detailImageIdx] || selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      referrerPolicy="no-referrer"
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* Secondary/additional layouts indicators row */}
                  <div className="flex gap-2.5">
                    {/* Add seed variants images as sub-strips to make it authentic */}
                    {[
                      selectedProduct.images[0],
                      "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&q=80&w=200",
                      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=200"
                    ].map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setDetailImageIdx(idx)}
                        className={`w-16 h-12 rounded-lg overflow-hidden border transition ${
                          detailImageIdx === idx ? 'border-amber-500 ring-2 ring-amber-100' : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        <img src={img} alt="sub" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right side checkouts parameters pricing */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4.5 h-4.5 fill-amber-500" />
                      <Star className="w-4.5 h-4.5 fill-amber-500" />
                      <Star className="w-4.5 h-4.5 fill-amber-500" />
                      <Star className="w-4.5 h-4.5 fill-amber-500" />
                      <Star className="w-4.5 h-4.5 fill-amber-500" />
                      <span className="text-[11px] font-mono font-bold text-neutral-800 pl-1">(120 Reviews)</span>
                    </div>

                    <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-neutral-950">
                      {selectedProduct.name}
                    </h2>

                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-2xl font-mono font-bold text-red-600 bg-red-50 px-3 py-1 rounded-xl shadow-sm">
                    ₹{selectedProduct.price}
                      </span>
                      {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-mono text-neutral-400 line-through">
                            ₹{selectedProduct.originalPrice}
                          </span>
                          <span className="text-xs uppercase font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg shadow-sm">
                            {Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  {/* Core bullet parameters from layout */}
                  <div className="space-y-2 text-xs text-stone-700 font-semibold bg-stone-50 border border-stone-100 p-4 rounded-xl">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                       <span>Premium Quality sustainably-sourced timber frames</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                       <span>Solid wood jointure and support slats fabrication</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                       <span>Water-resistant protective lacquer and high-density foam filling</span>
                    </div>
                  </div>

                  {/* Color Swatches and Quantity parameters */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="block text-[11px] font-semibold text-neutral-600">Select Custom Fabric Color</span>
                      <div className="flex gap-2">
                        {['Beige', 'Charcoal', 'Navy Blue', 'Velvet Black'].map((col) => {
                          const isSel = selectedColor === col;
                          return (
                            <button
                              key={col}
                              onClick={() => setSelectedColor(col)}
                              className={`px-3 py-1 text-[11px] font-semibold rounded-xl border transition cursor-pointer ${
                                isSel ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-stone-500 border-stone-200 hover:border-stoned-400'
                              }`}
                            >
                              {col}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="block text-[11px] font-semibold text-neutral-600">Quantity</span>
                      <div className="flex items-center border border-stone-250 w-24 rounded-xl overflow-hidden bg-stone-50">
                        <button
                          onClick={() => setSelectedQuantity(q => Math.max(1, q - 1))}
                          className="px-2.5 py-1 text-xs font-bold font-mono text-stone-500 hover:bg-stone-100 transition cursor-pointer"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center text-xs font-mono font-bold text-neutral-900 bg-white border-x border-stone-200 py-1">
                          {selectedQuantity}
                        </span>
                        <button
                          onClick={() => setSelectedQuantity(q => Math.min(selectedProduct.stock, q + 1))}
                          className="px-2.5 py-1 text-xs font-bold font-mono text-stone-500 hover:bg-stone-100 transition cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions purchase and Cart */}
                  <div className="pt-2 flex items-center gap-3">
                    {(!user || user.role === 'customer') ? (
                      <>
                        <button
                          onClick={() => {
                            for (let i = 0; i < selectedQuantity; i++) {
                              onAddToCart(selectedProduct);
                            }
                            setSelectedProduct(null);
                          }}
                          disabled={selectedProduct.stock === 0}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neutral-950 text-white hover:bg-neutral-850 font-semibold text-xs transition cursor-pointer disabled:opacity-40 shadow-xs"
                        >
                          <ShoppingCart className="w-4 h-4 text-amber-400" />
                          <span>Add to Cart</span>
                        </button>

                        <button
                          onClick={() => {
                            onAddToCart(selectedProduct);
                            setSelectedProduct(null);
                            onOrderNow(selectedProduct);
                          }}
                          disabled={selectedProduct.stock === 0}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-white hover:bg-amber-600 font-semibold text-xs transition cursor-pointer disabled:opacity-40 shadow-xs"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Buy Now</span>
                        </button>
                      </>
                    ) : (
                      <span className="w-full block bg-stone-50 text-neutral-400 text-[11px] py-2 text-center rounded-xl font-mono border border-stone-100">
                        Staff members cannot buy products
                      </span>
                    )}
                  </div>

                  {/* Bullet micro facts */}
                  <div className="flex flex-wrap gap-4 pt-2 text-[10px] font-mono text-stone-400 justify-between">
                     <span className="flex items-center gap-1">🚚 Free Delivery</span>
                     <span className="flex items-center gap-1">✨ White-glove Setup</span>
                     <span className="flex items-center gap-1">📝 7 Days Support</span>
                  </div>
                </div>
              </div>

              {/* Bottom part: Advanced Navigation Tabs section */}
              <div className="space-y-6 pt-4 border-t border-stone-100">
                <div className="flex gap-1.5 border-b border-stone-100 overflow-x-auto scrollbar-none pb-2">
                  {[
                    { label: 'Description', value: 'Description' },
                    { label: 'Technical Spec Sheet', value: 'Specs' },
                    { label: 'Reviews (120)', value: 'Reviews' },
                    { label: 'Interactive 3D View Room Planner', value: '3D_View' }
                  ].map((tab) => {
                    const isAct = activeDetailTab === tab.value;
                    return (
                      <button
                        key={tab.value}
                        onClick={() => setActiveDetailTab(tab.value as any)}
                        className={`px-4.5 py-2 whitespace-nowrap text-xs font-semibold rounded-xl transition cursor-pointer ${
                          isAct 
                            ? 'bg-neutral-900 text-white font-bold' 
                            : 'text-stone-500 hover:text-neutral-950 hover:bg-stone-50'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* TAB CONTENT 1: DESCRIPTION */}
                {activeDetailTab === 'Description' && (
                  <div className="text-xs text-neutral-500 leading-relaxed space-y-3">
                    <p>
                      Crafted down to the micron in our wood joinery labs, this premium {selectedProduct.category} piece offers an exceptional synthesis of modern elegance and durable support. We combine sustainable kiln-dried solid timber frames with luxury wear-resistant textiles specifically selected to endure household cycles.
                    </p>
                    <p>
                      Featuring heavy support slate frames, reinforced dowel joints, and highly dense eco-foam filling that retains its plush geometry over multiple seasons of active duty. Complete with custom gold foil trims or tapered wood supports depending on your selected stain palette.
                    </p>
                  </div>
                )}

                {/* TAB CONTENT 2: SPECS */}
                {activeDetailTab === 'Specs' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <div className="flex justify-between p-2.5 rounded-lg bg-stone-50">
                        <span className="text-neutral-400 font-mono">Frame Timber</span>
                        <span className="text-neutral-900 font-bold">100% Solid Kiln-Dried American Walnut</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-lg bg-stone-50">
                        <span className="text-neutral-400 font-mono">Upholstery Textile</span>
                        <span className="text-neutral-900 font-bold">Bespoke Velvet Velvet Blend</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-lg bg-stone-50">
                        <span className="text-neutral-400 font-mono">Joint Assembly</span>
                        <span className="text-neutral-900 font-bold">Dowelled with premium steel brace brackets</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between p-2.5 rounded-lg bg-stone-50">
                        <span className="text-neutral-400 font-mono">Foam Density</span>
                        <span className="text-neutral-900 font-bold">High Density Resilient Adaptive Foam (H30)</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-lg bg-stone-50">
                        <span className="text-neutral-400 font-mono">Logistics Support</span>
                        <span className="text-neutral-900 font-bold">Unpacked, placed + fully assembled free</span>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-lg bg-stone-50">
                        <span className="text-neutral-400 font-mono">Warranty Period</span>
                        <span className="text-neutral-900 font-bold">10-Year structural guarantee</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT 3: REVIEWS */}
                {activeDetailTab === 'Reviews' && (
                  <div className="space-y-4">
                    {staticReviews.map((rev, index) => (
                      <div key={index} className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-neutral-950 font-sans">{rev.author}</span>
                          <span className="font-mono text-[10px] text-stone-400">{rev.date}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                          ))}
                        </div>
                        <p className="text-neutral-500 leading-relaxed font-sans">{rev.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB CONTENT 4: INTERACTIVE 3D ROOM VISUALIZER */}
                {activeDetailTab === '3D_View' && (
                  <div className="bg-stone-900 rounded-3xl p-6 border border-stone-800 space-y-6 text-white relative">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left: Isometric grid simulator rendering */}
                      <div className="lg:col-span-8 flex flex-col items-center justify-center min-h-[300px] border border-stone-800 bg-stone-950/80 rounded-2xl relative p-4 overflow-hidden">
                        
                        {/* Background wireframe grids for perspective */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

                        {/* Isometric Blueprint Stage */}
                        <div className="relative w-72 h-72 transform rotate-x-60 -rotate-z-45 translate-y-2 flex items-center justify-center transition-all duration-300">
                          
                          {/* Floor grid squares layout drawing */}
                          <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 border border-amber-500/20 bg-neutral-900/40">
                            {Array.from({ length: 25 }).map((_, idx) => (
                              <div key={idx} className="border border-stone-800/50 flex items-center justify-center"></div>
                            ))}
                          </div>

                          {/* Render Items placed on floor grids */}
                          {isometricRoomItems.map((item, index) => {
                            const isSelected = activeSelectedItemIdx === index;
                            
                            // Map grid position (1-5 range) to relative percentage style
                            const leftPct = ((item.x - 1) / 5) * 100;
                            const topPct = ((item.y - 1) / 5) * 100;

                            return (
                              <div
                                key={item.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveSelectedItemIdx(index);
                                }}
                                className={`absolute w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer text-xl select-none z-20 ${item.color} ${
                                  isSelected ? 'ring-4 ring-amber-400 scale-105 z-30 shadow-lg shadow-amber-500/20' : 'hover:scale-102 hover:contrast-120'
                                }`}
                                style={{
                                  left: `${leftPct + 4}%`,
                                  top: `${topPct + 4}%`,
                                  transform: `rotate(${item.angle}deg)`
                                }}
                              >
                                <span>{item.icon}</span>
                                <span className="absolute bottom-[-14px] text-[7px] font-mono whitespace-nowrap bg-stone-950/90 text-stone-300 px-1 py-0.5 rounded border border-stone-800 font-bold uppercase scale-85">
                                  {item.type}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Top banner labels */}
                        <div className="absolute top-4 left-4 bg-stone-950/80 border border-stone-800 p-2 rounded-xl text-[10px] font-mono leading-relaxed space-y-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-amber-400">
                            <Compass className="w-3.5 h-3.5 animate-spin" />
                            <span>ISOMETRIC 3D INTERIOR PLANNER</span>
                          </div>
                          <p className="text-[9px] text-stone-500">Arranging Room Layout: {selectedProduct.name}</p>
                        </div>

                        <div className="absolute bottom-4 right-4 bg-stone-950 text-stone-400 text-[9px] font-mono px-2 py-1 rounded border border-stone-800 uppercase tracking-widest font-bold">
                          Z-plane Grid Scale: 1:20
                        </div>
                      </div>

                      {/* Right Control dashboard for rotation or moving items */}
                      <div className="lg:col-span-4 bg-stone-950 border border-stone-800 rounded-2xl p-4.5 space-y-5 flex flex-col justify-between">
                        <div className="space-y-3">
                          <span className="text-[9px] uppercase font-mono text-stone-400 font-bold block pb-1 border-b border-stone-900 tracking-wider">
                            FURNITURE BLUESPRINT REARRANGER
                          </span>

                          {/* Selector dropdown of active items */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-stone-500 block">Select Active Piece to Position</span>
                            <select
                              value={activeSelectedItemIdx !== null ? activeSelectedItemIdx : ''}
                              onChange={(e) => setActiveSelectedItemIdx(Number(e.target.value))}
                              className="w-full text-xs bg-stone-900 text-stone-200 border border-stone-800 px-3 py-1.5 rounded-lg"
                            >
                              {isometricRoomItems.map((item, idx) => (
                                <option key={item.id} value={idx}>{item.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Micro description specs of selected item */}
                          {activeSelectedItemIdx !== null && (
                            <div className="p-3 bg-stone-900/60 rounded-xl space-y-1.5 border border-stone-900 text-[10px] font-mono leading-relaxed">
                              <div className="text-amber-400 font-bold flex items-center justify-between">
                                <span>{isometricRoomItems[activeSelectedItemIdx].name}</span>
                                <span>Idx: {isometricRoomItems[activeSelectedItemIdx].x},{isometricRoomItems[activeSelectedItemIdx].y}</span>
                              </div>
                              <p className="text-stone-400 text-[9px]">Rotate or translate coordinates seamlessly using buttons below.</p>
                            </div>
                          )}
                        </div>

                        {/* Move translation direction cross pads */}
                        <div className="space-y-3.5">
                          {/* Rotation trigger */}
                          <button
                            onClick={rotateActiveRoomItem}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 text-stone-100 hover:bg-stone-800 text-xs font-bold font-mono transition cursor-pointer border border-stone-800 scale-95"
                          >
                            <RotateCcw className="w-4 h-4 text-amber-500 animate-[spin_4s_linear_infinite]" />
                            <span>Rotate Selected 90&deg;</span>
                          </button>

                          {/* Grid translation buttons cross pads */}
                          <div className="space-y-1.5 text-center">
                            <span className="text-[9px] font-mono font-bold text-stone-500">Translate Coordinates</span>
                            <div className="grid grid-cols-3 gap-1 w-24 mx-auto pb-1">
                              <div></div>
                              <button onClick={() => moveActiveRoomItem('y', -1)} className="p-2 bg-stone-900 hover:bg-stone-800 rounded border border-stone-800 text-white text-[10px] font-bold cursor-pointer font-mono">▲</button>
                              <div></div>

                              <button onClick={() => moveActiveRoomItem('x', -1)} className="p-2 bg-stone-900 hover:bg-stone-800 rounded border border-stone-800 text-white text-[10px] font-bold cursor-pointer font-mono">◀</button>
                              <div className="grid place-items-center text-xs font-mono font-bold text-amber-500 font-bold bg-neutral-900 border border-stone-800 text-[9px]">G</div>
                              <button onClick={() => moveActiveRoomItem('x', 1)} className="p-2 bg-stone-900 hover:bg-stone-800 rounded border border-stone-800 text-white text-[10px] font-bold cursor-pointer font-mono">▶</button>

                              <div></div>
                              <button onClick={() => moveActiveRoomItem('y', 1)} className="p-2 bg-stone-900 hover:bg-stone-800 rounded border border-stone-800 text-white text-[10px] font-bold cursor-pointer font-mono">▼</button>
                              <div></div>
                            </div>
                          </div>
                        </div>

                        {/* Reset button layout */}
                        <button
                          onClick={reset3DRoomLayout}
                          className="w-full py-1 bg-transparent hover:bg-stone-900 rounded border border-dashed border-stone-800 text-stone-400 hover:text-stone-300 text-[10px] font-mono transition cursor-pointer"
                        >
                          Reset Blueprint Configuration
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
