'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import SkeletonCard from '../../components/ui/SkeletonCard';
import EmptyState from '../../components/ui/EmptyState';
interface Property {
  _id: string;
  title: string;
  location: string;
  price: string | number;
  description: string;
  images?: string[]; // Array of Cloudinary Image URLs
}

interface Lead {
  _id: string;
  message: string;
}

export default function PropertyManagement() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
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

  // 🔄 CONCURRENT PIPELINE RECOVERY HOOK
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propData, leadData] = await Promise.all([
          api.get('/api/properties'),
          api.get('/api/leads')
        ]);

        setProperties(propData);
        setLeads(leadData);
      } catch (err: any) {
        setError(err.message || 'Error pulling network assets.');
      } finally {
        setLoading(false);
      }
    };

    fetchData(); 
  }, [router]);

  // 🗑️ GLOBAL DELETE HANDLER
  const handleDelete = async (id: string) => {
    if (!confirm("Are you absolutely sure you want to permanently remove this property from the active portfolio?")) {
      return;
    }

    try {
      await api.delete(`/api/properties/${id}`);
      
      // Optimistically remove the deleted property from your UI state instantly
      setProperties(properties.filter(property => property._id !== id));
      alert("Asset removed successfully!");
    } catch (err: any) {
      console.error("Error deleting property:", err);
      alert(err.message || "Failed to delete the asset. Please try again.");
    }
  };

// Helper function to calculate how many times a property title is mentioned inside lead messages
  const getLeadCountForProperty = (propertyTitle: string) => {
    return leads.filter(lead => lead.message.toLowerCase().includes(propertyTitle.toLowerCase())).length;
  };

  if (error) return <div className="p-12 text-center text-red-500 font-medium">Error: {error}</div>;

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation Breadcrumbs & Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              <Link href="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
              <span>/</span>
              <span className="text-gray-600">Properties</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Property Catalog</h1>
            <p className="text-sm text-gray-500 mt-1">Manage active listings and track property-specific buyer demand maps.</p>
          </div>
          
          {/* Dual-Button Action Cluster */}
          <div className="flex flex-wrap gap-3 self-start">
            <Link 
              href="/dashboard"
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition shadow-sm flex items-center"
            >
              ← View Client Leads
            </Link>
            
            <Link 
              href="/dashboard/properties/add"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-sm transition flex items-center"
            >
              + Add New Property
            </Link>
          </div>
        </div>

        {/* Property Grid Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : properties.length === 0 ? (
            <EmptyState 
              title="No Properties Registered" 
              description="Your database collections are currently empty. Create a new listing to start tracking leads."
              actionHref="/dashboard/properties/add"
              actionLabel="+ Add First Property"
            />
          ) : (
            properties.map((property) => {
              const hotLeadsCount = getLeadCountForProperty(property.title);
              
              // 📸 Media Extraction Strategy: Fallback safely if images array is unpopulated
              const cardPreviewImage = property.images && property.images.length > 0 
                ? property.images[0] 
                : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
              
              return (
                <div key={property._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group">
                  
                  {/* Clickable Header Anchor Target to route to individual property item detail view */}
                  <Link href={`/properties/${property._id}`} className="block overflow-hidden relative cursor-pointer">
                    <div className="w-full h-48 overflow-hidden bg-gray-100 relative">
                      <img 
                        src={cardPreviewImage} 
                        alt={property.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md border border-blue-100 shadow-sm">
                          {property.location || 'Abuja, Nigeria'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 pb-2">
                      <h3 className="text-lg font-bold text-gray-900 tracking-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {property.title}
                      </h3>
                      <p className="text-gray-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                        {property.description || 'No custom descriptive summary attributes logged for this property item.'}
                      </p>
                    </div>
                  </Link>

                  {/* Operational Footer Details */}
                  <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex flex-col gap-4 mt-auto">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Listing Price</span>
                        <span className="font-black text-gray-900 text-sm">
                          {typeof property.price === 'number' ? `₦${property.price.toLocaleString()}` : property.price}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Active Inquiries</span>
                        <span className={`inline-block font-black text-xs px-2.5 py-0.5 rounded-full mt-0.5 ${
                          hotLeadsCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {hotLeadsCount} Leads 🔥
                        </span>
                      </div>
                    </div>

                    {/* ACTION ROW MODULE REVISED INTERACTION */}
                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                      <Link 
                        href={`/dashboard/properties/edit/${property._id}`}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[11px] font-extrabold uppercase tracking-wider rounded-md transition"
                      >
                        Edit Asset
                      </Link>
                      {userRole === 'admin' && (
                        <button 
                          onClick={() => handleDelete(property._id)}
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