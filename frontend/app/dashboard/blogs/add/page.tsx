'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BlogForm from '../../../components/forms/BlogForm';
import { api } from '../../../../lib/api';

export default function AddBlogPost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError('');

    try {
      await api.post('/api/blogs', formData);
      router.push('/dashboard/blogs');
    } catch (err: any) {
      setError(err.message || 'Network synchronization failure.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <Link href="/dashboard/blogs" className="hover:text-blue-600 transition">Command Center</Link>
            <span>/</span>
            <span className="text-gray-600">New Article</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Compose Article</h1>
          <p className="text-sm text-gray-500 mt-1">Publish search-optimized insights regarding the Abuja real estate market ecosystem.</p>
        </div>

        <BlogForm 
          onSubmit={handleSubmit}
          onCancelHref="/dashboard/blogs"
          loading={loading}
          submitLabel="Publish Article"
          error={error}
        />
      </div>
    </main>
  );
}