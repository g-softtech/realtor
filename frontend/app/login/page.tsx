'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AgentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please fill in all security parameter fields.');
      setLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
      
      // 1. Submit authentication payload straight to your backend auth engine
      const res = await fetch(`${apiUrl}/api/users/login`, { // Update this route if your auth path matches api/auth/login
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication credentials rejected.');
      }

      // 2. Save the real cryptographic token string to local storage cache
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role
      }));

      // 3. Sequentially advance execution context straight onto your Dashboard UI
      router.push('/dashboard');
      
    } catch (err: any) {
      console.error('❌ LOGIN TRANSACTION BLOCKAGE:', err.message);
      setError(err.message || 'Unable to establish link with the core auth server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-xl p-8 md:p-10">
        
        {/* Identity Headings */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Agent Authentication</h1>
          <p className="text-sm text-gray-500 mt-1">Access internal real estate lead registries.</p>
        </div>

        {/* Error Tracking Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100 leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        {/* Core Submission Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Corporate Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@realtor.com"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Security Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all mt-2"
          >
            {loading ? 'Verifying Signature...' : 'Secure Authorization Entry'}
          </button>
        </form>

      </div>
    </main>
  );
}