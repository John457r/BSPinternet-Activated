/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClientPortal } from './components/ClientPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { Network } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isAdminView, setIsAdminView] = useState(false);

  return (
    <div className="min-h-screen bg-[#1a4d3a] flex flex-col font-sans">
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-center">
          {/* Admin toggle just for demo purposes if they don't want to login as admin/admin */}
          <button 
            onClick={() => setIsAdminView(!isAdminView)}
            className="absolute right-4 text-xs font-medium text-emerald-100/30 hover:text-emerald-100 opacity-0 focus:opacity-100 focus:outline-none"
            aria-label="Toggle admin view (hidden demo tool)"
          >
            [Admin]
          </button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {isAdminView ? (
            <motion.div key="admin" className="w-full flex justify-center">
              <AdminDashboard onLogout={() => setIsAdminView(false)} />
            </motion.div>
          ) : (
            <motion.div key="client" className="w-full flex justify-center">
              <ClientPortal onAdminLogin={() => setIsAdminView(true)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-6 text-center text-sm text-emerald-100/40">
        <p>&copy; {new Date().getFullYear()} BSPinternet Secure Portal. All rights reserved.</p>
      </footer>
    </div>
  );
}
