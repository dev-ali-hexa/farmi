import React, { useState } from 'react';
import { 
  Plus, Edit2, Trash2, Users, ShoppingCart, Package, Palette, DollarSign, 
  Search, ShieldAlert, CheckCircle, Clock, Truck, Eye, ArrowRight, UserPlus, FileText
  , Ticket, Heart, Download
} from 'lucide-react';
import { Product, ProductCategory, Order, OrderStatus, User, PromoCode } from '../types.js';

interface AdminPanelProps {
  products: Product[];
  customers: User[];
  orders: Order[];
  promos: PromoCode[];
  projectsCount: number;
  onAddProduct: (prod: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  onEditProduct: (id: string, prod: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onUpdateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  onAddCustomer: (cust: any) => Promise<void>;
  onEditCustomer: (id: string, cust: any) => Promise<void>;
  onAddPromo: (code: string, discount: number, limit: number) => Promise<void>;
  onDeletePromo: (id: string) => Promise<void>;
}

export default function AdminPanel({
  products,
  customers,
  orders,
  promos,
  projectsCount,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onAddCustomer,
  onEditCustomer,
  onAddPromo,
  onDeletePromo,
}: AdminPanelProps) {
  const [subTab, setSubTab] = useState<'dashboard' | 'products' | 'customers' | 'orders' | 'promos'>('dashboard');

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<ProductCategory | 'All'>('All');

  // Customer Management detail state
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

  // Form states - Products
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState<ProductCategory>('Living Room');
  const [productPrice, setProductPrice] = useState('');
  const [productOriginalPrice, setProductOriginalPrice] = useState('');
  const [isOfferProduct, setIsOfferProduct] = useState(false);
  const [productStock, setProductStock] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productImageUrl, setProductImageUrl] = useState('');
  const [productError, setProductError] = useState('');
  const [productSuccess, setProductSuccess] = useState('');
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Form states - Customer creation/editing
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerRole, setCustomerRole] = useState<'admin' | 'designer' | 'customer'>('customer');

  // Promo states
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('');
  const [promoLimit, setPromoLimit] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | OrderStatus>('All');

  // Safe Date formatter to prevent "Invalid time value" white screen crashes
  const formatSafeDate = (d: any) => {
    if (!d) return 'Unknown Date';
    const date = new Date(d);
    return isNaN(date.getTime()) ? 'Unknown Date' : date.toLocaleDateString();
  };

  // --- Products actions ---
  const handleOpenAddProduct = () => {
    setIsEditingProduct(false);
    setEditingProductId(null);
    setProductName('');
    setProductCategory('Living Room');
    setProductPrice('');
    setProductOriginalPrice('');
    setIsOfferProduct(false);
    setProductStock('');
    setProductDescription('');
    setProductImageUrl('');
  };

