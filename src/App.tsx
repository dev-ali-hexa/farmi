import React, { useState, useEffect } from 'react';
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
import { Product, Order, Project, User, OrderStatus, ProductCategory } from './types.ts';
import { Sofa, KeyRound, Key, ShieldCheck, Info, Sparkles, Sliders } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [catalogCategory, setCatalogCategory] = useState<ProductCategory | 'All'>('All');
  const [showAuth, setShowAuth] = useState<boolean>(false);

  // Standard data listings
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);

  // Local Shopping Cart state
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);

  // Loader state variables
  const [loadingUser, setLoadingUser] = useState<boolean>(!!token);
  const [loadingData, setLoadingData] = useState<boolean>(false);

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
      fetchOrders();
      fetchProjects();
      if (user.role === 'admin') {
        fetchCustomers();
      }
    }
  }, [user]);

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
  }, [user]);

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
    setCart([]);
    setOrders([]);
    setProjects([]);
    setCustomers([]);
    setActiveTab('products');
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
        return newCart;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleInstantBuy = (product: Product) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    // Add to cart and immediately route him to checkout cart segment!
    setCart([{ product, quantity: 1 }]);
    setActiveTab('customer_dashboard');
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handlePlaceOrder = async (shippingAddress: string, paymentMethod: string) => {
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
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to place order.');
    }

    // Success: refresh listings and sweep cart
    setCart([]);
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
          orders={orders}
          projects={projects}
          onUpdateProfile={handleUpdateProfile}
          cart={cart}
          onUpdateCartQty={handleUpdateCartQty}
          onRemoveFromCart={handleRemoveFromCart}
          onPlaceOrder={handlePlaceOrder}
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
          projectsCount={projects.length}
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onAddCustomer={handleRegisterCustomerByAdmin}
          onEditCustomer={handleEditCustomerByAdmin}
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
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        />

        {/* Central main page content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          {renderContent()}
        </main>
      </div>

      {/* Auth overlay popup modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md animate-[scaleIn_0.2s_ease-out]">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowAuth(false)}
              className="absolute top-4 right-4 bg-neutral-50 hover:bg-neutral-100 p-1.5 rounded-full text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer z-50"
            >
              &times;
            </button>
            <AuthModal onSuccess={handleAuthSuccess} onClose={() => setShowAuth(false)} />
          </div>
        </div>
      )}

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
        </div>
      </footer>
    </div>
  );
}
