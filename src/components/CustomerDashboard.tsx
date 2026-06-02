import React, { useState } from 'react';
import { 
  ShoppingBag, MapPin, Phone, User as UserIcon, Mail, CheckCircle2, ClipboardList, 
  Map, Trash2, ArrowRight, Check, Heart, HelpCircle, RefreshCw, Sparkles, ChevronRight
} from 'lucide-react';
import { Order, OrderStatus, Product, Project, User } from '../types.js';

interface CustomerDashboardProps {
  user: User;
  orders: Order[];
  projects: Project[];
  onUpdateProfile: (updates: Partial<User>) => Promise<void>;
  cart: { product: Product; quantity: number }[];
  onUpdateCartQty: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onPlaceOrder: (shippingAddress: string, paymentMethod: string) => Promise<void>;
}

const PAYMENT_METHODS = [
  'UPI',
  'Cash on Delivery',
];

export default function CustomerDashboard({
  user,
  orders,
  projects,
  onUpdateProfile,
  cart,
  onUpdateCartQty,
  onRemoveFromCart,
  onPlaceOrder,
}: CustomerDashboardProps) {
  const [activeSegment, setActiveSegment] = useState<'cart' | 'orders' | 'profile' | 'projects'>('cart');

  // Profile Form States
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Checkout Form States
  const [shippingAddress, setShippingAddress] = useState(user.address || '');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Cart math
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartTax = Math.round(cartSubtotal * 0.08); // 8% simulation
  const cartTotal = cartSubtotal + cartTax;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateProfile({ name, phone, address });
      setProfileSuccess(true);
      setIsEditingProfile(false);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!shippingAddress.trim()) {
      setCheckoutError('Please enter a delivery destination address.');
      return;
    }

    setCheckoutError('');
    setCheckoutLoading(true);

    try {
      await onPlaceOrder(shippingAddress, paymentMethod);
      setCheckoutSuccess(true);
      setTimeout(() => {
        setCheckoutSuccess(false);
        setActiveSegment('orders'); // Jump to orders segment to see progress!
      }, 3500);
    } catch (err: any) {
      setCheckoutError(err.message || 'Stock limits exceeded. Order failed.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Order status visual layout mapping
  const workflowStatuses: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const getWorkflowStep = (currentStatus: OrderStatus) => {
    return workflowStatuses.indexOf(currentStatus);
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      {/* Welcome ribbon */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 bg-white border border-neutral-100 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="bg-neutral-150 p-3 rounded-2xl text-neutral-800 shrink-0">
            <UserIcon className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h2 className="font-display text-lg font-bold text-neutral-900 leading-tight">
              Hello, {user.name}
            </h2>
            <p className="text-xs text-neutral-500 font-mono">
              ROLE: CUSTOMER • REGISTERED ON {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Dash Segment navigations */}
        <div className="flex flex-wrap gap-1 bg-neutral-50 p-1 rounded-xl border border-neutral-200">
          <button
            onClick={() => setActiveSegment('orders')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
              activeSegment === 'orders' ? 'bg-neutral-950 text-white' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            My Orders ({orders.length})
          </button>
          <button
            onClick={() => {
              setActiveSegment('cart');
              // Pre-fill checkout address from profile if empty
              if (!shippingAddress && user.address) {
                setShippingAddress(user.address);
              }
            }}
            id="tab-customer-cart"
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
              activeSegment === 'cart' ? 'bg-neutral-950 text-white' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <span>Shopping Cart</span>
            {cart.length > 0 && (
              <span className="bg-neutral-250 text-neutral-900 text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSegment('projects')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
              activeSegment === 'projects' ? 'bg-neutral-950 text-white' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            My Design Studio ({projects.length})
          </button>
          <button
            onClick={() => setActiveSegment('profile')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
              activeSegment === 'profile' ? 'bg-neutral-950 text-white' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Profile Dossier
          </button>
        </div>
      </div>

      {/* SEGMENT 1: VISUAL ORDER SCHEDULER & HISTORY */}
      {activeSegment === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <span className="text-xs font-bold font-mono text-neutral-600">MY TRANSACTION HISTORY & SHIPMENT TRACKING</span>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-neutral-150">
              <ShoppingBag className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-neutral-700">No transactions recorded</h3>
              <p className="text-xs text-neutral-400 mt-1">Visit our Browse Products tab to add luxurious furniture pieces to your cart.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const step = getWorkflowStep(order.status);
                return (
                  <div key={order.id} className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-5 shadow-2xs hover:border-neutral-300 transition duration-150" id={`order-item-${order.id}`}>
                    {/* Header Ribbon */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                      <div>
                        <span className="text-xs font-mono font-bold text-neutral-400">
                          ORDER REF: {order.id.toUpperCase()}
                        </span>
                        <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                          PLACED ON {new Date(order.createdAt).toLocaleDateString()} AT {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-400 font-mono">TOTAL BILL</span>
                        <p className="text-sm font-mono font-bold text-neutral-900">₹{order.totalAmount}</p>
                      </div>
                    </div>

                    {/* Ordered items listing */}
                    <div className="space-y-1.5 text-xs text-neutral-700 font-medium">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                          <span>{item.name} <strong className="text-neutral-400 font-normal">x{item.quantity}</strong></span>
                          <span className="font-mono font-semibold text-neutral-950">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Step-by-Step Graphical Workflow Tracker  */}
                    <div className="pt-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-neutral-400 block mb-4 text-center sm:text-left">
                        White-Glove Shipment Dispatch Progress
                      </span>

                      <div className="relative">
                        {/* Connecting tracking pipeline */}
                        <div className="absolute top-4 left-4 right-4 sm:left-12 sm:right-12 h-1 bg-neutral-100 -z-0">
                          <div
                            className="h-full bg-neutral-900 transition-all duration-300"
                            style={{ width: `${(step / 3) * 100}%` }}
                          ></div>
                        </div>

                        {/* Milestones bar */}
                        <div className="relative flex justify-between z-10 text-center">
                          {workflowStatuses.map((status, index) => {
                            const active = index <= step;
                            const isCurrent = index === step;
                            return (
                              <div key={status} className="flex-1 flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                                  isCurrent
                                    ? 'bg-neutral-900 border-neutral-900 text-white ring-4 ring-neutral-100'
                                    : active
                                    ? 'bg-neutral-900 border-neutral-900 text-white'
                                    : 'bg-white border-neutral-200 text-neutral-400'
                                }`}>
                                  {index < step ? (
                                    <Check className="w-4.5 h-4.5 text-white" />
                                  ) : (
                                    <span className="text-xs font-mono font-bold">{index + 1}</span>
                                  )}
                                </div>
                                <span className={`text-[10px] font-semibold mt-2 block capitalize ${
                                  isCurrent ? 'text-neutral-900 font-bold' : active ? 'text-neutral-600' : 'text-neutral-400'
                                }`}>
                                  {status}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Address tag */}
                    <div className="flex items-center gap-2 text-xs text-neutral-500 pt-3 border-t border-neutral-100 font-mono">
                      <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>Delivery Location: <strong>{order.shippingAddress}</strong> • Payment: <strong>{order.paymentMethod}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SEGMENT 2: SHOPPING CART WORKSPACE */}
      {activeSegment === 'cart' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <span className="text-xs font-bold font-mono text-neutral-600">IN-CART SELECTIONS</span>
              <span className="text-[10px] text-neutral-400 font-mono">{cart.length} unique pieces selected</span>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-neutral-150 p-6">
                <ShoppingBag className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-neutral-700">Your shopping cart is currently empty</h3>
                <p className="text-xs text-neutral-400 mt-1">Browse furniture products to configure wood pieces in your catalog.</p>
              </div>
            ) : (
              <div className="space-y-3.5" id="cart-item-list">
                {cart.map((item) => (
                  <div key={item.product.id} className="bg-white rounded-2xl border border-neutral-250 p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 object-cover rounded-xl border border-neutral-100 bg-neutral-50"
                      />
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-neutral-900">{item.product.name}</h4>
                        <p className="text-[10px] text-neutral-400 font-mono">REF ID: {item.product.id.toUpperCase()}</p>
                        <p className="text-xs font-mono font-semibold text-neutral-950">₹{item.product.price} each</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Quantity input controls */}
                      <div className="flex items-center border border-neutral-200 rounded-lg bg-neutral-50 overflow-hidden text-xs">
                        <button
                          type="button"
                          onClick={() => onUpdateCartQty(item.product.id, Math.max(1, item.quantity - 1))}
                          className="px-2 py-1 hover:bg-neutral-100 transition cursor-pointer font-bold text-neutral-600"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-1 font-semibold text-neutral-800 bg-white border-x border-neutral-200 min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateCartQty(item.product.id, Math.min(item.product.stock, item.quantity + 1))}
                          className="px-2 py-1 hover:bg-neutral-100 transition cursor-pointer font-bold text-neutral-600"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveFromCart(item.product.id)}
                        className="p-2 hover:bg-red-50 text-neutral-400 hover:text-red-500 rounded-xl transition cursor-pointer"
                        title="Remove selection"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout billing summary */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5 h-fit shadow-2xs">
            <h3 className="font-display font-bold text-neutral-950 text-sm">Draft Purchase Dispatch</h3>
            
            {checkoutSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <span>Transaction processed! Order compiled synchronously. Redirecting...</span>
              </div>
            )}

            {checkoutError && (
              <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl">
                {checkoutError}
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Shipment Destination Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    id="checkout-shipping-address"
                    placeholder="E.g., 150 Maple Leaf Drive, Toronto"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Settlement Payment Protocol
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              {/* Checkout pricing breakdown */}
              <div className="border-t border-dashed border-neutral-200 pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-neutral-500">
                  <span>Product Subtotal</span>
                  <span className="font-mono">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Tax & Logistics Simulation (8%)</span>
                  <span className="font-mono">₹{cartTax}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>White-Glove Installation</span>
                  <span className="font-mono text-emerald-600 uppercase font-bold text-[10px]">FREE PROMO</span>
                </div>
                <div className="flex justify-between text-neutral-900 pt-2.5 border-t border-neutral-150 text-sm font-bold">
                  <span>Total Bill Amount</span>
                  <span className="font-mono">₹{cartTotal}</span>
                </div>
              </div>

              <button
                type="submit"
                id="btn-confirm-checkout"
                disabled={checkoutLoading || cart.length === 0}
                className="w-full bg-neutral-950 hover:bg-neutral-850 text-white font-semibold text-xs py-3 px-4 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <span>{checkoutLoading ? 'Processing Secure Settlement...' : 'Dispatch White-Glove Order'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SEGMENT 3: MY DESIGN STUDIO PLANS */}
      {activeSegment === 'projects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <span className="text-xs font-bold font-mono text-neutral-600">MY SPACIAL CONSULTATIONS & PORTFOLIOS</span>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-neutral-150 p-6">
              <Sparkles className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-xs font-semibold text-neutral-700">No active design consultation cases</h3>
              <p className="text-[10px] text-neutral-400 mt-1 leading-normal">
                Submit raw spacing and dimensions on the <strong>Interior Consultation</strong> tab above to engage master decorators 1-on-1.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {projects.map((proj) => (
                <div key={proj.id} className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4 shadow-2xs hover:border-neutral-300 transition duration-150">
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-neutral-400">
                        INQUIRY CASE: {proj.id.toUpperCase()}
                      </span>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Style Line: {proj.preferredStyle}</p>
                    </div>
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-mono font-bold rounded-full uppercase">
                      {proj.status}
                    </span>
                  </div>

                  <div className="bg-neutral-50 p-3 rounded-lg text-xs text-neutral-600 leading-normal">
                    <strong>My Inquired Space Requirements:</strong><br />
                    {proj.requestDetails}
                  </div>

                  {proj.planTitle ? (
                    <div className="border border-neutral-100 rounded-xl p-4 space-y-3.5 bg-neutral-50/20">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">Designer Bespoke Layout Plan</span>
                          <h4 className="font-display font-bold text-sm text-neutral-900 mt-0.5">
                            {proj.planTitle}
                          </h4>
                        </div>
                        {proj.estimatedCost && (
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">Budget Appraisal</span>
                            <p className="font-mono text-xs font-bold text-neutral-950 mt-0.5">
                              ₹{proj.estimatedCost}
                            </p>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-neutral-600 leading-normal">
                        {proj.planDescription}
                      </p>

                      {proj.notes && (
                        <p className="text-[11px] text-neutral-500 bg-white border border-neutral-100 p-2.5 rounded-lg italic">
                          <strong>Consultant Comment:</strong> {proj.notes}
                        </p>
                      )}

                      {proj.designUrls && proj.designUrls.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 block font-bold">Visual Blueprints & Moodboards</span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {proj.designUrls.map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="relative aspect-video rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 block hover:opacity-90 transition"
                              >
                                <img src={url} alt="inspiration" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50/50 border border-dashed border-amber-200 rounded-xl text-center text-xs text-amber-900">
                      Waiting on spatial drawings from our decorators for your portfolio.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SEGMENT 4: CLIENT DOSSIER & PROFILE EDITING */}
      {activeSegment === 'profile' && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6 shadow-2xs">
          <div className="border-b border-neutral-100 pb-3">
            <h3 className="font-display font-semibold text-neutral-900 text-sm">Profile Dossier</h3>
            <p className="text-[10px] text-neutral-400 font-mono mt-0.5">MANAGE CORRESPONDENCE DETAILS</p>
          </div>

          {profileSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-medium">
              Information dossier updated successfully.
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    placeholder="Olivia Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Email (Read Only)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-neutral-100/75 border border-neutral-200 rounded-lg text-neutral-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="tel"
                    id="customer-profile-phone"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Delivery Address Map</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    id="customer-profile-address"
                    placeholder="150 Maple Leaf Drive, Toronto"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              id="customer-profile-save"
              className="bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs py-2 px-4 rounded-xl cursor-pointer shadow-2xs"
            >
              Verify & Save Profile
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
