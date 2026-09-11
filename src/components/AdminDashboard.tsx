import React, { useState, useEffect } from 'react';
import { UserAccount, AccountStatus } from '../types';
import { Loader2, ShieldCheck, XCircle, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Rejection state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchAccounts();
    const interval = setInterval(fetchAccounts, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/admin/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.warn('Failed to fetch accounts (retrying):', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: AccountStatus, reason?: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/accounts/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectionReason: reason }),
      });
      
      if (res.ok) {
        await fetchAccounts();
        if (status === 'rejected') {
          setRejectingId(null);
          setRejectionReason('');
        }
      }
    } catch (error) {
      console.warn('Failed to update status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <ShieldCheck className="h-6 w-6 mr-2 text-indigo-600" />
            Admin Dashboard
          </h2>
          <p className="text-slate-500 mt-1 text-sm">Review and manage client network access requests.</p>
        </div>
        <button 
          onClick={onLogout}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
        >
          Exit Admin Mode
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-start text-amber-800">
        <AlertTriangle className="h-5 w-5 mr-3 shrink-0 mt-0.5 text-amber-600" />
        <div className="text-sm">
          <p className="font-semibold mb-1">Security & Privacy Notice</p>
          <p>
            As per explicit prompt instructions, client passwords are shown in plain text for demonstration purposes. 
            <strong> NEVER store or transmit passwords in plain text in a production environment.</strong> Always use strong hashing algorithms (e.g., bcrypt, Argon2).
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Client Details</th>
                <th className="px-6 py-4">Credentials (Demo)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && accounts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">Loading accounts...</p>
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No client requests found in the system.
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      {account.status === 'pending' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="h-3 w-3 mr-1" /> Pending
                        </span>
                      )}
                      {account.status === 'approved' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
                        </span>
                      )}
                      {account.status === 'rejected' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
                          <XCircle className="h-3 w-3 mr-1" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="font-medium text-slate-900">{account.username}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {new Date(account.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top font-mono text-xs bg-slate-50">
                      <div className="text-slate-500 select-all">
                        {account.password}
                      </div>
                      {account.status === 'rejected' && account.rejectionReason && (
                        <div className="mt-2 text-xs bg-rose-50 border border-rose-100 p-2 rounded text-rose-700">
                          <strong>Reason:</strong> {account.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top text-right">
                      {rejectingId === account.id ? (
                        <div className="flex flex-col gap-2 items-end min-w-[200px]">
                          <textarea 
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full text-sm p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-rose-500 outline-none resize-none"
                            placeholder="Enter reason for rejection..."
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setRejectingId(null);
                                setRejectionReason('');
                              }}
                              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(account.id, 'rejected', rejectionReason)}
                              disabled={actionLoading === account.id || !rejectionReason.trim()}
                              className="px-3 py-1.5 text-xs bg-rose-600 text-white rounded hover:bg-rose-700 disabled:opacity-50 transition-colors"
                            >
                              Confirm Reject
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleUpdateStatus(account.id, 'approved')}
                            disabled={account.status === 'approved' || actionLoading === account.id}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md disabled:opacity-40 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setRejectingId(account.id)}
                            disabled={account.status === 'rejected' || actionLoading === account.id}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md disabled:opacity-40 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
