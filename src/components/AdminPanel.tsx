import React, { useState } from 'react';
import { 
  Plus, Edit2, Trash2, Users, ShoppingCart, Package, Palette, DollarSign, 
  Search, ShieldAlert, CheckCircle, Clock, Truck, Eye, ArrowRight, UserPlus, FileText
} from 'lucide-react';
import { Product, ProductCategory, Order, OrderStatus, User } from '../types.js';

interface AdminPanelProps {
  products: Product[];
  customers: User[];
  orders: Order[];
  projectsCount: number;
  onAddProduct: (prod: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  onEditProduct: (id: string, prod: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onUpdateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  onAddCustomer: (cust: any) => Promise<void>;
  onEditCustomer: (id: string, cust: any) => Promise<void>;
}

export default function AdminPanel({
  products,
  customers,
  orders,
  projectsCount,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onAddCustomer,
  onEditCustomer,
}: AdminPanelProps) {
  const [subTab, setSubTab] = useState<'dashboard' | 'products' | 'customers' | 'orders'>('dashboard');

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
  const [productStock, setProductStock] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productImageUrl, setProductImageUrl] = useState('');

  // Form states - Customer creation/editing
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerRole, setCustomerRole] = useState<'admin' | 'designer' | 'customer'>('customer');

  // --- Products actions ---
  const handleOpenAddProduct = () => {
    setIsEditingProduct(false);
    setEditingProductId(null);
    setProductName('');
    setProductCategory('Living Room');
    setProductPrice('');
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
    setProductStock(prod.stock.toString());
    setProductDescription(prod.description);
    setProductImageUrl(prod.images[0] || '');
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: productName,
      category: productCategory,
      price: Number(productPrice),
      stock: Number(productStock),
      description: productDescription,
      images: [productImageUrl ? productImageUrl : 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=600'],
    };

    try {
      if (isEditingProduct && editingProductId) {
        await onEditProduct(editingProductId, payload);
      } else {
        await onAddProduct(payload);
      }
      // Reset
      handleOpenAddProduct();
    } catch (e) {
      console.error(e);
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
          {(['dashboard', 'products', 'customers', 'orders'] as const).map((tab) => (
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

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Starting Price (₹)</label>
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
                  <div className="flex gap-2">
                    <input
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
                  id="admin-product-save"
                  className="flex-1 bg-neutral-950 hover:bg-neutral-850 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-xs transition cursor-pointer"
                >
                  {editingProductId ? 'Apply Modifications' : 'Register Piece'}
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
                    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-50/45 transition">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 object-cover rounded-lg shrink-0 border border-neutral-200 bg-neutral-100"
                          />
                          <div>
                            <span className="font-semibold text-neutral-900 text-xs block">{p.name}</span>
                            <span className="text-[10px] font-mono text-neutral-400">REF: {p.id.toUpperCase()}</span>
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
                              onClick={() => onDeleteProduct(p.id)}
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
        const currentSelectedUser = selectedCustomer ? customers.find(c => c.id === selectedCustomer.id) || selectedCustomer : null;

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
                  .filter(c => c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) || c.email.toLowerCase().includes(customerSearchQuery.toLowerCase()))
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
                        REF CONSOLE PROFILE: {currentSelectedUser.id.toUpperCase()}
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
                      <strong className="text-neutral-900 text-sm font-bold block">{orders.filter(o => o.customerId === currentSelectedUser.id).length} Orders</strong>
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

                  {/* Sub-section: Customer order history (Phase 3 spec!) */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-neutral-500" />
                      <span className="text-xs font-bold font-mono text-neutral-600">HISTORIC PURCHASES & DISPATCH LOGS</span>
                    </div>

                    {orders.filter(o => o.customerId === currentSelectedUser.id).length === 0 ? (
                      <p className="text-xs text-neutral-400 bg-neutral-50 p-4 rounded-xl text-center border border-dashed">
                        No purchases registered for this profile yet.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-[250px] overflow-y-auto">
                        {orders
                          .filter(o => o.customerId === currentSelectedUser.id)
                          .map((order) => (
                            <div key={order.id} className="p-4 border border-neutral-100 hover:border-neutral-200 transition rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold text-neutral-500">
                                  ID: {order.id.toUpperCase()}
                                </span>
                                <span className={`px-2 py-0.5 text-[9px] font-mono tracking-wider font-bold rounded-full ${getOrderStatusPill(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>

                              <div className="pt-1.5 flex justify-between text-xs font-medium">
                                <span className="text-neutral-600">
                                  {order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}
                                </span>
                                <span className="font-mono text-neutral-900">₹{order.totalAmount}</span>
                              </div>

                              <p className="text-[10px] text-neutral-400 pt-1 border-t border-dashed border-neutral-100">
                                Logged on {new Date(order.createdAt).toLocaleDateString()} via {order.paymentMethod}
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
          <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-neutral-600">PIPELINE TRACKING CONTROLS</span>
            <span className="text-[10px] text-neutral-500 font-mono">{orders.length} active dispatches</span>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center text-neutral-400">
              <ShoppingCart className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-neutral-700">No orders filed by customers yet</p>
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
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-neutral-50/30 transition">
                      <td className="p-4 font-mono font-bold text-neutral-500">
                        {o.id.toUpperCase()}
                      </td>
                      <td className="p-4">
                      <button
                        onClick={() => {
                          const cust = customers.find(c => c.id === o.customerId);
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
                        <span className="text-[10px] text-neutral-400 block font-mono">{new Date(o.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="p-4 font-medium max-w-xs">
                        {o.items.map((it, idx) => (
                          <div key={idx} className="line-clamp-1">
                            {it.name} <strong className="text-neutral-500 font-normal">({it.quantity}x)</strong>
                          </div>
                        ))}
                      </td>
                      <td className="p-4 font-mono font-semibold text-neutral-950">
                        ₹{o.totalAmount}
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
    </div>
  );
}