  const handleOpenEditProduct = (prod: Product) => {
    setIsEditingProduct(true);
    setEditingProductId(prod.id);
    setProductName(prod.name);
    setProductCategory(prod.category);
    setProductPrice(prod.price.toString());
    setProductOriginalPrice(prod.originalPrice ? prod.originalPrice.toString() : '');
    setIsOfferProduct(!!prod.isOffer);
    setProductStock(prod.stock.toString());
    setProductDescription(prod.description);
    setProductImageUrl(prod.images?.[0] || '');
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductError('');
    setProductSuccess('');
    setIsSubmittingProduct(true);

    const payload = {
      name: productName,
      category: productCategory,
      price: Number(productPrice),
      originalPrice: productOriginalPrice ? Number(productOriginalPrice) : null,
      isOffer: isOfferProduct,
      stock: Number(productStock),
      description: productDescription,
      images: [productImageUrl ? productImageUrl : 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=600'],
    };

    try {
      if (isEditingProduct && editingProductId) {
        await onEditProduct(editingProductId, payload);
        setProductSuccess('Product updated successfully!');
      } else {
        await onAddProduct(payload);
        setProductSuccess('Product added successfully!');
      }
      // Reset
      handleOpenAddProduct();
      setTimeout(() => setProductSuccess(''), 4000);
    } catch (e: any) {
      console.error('Product save error:', e);
      setProductError(e.message || 'Failed to save product. File might be too large.');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // --- Customers actions ---
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditingCustomer && selectedCustomer) {
        await onEditCustomer(selectedCustomer.id, {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          address: customerAddress,
          role: customerRole,
        });
        setIsEditingCustomer(false);
      } else {
        await onAddCustomer({
          name: customerName,
          email: customerEmail,
          password: customerPassword || 'customer123', // default starting password
          phone: customerPhone,
          address: customerAddress,
          role: customerRole,
        });
        setIsCreatingCustomer(false);
      }
      // Refresh selected if applicable
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPassword('');
      setCustomerPhone('');
      setCustomerAddress('');
      setCustomerRole('customer');
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditCustomer = (cust: User) => {
    setIsEditingCustomer(true);
    setIsCreatingCustomer(false);
    setCustomerName(cust.name);
    setCustomerEmail(cust.email);
    setCustomerPhone(cust.phone || '');
    setCustomerAddress(cust.address || '');
    setCustomerRole(cust.role || 'customer');
  };

  const handleToggleBlockStatus = async (cust: User) => {
    try {
      await onEditCustomer(cust.id, {
        isBlocked: !cust.isBlocked
      });
    } catch (error) {
      console.error('Failed to toggle block status:', error);
    }
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    try {
      await onAddPromo(promoCode, Number(promoDiscount), Number(promoLimit));
      setPromoSuccess('Promo Code created successfully!');
      setPromoCode('');
      setPromoDiscount('');
      setPromoLimit('');
      setTimeout(() => setPromoSuccess(''), 3000);
    } catch (err: any) {
      setPromoError(err.message || 'Failed to create promo code');
    }
  };

  // Export Orders Data to CSV
  const handleExportOrdersCSV = () => {
    if (orders.length === 0) return;
    
    const headers = ['Order ID', 'Customer Name', 'Items (Qty)', 'Total Amount (Rs)', 'Status', 'Date', 'Shipping Address'];
    const rows = orders.map(o => [
      o.id,
      `"${o.customerName}"`,
      `"${(o.items || []).map(i => `${i.name} (x${i.quantity})`).join(' | ')}"`,
      o.totalAmount,
      o.status,
      formatSafeDate(o.createdAt),
      `"${o.shippingAddress}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `FurniDesign_Orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Status check utilities
  const getOrderStatusPill = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-purple-100 text-purple-800 font-bold';
      case 'Processing':
        return 'bg-blue-100 text-blue-800 font-bold';
      case 'Shipped':
        return 'bg-amber-100 text-amber-800 font-bold';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 font-bold';
    }
  };

  const filteredOrders = orders.filter(o => o && o.id && (orderStatusFilter === 'All' || o.status === orderStatusFilter));

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      {/* Admin Title Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 pb-5">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-bold tracking-tight text-neutral-900">
            Administrative Headquarters
          </h2>
          <p className="text-xs text-neutral-500 font-mono">
            MÄSTER SYSTEM DEPLOYMENT • CONTROLS ONLINE
          </p>
        </div>

        {/* Workspace controller */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200">
          {(['dashboard', 'products', 'customers', 'orders', 'promos'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSubTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                subTab === tab
                  ? 'bg-neutral-950 text-white'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              {tab === 'customers' ? 'users' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* SUB-SECTION 1: DASHBOARD METRICS */}
      {subTab === 'dashboard' && (
        <div className="space-y-8">
          {/* KPI Cards bento-grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-2">
              <div className="flex justify-between items-center text-neutral-400">
                <Users className="w-4 h-4" />
                <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-neutral-400">MEMBER</span>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-2xl font-bold text-neutral-900 tracking-tight">{customers.length}</h4>
                <p className="text-[10px] text-neutral-500">Registered Customers</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-2">
              <div className="flex justify-between items-center text-neutral-400">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-neutral-400">PIPELINE</span>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-2xl font-bold text-neutral-900 tracking-tight">{orders.length}</h4>
                <p className="text-[10px] text-neutral-500">Orders Processed</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-2">
              <div className="flex justify-between items-center text-neutral-400">
                <Package className="w-4 h-4" />
                <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-neutral-400">STOCK</span>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-2xl font-bold text-neutral-900 tracking-tight">{products.length}</h4>
                <p className="text-[10px] text-neutral-500">Unique Pieces</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-2">
              <div className="flex justify-between items-center text-neutral-400">
                <Palette className="w-4 h-4" />
                <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-neutral-400">DESIGN</span>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-2xl font-bold text-neutral-900 tracking-tight">{projectsCount}</h4>
                <p className="text-[10px] text-neutral-500">Consultation Projects</p>
              </div>
            </div>
          </div>

          {/* Quick CSS Visualizations graph block */}
          <div className="grid grid-cols-1 gap-6">
            {/* Design status logs */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="font-display font-semibold text-neutral-900 text-sm">Design Project Status Distribution</h3>
                <p className="text-[10px] text-neutral-400 font-mono">CONSULTATION PIPELINE SEGMENTS</p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { name: 'Consultations Requested', count: projectsCount, color: 'bg-purple-650' },
                  { name: 'Active Workshop Creations', count: Math.ceil(projectsCount * 0.4), color: 'bg-teal-650' },
                  { name: 'Delivered Layout Projects', count: Math.floor(projectsCount * 0.3), color: 'bg-emerald-650' },
                ].map((item, idx) => {
                  const maxVal = projectsCount || 5;
                  const ratio = Math.min(100, Math.max(10, (item.count / maxVal) * 100)) + '%';
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-700 font-medium">{item.name}</span>
                        <span className="font-mono font-bold text-neutral-900">{item.count}</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div style={{ width: ratio }} className={`h-full ${item.color} rounded-full`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 2: PRODUCT MANAGEMENT */}
      {subTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add/Edit Form */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 h-fit">
            <h3 className="font-display font-bold text-neutral-900 text-sm">
              {editingProductId ? 'Modify Product Specifications' : 'Add Furniture Product'}
            </h3>
            <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-wide">
              {editingProductId ? `EDITING: ${editingProductId.toUpperCase()}` : 'NEW COLLECTION ENTRY'}
            </p>

          {productSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {productSuccess}
            </div>
          )}
          {productError && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
              {productError}
            </div>
          )}

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Piece Name</label>
                <input
                  type="text"
                  required
                  id="admin-product-name"
                  placeholder="E.g., Oakwood Mid-Century Credenza"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Category</label>
                  <select
                    value={productCategory}
                    id="admin-product-category"
                    onChange={(e) => setProductCategory(e.target.value as ProductCategory)}
                    className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                  >
                    <option value="Living Room">Living Room</option>
                    <option value="Bedroom">Bedroom</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Office">Office</option>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Decor">Decor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Actual Price (₹)</label>
                  <input
                    type="number"
                    id="admin-product-original-price"
                    placeholder="1200"
                    value={productOriginalPrice}
                    onChange={(e) => setProductOriginalPrice(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Offer/Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    id="admin-product-price"
                    placeholder="750"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <input
                  type="checkbox"
                  id="admin-product-is-offer"
                  checked={isOfferProduct}
                  onChange={(e) => setIsOfferProduct(e.target.checked)}
                  className="w-4 h-4 text-neutral-900 accent-neutral-900 cursor-pointer"
                />
                <label htmlFor="admin-product-is-offer" className="text-xs font-semibold text-neutral-700 cursor-pointer select-none">
                  Feature this item in the "Exclusive Offers" section on Home Page
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    id="admin-product-stock"
                    placeholder="10"
                    value={productStock}
                    onChange={(e) => setProductStock(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Photo Reference (URL or Upload)</label>
                  <div className="flex gap-2">                 <input
                      type="text"
                      id="admin-product-image"
                      placeholder="URL or Upload..."
                      value={productImageUrl}
                      onChange={(e) => setProductImageUrl(e.target.value)}
                      className="flex-1 text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition min-w-0"
                    />
                    <label className="flex items-center justify-center px-4 py-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-xl cursor-pointer transition text-xs font-bold text-neutral-700 shrink-0">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setProductImageUrl(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Description Brief</label>
                <textarea
                  rows={4}
                  required
                  id="admin-product-description"
                  placeholder="Elaborate on wood treatments, material weave densities, or style history..."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="w-full text-xs p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition resize-none"
                ></textarea>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  id="admin-product-save"
                  className="flex-1 bg-neutral-950 hover:bg-neutral-850 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingProduct ? 'Processing...' : (editingProductId ? 'Apply Modifications' : 'Register Piece')}
                </button>
                {editingProductId && (
                  <button
                    type="button"
                    onClick={handleOpenAddProduct}
                    className="px-3 py-2.5 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-xl transition cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Product Listing Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold font-mono text-neutral-600">FURNITURE STOCK LISTING</span>
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search furniture piece name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white text-xs px-3 py-1.5 border border-neutral-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[10px] font-mono tracking-wider text-neutral-400">
                    <th className="p-4 uppercase font-bold">Image & Name</th>
                    <th className="p-4 uppercase font-bold">Category</th>
                    <th className="p-4 uppercase font-bold">Price</th>
                    <th className="p-4 uppercase font-bold text-center">Stock</th>
                    <th className="p-4 uppercase font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {products
                    .filter(p => p && (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-50/45 transition">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={p.images?.[0] || ''}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 object-cover rounded-lg shrink-0 border border-neutral-200 bg-neutral-100"
                          />
                          <div>
                            <span className="font-semibold text-neutral-900 text-xs block">{p.name}</span>
                            <span className="text-[10px] font-mono text-neutral-400">REF: {p.id?.toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[10px] font-mono tracking-wide">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-neutral-900">₹{p.price}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                            p.stock === 0 ? 'bg-red-50 text-red-700' : 'bg-neutral-100 text-neutral-800'
                          }`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              id={`btn-edit-prod-${p.id}`}
                              className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg cursor-pointer transition"
                              title="Edit specifications"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to permanently delete "${p.name}"? This will remove it from the database.`)) {
                                  onDeleteProduct(p.id);
                                }
                              }}
                              id={`btn-delete-prod-${p.id}`}
                              className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 3: USER & CUSTOMER MANAGEMENT */}
      {subTab === 'customers' && (() => {
        // Find fresh customer data in list so blocks and counts sync dynamically
        const currentSelectedUser = selectedCustomer ? customers.find(c => c && c.id === selectedCustomer.id) || selectedCustomer : null;

        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Directory List */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs flex flex-col">
              <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-neutral-600">USER REGISTER</span>
                  <button
                    onClick={() => {
                      setIsCreatingCustomer(true);
                      setSelectedCustomer(null);
                      setCustomerName('');
                      setCustomerEmail('');
                      setCustomerPassword('');
                      setCustomerPhone('');
                      setCustomerAddress('');
                      setCustomerRole('customer');
                    }}
                    id="btn-admin-add-customer"
                    className="p-1 px-2.5 text-[10px] font-bold bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Add User</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="divide-y divide-neutral-100 overflow-y-auto max-h-[500px]">
                {customers
                  .filter(c => c && ((c.name || '').toLowerCase().includes(customerSearchQuery.toLowerCase()) || (c.email || '').toLowerCase().includes(customerSearchQuery.toLowerCase())))
                  .map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setIsCreatingCustomer(false);
                      setIsEditingCustomer(false);
                    }}
                    id={`customer-item-${c.id}`}
                    className={`p-4 cursor-pointer transition flex items-center justify-between hover:bg-neutral-50/60 ${
                      selectedCustomer?.id === c.id ? 'bg-neutral-50 border-l-4 border-neutral-950 font-semibold' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-neutral-900 block">{c.name}</span>
                        <span className={`px-1 py-0.5 rounded text-[8px] font-mono uppercase tracking-wide border font-bold ${
                          c.role === 'admin' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          c.role === 'designer' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                          'bg-stone-50 text-stone-600 border-stone-200 font-normal'
                        }`}>
                          {c.role}
                        </span>
                        {c.isBlocked && (
                          <span className="bg-red-500 text-white rounded px-1.5 py-0.2 text-[8px] font-mono font-bold tracking-wide">
                            BLOCKED
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono tracking-wide">{c.email}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-300" />
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Profile detail view or Add/Edit forms */}
            <div className="lg:col-span-2 space-y-6">
              {isCreatingCustomer || isEditingCustomer ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
                  <h3 className="font-display font-bold text-neutral-900 text-sm">
                    {isEditingCustomer ? `Edit User Details` : 'Register New User Profile'}
                  </h3>
                  <form onSubmit={handleCustomerSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          id="admin-cust-name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          id="admin-cust-email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                        />
                      </div>
                    </div>

                    {!isEditingCustomer && (
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">Initial Password (Optional)</label>
                        <input
                          type="password"
                          placeholder="Default is 'customer123'"
                          value={customerPassword}
                          onChange={(e) => setCustomerPassword(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          id="admin-cust-phone"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Delivery Address</label>
                        <input
                          type="text"
                          id="admin-cust-address"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">System Role</label>
                      <select
                        id="admin-cust-role"
                        value={customerRole}
                        onChange={(e) => setCustomerRole(e.target.value as any)}
                        className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      >
                        <option value="customer">Customer</option>
                        <option value="designer">Interior Designer</option>
                        <option value="admin">System Admin</option>
                      </select>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        id="admin-cust-submit"
                        className="bg-neutral-900 text-white text-xs font-semibold px-4 py-2 rounded-xl h-auto cursor-pointer"
                      >
                        {isEditingCustomer ? 'Save Profile' : 'Enlist User'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingCustomer(false);
                          setIsEditingCustomer(false);
                        }}
                        className="bg-neutral-100 text-xs font-semibold px-4 py-2 rounded-xl h-auto cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : currentSelectedUser ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6 shadow-2xs" id="customer-profile-card">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-100 pb-4 gap-4">
                    <div className="space-y-1">
                      <h3 className="font-display font-bold text-neutral-900 text-base">
                        {currentSelectedUser.name}
                      </h3>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        REF CONSOLE PROFILE: {currentSelectedUser.id?.toUpperCase() || 'UNKNOWN'}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Block / Unblock Action Button */}
                      <button
                        onClick={() => handleToggleBlockStatus(currentSelectedUser)}
                        className={`flex items-center gap-1.5 p-1 px-3 rounded-lg text-xs font-semibold transition duration-150 cursor-pointer text-white ${
                          currentSelectedUser.isBlocked 
                            ? 'bg-emerald-600 hover:bg-emerald-700' 
                            : 'bg-rose-600 hover:bg-rose-700'
                        }`}
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>{currentSelectedUser.isBlocked ? 'Unlock Member' : 'Block User'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditCustomer(currentSelectedUser)}
                        id="btn-admin-edit-customer"
                        className="flex items-center gap-1.5 p-1 px-3 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 transition duration-150 cursor-pointer border border-neutral-200"
                      >
                        <Edit2 className="w-3 h-3 shrink-0" />
                        <span>Edit Details</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs flex-wrap">
                    <div className="bg-neutral-50/50 p-3.5 rounded-xl border border-neutral-100 space-y-1 min-w-[120px]">
                      <span className="text-neutral-400 block font-mono">EMAIL ADDRESS</span>
                      <strong className="text-neutral-800 truncate block text-[11px]" title={currentSelectedUser.email}>{currentSelectedUser.email}</strong>
                    </div>
                    <div className="bg-neutral-50/50 p-3.5 rounded-xl border border-neutral-100 space-y-1 min-w-[100px]">
                      <span className="text-neutral-400 block font-mono">PHONE NUMBER</span>
                      <strong className="text-neutral-800 block text-[11px]">{currentSelectedUser.phone || 'Not provided'}</strong>
                    </div>
                    <div className="bg-neutral-50/50 p-3.5 rounded-xl border border-neutral-100 space-y-1 min-w-[80px]">
                      <span className="text-neutral-400 block font-mono">ROLE</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold tracking-wide block w-fit ${
                        currentSelectedUser.role === 'admin' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        currentSelectedUser.role === 'designer' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                        'bg-neutral-100 text-neutral-800 border border-neutral-200'
                      }`}>
                        {currentSelectedUser.role}
                      </span>
                    </div>
                    <div className="bg-neutral-50/50 p-3.5 rounded-xl border border-neutral-100 space-y-1 min-w-[85px]">
                      <span className="text-neutral-400 block font-mono font-semibold">TOTAL ORDERS</span>
                      <strong className="text-neutral-900 text-sm font-bold block">{orders.filter(o => o && o.customerId === currentSelectedUser?.id).length} Orders</strong>
                    </div>
                    <div className="bg-neutral-50/50 p-3.5 rounded-xl border border-neutral-100 space-y-1 min-w-[70px]">
                      <span className="text-neutral-400 block font-mono font-semibold">STATUS</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold block w-fit ${
                        currentSelectedUser.isBlocked ? 'bg-red-500 text-white' : 'bg-green-100 text-green-800'
                      }`}>
                        {currentSelectedUser.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-neutral-50/50 p-3.5 rounded-xl border border-neutral-100 space-y-1 text-xs">
                    <span className="text-neutral-400 block font-mono">SHIPPING MAP</span>
                    <strong className="text-neutral-800 leading-snug block">{currentSelectedUser.address || 'Not provided'}</strong>
                  </div>

                  {/* Sub-section: Favourite Products (Wishlist) */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span className="text-xs font-bold font-mono text-neutral-600">FAVOURITE PRODUCTS ({currentSelectedUser.wishlist?.length || 0})</span>
                    </div>

                    {currentSelectedUser.wishlist && currentSelectedUser.wishlist.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[250px] overflow-y-auto pr-2">
                        {products
                          .filter(p => p && Array.isArray(currentSelectedUser.wishlist) && currentSelectedUser.wishlist.includes(p.id))
                          .map(prod => (
                            <div key={prod.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center gap-2">
                              <img
                                src={prod.images?.[0] || ''}
                                alt={prod.name}
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 object-cover rounded-md shrink-0 border border-neutral-200"
                              />
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-semibold text-neutral-900 block line-clamp-1">{prod.name}</span>
                                <span className="text-[9px] font-mono text-neutral-500">₹{Number(prod.price) || 0}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-400 bg-neutral-50 p-4 rounded-xl text-center border border-dashed">
                        No favourite products added yet.
                      </p>
                    )}
                  </div>

                  {/* Sub-section: Customer order history (Phase 3 spec!) */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-neutral-500" />
                      <span className="text-xs font-bold font-mono text-neutral-600">HISTORIC PURCHASES & DISPATCH LOGS</span>
                    </div>

                    {orders.filter(o => o && o.customerId === currentSelectedUser?.id).length === 0 ? (
                      <p className="text-xs text-neutral-400 bg-neutral-50 p-4 rounded-xl text-center border border-dashed">
                        No purchases registered for this profile yet.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-[250px] overflow-y-auto">
                        {orders
                          .filter(o => o && o.customerId === currentSelectedUser?.id)
                          .map((order) => (
                            <div key={order.id} className="p-4 border border-neutral-100 hover:border-neutral-200 transition rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold text-neutral-500">
                                  ID: {order.id?.toUpperCase() || 'UNKNOWN'}
                                </span>
                                <span className={`px-2 py-0.5 text-[9px] font-mono tracking-wider font-bold rounded-full ${getOrderStatusPill(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>

                              <div className="pt-1.5 flex justify-between text-xs font-medium">
                                <span className="text-neutral-600">
                                  {Array.isArray(order.items) ? order.items.map(item => `${item?.name || 'Unknown'} (x${item?.quantity || 1})`).join(', ') : 'No items'}
                                </span>
                                <span className="font-mono text-neutral-900">₹{Number(order.totalAmount) || 0}</span>
                              </div>

                              <p className="text-[10px] text-neutral-400 pt-1 border-t border-dashed border-neutral-100">
                                Logged on {formatSafeDate(order.createdAt || Date.now())} via {order.paymentMethod || 'Unknown'}
                              </p>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-16 text-center text-neutral-400">
                  <Users className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                  <p className="text-xs font-semibold text-neutral-700">Select a User to inspect profile dossier history</p>
                  <p className="text-[10px] text-neutral-400 mt-1">Review roles, block status, active consultations, and total orders.</p>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* SUB-SECTION 4: ORDER DISPATCH PIPELINE */}
      {subTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-neutral-600">PIPELINE TRACKING CONTROLS</span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-neutral-500 font-mono">{orders.length} active dispatches</span>
                <button
                  onClick={handleExportOrdersCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-[10px] font-bold hover:bg-neutral-800 transition cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
            
            {/* Order Status Filters */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {(['All', 'Pending', 'Processing', 'Shipped', 'Delivered'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setOrderStatusFilter(status)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                    orderStatusFilter === status
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                      : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {status} ({status === 'All' ? orders.length : orders.filter(o => o.status === status).length})
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-neutral-400">
              <ShoppingCart className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-neutral-700">No {orderStatusFilter !== 'All' ? orderStatusFilter.toLowerCase() : ''} orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[10px] font-mono tracking-wider text-neutral-4000">
                    <th className="p-4 uppercase font-bold text-neutral-400">Order ID</th>
                    <th className="p-4 uppercase font-bold text-neutral-400">Customer & Date</th>
                    <th className="p-4 uppercase font-bold text-neutral-400">Items (Qty)</th>
                    <th className="p-4 uppercase font-bold text-neutral-400">Total Price</th>
                    <th className="p-4 uppercase font-bold text-neutral-400">Shipping Map</th>
                    <th className="p-4 uppercase font-bold text-center text-neutral-400">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                  {filteredOrders.map((o) => (
                    <tr key={o.id || Math.random()} className="hover:bg-neutral-50/30 transition">
                      <td className="p-4 font-mono font-bold text-neutral-500">
                        {o.id?.toUpperCase() || 'UNKNOWN'}
                      </td>
                      <td className="p-4">
                      <button
                        onClick={() => {
                          const cust = customers.find(c => c && c.id === o.customerId);
                          if (cust) {
                            setSelectedCustomer(cust);
                            setIsCreatingCustomer(false);
                            setIsEditingCustomer(false);
                            setSubTab('customers');
                          }
                        }}
                        className="font-semibold text-neutral-900 hover:text-amber-600 hover:underline block text-left cursor-pointer transition-colors"
                        title="View Customer Profile"
                      >
                        {o.customerName}
                      </button>
                        <span className="text-[10px] text-neutral-400 block font-mono">{formatSafeDate(o.createdAt)}</span>
                      </td>
                      <td className="p-4 font-medium max-w-xs">
                        {Array.isArray(o.items) ? o.items.map((it, idx) => (
                          <div key={idx} className="line-clamp-1">
                            {it?.name || 'Unknown Item'} <strong className="text-neutral-500 font-normal">({it?.quantity || 1}x)</strong>
                          </div>
                        )) : (
                          <span className="text-neutral-400 text-[10px]">No items</span>
                        )}
                      </td>
                      <td className="p-4 font-mono font-semibold text-neutral-950">
                        ₹{Number(o.totalAmount) || 0}
                      </td>
                      <td className="p-4 max-w-xs text-neutral-500 truncate" title={o.shippingAddress}>
                        {o.shippingAddress}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col items-center gap-1.5">
                          {/* Quick dropdown selector to fulfill Phase 4: Admin can manage orders */}
                          <select
                            value={o.status}
                            id={`status-select-${o.id}`}
                            onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                            className={`p-1.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wide border border-transparent shadow-2xs focus:outline-none focus:ring-1 focus:ring-neutral-950 ${getOrderStatusPill(o.status)}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-SECTION 5: PROMO CODES MANAGEMENT */}
      {subTab === 'promos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 h-fit">
            <h3 className="font-display font-bold text-neutral-900 text-sm">Create Promo Code</h3>
            <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-wide">Generate discount vouchers</p>
            
            {promoSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold">
                {promoSuccess}
              </div>
            )}
            {promoError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
                {promoError}
              </div>
            )}

            <form onSubmit={handlePromoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., WINTER50"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase().trim())}
                  className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none uppercase font-mono tracking-widest"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    placeholder="20"
                    value={promoDiscount}
                    onChange={(e) => setPromoDiscount(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Max Users Limit</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="100"
                    value={promoLimit}
                    onChange={(e) => setPromoLimit(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-neutral-950 hover:bg-neutral-850 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer"
              >
                Generate Promo Code
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50">
              <span className="text-xs font-bold font-mono text-neutral-600">ACTIVE PROMOTIONS</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[10px] font-mono tracking-wider text-neutral-400">
                    <th className="p-4 uppercase font-bold">Code Name</th>
                    <th className="p-4 uppercase font-bold text-center">Discount</th>
                    <th className="p-4 uppercase font-bold text-center">Claims Limit</th>
                    <th className="p-4 uppercase font-bold text-center">Used By</th>
                    <th className="p-4 uppercase font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs">
                  {promos.filter(p => p && p.id).map((p) => (
                    <tr key={p.id || Math.random()} className="hover:bg-neutral-50/45 transition">
                      <td className="p-4 font-mono font-bold tracking-widest text-emerald-600">{p.code}</td>
                      <td className="p-4 text-center font-bold">{p.discount}%</td>
                      <td className="p-4 text-center font-mono">{p.usageLimit} Max</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold font-mono text-[10px] ${p.usedCount >= p.usageLimit ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {p.usedCount} Claimed
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => onDeletePromo(p.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition"
                          title="Delete Code"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
