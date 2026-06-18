'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import PublicNavbar from './components/PublicNavbar';

interface Property {
  _id: string;
  title: string;
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  images: string[];
  category?: string;
  purpose: 'sale' | 'rent' | 'short-let';
  propertyType: string;
  status: 'Available' | 'Sold' | 'Pending';
  isFeatured?: boolean;
}

function LuxuryLandingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [properties, setProperties] = useState<Property[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  
  // Filtering States (Hydrated from URL)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedDistrict, setSelectedDistrict] = useState(searchParams.get('district') || '');
  const [selectedPurpose, setSelectedPurpose] = useState(searchParams.get('purpose') || '');
  const [selectedPropertyType, setSelectedPropertyType] = useState(searchParams.get('propertyType') || '');
  const [selectedBedrooms, setSelectedBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  // Pagination & Mobile States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Dropdown States
  const [districts, setDistricts] = useState<string[]>([]);
  const [purposes, setPurposes] = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);

  // 1. Fetch Dropdown Options on Mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
        const [distRes, purpRes, propTypeRes] = await Promise.all([
          fetch(`${apiUrl}/api/properties/filters/districts`),
          fetch(`${apiUrl}/api/properties/filters/purposes`),
          fetch(`${apiUrl}/api/properties/filters/propertyTypes`)
        ]);
        if (distRes.ok) setDistricts(await distRes.json());
        if (purpRes.ok) setPurposes(await purpRes.json());
        if (propTypeRes.ok) setPropertyTypes(await propTypeRes.json());
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    fetchFilters();
  }, []);

  // 2. Fetch Featured Showcase (Independent of Filters)
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoadingFeatured(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
        // Mock a query that requests featured only, or just fetch and filter. Since we didn't add isFeatured filter to backend explicitly, we fetch all and filter, or we rely on the DB. Wait, let's just fetch all and take the top 3 featured.
        // Or better yet, we just render them out of properties if there's no backend route. But wait, if filters are active, featured might not match.
        // Let's do a separate fetch with limit 30 and filter it. (For production, add an isFeatured backend query).
        const res = await fetch(`${apiUrl}/api/properties?limit=50`);
        if (res.ok) {
          const result = await res.json();
          setFeaturedProperties((result.data || []).filter((p: Property) => p.isFeatured).slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching featured:', err);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedDistrict, selectedPurpose, selectedPropertyType, selectedBedrooms, minPrice, maxPrice, sort]);

  // 3. Main Data Sync & Fetch
  useEffect(() => {
    let isCancelled = false;

    const fetchCatalog = async () => {
      try {
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
        const url = new URL(`${apiUrl}/api/properties`);
        if (searchQuery) url.searchParams.append('search', searchQuery);
        if (selectedDistrict) url.searchParams.append('district', selectedDistrict);
        if (selectedPurpose) url.searchParams.append('purpose', selectedPurpose);
        if (selectedPropertyType) url.searchParams.append('propertyType', selectedPropertyType);
        if (selectedBedrooms) url.searchParams.append('bedrooms', selectedBedrooms);
        if (minPrice) url.searchParams.append('minPrice', minPrice);
        if (maxPrice) url.searchParams.append('maxPrice', maxPrice);
        if (sort && sort !== 'newest') url.searchParams.append('sort', sort);
        
        url.searchParams.append('page', page.toString());
        url.searchParams.append('limit', '6');
        
        const res = await fetch(url.toString(), { cache: 'no-store' });
        if (res.ok && !isCancelled) {
          const result = await res.json();
          const newProperties = result.data || [];
          
          if (page === 1) {
            setProperties(newProperties);
          } else {
            setProperties(prev => {
              const existingIds = new Set(prev.map(p => p._id));
              const uniqueNew = newProperties.filter((p: Property) => !existingIds.has(p._id));
              return [...prev, ...uniqueNew];
            });
          }
          
          setHasMore(result.page < result.totalPages);
        }
      } catch (err) {
        console.error('Error streaming public portfolio:', err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    const syncToURL = () => {
      const params = new URLSearchParams(searchParams.toString());
      searchQuery ? params.set('search', searchQuery) : params.delete('search');
      selectedDistrict ? params.set('district', selectedDistrict) : params.delete('district');
      selectedPurpose ? params.set('purpose', selectedPurpose) : params.delete('purpose');
      selectedPropertyType ? params.set('propertyType', selectedPropertyType) : params.delete('propertyType');
      selectedBedrooms ? params.set('bedrooms', selectedBedrooms) : params.delete('bedrooms');
      minPrice ? params.set('minPrice', minPrice) : params.delete('minPrice');
      maxPrice ? params.set('maxPrice', maxPrice) : params.delete('maxPrice');
      sort && sort !== 'newest' ? params.set('sort', sort) : params.delete('sort');
      
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const delayDebounceFn = setTimeout(() => {
      syncToURL();
      fetchCatalog();
    }, 500);

    return () => {
      clearTimeout(delayDebounceFn);
      isCancelled = true;
    };
  }, [searchQuery, selectedDistrict, selectedPurpose, selectedPropertyType, selectedBedrooms, minPrice, maxPrice, sort, page]);

  // Infinite Scroll Observer
  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setPage(prev => prev + 1);
    }, { threshold: 0.1 });
    const trigger = document.getElementById('infinite-scroll-trigger');
    if (trigger) observer.observe(trigger);
    return () => { if (trigger) observer.unobserve(trigger); };
  }, [loading, loadingMore, hasMore]);

  // Reusable Filter UI
  // Note: Defined as a JSX variable (not a React component function) to prevent React from unmounting it on every re-render and losing focus!
  const filterControlsUI = (
    <div className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">Keyword Search</label>
        <input 
          type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="e.g., Duplex, Pool..."
          className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:bg-white dark:focus:bg-neutral-950 transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">District</label>
          <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="w-full px-3 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all">
            <option value="">All Regions</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Purpose</label>
          <select value={selectedPurpose} onChange={(e) => setSelectedPurpose(e.target.value)} className="w-full px-3 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all">
            <option value="">All Purposes</option>
            {purposes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Property Type</label>
          <select value={selectedPropertyType} onChange={(e) => setSelectedPropertyType(e.target.value)} className="w-full px-3 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all">
            <option value="">All Types</option>
            {propertyTypes.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Bedrooms</label>
          <select value={selectedBedrooms} onChange={(e) => setSelectedBedrooms(e.target.value)} className="w-full px-3 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all">
            <option value="">Any</option>
            <option value="1">1+ Beds</option>
            <option value="2">2+ Beds</option>
            <option value="3">3+ Beds</option>
            <option value="4">4+ Beds</option>
            <option value="5">5+ Beds</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Min Price (₦)</label>
          <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" className="w-full px-3 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Max Price (₦)</label>
          <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="No Limit" className="w-full px-3 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all" />
        </div>
      </div>
      
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Sort Results</label>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full px-3 py-3 bg-white dark:bg-neutral-950 border border-gray-300 dark:border-neutral-700 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold shadow-sm transition-all text-blue-600 dark:text-blue-400">
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );

  const PropertyCard = ({ property }: { property: Property }) => (
    <article className="group bg-white dark:bg-neutral-950 rounded-2xl overflow-hidden border border-gray-100 dark:border-neutral-900 shadow-sm hover:shadow-xl dark:hover:shadow-none hover:border-gray-200/60 dark:hover:border-neutral-800 transition-all flex flex-col justify-between">
      <div>
        <div className="aspect-4/3 bg-gray-50 dark:bg-neutral-900 relative overflow-hidden">
          {property.images?.length > 0 ? (
            <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-neutral-700 text-xs font-bold">🖼️ Image Pending</div>
          )}
          <span className="absolute top-4 left-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md text-gray-900 dark:text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 dark:border-neutral-800">
            📍 {property.location.split(',')[0]}
          </span>
          {property.isFeatured && (
            <span className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-md">
              ★ Featured
            </span>
          )}
        </div>
        <div className="p-6">
          <h4 className="text-lg font-black text-gray-900 dark:text-white tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
            {property.title}
          </h4>
          <div className="flex items-center gap-4 text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mt-4 pt-4 border-t border-gray-50 dark:border-neutral-900/60">
            {property.propertyType !== 'land' ? (
              <>
                <span className="flex items-center gap-1.5">🛏️ {property.bedrooms || 'N/A'} Beds</span>
                <span className="flex items-center gap-1.5">🚿 {property.bathrooms || 'N/A'} Baths</span>
              </>
            ) : (
              <span className="flex items-center gap-1.5">📏 {property.size || 'N/A'} SQM</span>
            )}
          </div>
        </div>
      </div>
      <div className="p-6 pt-2 flex items-center justify-between gap-2">
        <div>
          <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">Valuation Range</span>
          <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">₦{property.price.toLocaleString()}</span>
        </div>
        <a href={`https://wa.me/2349089876765?text=Hello%20Broker!%20I%20am%20interested%20in%20your%20property:%20"${encodeURIComponent(property.title)}".`} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 bg-gray-50 dark:bg-neutral-900 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black border border-gray-100 dark:border-neutral-800 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all">
          Acquire
        </a>
      </div>
    </article>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-300">
      <PublicNavbar />

      {/* 🎭 HERO SECTION */}
      <section className="relative pt-20 pb-20 px-6 md:px-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
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

        {/* 🔍 DESKTOP FILTER CARD */}
        <div className="hidden lg:block lg:col-span-5 bg-white dark:bg-neutral-950 border border-gray-100 dark:border-neutral-900 rounded-2xl p-6 md:p-8 shadow-xl shadow-gray-100/50 dark:shadow-none">
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4">Portfolio Selection</h3>
          {filterControlsUI}
        </div>
      </section>

      {/* 📱 MOBILE FILTER DRAWER BUTTON */}
      <div className="lg:hidden sticky top-20 z-40 px-6 mb-6">
        <button 
          onClick={() => setIsMobileDrawerOpen(true)}
          className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
        >
          <span>🔍</span> Refine Portfolio Search
        </button>
      </div>

      {/* 📱 MOBILE DRAWER UI */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileDrawerOpen(false)} />
          <div className="relative w-4/5 max-w-md bg-white dark:bg-neutral-950 h-full shadow-2xl p-6 overflow-y-auto transform transition-transform duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black uppercase tracking-wider">Filters</h3>
              <button onClick={() => setIsMobileDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-neutral-900 rounded-full font-bold">✕</button>
            </div>
            {filterControlsUI}
            <button onClick={() => setIsMobileDrawerOpen(false)} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-8 shadow-lg">
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* ⭐ SECTION 1: FEATURED SHOWCASE */}
      {!loadingFeatured && featuredProperties.length > 0 && page === 1 && !searchQuery && !selectedDistrict && !selectedPurpose && !selectedPropertyType && !selectedBedrooms && !minPrice && !maxPrice && sort === 'newest' && (
        <section className="bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/10 dark:to-[#0E0E0E] py-16 px-6 md:px-16 border-y border-gray-100 dark:border-neutral-900">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10 text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 block mb-1">Premium Collection</span>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Featured Masterpieces</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProperties.map(p => <PropertyCard key={p._id} property={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* 🏢 SECTION 2: LATEST / FILTERED MATRIX */}
      <section id="portfolio" className="bg-white dark:bg-[#0E0E0E] py-24 px-6 md:px-16 transition-colors duration-300 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-16">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-neutral-500 block mb-1">Market Inventory</span>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Search Results</h2>
            </div>
            <p className="text-xs text-gray-400 dark:text-neutral-400 font-bold uppercase tracking-wider bg-gray-50 dark:bg-neutral-900 px-4 py-2 rounded-lg border border-gray-100 dark:border-neutral-800">
              Showing {properties.length} Matches
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div key={n} className="space-y-4">
                  <div className="bg-gray-100 dark:bg-neutral-900 aspect-4/3 rounded-2xl" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-100 dark:border-neutral-800 rounded-2xl bg-gray-50/50">
              <span className="text-3xl block mb-2">📥</span>
              <p className="text-sm font-bold text-gray-700 dark:text-neutral-300">No Assets Match Your Exact Criteria</p>
              <p className="text-xs text-gray-400 mt-1">Try resetting your advanced filters or expanding your price range.</p>
              <button 
                onClick={() => {
                  setSearchQuery(''); setSelectedDistrict(''); setSelectedPurpose(''); setSelectedPropertyType('');
                  setSelectedBedrooms(''); setMinPrice(''); setMaxPrice(''); setSort('newest');
                }}
                className="mt-6 px-6 py-2.5 bg-black text-white text-xs font-bold rounded-xl"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map(p => <PropertyCard key={p._id} property={p} />)}
            </div>
          )}

          {hasMore && !loading && (
            <div id="infinite-scroll-trigger" className="h-24 flex items-center justify-center mt-12">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
            </div>
          )}
        </div>
      </section>

      <footer className="bg-black text-white py-12 px-6 md:px-16 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <span className="text-base font-black tracking-tighter text-white">Cortex <span className="text-blue-500 font-serif">RealtyEngine</span></span>
            <p className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase mt-1">© 2026 Sovereign Portfolio Brokerage.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LuxuryLandingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0A0A]">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    }>
      <LuxuryLandingPageContent />
    </Suspense>
  );
}