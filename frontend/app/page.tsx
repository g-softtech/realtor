'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PublicNavbar from './components/PublicNavbar';

// interface Property {
//   _id: string;
//   title: string;
//   price: number;
//   location: string;
//   beds: number;
//   baths: number;
//   cover_image?: string;
//   category?: string;
// }
interface Property {
  _id: string;
  title: string;
  price: number;
  location: string;
  beds: number; // Keep this (it will default safely or map to your custom fields)
  baths: number; // Keep this
  images: string[]; // 🚀 CHANGED: Now correctly recognizes your backend array of Cloudinary URLs!
  category?: string;
  type: 'rent' | 'sale' | 'land';
  status: 'Available' | 'Sold' | 'Pending';
}

export default function LuxuryLandingPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
        const url = new URL(`${apiUrl}/api/properties`);
        if (searchQuery) {
          url.searchParams.append('search', searchQuery);
        }
        const res = await fetch(url.toString(), { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setProperties(data);
        }
      } catch (err) {
        console.error('Error streaming public portfolio:', err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchCatalog();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const filteredProperties = properties.filter(item => {
    const matchesDistrict = selectedDistrict ? item.location.toLowerCase().includes(selectedDistrict.toLowerCase()) : true;
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    return matchesDistrict && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-300">
      
      {/* 🧭 NAVIGATION HEADER */}
      <PublicNavbar />

      {/* 🎭 HERO SECTION */}
      <section className="relative pt-20 pb-32 px-6 md:px-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-full">
            Prime Real Estate Ecosystem
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.05]">
            Architectural <br />Masterpieces in <span className="font-serif italic font-medium text-gray-800 dark:text-neutral-300">Abuja</span>
          </h1>
          <p className="text-gray-500 dark:text-neutral-400 text-sm md:text-base max-w-lg font-medium leading-relaxed">
            Discover unprecedented architectural integration, highly verified premier listings, and real-time market intent intelligence transacting across the Capital's luxury sectors.
          </p>
        </div>

        {/* 🔍 FILTER CONTROL CARD */}
        <div className="lg:col-span-5 bg-white dark:bg-neutral-950 border border-gray-100 dark:border-neutral-900 rounded-2xl p-6 md:p-8 shadow-xl shadow-gray-100/50 dark:shadow-none space-y-5">
          <div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Portfolio Selection</h3>
            <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5 font-medium">Filter verified residential assets instantly.</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">Keyword Search</label>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., Duplex, Penthouse, Pool..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:bg-white dark:focus:bg-neutral-950 text-gray-900 dark:text-white font-medium transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">Target District</label>
                <select 
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:bg-white dark:focus:bg-neutral-950 text-gray-800 dark:text-neutral-200 font-bold transition-all"
                >
                  <option value="">All Regions</option>
                  <option value="Maitama">Maitama</option>
                  <option value="Wuse">Wuse 2</option>
                  <option value="Asokoro">Asokoro</option>
                  <option value="Gwarinpa">Gwarinpa</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">Asset Tier</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:bg-white dark:focus:bg-neutral-950 text-gray-800 dark:text-neutral-200 font-bold transition-all"
                >
                  <option value="">All Categories</option>
                  <option value="Real Estate Investment">Investment Tier</option>
                  <option value="Abuja Housing Market">Standard Residential</option>
                  <option value="Buying Guides">Buying Guides</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🏢 GRID MATRIX */}
      <section id="portfolio" className="bg-white dark:bg-[#0E0E0E] border-t border-gray-100 dark:border-neutral-900 py-24 px-6 md:px-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-16">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-neutral-500 block mb-1">Curated Portfolio</span>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Available Brokerage Assets</h2>
            </div>
            <p className="text-xs text-gray-400 dark:text-neutral-400 font-bold uppercase tracking-wider bg-gray-50 dark:bg-neutral-900 px-4 py-2 rounded-lg border border-gray-100 dark:border-neutral-800">
              Showing {filteredProperties.length} Matching Results
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div key={n} className="space-y-4">
                  <div className="bg-gray-100 dark:bg-neutral-900 aspect-4/3 rounded-2xl" />
                  <div className="h-4 bg-gray-100 dark:bg-neutral-900 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 dark:bg-neutral-900 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-100 dark:border-neutral-800 rounded-2xl bg-gray-50/50 dark:bg-neutral-950/50">
              <span className="text-3xl block mb-2">📥</span>
              <p className="text-sm font-bold text-gray-700 dark:text-neutral-300">No Premium Assets Match Your Criteria</p>
              <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">Try broadening your selected location filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property) => (
                <article key={property._id} className="group bg-white dark:bg-neutral-950 rounded-2xl overflow-hidden border border-gray-100 dark:border-neutral-900 shadow-sm hover:shadow-xl dark:hover:shadow-none hover:border-gray-200/60 dark:hover:border-neutral-800 transition-all flex flex-col justify-between">
                  <div>
                    <div className="aspect-4/3 bg-gray-50 dark:bg-neutral-900 relative overflow-hidden">
                      {property.images ? (
                        <img 
                          src={property.images[0]} 
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-neutral-700 text-xs font-bold bg-gray-50 dark:bg-neutral-900">🖼️ Image Pending</div>
                      )}
                      <span className="absolute top-4 left-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md text-gray-900 dark:text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm border dark:border-neutral-800">
                        📍 {property.location.split(',')[0]}
                      </span>
                    </div>

                    <div className="p-6">
                      <h4 className="text-lg font-black text-gray-900 dark:text-white tracking-tight leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {property.title}
                      </h4>
                      
                      <div className="flex items-center gap-4 text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mt-4 pt-4 border-t border-gray-50 dark:border-neutral-900/60">
                        <span className="flex items-center gap-1.5">🛏️ {property.beds} Beds</span>
                        <span className="flex items-center gap-1.5">🚿 {property.baths} Baths</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-2 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 dark:text-neutral-500 block">Valuation Range</span>
                      <span className="text-xl font-black tracking-tight text-gray-900 dark:white">
                        ₦{property.price.toLocaleString()}
                      </span>
                    </div>
                    
                    <a 
                      href={`https://wa.me/2349089876765?text=Hello%20Broker!%20I%20am%20highly%20interested%20in%20arranging%20a%20private%20portfolio%20briefing%20regarding%20your%20listed%20asset:%20"${encodeURIComponent(property.title)}"%20located%20in%20${encodeURIComponent(property.location)}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-gray-50 dark:bg-neutral-900 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black border border-gray-100 dark:border-neutral-800 text-gray-800 dark:text-neutral-200 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all"
                    >
                      Acquire Asset
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* 🖤 FOOTER */}
      <footer className="bg-black text-white py-12 px-6 md:px-16 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <span className="text-base font-black tracking-tighter text-white">REALTOR<span className="text-blue-500 font-serif">.</span></span>
            <p className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase mt-1">© 2026 Sovereign Portfolio Brokerage. All rights reserved.</p>
          </div>
          
          <div className="flex items-center gap-2 border border-neutral-800 bg-neutral-950 px-4 py-2 rounded-xl shadow-inner">
            <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              Designed by <span className="text-white font-black cursor-default">Cortex Systems</span>
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}