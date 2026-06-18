'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import PublicNavbar from '../components/PublicNavbar';

interface Property {
  _id: string;
  title: string;
  location: string;
  price: number;
  type: string;
  status: string;
  description: string;
  images?: string[];
}

interface PageProps {
  searchParams: Promise<{ location?: string; type?: string; layout?: string }>;
}

export default function PublicPropertiesCatalog({ searchParams }: PageProps) {
  const resolvedParams = use(searchParams);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedLocation, setSelectedLocation] = useState(resolvedParams.location || 'All');
  const [selectedType, setSelectedType] = useState(resolvedParams.type || 'All');
  const [selectedLayout, setSelectedLayout] = useState(resolvedParams.layout || 'All'); // 🚀 New layout state node

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
        const res = await fetch(`${apiUrl}/api/properties`);
        if (!res.ok) throw new Error('Could not pull listings from database cluster.');
        
        const data = await res.json();
        // 🚀 Ensure compatibility with unified paginated API format
        setProperties(data.data || data);
        
        // Run deep structural optimization pass
        applyInitialFilters(data, resolvedParams.location || 'All', resolvedParams.type || 'All', resolvedParams.layout || 'All');
      } catch (err: any) {
        setError(err.message || 'Network synchronization failure.');
      } bits: { setLoading(false); }
    };
    fetchProperties();
  }, [resolvedParams.location, resolvedParams.type, resolvedParams.layout]);

  const applyInitialFilters = (rawList: Property[], loc: string, statusType: string, layoutStructure: string) => {
    let temp = [...rawList];

    if (loc !== 'All') {
      temp = temp.filter(p => p.location.toLowerCase().trim().includes(loc.toLowerCase().trim()));
    }
    if (statusType !== 'All') {
      temp = temp.filter(p => p.type.toLowerCase().trim().includes(statusType.toLowerCase().trim()));
    }
    if (layoutStructure !== 'All') {
      // 🚀 INTELLIGENT DEEP SCAN: Checks if title or description contains layout words like "Duplex"
      temp = temp.filter(p => 
        p.title.toLowerCase().includes(layoutStructure.toLowerCase()) || 
        p.description.toLowerCase().includes(layoutStructure.toLowerCase())
      );
    }
    setFilteredProperties(temp);
  };

  const handleLiveFilterChange = (loc: string, statusType: string, layoutStructure: string) => {
    applyInitialFilters(properties, loc, statusType, layoutStructure);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm font-bold text-gray-400 animate-pulse tracking-widest uppercase">Streaming Real Estate Portfolio...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-900 pb-16">
      <PublicNavbar />
      <section className="bg-gray-50 border-b border-gray-100 py-12 px-6 text-center">
        <h1 className="text-3xl font-black tracking-tight text-gray-900">Verified Abuja Portfolios</h1>
        <p className="text-xs text-gray-400 font-semibold mt-1">Premium residential and commercial assets under active brokerage.</p>
      </section>

      {/* 🔍 Upgraded 3-Dropdown Filtering Toolbar UI */}
      <section className="max-w-6xl mx-auto px-6 my-8">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <select 
              value={selectedLocation} 
              onChange={(e) => { setSelectedLocation(e.target.value); handleLiveFilterChange(e.target.value, selectedType, selectedLayout); }} 
              className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs font-bold text-gray-800 focus:outline-none"
            >
              <option value="All">All Districts</option>
              <option value="Maitama">Maitama</option>
              <option value="Wuse 2">Wuse 2</option>
              <option value="Asokoro">Asokoro</option>
              <option value="Gwarinpa">Gwarinpa</option>
            </select>

            <select 
              value={selectedType} 
              onChange={(e) => { setSelectedType(e.target.value); handleLiveFilterChange(selectedLocation, e.target.value, selectedLayout); }} 
              className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs font-bold text-gray-800 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
              <option value="land">Land Assets</option>
            </select>

            <select 
              value={selectedLayout} 
              onChange={(e) => { setSelectedLayout(e.target.value); handleLiveFilterChange(selectedLocation, selectedType, e.target.value); }} 
              className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs font-bold text-gray-800 focus:outline-none"
            >
              <option value="All">All Layouts</option>
              <option value="Duplex">Duplex</option>
              <option value="Apartment">Apartment</option>
              <option value="Bungalow">Bungalow</option>
            </select>
          </div>
          <span className="text-xs font-bold text-gray-400">
            Found {filteredProperties.length} Matching Asset{filteredProperties.length !== 1 ? 's' : ''}
          </span>
        </div>
      </section>

      {/* Grid Display Container */}
      <section className="max-w-6xl mx-auto px-6">
        {filteredProperties.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-medium border border-dashed border-gray-100 rounded-xl bg-gray-50/50">
            No matching properties found in this specific search profile.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((item) => (
              <Link href={`/properties/${item._id}`} key={item._id} className="group border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white block">
                <div className="aspect-16/10 bg-gray-50 overflow-hidden relative border-b border-gray-50">
                  <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80'} alt={item.title} className="w-full h-full object-cover group-hover:scale-102 transition duration-300" />
                  <span className="absolute bottom-3 left-3 bg-white/95 border border-gray-100 text-gray-900 text-[9px] font-black uppercase px-2.5 py-1 rounded shadow-sm">{item.status}</span>
                </div>
                <div className="p-5">
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block mb-1">📍 {item.location} • For {item.type}</span>
                  <h3 className="text-md font-black text-gray-900 tracking-tight line-clamp-1 group-hover:text-blue-600 transition">{item.title}</h3>
                  <p className="text-base font-black text-gray-900 tracking-tight mt-3">₦{item.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}