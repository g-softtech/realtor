'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // 1. Maintain existing architecture: check localStorage for token
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router, pathname]);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent flash of unprotected content
  if (!isAuthenticated) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative w-full">
      
      {/* 📱 Mobile Top Header (Visible only on < md screens) */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 fixed top-0 w-full z-40 shadow-sm">
        <div className="font-black text-lg tracking-tight text-gray-900">Abuja Realty</div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-lg"
          aria-label="Open mobile menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* 🌑 Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close mobile menu"
        />
      )}

      {/* 📂 Mobile Slide-out Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button inside drawer for extra UX safety */}
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 z-50 md:hidden p-2"
        >
          ✕
        </button>
        <Sidebar />
      </div>

      {/* 💻 Desktop Persistent Sidebar (Visible only on >= md screens) */}
      <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-white hidden md:block">
        <Sidebar />
      </div>

      {/* 📄 Main Content Area (Push down content on mobile to clear fixed header) */}
      <div className="flex-1 overflow-auto md:mt-0 mt-[60px] pb-6">
        {children}
      </div>
    </div>
  );
}
