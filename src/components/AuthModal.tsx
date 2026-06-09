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

  const handleSocialLogin = (provider: string) => {
    setError(`${provider} login integration requires OAuth API Keys (Client ID). For testing, please use the Email login.`);
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

        {/* SOCIAL LOGIN BUTTONS */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={() => handleSocialLogin('Google')}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl text-xs font-semibold text-neutral-700 transition shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px bg-neutral-200 flex-1"></div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">Or continue with email</span>
          <div className="h-px bg-neutral-200 flex-1"></div>
        </div>

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
                  required
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
