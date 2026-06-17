'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';

interface AnalyticsData {
  totalProperties: number;
  totalLeads: number;
  conversionRate: number;
  districtDemand: { name: string; percentage: number }[];
}

export default function AgentAnalyticsPanel() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const summary = await api.get('/api/analytics/summary');
        setData(summary);
      } catch (err) {
        console.error('Failed to stream analytic datasets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-8 animate-pulse text-center">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Compiling Asset Metrics...</span>
      </div>
    );
  }

  // Fallback structural numbers if backend data is initializing
  const stats = data || { totalProperties: 0, totalLeads: 0, conversionRate: 0, districtDemand: [] };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
      
      {/* 📊 CORE KPI METRIC CARDS (Left Side - 7 Columns) */}
      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Listed Portfolio Assets */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Active Portfolio</span>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight mt-2">{stats.totalProperties}</h3>
          </div>
          <p className="text-[10px] font-bold text-green-600 mt-4">🏢 Assets Under Active Brokerage</p>
        </div>

        {/* Total Captured Client Leads */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Acquisition Enquiries</span>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight mt-2">{stats.totalLeads}</h3>
          </div>
          <p className="text-[10px] font-bold text-blue-600 mt-4">📩 Live Lead Consultation Intakes</p>
        </div>

        {/* Lead Interaction Conversion Velocity Rate */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Conversion Yield Velocity</span>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight mt-2">{stats.conversionRate}%</h3>
          </div>
          <p className="text-[10px] font-bold text-purple-600 mt-4">⚡ High-Intent Engagement Speed</p>
        </div>

      </div>

      {/* 📈 REAL-TIME DISTRICT DEMAND TRACKER (Right Side - 5 Columns) */}
      <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-4">
          District Intent Tracking Metrics
        </span>
        
        <div className="space-y-3">
          {stats.districtDemand.map((district) => (
            <div key={district.name} className="space-y-1">
              <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                <span>📍 {district.name}</span>
                <span className="text-gray-400">{district.percentage}%</span>
              </div>
              
              {/* Pure CSS/Tailwind Animated Bar Component */}
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${district.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}