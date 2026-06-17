'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>('agent');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role) setUserRole(user.role);
      } catch (e) {
        console.error('Error parsing user object');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); 
    router.push('/login');
  };

  const navLinks = [
    { name: 'Overview', href: '/dashboard', icon: '📊' },
    { name: 'Properties', href: '/dashboard/properties', icon: '🏢' },
    { name: 'Leads', href: '/dashboard/leads', icon: '👥' },
    { name: 'Blog Posts', href: '/dashboard/blogs', icon: '✍️' },
  ];

  if (userRole === 'admin') {
    navLinks.push({ name: 'Agent Management', href: '/dashboard/agents', icon: '🛡️' });
  }

  return (
    <div className="p-4 bg-white dark:bg-neutral-950 flex flex-col justify-between h-full">
      <div>
        <div className="mb-8 px-4">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Abuja Realty</h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Agent Console</p>
        </div>
        
        <nav className="space-y-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link 
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <span>{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2.5} 
            stroke="currentColor" 
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
          Exit Command Center
        </button>
      </div>
    </div>
  );
}
