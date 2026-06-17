'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Property {
  _id: string;
  title: string;
  location: string;
  price: number;
  type: string;
  status: string;
  images?: string[];
}

interface Blog {
  _id: string;
  title: string;
  slug: string;
  category: string;
  meta_description: string;
  cover_image?: string;
}

interface ComponentProps {
  initialProperties: Property[];
  initialBlogs: Blog[];
}

export default function HomepageClientLayout({ initialProperties, initialBlogs }: ComponentProps) {
  // Filter Dropdown Options
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterLayout, setFilterLayout] = useState('All'); // 🚀 NEW: State node to track layout keywords

  // Contact Intake Form States
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadNotes, setLeadNotes] = useState('');
  const [formStatus, setFormStatus] = useState({ success: false, error: '', loading: false });

  // Handle Lead Posting
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone) {
      setFormStatus({ success: false, error: 'Name and Phone fields are strictly required.', loading: false });
      return;
    }

    setFormStatus({ success: false, error: '', loading: true });
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
      const res = await fetch(`${apiUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadName,
          email: leadEmail,
          phone: leadPhone,
          notes: leadNotes || 'Requested property consultation via landing page.'
        })
      });

      if (!res.ok) throw new Error('Lead registration failed backend validation validation checks.');

      setFormStatus({ success: true, error: '', loading: false });
      setLeadName(''); setLeadEmail(''); setLeadPhone(''); setLeadNotes('');
    } catch (err: any) {
      setFormStatus({ success: false, error: err.message || 'Server connection error.', loading: false });
    }
  };

  return (
    <>
      {/* 🏙️ Cinematic Editorial Hero Container Banner */}
      <section className="relative bg-gray-50 border-b border-gray-100 py-24 px-6 md:px-12 text-center overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Premium Real Estate Portfolios
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight mt-6 mb-4 max-w-3xl mx-auto leading-none">
            Secure Luxury Real Estate Assets In Abuja
          </h1>
          <p className="text-md md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Explore verified high-yield residential estates and commercial assets across Maitama, Wuse, Asokoro, and Gwarinpa.
          </p>

          {/* 🔍 Premium Search Controller Module Component with 4-Grid Layout Optimization */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xl max-w-4xl mx-auto mt-12 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-left text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 px-1">Location District</label>
              <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="w-full bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-800 focus:outline-none">
                <option value="All">All Districts</option>
                <option value="Maitama">Maitama</option>
                <option value="Wuse 2">Wuse 2</option>
                <option value="Asokoro">Asokoro</option>
                <option value="Gwarinpa">Gwarinpa</option>
              </select>
            </div>
            
            <div>
              <label className="block text-left text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 px-1">Property Status</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-800 focus:outline-none">
                <option value="All">All Statuses</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
                <option value="land">Land Assets</option>
              </select>
            </div>

            <div>
              <label className="block text-left text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 px-1">Property Layout</label>
              <select value={filterLayout} onChange={(e) => setFilterLayout(e.target.value)} className="w-full bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-800 focus:outline-none">
                <option value="All">All Layouts</option>
                <option value="Duplex">Duplex</option>
                <option value="Apartment">Apartment</option>
                <option value="Bungalow">Bungalow</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              {/* 🚀 Safely passes location, transactional type, and layout configuration down the query string */}
              <Link href={`/properties?location=${filterLocation}&type=${filterType}&layout=${filterLayout}`} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition text-center flex items-center justify-center">
                Search Properties
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 🏢 Premium Featured Catalog Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-12 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Featured Listings</h2>
            <p className="text-xs text-gray-400 mt-0.5 font-semibold">Latest verified assets available across primary districts.</p>
          </div>
          <Link href="/properties" className="text-xs font-bold text-blue-600 hover:underline tracking-wide uppercase">View Full Catalog →</Link>
        </div>

        {initialProperties.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border border-dashed border-gray-100 rounded-xl bg-gray-50/50">No properties uploaded yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {initialProperties.slice(0, 3).map((item) => (
              <Link href={`/properties/${item._id}`} key={item._id} className="group border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white block">
                <div className="aspect-16/10 bg-gray-50 overflow-hidden relative">
                  <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80'} alt={item.title} className="w-full h-full object-cover group-hover:scale-102 transition duration-300" />
                  <span className="absolute bottom-3 left-3 bg-white/95 border border-gray-100 text-gray-900 text-[10px] font-black uppercase px-2.5 py-1 rounded shadow-sm">{item.status}</span>
                </div>
                <div className="p-5">
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block mb-1">📍 {item.location}</span>
                  <h3 className="text-md font-black text-gray-900 tracking-tight line-clamp-1 group-hover:text-blue-600 transition">{item.title}</h3>
                  <p className="text-base font-black text-gray-900 tracking-tight mt-3">₦{item.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 📰 Market Intelligence Section (Organic SEO Pipeline Node) */}
      <section className="bg-gray-50 border-y border-gray-100 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-12 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Market Intelligence & Guides</h2>
              <p className="text-xs text-gray-400 mt-0.5 font-semibold">Search-optimized insights on the local property market landscape.</p>
            </div>
            <Link href="/blogs" className="text-xs font-bold text-blue-600 hover:underline tracking-wide uppercase">Read All Articles →</Link>
          </div>

          {initialBlogs.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border border-dashed border-gray-100 rounded-xl bg-white">No market insights published yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {initialBlogs.slice(0, 3).map((post) => (
                <article key={post._id} className="flex flex-col space-y-2">
                  <Link href={`/blogs/${post.slug}`} className="aspect-16/10 rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm block relative hover:opacity-95 transition">
                    <img src={post.cover_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80'} alt={post.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 bg-gray-900 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider">{post.category}</span>
                  </Link>
                  <Link href={`/blogs/${post.slug}`} className="hover:text-blue-600 transition">
                    <h3 className="text-md font-black text-gray-900 tracking-tight leading-snug line-clamp-2 mt-1">{post.title}</h3>
                  </Link>
                  <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed font-medium">{post.meta_description}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 📩 Secure Direct Lead Intake Consultation Section Block Component */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-gray-900 text-white rounded-3xl p-8 md:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-3">
            <span className="text-[9px] font-black tracking-widest text-blue-400 uppercase bg-blue-950/50 border border-blue-900/50 px-2.5 py-1 rounded-full">Consultation Hub</span>
            <h2 className="text-3xl font-black tracking-tight leading-none text-white">Speak With An Abuja Asset Specialist</h2>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Submit your criteria. Inquiries flow directly onto our agent tracking desks for near-instant contact response.
            </p>
          </div>

          <div className="lg:col-span-7">
            {formStatus.success ? (
              <div className="bg-blue-950/40 border border-blue-900/60 p-6 rounded-2xl text-center">
                <span className="text-3xl block mb-2">🚀</span>
                <h4 className="text-sm font-black text-blue-400 uppercase tracking-wider">Inquiry Synchronized Successfully</h4>
                <p className="text-xs text-gray-300 mt-1 font-medium">An available agent has cached your parameters and will initiate client contact shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-3 text-gray-900">
                {formStatus.error && <div className="p-3 bg-red-950/50 border border-red-900 text-red-400 text-xs font-bold rounded-xl">{formStatus.error}</div>}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" placeholder="Your Name" value={leadName} onChange={(e) => setLeadName(e.target.value)} className="w-full bg-white border border-gray-800 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                  <input type="text" placeholder="Phone Number" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} className="w-full bg-white border border-gray-800 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                </div>
                <input type="email" placeholder="Email Address (Optional)" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} className="w-full bg-white border border-gray-800 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                <textarea placeholder="Specify preferred locations, property types, or targeted asset parameters..." rows={3} value={leadNotes} onChange={(e) => setLeadNotes(e.target.value)} className="w-full bg-white border border-gray-800 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900" />
                
                <button type="submit" disabled={formStatus.loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md">
                  {formStatus.loading ? 'Transmitting Consultation Data...' : 'Submit Inquiry Parameters'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}