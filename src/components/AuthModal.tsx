import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Phone, MapPin, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole } from '../types.js';

interface AuthModalProps {
  onSuccess: (token: string, user: any) => void;
  onClose?: () => void;
}

export default function AuthModal({ onSuccess, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin
      ? { email, password }
      : { email, password, name, role, phone, address };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      onSuccess(data.token, data.user);
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal" className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden">
      <div className="p-8">
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-neutral-900">
            {isLogin ? 'Sign In to Your Space' : 'Create an Account'}
          </h2>
          <p className="text-sm text-neutral-500 mt-2">
            {isLogin ? 'Welcome back! Enjoy crafted furniture and interior designs.' : 'Join us to design your dream home today.'}
          </p>
        </div>

        {error && (
          <div id="auth-error-alert" className="mb-4 p-3.5 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-4.5 w-4.5 text-neutral-400" />
                  <input
                    type="text"
                    required
                    id="register-name"
                    placeholder="e.g., ali khan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Select Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['customer', 'designer'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      id={`role-btn-${r}`}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`px-3 py-2 text-xs font-medium border rounded-xl capitalize transition cursor-pointer ${
                        role === r
                          ? 'bg-neutral-900 border-neutral-900 text-white'
                          : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-neutral-400" />
              <input
                type="email"
                required
                id="auth-email-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-neutral-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                id="auth-password-input"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4.5 w-4.5 text-neutral-400" />
                  <input
                    type="tel"
                    id="register-phone"
                    placeholder="enter your Mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Delivery Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4.5 w-4.5 text-neutral-400" />
                  <input
                    type="text"
                    id="register-address"
                    placeholder="e.g., tower friganze ujjain"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            id="auth-submit-btn"
            className="w-full mt-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm py-2.5 px-4 rounded-xl shadow-md transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm border-t border-neutral-100 pt-4">
          <span className="text-neutral-500">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </span>{' '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-neutral-900 font-semibold hover:underline bg-transparent border-none cursor-pointer"
          >
            {isLogin ? 'Register now' : 'Sign in here'}
          </button>
        </div>
      </div>
    </div>
  );
}
