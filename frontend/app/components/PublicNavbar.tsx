'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PublicNavbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-[#0A0A0A]/70 border-b border-gray-100 dark:border-neutral-900 px-6 md:px-16 py-5 flex items-center justify-between transition-all">
        <Link href="/" className="text-xl font-black tracking-tighter text-gray-900 dark:text-white">
          REALTOR<span className="text-blue-600 font-serif">.</span>
        </Link>
        
        <div className="flex items-center gap-4 md:gap-8">
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-neutral-400">
            <Link href="/properties" className="hover:text-black dark:hover:text-white transition">The Collection</Link>
            <Link href="/blogs" className="hover:text-black dark:hover:text-white transition">Market Insights</Link>
          </nav>

          <button 
            type="button"
            onClick={toggleTheme}
            className="p-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl text-sm shadow-sm hover:scale-105 transition-all"
            aria-label="Toggle structural interface theme"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          <Link href="/dashboard" className="hidden md:inline-block px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-wider rounded-lg transition shadow-sm">
            Agent Console
          </Link>

          {/* 🍔 Mobile Hamburger Toggle */}
          <button 
            className="md:hidden p-2 text-gray-900 dark:text-white focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* 📱 Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0A0A0A] border-b border-gray-100 dark:border-neutral-900 absolute w-full z-40 px-6 py-4 shadow-lg">
          <nav className="flex flex-col gap-4 text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white">
            <Link href="/properties" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-gray-50 dark:border-neutral-900">The Collection</Link>
            <Link href="/blogs" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-gray-50 dark:border-neutral-900">Market Insights</Link>
            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-blue-600 dark:text-blue-400">Agent Console Login →</Link>
          </nav>
        </div>
      )}
    </>
  );
}
