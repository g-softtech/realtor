'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BlogForm, { BlogData } from '../../../../components/forms/BlogForm';
import { api } from '../../../../lib/api';

export default function EditBlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = use(params);
  const blogSlug = unwrappedParams.slug;

  const [blogId, setBlogId] = useState('');
  const [initialData, setInitialData] = useState<BlogData | undefined>(undefined);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const data = await api.get(`/api/blogs/${blogSlug}`);
        setBlogId(data._id);
        setInitialData({
          title: data.title || '',
          category: data.category || 'Real Estate Investment',
          metaDescription: data.meta_description || '',
          content: data.content || '',
          existingCoverUrl: data.cover_image || ''
        });
      } catch (err: any) {
        setError(err.message || 'Error loading existing data.');
      } finally {
        setInitialLoading(false);
      }
    };

    if (blogSlug) fetchBlog();
  }, [blogSlug]);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError('');

    try {
      await api.put(`/api/blogs/${blogId}`, formData);
      router.push('/dashboard/blogs');
    } catch (err: any) {
      setError(err.message || 'Network synchronization failure.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-12 text-center font-medium text-gray-500">Loading article...</div>;

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            <Link href="/dashboard/blogs" className="hover:text-blue-600 transition">Command Center</Link>
            <span>/</span>
            <span className="text-gray-600">Edit Article</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Edit Article</h1>
          <p className="text-sm text-gray-500 mt-1">Update search-optimized insights regarding the Abuja real estate market ecosystem.</p>
        </div>

        <BlogForm 
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancelHref="/dashboard/blogs"
          loading={loading}
          submitLabel="Save Changes"
          error={error}
        />
      </div>
    </main>
  );
}
