'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import SkeletonCard from '../../components/ui/SkeletonCard';
import EmptyState from '../../components/ui/EmptyState';
interface Blog {
  _id: string;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  cover_image: string;
  createdAt: string;
}

export default function BlogManagement() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('agent');
  const router = useRouter();

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

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await api.get('/api/blogs');
        setBlogs(data);
      } catch (err: any) {
        setError(err.message || 'Error pulling network assets.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs(); 
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you absolutely sure you want to permanently remove this article?")) {
      return;
    }

    try {
      await api.delete(`/api/blogs/${id}`);
      
      setBlogs(blogs.filter(blog => blog._id !== id));
      alert("Article removed successfully!");
    } catch (err: any) {
      console.error("Error deleting blog:", err);
      alert(err.message || "Failed to delete the article.");
    }
  };

  if (error) return <div className="p-12 text-center text-red-500 font-medium">Error: {error}</div>;

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              <Link href="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
              <span>/</span>
              <span className="text-gray-600">Blog Posts</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Blog Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage articles and track your content marketing pipeline.</p>
          </div>
          
          <div className="flex flex-wrap gap-3 self-start">
            <Link 
              href="/dashboard"
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition shadow-sm flex items-center"
            >
              ← View Client Leads
            </Link>
            
            <Link 
              href="/dashboard/blogs/add"
              className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 shadow-sm transition flex items-center"
            >
              + Compose New Article
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : blogs.length === 0 ? (
            <EmptyState 
              title="No Blog Articles Registered" 
              description="Your content database is currently empty. Compose a new article to start building SEO traffic."
              actionHref="/dashboard/blogs/add"
              actionLabel="+ Compose Article"
            />
          ) : (
            blogs.map((blog) => {
              const cardPreviewImage = blog.cover_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
              
              return (
                <div key={blog._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group">
                  
                  <Link href={`/blogs/${blog.slug}`} className="block overflow-hidden relative cursor-pointer">
                    <div className="w-full h-48 overflow-hidden bg-gray-100 relative">
                      <img 
                        src={cardPreviewImage} 
                        alt={blog.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md border border-blue-100 shadow-sm">
                          {blog.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 pb-2">
                      <h3 className="text-lg font-bold text-gray-900 tracking-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-gray-400 text-[10px] mt-1 uppercase font-bold tracking-wider">
                        Published: {new Date(blog.createdAt).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </Link>

                  <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex flex-col gap-4 mt-auto">
                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                    <Link 
                      href={`/dashboard/blogs/edit/${blog.slug}`}
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[11px] font-extrabold uppercase tracking-wider rounded-md transition"
                    >
                      Edit
                    </Link>
                    {userRole === 'admin' && (
                      <button 
                        onClick={() => handleDelete(blog._id)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-[11px] font-extrabold uppercase tracking-wider rounded-md transition"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  </div>
                  
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
