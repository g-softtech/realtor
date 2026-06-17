'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  category: 'Real Estate Investment' | 'Abuja Housing Market' | 'Buying Guides';
  content: string;
  cover_image?: string;
  meta_description: string;
  createdAt: string;
}

export default function PublicBlogFeed() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Enforced PRD marketing categories
  const categories = ['All', 'Real Estate Investment', 'Abuja Housing Market', 'Buying Guides'];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
        const res = await fetch(`${apiUrl}/api/blogs`);
        
        if (!res.ok) throw new Error('Failed to capture content engine parameters.');
        
        const data = await res.json();
        setBlogs(data);
        setFilteredBlogs(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading articles.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Filter articles smoothly based on the selected tag node
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setFilteredBlogs(blogs);
    } else {
      setFilteredBlogs(blogs.filter(blog => blog.category === category));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm font-bold text-gray-500 animate-pulse tracking-wider uppercase">Loading Market Insights...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      
      {/* 🏙️ Luxury Editorial Hero Section */}
      <section className="bg-gray-50 border-b border-gray-100 py-16 px-6 md:px-12 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Abuja Real Estate Insights
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mt-4 mb-3">
            Market Intelligence & Guides
          </h1>
          <p className="text-md text-gray-500 max-w-xl mx-auto leading-relaxed">
            Stay ahead with search-optimized data, investment breakdowns, and neighborhood analysis direct from our local agents.
          </p>
        </div>
      </section>

      {/* 🏷️ Interactive Category Filter Navigation Bar */}
      <section className="max-w-6xl mx-auto px-6 mt-12">
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-gray-100 pb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-full border transition-all ${
                selectedCategory === cat
                  ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 📰 Public Blog Grid Matrix Layout */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100 text-center max-w-md mx-auto">
            ⚠️ {error}
          </div>
        )}

        {filteredBlogs.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-medium border border-dashed border-gray-100 rounded-xl bg-gray-50/50">
            No articles published under this specific category segment yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((post) => {
              const fallbackImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
              
              return (
                <article key={post._id} className="group flex flex-col space-y-3 cursor-pointer">
                  {/* Image Wrap */}
                  <Link href={`/blogs/${post.slug}`} className="block overflow-hidden rounded-xl border border-gray-100 aspect-16/10 bg-gray-50 relative shadow-sm">
                    <img 
                      src={post.cover_image || fallbackImage} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-white/95 text-gray-900 px-2.5 py-1 rounded shadow-sm border border-gray-100">
                        {post.category}
                      </span>
                    </div>
                  </Link>

                  {/* Meta Text details */}
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  {/* Title & Description Clickable Node */}
                  <Link href={`/blogs/${post.slug}`} className="block group-hover:text-blue-600 transition-colors">
                    <h2 className="text-lg font-black text-gray-900 tracking-tight leading-snug line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-500 text-xs mt-2 line-clamp-2 leading-relaxed font-medium">
                      {post.meta_description}
                    </p>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>

    </main>
  );
}