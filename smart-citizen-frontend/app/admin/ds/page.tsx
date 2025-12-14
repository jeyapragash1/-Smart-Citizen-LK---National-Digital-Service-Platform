'use client';

import React, { useEffect, useState } from 'react';
import { Stamp, FileText, TrendingUp, Loader2 } from 'lucide-react';
import { getDSStats } from '@/lib/api';

export default function DSDashboard() {
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDSStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/> Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Divisional Secretariat Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Pending */}
        <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white rounded-xl p-6 shadow-lg">
            <Stamp className="w-8 h-8 mb-4 opacity-80" />
            <p className="text-sm opacity-80 mb-1">Pending Digital Signatures</p>
            <h2 className="text-4xl font-bold">{stats.pending}</h2>
            <button className="mt-4 w-full bg-white/20 hover:bg-white/30 py-2 rounded-lg text-sm font-medium transition">Sign Batch Now</button>
        </div>
        
        {/* Card 2: Approved/Issued */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">Certificates Issued</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-2">{stats.approved}</h2>
            </div>
            <div className="mt-4 flex items-center gap-2 text-green-600 text-sm font-medium">
                <FileText size={16} /> Total Completed
            </div>
        </div>

        {/* Card 3: Revenue */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
             <div>
                <p className="text-sm text-gray-500 font-medium">Estimated Revenue</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-2">LKR {stats.revenue.toLocaleString()}</h2>
            </div>
            <div className="mt-4 flex items-center gap-2 text-blue-600 text-sm font-medium">
                <TrendingUp size={16} /> Verified Payments
            </div>
        </div>
      </div>
    </div>
  );
}