import React from 'react';
import { Sofa, LogOut, User as UserIcon, Shield, PenTool, ShoppingCart, LogIn, Search, Grid } from 'lucide-react';
import { User } from '../types.js';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onLoginClick: () => void;
  cartCount: number;
}

export default function Navbar({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onLoginClick,
  cartCount,
}: NavbarProps) {
  const mainNavLinks = [
    { label: 'Home', id: 'home' },
    { label: 'Products', id: 'products' },
    { label: 'Services', id: 'services' },
    { label: 'Projects', id: 'projects_page' },
    { label: 'About Us', id: 'about' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Brand Name block */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <div className="bg-neutral-900 text-amber-500 p-2.5 rounded-2xl group-hover:scale-103 transition duration-200">
              <Sofa className="w-5.5 h-5.5 text-amber-400" />
            </div>
            <div>
              <span className="font-display text-xl font-bold tracking-tight text-neutral-950 flex items-center gap-0.5">
                Furni<span className="text-amber-500 font-medium">Design</span>
              </span>
              <span className="block text-[8px] uppercase tracking-widest text-neutral-400 font-mono">
                Design Your Dream Space
              </span>
            </div>
          </div>

          {/* Center Main Website Tabs */}
          <nav className="hidden lg:flex space-x-1 items-center">
            {mainNavLinks.map((link) => {
              const works = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`px-4.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                    works
                      ? 'bg-neutral-950 text-white shadow-md shadow-neutral-950/10'
                      : 'text-stone-600 hover:text-neutral-950 hover:bg-stone-50 active:scale-95'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-2.5">
            {/* Search Button simulation */}
            <button
              onClick={() => setActiveTab('products')}
              className="p-2.5 hover:bg-stone-50 rounded-xl transition text-stone-500 hover:text-neutral-950 cursor-pointer"
              title="Search Collection"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* Shopping Bag Button */}
            {(!user || user.role === 'customer') && (
              <button
                onClick={() => {
                  if (!user) {
                    onLoginClick();
                  } else {
                    setActiveTab('customer_dashboard');
                  }
                }}
                className="relative p-2.5 hover:bg-stone-50 rounded-xl transition text-stone-600 hover:text-neutral-950 cursor-pointer"
                title="Your Bag / Orders"
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-amber-500 text-white text-[9px] w-4.5 h-4.5 font-bold rounded-full flex items-center justify-center animate-pulse border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Authenticated dash links */}
            {user ? (
              <div className="flex items-center gap-3">
                {/* Special Workspace Toggles */}
                <div className="hidden md:flex items-center gap-1.5 bg-stone-50 p-1 border border-stone-200 rounded-xl">
                  {user.role === 'customer' && (
                    <button
                      onClick={() => setActiveTab('customer_dashboard')}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                        activeTab === 'customer_dashboard' ? 'bg-white text-neutral-900 shadow-2xs border border-stone-200' : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      My Dashboard
                    </button>
                  )}
                  {user.role === 'designer' && (
                    <button
                      onClick={() => setActiveTab('designer_dashboard')}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                        activeTab === 'designer_dashboard' ? 'bg-white text-emerald-700 shadow-2xs border border-stone-200' : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      <PenTool className="w-3 h-3 text-emerald-600" />
                      <span>Designer Hub</span>
                    </button>
                  )}
                  {user.role === 'admin' && (
                    <button
                      onClick={() => setActiveTab('admin_dashboard')}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                        activeTab === 'admin_dashboard' ? 'bg-white text-amber-700 shadow-2xs border border-stone-200' : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      <Shield className="w-3 h-3 text-amber-600" />
                      <span>Admin Panel</span>
                    </button>
                  )}
                </div>

                {/* Profile Badge info */}
                <div className="hidden sm:flex flex-col items-end text-right select-none text-[11px]">
                  <span className="font-semibold text-neutral-900 leading-tight">{user.name.split(' ')[0]}</span>
                  <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-stone-400">{user.role}</span>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50/50 rounded-xl transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-semibold text-white bg-neutral-950 hover:bg-neutral-850 rounded-xl transition-all shadow-sm cursor-pointer border border-neutral-900"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile quick links sub-ribbon */}
        <div className="flex lg:hidden items-center gap-1.5 py-3 border-t border-stone-100 overflow-x-auto scrollbar-none scroll-smooth">
          {mainNavLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`px-3.5 py-1.5 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                activeTab === link.id
                  ? 'bg-neutral-900 text-white'
                  : 'text-stone-500 hover:bg-stone-50'
              }`}
            >
              {link.label}
            </button>
          ))}

          {/* Quick Hub link inside Mobile bar for staff */}
          {user && user.role !== 'customer' && (
            <button
              onClick={() => setActiveTab(user.role === 'admin' ? 'admin_dashboard' : 'designer_dashboard')}
              className={`px-3.5 py-1.5 text-[11px] font-bold rounded-lg transition whitespace-nowrap border border-stone-200 bg-amber-500/10 text-amber-700 cursor-pointer`}
            >
              Staff Control Center
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
