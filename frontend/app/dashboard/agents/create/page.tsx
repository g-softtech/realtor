'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../../lib/api';

export default function CreateAgentPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'agent'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Hard Redirect Guard
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') {
          setIsAuthorized(true);
          setIsCheckingAuth(false);
        } else {
          router.replace('/dashboard/agents'); // unauthorized, kick out
        }
      } catch (e) {
        router.replace('/dashboard');
      }
    } else {
      router.replace('/login');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/api/users', formData);
      alert('Agent provisioned successfully!');
      router.push('/dashboard/agents');
    } catch (err: any) {
      setError(err.message || 'Failed to provision the agent. Please verify inputs.');
      setLoading(false);
    }
  };

  // Prevent flash of UI before redirect
  if (isCheckingAuth) {
    return (
      <main className="min-h-screen bg-gray-50/50 p-6 md:p-12 flex items-center justify-center">
        <p className="text-sm font-bold text-gray-500 animate-pulse tracking-wider uppercase">Verifying Authorization...</p>
      </main>
    );
  }

  if (!isAuthorized) return null;

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <Link href="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
            <span>/</span>
            <Link href="/dashboard/agents" className="hover:text-blue-600 transition">Personnel</Link>
            <span>/</span>
            <span className="text-gray-600">Provision</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Provision Agent</h1>
          <p className="text-sm text-gray-500 mt-1">Register a new real estate agent or administrator.</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100 leading-relaxed">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Corporate Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="agent@realtor.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Security Password</label>
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">System Clearance Role</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 font-bold"
                >
                  <option value="agent">Standard Agent</option>
                  <option value="admin">System Administrator</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-2 font-medium">Administrators have full destructive privileges across the CRM.</p>
              </div>

            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row gap-3 md:justify-end">
              <Link 
                href="/dashboard/agents"
                className="w-full md:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-black uppercase tracking-wider rounded-xl transition text-center"
              >
                Cancel
              </Link>
              <button 
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition"
              >
                {loading ? 'Provisioning...' : 'Provision Agent'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </main>
  );
}
