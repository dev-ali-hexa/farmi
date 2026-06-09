import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar.tsx';
import AuthModal from './components/AuthModal.tsx';
import ProductCatalog from './components/ProductCatalog.tsx';
import Consultations from './components/Consultations.tsx';
import CustomerDashboard from './components/CustomerDashboard.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import DesignerDashboard from './components/DesignerDashboard.tsx';
import Home from './components/Home.tsx';
import Services from './components/Services.tsx';
import Projects from './components/Projects.tsx';
import AboutUs from './components/AboutUs.tsx';
import ContactUs from './components/ContactUs.tsx';
import { Product, Order, Project, User, OrderStatus, ProductCategory, PromoCode } from './types.ts';
import { Sofa, KeyRound, Key, ShieldCheck, Info, Sparkles, Sliders, X, MessageSquare, Send } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [catalogCategory, setCatalogCategory] = useState<ProductCategory | 'All'>('All');
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [customerDashboardActiveSegment, setCustomerDashboardActiveSegment] = useState<'cart' | 'orders' | 'profile' | 'projects' | 'wishlist' | 'giftcards'>('cart');
  const [viewProductId, setViewProductId] = useState<string | null>(null);
  const [cartHydrated, setCartHydrated] = useState<boolean>(false);
  const cartSyncTimeoutRef = useRef<number | null>(null);

  // Standard data listings
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);

  // Local Shopping Cart state
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);

  // Loader state variables
  const [loadingUser, setLoadingUser] = useState<boolean>(!!token);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  // Live Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{sender: 'bot' | 'user', text: string}[]>([{ sender: 'bot', text: 'Hello! Welcome to FurniDesign. How can we help you craft your dream space today?' }]);

  // Helper fetch request headers
  const getHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Restores user session on startup
  useEffect(() => {
    async function restoreSession() {
      if (!token) {
        setLoadingUser(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: getHeaders(),
        });
        if (res.ok) {
          const u = await res.json();
          setUser(u);
        } else {
          // Token expired or invalid
          handleLogout();
        }
      } catch (err) {
        console.error('Session restoration failed:', err);
      } finally {
        setLoadingUser(false);
      }
    }
    restoreSession();
  }, [token]);

  // Fetches transaction and portfolio data once logged in
  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchPromos();
      fetchOrders();
      fetchProjects();
      if (user.role === 'admin') {
        fetchCustomers();
      }
    }
  }, [user?.id, user?.role]);

  // Hydrate cart from MongoDB when products and user are loaded
  useEffect(() => {
    if (user && user.cart && products.length > 0 && !cartHydrated) {
      const hydrated = user.cart.map(cItem => {
        const product = products.find(p => p && p.id === cItem.productId);
        return product ? { product, quantity: cItem.quantity } : null;
      }).filter(Boolean) as { product: Product; quantity: number }[];
      
      setCart(hydrated);
      setCartHydrated(true);
    }
  }, [user, products, cartHydrated]);

  // Adjusts start screen tab when role is assigned
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        setActiveTab('admin_dashboard');
      } else if (user.role === 'designer') {
        setActiveTab('designer_dashboard');
      } else {
        setActiveTab('home');
      }
    } else {
      setActiveTab('home');
    }
  }, [user?.id, user?.role]);

  // Sync API Data fetches
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error('Failed to load products:', e);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (e) {
      console.error('Failed to load projects:', e);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (e) {
      console.error('Failed to load customers:', e);
    }
  };

  const fetchPromos = async () => {
    try {
      const res = await fetch('/api/promos', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setPromos(data);
      }
    } catch (e) {
      console.error('Failed to load promos:', e);
    }
  };

  // Authentication callbacks
  const handleAuthSuccess = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    setShowAuth(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCustomerDashboardActiveSegment('cart'); // Reset segment on logout
    setCart([]);
    setOrders([]);
    setProjects([]);
    setCustomers([]);
    setCartHydrated(false);
    setActiveTab('products');
  };

  const syncCartToDB = async (newCart: { product: Product; quantity: number }[]) => {
    if (!user) return;
    
    if (cartSyncTimeoutRef.current) clearTimeout(cartSyncTimeoutRef.current);
    
    cartSyncTimeoutRef.current = window.setTimeout(async () => {
      const cartPayload = newCart.map(item => ({ productId: item.product.id, quantity: item.quantity }));
      try {
        await fetch('/api/cart', {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ cart: cartPayload })
        });
      } catch (e) {
        console.error('Failed to sync cart:', e);
      }
    }, 500); // 500ms debounce delay
  };

  // Cart action pipelines
  const handleAddToCart = (product: Product) => {
    if (!user) {
      setShowAuth(true); // Must log in to select pieces
      return;
    }
    
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id);
      if (existingIdx >= 0) {
        const newCart = [...prev];
        const newQty = Math.min(product.stock, newCart[existingIdx].quantity + 1);
        newCart[existingIdx] = { ...newCart[existingIdx], quantity: newQty };
        syncCartToDB(newCart);
        return newCart;
      }
      const newCart = [...prev, { product, quantity: 1 }];
      syncCartToDB(newCart);
      return newCart;
    });
  };

  const handleInstantBuy = (product: Product) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    // Add to cart and immediately route him to checkout cart segment!
    const newCart = [{ product, quantity: 1 }];
    setCart(newCart);
    syncCartToDB(newCart);
    setActiveTab('customer_dashboard');
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    setCart((prev) => {
      const newCart = prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item));
      syncCartToDB(newCart);
      return newCart;
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => {
      const newCart = prev.filter((item) => item.product.id !== productId);
      syncCartToDB(newCart);
      return newCart;
    });
  };

  const handlePlaceOrder = async (shippingAddress: string, paymentMethod: string, promoCode?: string, useCoins: boolean = false) => {
    const itemsPayload = cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        items: itemsPayload,
        shippingAddress,
        paymentMethod,
        promoCode,
        useCoins
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to place order.');
    }

    // Success: refresh listings and sweep cart
    setCart([]);
    syncCartToDB([]);
    
    // Refresh user to get updated FurniCoins
    const userRes = await fetch('/api/auth/me', { headers: getHeaders() });
    if (userRes.ok) {
      const updatedUser = await userRes.json();
      setUser(updatedUser);
    }

    fetchOrders();
    fetchProducts(); // Stock levels decremented
  };

  // Profiles updating
  const handleUpdateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const res = await fetch(`/api/customers/${user.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updatedUser = await res.json();
      setUser(updatedUser);
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    try {
      const res = await fetch(`/api/customers/${user.id}/wishlist`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        // The ProductCatalog will handle the popup for wishlist changes
      }
    } catch (e) {
      console.error('Failed to toggle wishlist:', e);
    }
  };

  const handleAddReview = async (productId: string, rating: number, comment: string) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ rating, comment }),
      });
      if (res.ok) {
        fetchProducts(); // Refresh products to get the new review
      }
    } catch (e) {
      console.error('Failed to add review:', e);
    }
  };

  const handleViewWishlist = () => {
    setCustomerDashboardActiveSegment('wishlist');
    setActiveTab('customer_dashboard');
  };

  // Consultations & Projects action flows
  const handleNewProjectRequest = async (requestDetails: string, preferredStyle: string) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ requestDetails, preferredStyle }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to file inquiry.');
    }
    fetchProjects();
  };

  const handleUpdateProjectInDB = async (projectId: string, updates: Partial<Project>) => {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update designers blueprint.');
    }
    fetchProjects();
  };

  // Administrative catalogs CRUD (Phase 2 & 3 & 4)
  const handleAddProduct = async (prod: Omit<Product, 'id' | 'createdAt'>) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(prod),
    });
    if (res.ok) {
      fetchProducts();
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add product');
    }
  };

  const handleEditProduct = async (id: string, prod: Partial<Product>) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(prod),
    });
    if (res.ok) {
      fetchProducts();
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (res.ok) {
      fetchProducts();
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: OrderStatus) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      fetchOrders();
    }
  };

  const handleRegisterCustomerByAdmin = async (cust: any) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cust),
    });
    if (res.ok) {
      fetchCustomers();
    }
  };

  const handleEditCustomerByAdmin = async (id: string, cust: any) => {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(cust),
    });
    if (res.ok) {
      fetchCustomers();
    }
  };

  const handleAddPromo = async (code: string, discount: number, usageLimit: number) => {
    const res = await fetch('/api/promos', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code, discount, usageLimit }),
    });
    if (res.ok) fetchPromos();
    else { const err = await res.json(); throw new Error(err.error || 'Failed to create promo code'); }
  };

  const handleDeletePromo = async (id: string) => {
    const res = await fetch(`/api/promos/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (res.ok) fetchPromos();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'user', text: chatInput }]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'bot', text: 'Thank you for your message. One of our master designers will be with you shortly.' }]);
    }, 1000);
  };

  // Render correct sub-view
  const renderContent = () => {
    if (activeTab === 'home') {
      return (
        <Home
          setActiveTab={setActiveTab}
          products={products}
          onAddToCart={handleAddToCart}
          onLoginClick={() => setShowAuth(true)}
          user={user}
          onCategorySelect={(cat) => {
            setCatalogCategory(cat as ProductCategory | 'All');
            setActiveTab('products');
          }}
          onProductClick={(id) => {
            setViewProductId(id);
            setActiveTab('products');
          }}
        />
      );
    }

    if (activeTab === 'services') {
      return (
        <Services
          setActiveTab={setActiveTab}
          onLoginClick={() => setShowAuth(true)}
          user={user}
        />
      );
    }

    if (activeTab === 'projects_page') {
      return (
        <Projects />
      );
    }

    if (activeTab === 'about') {
      return (
        <AboutUs />
      );
    }

    if (activeTab === 'contact') {
      return (
        <ContactUs
          onNewRequest={handleNewProjectRequest}
          user={user}
          onLoginClick={() => setShowAuth(true)}
          setActiveTab={setActiveTab}
        />
      );
    }

    if (activeTab === 'products') {
      return (
        <ProductCatalog
          products={products}
          user={user}
          onAddToCart={handleAddToCart}
          onOrderNow={handleInstantBuy}
          selectedCategory={catalogCategory}
          setSelectedCategory={setCatalogCategory}
          viewProductId={viewProductId}
          clearViewProduct={() => setViewProductId(null)}
          onToggleWishlist={handleToggleWishlist}
          onAddReview={handleAddReview}
        />
      );
    }

    if (activeTab === 'consultation_request') {
      return (
        <Consultations
          projects={projects}
          user={user}
          onNewRequest={handleNewProjectRequest}
          onUpdateProject={handleUpdateProjectInDB}
        />
      );
    }

    if (activeTab === 'customer_dashboard' && user && user.role === 'customer') {
      return (
        <CustomerDashboard
          user={user}
          products={products}
          orders={orders}
          projects={projects}
          onUpdateProfile={handleUpdateProfile}
          cart={cart}
          onUpdateCartQty={handleUpdateCartQty}
          onRemoveFromCart={handleRemoveFromCart}
          onPlaceOrder={handlePlaceOrder}
          onToggleWishlist={handleToggleWishlist}
          promos={promos}
          initialActiveSegment={customerDashboardActiveSegment}
        />
      );
    }

    if (activeTab === 'designer_dashboard' && user && user.role === 'designer') {
      return (
        <DesignerDashboard
          designerName={user.name}
          designerId={user.id}
          projects={projects}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onUpdateProject={handleUpdateProjectInDB}
        />
      );
    }

    if (activeTab === 'admin_dashboard' && user && user.role === 'admin') {
      return (
        <AdminPanel
          products={products}
          customers={customers}
          orders={orders}
          promos={promos}
          projectsCount={projects.length}
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onAddCustomer={handleRegisterCustomerByAdmin}
          onEditCustomer={handleEditCustomerByAdmin}
          onAddPromo={handleAddPromo}
          onDeletePromo={handleDeletePromo}
        />
      );
    }

    // Default Fallback
    return (
      <div className="text-center py-10 sm:py-20 px-4 bg-white border rounded-2xl mx-4 sm:mx-0">
        <p className="text-neutral-500 text-xs sm:text-sm font-mono leading-relaxed">
          Access restricted. Please sign in to authenticate credentials.
        </p>
      </div>
    );
  };

  // Initial Startup layout
  if (loadingUser) {
    return (
      <div className="min-h-screen grid place-items-center bg-neutral-50 text-neutral-900 font-mono">
        <div className="space-y-4 text-center">
          <Sofa className="w-10 h-10 mx-auto animate-pulse text-neutral-900" />
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Initializing Bespoke MÄSTER Console...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-between selection:bg-neutral-900 selection:text-white">
      <div>
        {/* Navigation panel */}
        <Navbar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          onLoginClick={() => setShowAuth(true)}
          onViewWishlist={handleViewWishlist}
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        />

        {/* Central main page content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1" key={activeTab}>
          {renderContent()}
        </main>
      </div>

      {/* Auth overlay popup modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-2xl animate-[scaleIn_0.2s_ease-out] flex flex-col md:flex-row">
            
            {/* Luxury Brand Image Panel (Hidden on small screens) */}
            <div className="hidden md:block md:w-1/2 relative bg-neutral-950">
              <img 
                src="https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&q=80&w=800"
                alt="Luxury Interior" 
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover opacity-70"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400/F5F5F5/BDBDBD?text=Login+Image'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/20 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 p-10 text-white space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-amber-500 p-2.5 rounded-xl shadow-lg">
                    <Sofa className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-display text-xl font-bold tracking-tight">Furni<span className="text-amber-500">Design</span></span>
                </div>
                <h3 className="font-display text-3xl font-bold leading-tight">Elevate your<br/>living space.</h3>
                <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-widest pt-2">Secure Authentication Portal</p>
              </div>
            </div>

            {/* Auth Form Area */}
            <div className="w-full md:w-1/2 relative bg-white flex flex-col justify-center min-h-[500px]">
              {/* Close button */}
              <button
                type="button"
                onClick={() => setShowAuth(false)}
                className="absolute top-5 right-5 bg-neutral-100 hover:bg-neutral-200 p-2 rounded-full text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer z-50"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="p-6 md:p-12 w-full max-w-md mx-auto">
                <AuthModal onSuccess={handleAuthSuccess} onClose={() => setShowAuth(false)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIVE CHAT WIDGET */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {isChatOpen && (
          <div className="w-80 bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden mb-4 animate-[fadeInUp_0.2s_ease-out] flex flex-col">
            <div className="bg-neutral-950 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="font-semibold text-sm">Design Concierge</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-neutral-400 hover:text-white transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-64 p-4 overflow-y-auto bg-neutral-50 space-y-3">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-amber-500 text-white rounded-br-sm' : 'bg-white border border-neutral-200 text-neutral-700 rounded-bl-sm shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-neutral-100 flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-neutral-100 border-none rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950"
              />
              <button type="submit" className="p-2 bg-neutral-950 text-white rounded-xl hover:bg-neutral-800 transition cursor-pointer shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
        <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-14 h-14 bg-neutral-950 text-amber-500 rounded-full shadow-xl hover:scale-105 transition-transform flex items-center justify-center cursor-pointer relative">
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          {!isChatOpen && <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>}
        </button>
      </div>

      {/* Styled custom footer */}
      <footer className="bg-white border-t border-neutral-100 py-8 md:py-12 text-center text-xs text-neutral-400 select-none">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-left text-neutral-500 font-sans">
          
          {/* Logo Brand information */}
          <div className="space-y-3.5">
            <h3 className="text-neutral-900 font-display font-bold text-lg">
              Furni<span className="text-amber-500">Design</span>
            </h3>
            <p className="text-[11px] text-neutral-400 leading-normal">
              High fidelity wood joiners and certified decorators dedicated to transform living spaces into masterpieces of cozy organic elegance.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="font-bold text-neutral-900 text-xs">Quick Links</h4>
            <div className="flex flex-col gap-1.5 text-[11px]">
              <button onClick={() => setActiveTab('home')} className="hover:text-amber-600 transition text-left cursor-pointer">Landing Home</button>
              <button onClick={() => setActiveTab('products')} className="hover:text-amber-600 transition text-left cursor-pointer">Product Catalog</button>
              <button onClick={() => setActiveTab('services')} className="hover:text-amber-600 transition text-left cursor-pointer">Bespoke Services</button>
              <button onClick={() => setActiveTab('projects_page')} className="hover:text-amber-600 transition text-left cursor-pointer">Completed Galleries</button>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="font-bold text-neutral-900 text-xs">Customer Support</h4>
            <div className="flex flex-col gap-1.5 text-[11px]">
              <button onClick={() => {}} className="hover:text-amber-600 transition text-left cursor-pointer">White-glove Assembly policy</button>
              <button onClick={() => {}} className="hover:text-amber-600 transition text-left cursor-pointer">10-Year Craft Assurance</button>
              <button onClick={() => setActiveTab('contact')} className="hover:text-amber-600 transition text-left cursor-pointer">Direct Contact Directory</button>
            </div>
          </div>

          {/* Address contacts */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-neutral-900 text-xs">Contact Us</h4>
            <p className="text-[11px] text-neutral-400 leading-normal">
              Ujjain<br />
              Madhya Pradesh
            </p>
            <p className="text-[11px] text-neutral-900 font-mono font-bold">contact@gmail.com</p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 font-mono text-[10px] text-neutral-400">
          <span>&copy; 2026 FurniDesign Systems. All rights reserved.</span>
          <span className="text-[11px] font-sans">
            Created with <span className="text-red-500 animate-pulse">❤️</span> by Developer <strong className="text-neutral-700">ALI</strong>
          </span>
        </div>
      </footer>
    </div>
  );
}
