'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PropertyForm from '../../../components/forms/PropertyForm';
import { api } from '../../../../lib/api';

export default function AddProperty() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (payload: any) => {
    setLoading(true);
    setError('');

    try {
      await api.post('/api/properties', payload);
      router.push('/dashboard/properties');
    } catch (err: any) {
      setError(err.message || 'Network sync disruption occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <Link href="/dashboard/properties" className="hover:text-blue-600 transition">Catalog</Link>
            <span>/</span>
            <span className="text-gray-600">New Listing</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create Listing</h1>
          <p className="text-sm text-gray-500 mt-1">Inject a brand new real estate asset into the public market repository.</p>
        </div>

        <PropertyForm 
          onSubmit={handleSubmit}
          onCancelHref="/dashboard/properties"
          loading={loading}
          submitLabel="Publish Listing"
          error={error}
        />
      </div>
    </main>
  );
}