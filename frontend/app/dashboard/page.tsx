'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import AgentAnalyticsPanel from './components/AgentAnalyticsPanel';

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'new' | 'contacted' | 'converted' | 'closed';
  createdAt: string;
}

export default function AgentDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/login');
          return;
        }

        const data = await api.get('/api/leads');
        setLeads(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [router]);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const data = await api.patch(`/api/leads/${leadId}`, { status: newStatus });
      setLeads(prevLeads =>
        prevLeads.map(lead => (lead._id === leadId ? { ...lead, status: newStatus as any } : lead))
      );
    } catch (err) {
      console.error('Error modifying lead status context:', err);
    }
  };

  // 🎯 Helper Function: Extracts text wrapped in double quotes from the message string
  const extractPropertyName = (message: string) => {
    const match = message.match(/"([^"]+)"/);
    return match ? match[1] : 'General Property Inquiry';
  };

  if (loading) return <div className="p-12 text-center font-medium text-gray-500">Loading pipeline parameters...</div>;
  if (error) return <div className="p-12 text-center text-red-500 font-medium">Error: {error}</div>;

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Elements */}
       {/* 🚀 Upgraded Command Center Navigation Header */}
<div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-6">
  <div>
    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Agent Command Center</h1>
    <p className="text-sm text-gray-500 mt-1">Welcome back! Monitor incoming client leads, manage listings, and track real-time marketplace demand.</p>
  </div>
  
  {/* Global Action Shortcut Buttons */}
 {/* 🏢 Updated Header Button Cluster */}
<div className="flex flex-wrap gap-3 self-start md:self-center">
  <Link 
    href="/dashboard/properties"
    className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition shadow-sm flex items-center gap-2"
  >
    🏢 Open Property Catalog
  </Link>
  
  <Link 
    href="/dashboard/blogs/add"
    className="px-4 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition shadow-sm flex items-center gap-2"
  >
    ✍️ Compose Blog Post
  </Link>
  
  <Link 
    href="/dashboard/properties/add"
    className="px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition shadow-sm flex items-center gap-1"
  >
    + Add New Property
  </Link>
</div>
</div>
{/* 🚀 GRAPHIC METRIC CORE OVERVIEW LAYER */}
      <AgentAnalyticsPanel />

        {/* Live Metrics Grid Panels */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Leads</span>
            <div className="text-2xl font-black text-gray-900 mt-1">{leads.length}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-500">New Requests</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{leads.filter(l => l.status === 'new').length}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">In Contact</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{leads.filter(l => l.status === 'contacted').length}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-green-500">Converted</span>
            <div className="text-2xl font-black text-green-600 mt-1">{leads.filter(l => l.status === 'converted').length}</div>
          </div>
        </div>

        {/* Core Lead Control Grid Data Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <th className="p-4">Client Contact</th>
                  <th className="p-4">Target Property</th>
                  <th className="p-4">Full Message / Notes</th>
                  <th className="p-4">Date Logged</th>
                  <th className="p-4">Pipeline Status</th>
                  <th className="p-4 text-right">Quick Engagement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">No client leads logged in system storage.</td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Name & Contact Info */}
                      <td className="p-4 align-top">
                        <div className="font-bold text-gray-900">{lead.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{lead.email}</div>
                        <div className="text-xs text-gray-600 font-medium mt-1">{lead.phone}</div>
                      </td>
                      
                    
                      {/* 🚀 New Extracted Target Property Name Column */}
<td className="p-4 align-top font-semibold text-gray-800 max-w-48">
  <span className="inline-block bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-200">
    {extractPropertyName(lead.message)}
  </span>
</td>

                      {/* Message Content */}
                      <td className="p-4 max-w-xs align-top">
                        <p className="text-gray-600 line-clamp-3 leading-relaxed">{lead.message}</p>
                      </td>
                      
                      {/* Date Block */}
                      <td className="p-4 text-gray-500 text-xs whitespace-nowrap align-top">
                        {new Date(lead.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                      
                      {/* Interactive Status Selector Dropdown */}
                      <td className="p-4 whitespace-nowrap align-top">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border-0 ring-1 cursor-pointer focus:outline-none focus:ring-2 transition-all ${
                            lead.status === 'new' ? 'bg-blue-50 text-blue-700 ring-blue-100 focus:ring-blue-500' :
                            lead.status === 'contacted' ? 'bg-amber-50 text-amber-700 ring-amber-100 focus:ring-amber-500' :
                            lead.status === 'converted' ? 'bg-green-50 text-green-700 ring-green-100 focus:ring-green-500' :
                            'bg-gray-100 text-gray-700 ring-gray-200 focus:ring-gray-500'
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="converted">Converted</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>

                      {/* Immediate Follow-Up Comms Buttons */}
                      <td className="p-4 text-right whitespace-nowrap align-top">
                        <div className="flex justify-end gap-2">
                          <a 
                            href={`https://wa.me/${lead.phone.replace(/\+/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-3 py-1.5 bg-green-500 text-white font-bold text-xs rounded-lg hover:bg-green-600 shadow-sm transition"
                          >
                            WhatsApp
                          </a>
                          <a 
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center justify-center px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 shadow-sm transition"
                          >
                            Call
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}