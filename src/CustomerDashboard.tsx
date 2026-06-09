import React, { useState } from 'react';
import { 
  ShoppingBag, MapPin, Phone, User as UserIcon, Mail, CheckCircle2, ClipboardList, 
  Map, Trash2, ArrowRight, Check, Heart, HelpCircle, RefreshCw, Sparkles, ChevronRight, Download, Ticket, QrCode, Gift, Coins
} from 'lucide-react';
import { Order, OrderStatus, Product, Project, User, PromoCode } from '../types.js';

interface CustomerDashboardProps {
  user: User;
  products: Product[];
  orders: Order[];
  projects: Project[];
  promos?: PromoCode[];
  onUpdateProfile: (updates: Partial<User>) => Promise<void>;
  cart: { product: Product; quantity: number }[];
  onUpdateCartQty: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onPlaceOrder: (shippingAddress: string, paymentMethod: string, promoCode?: string, useCoins?: boolean) => Promise<void>;
  onToggleWishlist?: (productId: string) => void;
  initialActiveSegment?: 'cart' | 'orders' | 'profile' | 'projects' | 'wishlist' | 'giftcards';
}

const PAYMENT_METHODS = [
  'UPI',
  'Cash on Delivery',
];

export default function CustomerDashboard({
  user,
  products,
  orders,
  projects,
  promos = [],
  onUpdateProfile,
  cart,
  onUpdateCartQty,
  onRemoveFromCart,
  onPlaceOrder,
  onToggleWishlist,
  initialActiveSegment = 'cart',
}: CustomerDashboardProps) {
  const [activeSegment, setActiveSegment] = useState<'cart' | 'orders' | 'profile' | 'projects' | 'wishlist' | 'giftcards'>(initialActiveSegment);

  // Profile Form States
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Checkout Form States
  const [shippingAddress, setShippingAddress] = useState(user.address || '');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discount: number} | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [useFurniCoins, setUseFurniCoins] = useState(false);

  // Advanced Checkout Flow States
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'upi' | 'cod'>('form');
  const [codFee, setCodFee] = useState(0);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  // Cart math
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartTax = Math.round(cartSubtotal * 0.08); // 8% simulation
  const discountAmt = appliedPromo ? Math.round(cartSubtotal * (appliedPromo.discount / 100)) : 0;
  const platformFee = 29; // Standard platform fee
  let cartTotal = cartSubtotal + cartTax + platformFee - discountAmt;
  
  let coinDiscount = 0;
  if (useFurniCoins && user.furniCoins) {
    coinDiscount = Math.min(cartTotal, user.furniCoins);
    cartTotal -= coinDiscount;
  }

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

  const handleInitiateCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!shippingAddress.trim()) {
      setCheckoutError('Please enter a delivery destination address.');
      return;
    }

    setCheckoutError('');
    
    // Route to respective payment verification steps
    if (paymentMethod === 'UPI') {
      setCheckoutStep('upi');
    } else {
      // Standardize COD fee for consistent invoice printing
      setCodFee(25);
      setCheckoutStep('cod');
    }
  };

  const handleFinalizeOrder = async () => {
    setCheckoutLoading(true);

    try {
      await onPlaceOrder(shippingAddress, paymentMethod, appliedPromo?.code, useFurniCoins);
      setCheckoutSuccess(true);
      setCheckoutStep('form');
      setTimeout(() => {
        setCheckoutSuccess(false);
        setActiveSegment('orders'); // Jump to orders segment to see progress!
      }, 3500);
    } catch (err: any) {
      setCheckoutError(err.message || 'Stock limits exceeded. Order failed.');
      setCheckoutStep('form');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Mock UPI verification loader
  const handleUPIPaymentDone = () => {
    setIsSimulatingPayment(true);
    setTimeout(() => {
      setIsSimulatingPayment(false);
      handleFinalizeOrder();
    }, 2500); // Wait 2.5 seconds showing loader
  };

  // Order status visual layout mapping
  const workflowStatuses: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const getWorkflowStep = (currentStatus: OrderStatus) => {
    return workflowStatuses.indexOf(currentStatus);
  };

  const handleApplyPromo = () => {
    const code = promoCodeInput.trim().toUpperCase();
    const activePromo = promos.find(p => p && p.code === code);
    
    if (activePromo) {
      if (activePromo.usedCount >= activePromo.usageLimit) {
        setCheckoutError('This Promo Code has reached its usage limit.');
        setAppliedPromo(null);
      } else {
        setAppliedPromo({ code: activePromo.code, discount: activePromo.discount });
        setCheckoutError('');
      }
    } else {
      setCheckoutError('Invalid or expired Promo Code.');
      setAppliedPromo(null);
    }
  };

  // Comprehensive calculation for displaying breakdown
  const getOrderDetails = (order: Order) => {
    const subtotal = (order.items || []).reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = Math.round(subtotal * 0.08);
    const pFee = 29;
    const isCOD = order.paymentMethod === 'Cash on Delivery';
    const codFeeValue = isCOD ? 25 : 0;
    const promo = promos.find(p => p && p.code === order.promoCode);
    const discountAmtValue = promo ? Math.round(subtotal * (promo.discount / 100)) : 0;
    const coinDiscountValue = order.usedCoins || 0;
    const grandTotal = subtotal + tax + pFee + codFeeValue - discountAmtValue - coinDiscountValue;
    
    return { subtotal, tax, pFee, isCOD, codFeeValue, discountAmtValue, coinDiscountValue, grandTotal };
  };

  const handlePrintInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const { subtotal, tax, pFee, isCOD, codFeeValue, discountAmtValue, coinDiscountValue, grandTotal } = getOrderDetails(order);

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1c1917; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 2px solid #e7e5e4; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
            .brand { font-size: 28px; font-weight: bold; letter-spacing: -0.5px; margin: 0; }
            .brand span { color: #f59e0b; }
            .invoice-title { font-size: 12px; color: #78716c; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px; font-weight: 600; }
            .details p { margin: 4px 0; font-size: 14px; color: #44403c; }
            .item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #e7e5e4; font-size: 14px; }
            .footer { margin-top: 70px; text-align: center; color: #78716c; border-top: 1px solid #e7e5e4; padding-top: 30px; }
            .footer-logo { font-size: 20px; font-weight: bold; color: #1c1917; margin-bottom: 8px; letter-spacing: -0.5px; }
            .footer-logo span { color: #f59e0b; }
            .summary-container { margin-top: 20px; padding-top: 15px; display: flex; flex-direction: column; align-items: flex-end; }
            .summary-line { display: flex; justify-content: space-between; width: 320px; margin-bottom: 8px; font-size: 14px; color: #44403c; }
            .summary-line.discount { color: #059669; font-weight: 500; }
            .total { font-weight: bold; font-size: 1.3em; margin-top: 10px; text-align: right; padding-top: 15px; border-top: 2px solid #1c1917; width: 320px; display: flex; justify-content: space-between; }
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-30deg);
              font-size: 130px;
              font-weight: bold;
              color: rgba(28, 25, 23, 0.03);
              z-index: -1;
              pointer-events: none;
            }
          </style>
        </head>
        <body>
          <div class="watermark">Furni<span style="color: rgba(245, 158, 11, 0.04);">Design</span></div>
          <div class="header">
            <div>
              <h1 class="brand">Furni<span>Design</span></h1>
              <div class="invoice-title">Official Tax Invoice</div>
            </div>
            <div style="text-align: right;" class="details">
              <p><strong>Order ID:</strong> ${order.id?.toUpperCase() || 'UNKNOWN'}</p>
              <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div class="details" style="margin-bottom: 30px;">
            <p style="color: #78716c; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; font-weight: bold;">Billed To:</p>
            <p><strong>${order.customerName}</strong></p>
            <p>${order.shippingAddress}</p>
            <p>Payment Method: ${order.paymentMethod}</p>
          </div>

          <h3 style="font-size: 16px; border-bottom: 1px solid #1c1917; padding-bottom: 10px;">Items Purchased</h3>
          ${(order.items || []).map(i => `<div class="item"><span>${i.name} (x${i.quantity})</span><span>₹${i.price * i.quantity}</span></div>`).join('')}
          
          <div class="summary-container">
            <div class="summary-line"><span>Products Subtotal:</span> <span>₹${subtotal}</span></div>
            <div class="summary-line"><span>Tax (8%):</span> <span>₹${tax}</span></div>
            <div class="summary-line"><span>Platform Fee:</span> <span>₹${pFee}</span></div>
            ${isCOD ? `<div class="summary-line"><span>COD Handling Fee:</span> <span>₹${codFeeValue}</span></div>` : ''}
            ${order.promoCode ? `<div class="summary-line discount"><span>Promo Applied (${order.promoCode}):</span> <span>-₹${discountAmtValue}</span></div>` : ''}
            ${coinDiscountValue > 0 ? `<div class="summary-line discount"><span>FurniCoins Redeemed:</span> <span>-₹${coinDiscountValue}</span></div>` : ''}
            ${order.earnedCoins ? `<div class="summary-line" style="color: #f59e0b; font-weight: bold; font-size: 12px; margin-top: 5px;"><span>Coins Earned in this Order:</span> <span>+${order.earnedCoins} <span style="font-size:10px">🪙</span></span></div>` : ''}
            
            <div class="total"><span>Grand Total:</span> <span>₹${grandTotal}</span></div>
          </div>

          <div class="footer">
            <div class="footer-logo">Furni<span>Design</span></div>
            <p style="font-size: 12px;">Thank you for trusting us with your home interior.</p>
            <p style="font-size: 10px; color: #a8a29e; margin-top: 5px;">FurniDesign Systems • Ujjain, Madhya Pradesh • contact@gmail.com</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
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
        
        <div className="flex items-center gap-3 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-100 shrink-0">
          <div className="bg-amber-100 p-2 rounded-full">
            <Coins className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">FurniCoins Balance</p>
            <p className="text-lg font-mono font-bold text-amber-600">{user.furniCoins || 0}</p>
          </div>
        </div>

        {/* Dash Segment navigations */}
        <div className="flex overflow-x-auto scrollbar-none gap-1 bg-neutral-50 p-1 rounded-xl border border-neutral-200">
          <button
            onClick={() => setActiveSegment('orders')}
            className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
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
            className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
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
            onClick={() => setActiveSegment('wishlist')}
            className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
              activeSegment === 'wishlist' ? 'bg-rose-500 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            My Wishlist ({user.wishlist?.length || 0})
          </button>
          <button
            onClick={() => setActiveSegment('projects')}
            className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
              activeSegment === 'projects' ? 'bg-neutral-950 text-white' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            My Design Studio ({projects.length})
          </button>
          <button
            onClick={() => setActiveSegment('profile')}
            className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
              activeSegment === 'profile' ? 'bg-neutral-950 text-white' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Profile Dossier
          </button>
          <button
            onClick={() => setActiveSegment('giftcards')}
            className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
              activeSegment === 'giftcards' ? 'bg-neutral-950 text-white' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            E-Gift Cards
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
                const details = getOrderDetails(order);
                return (
                  <div key={order.id} className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-5 shadow-2xs hover:border-neutral-300 transition duration-150" id={`order-item-${order.id}`}>
                    {/* Header Ribbon */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                      <div>
                        <span className="text-xs font-mono font-bold text-neutral-400">
                          ORDER REF: {order.id?.toUpperCase() || 'UNKNOWN'}
                        </span>
                        <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                          PLACED ON {new Date(order.createdAt).toLocaleDateString()} AT {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-400 font-mono">TOTAL BILL</span>
                        <p className="text-sm font-mono font-bold text-neutral-900">₹{details.grandTotal}</p>
                      </div>
                      <button 
                        onClick={() => handlePrintInvoice(order)}
                        className="p-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 rounded-xl transition cursor-pointer"
                        title="Download Invoice PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Ordered items listing */}
                    <div className="space-y-1.5 text-xs text-neutral-700 font-medium">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                          <span>{item.name} <strong className="text-neutral-400 font-normal">x{item.quantity}</strong></span>
                          <span className="font-mono font-semibold text-neutral-950">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center bg-stone-50 border border-stone-100 rounded-lg p-3 text-xs">
                      <span className="text-stone-500 font-mono">Payment Method: <strong>{order.paymentMethod}</strong></span>
                      {order.earnedCoins ? <span className="font-bold text-amber-600">+{order.earnedCoins} Coins Earned</span> : <span className="text-stone-400">No coins earned</span>}
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
                        src={item.product.images?.[0] || ''}
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
          {cart.length > 0 && (
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

              {checkoutStep === 'form' && (
              <form onSubmit={handleInitiateCheckout} className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
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

                {/* Promo code area */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1">
                    <Ticket className="w-3.5 h-3.5 text-amber-600" /> Promotional Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="WELCOME20"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none uppercase font-mono tracking-widest"
                    />
                    <button type="button" onClick={handleApplyPromo} className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 px-4 rounded-xl text-xs font-bold transition cursor-pointer">Apply</button>
                  </div>
                </div>

                {/* FurniCoins Application */}
                {user.furniCoins ? user.furniCoins > 0 && (
                  <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Coins className="w-6 h-6 text-amber-500" />
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900">Use FurniCoins</h4>
                        <p className="text-[10px] text-neutral-500">Balance: {user.furniCoins} 🪙 (Value: ₹{user.furniCoins})</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={useFurniCoins} onChange={(e) => setUseFurniCoins(e.target.checked)} />
                      <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                ) : null}

                {/* Checkout pricing breakdown */}
                <div className="border-t border-dashed border-neutral-200 pt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between text-neutral-500">
                    <span>Product Subtotal</span>
                    <span className="font-mono">₹{cartSubtotal}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Promo Applied ({appliedPromo.code} - {appliedPromo.discount}%)</span>
                      <span className="font-mono">- ₹{discountAmt}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-500">
                    <span>Tax & Logistics (8%)</span>
                    <span className="font-mono">₹{cartTax}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Platform Fee</span>
                    <span className="font-mono">₹{platformFee}</span>
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
                  <span>Proceed to Payment</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>
              )}

              {/* DYNAMIC UPI QR SCANNER STEP */}
              {checkoutStep === 'upi' && (
                <div className="space-y-5 animate-[fadeIn_0.2s_ease-out] text-center">
                  <div className="space-y-1">
                    <div className="mx-auto w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-neutral-900">Scan to Pay via UPI</h4>
                    <p className="text-[10px] text-neutral-500 font-mono">Total Bill: ₹{cartTotal}</p>
                  </div>

                  <div className="bg-white p-4 inline-block rounded-2xl border border-neutral-200 shadow-sm mx-auto">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=furnidesign@upi&pn=FurniDesign&am=${cartTotal}`} alt="UPI QR Code" className="w-32 h-32" />
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2 block">Or Pay Using Apps</span>
                    <div className="flex justify-center gap-2.5">
                      <button type="button" className="flex-1 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 transition cursor-pointer">PhonePe</button>
                      <button type="button" className="flex-1 py-2 bg-sky-50 border border-sky-100 rounded-lg text-[10px] font-bold text-sky-700 hover:bg-sky-100 transition cursor-pointer">Paytm</button>
                      <button type="button" className="flex-1 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer">GPay</button>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button type="button" onClick={() => setCheckoutStep('form')} disabled={isSimulatingPayment} className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-semibold text-xs py-3 rounded-xl transition cursor-pointer disabled:opacity-50">
                      Cancel
                    </button>
                    <button type="button" onClick={handleUPIPaymentDone} disabled={isSimulatingPayment || checkoutLoading} className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70">
                      {(isSimulatingPayment || checkoutLoading) ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {(isSimulatingPayment || checkoutLoading) ? 'Verifying Payment...' : 'Payment Done'}
                    </button>
                  </div>
                </div>
              )}

              {/* DYNAMIC COD CONFIRMATION STEP */}
              {checkoutStep === 'cod' && (
                <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                  <div className="text-center space-y-1 pb-2">
                    <h4 className="font-bold text-neutral-900">Confirm Cash on Delivery</h4>
                    <p className="text-[10px] text-neutral-500">Please review your final amount</p>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3 text-xs">
                    <div className="flex justify-between text-neutral-600">
                      <span>Items & Taxes Total</span>
                      <span className="font-mono font-medium">₹{cartTotal}</span>
                    </div>
                    <div className="flex justify-between text-rose-600">
                      <span>COD Handling Fee</span>
                      <span className="font-mono font-bold">+ ₹{codFee}</span>
                    </div>
                    <div className="flex justify-between text-neutral-900 font-bold pt-3 border-t border-neutral-200 mt-2">
                      <span>Amount to Pay on Delivery</span>
                      <span className="font-mono text-sm">₹{cartTotal + codFee}</span>
                    </div>
                  </div>
                  <div className="bg-amber-50 text-amber-800 p-3.5 rounded-xl border border-amber-100 text-[10px] leading-relaxed">
                    <strong>Logistics Note:</strong> Please keep the exact amount ready at the time of delivery. A small handling fee of ₹{codFee} is applied for COD orders.
                  </div>
                  <div className="pt-2 flex gap-2">
                    <button type="button" onClick={() => setCheckoutStep('form')} className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-semibold text-xs py-3 rounded-xl transition cursor-pointer">
                      Back
                    </button>
                    <button type="button" onClick={handleFinalizeOrder} disabled={checkoutLoading} className="flex-[2] bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs py-3 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2">
                      {checkoutLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirm Order'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SEGMENT: MY WISHLIST */}
      {activeSegment === 'wishlist' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <span className="text-xs font-bold font-mono text-neutral-600">SAVED FAVORITES</span>
          </div>
          {(!user.wishlist || user.wishlist.length === 0) ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-neutral-150 p-6">
              <Heart className="w-10 h-10 text-rose-200 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-neutral-700">Your wishlist is empty</h3>
              <p className="text-xs text-neutral-400 mt-1">Tap the heart icon on any product to save it here for later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.filter(p => user.wishlist?.includes(p.id)).map(prod => (
                <div key={prod.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition">
                  <div className="aspect-square relative">
                    <img src={prod.images?.[0] || ''} alt={prod.name} className="w-full h-full object-cover" />
                    <button type="button" onClick={(e) => { e.preventDefault(); onToggleWishlist?.(prod.id); }} className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow cursor-pointer">
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    </button>
                  </div>
                  <div className="p-4 space-y-1">
                    <h4 className="font-bold text-xs truncate">{prod.name}</h4>
                    <p className="font-mono text-xs font-bold text-neutral-900">₹{prod.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* SEGMENT 5: E-GIFT CARDS */}
      {activeSegment === 'giftcards' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <span className="text-xs font-bold font-mono text-neutral-600">GIFT CARDS & VOUCHERS</span>
          </div>

          <div className="bg-neutral-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center"></div>
            <div className="relative z-10 space-y-5 max-w-xl mx-auto">
              <Gift className="w-12 h-12 text-amber-400 mx-auto" />
              <h2 className="font-display text-3xl font-bold">Share the Gift of Design</h2>
              <p className="text-neutral-300 text-sm leading-relaxed">
                Surprise your loved ones with a FurniDesign E-Gift Card. Perfect for housewarmings, weddings, and special milestones.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
                {['₹5,000', '₹10,000', '₹25,000', 'Custom'].map((amt, idx) => (
                  <button key={idx} className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-3 rounded-xl font-mono font-bold text-sm transition cursor-pointer">
                    {amt}
                  </button>
                ))}
              </div>
              
              <button className="mt-6 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 transition cursor-pointer">
                Purchase Gift Card
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h3 className="font-display font-semibold text-neutral-900 text-sm mb-4">My Active Gift Cards</h3>
            <div className="p-8 border border-dashed border-neutral-200 rounded-xl text-center text-neutral-400">
              <Ticket className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-xs font-semibold">You don't have any active gift cards</p>
            </div>
          </div>
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
