'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, CheckCircle, AlertCircle, ShoppingBag, ArrowRight, Sparkles, FileText, Loader2 } from 'lucide-react';
import { getSmartRecommendations, getMyApplications, getUserProfile } from '@/lib/api'; // Added getUserProfile

export default function Dashboard() {
  // State for all Real Data
  const [user, setUser] = useState({ fullname: 'Citizen' });
  const [stats, setStats] = useState({ pending: 0, completed: 0, total: 0 });
  const [recentApps, setRecentApps] = useState<any[]>([]); // Store recent list
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        // 1. Fetch User Profile (For Name)
        const profileData = await getUserProfile();
        setUser(profileData);

        // 2. Fetch Applications (For Stats & Recent List)
        const apps = await getMyApplications();
        
        // Calculate Stats
        const pending = apps.filter((a: any) => a.status === 'Pending').length;
        const completed = apps.filter((a: any) => a.status === 'Completed').length;
        setStats({ pending, completed, total: apps.length });

        // Get Top 3 Recent Apps (Reverse to show newest first)
        setRecentApps(apps.reverse().slice(0, 3));

        // 3. Fetch AI Recommendations (For Products)
        const recData = await getSmartRecommendations();
        setRecommendations(recData.products);
        setTriggers(recData.triggers);

      } catch (error) {
        console.error("Dashboard Load Error", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="animate-spin w-10 h-10 mb-4 text-blue-600" />
        <p>Loading your digital profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* 1. Welcome Banner (Real Name + Real Pending Count) */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Ayubowan, {user.fullname.split(' ')[0]}! 👋</h1>
            <p className="text-blue-100 mb-6 max-w-xl">
                Welcome to your digital citizen portal. You have <span className="font-bold text-white">{stats.pending} pending actions</span> requiring attention.
            </p>
            <div className="flex gap-3">
                <Link href="/services"> {/* ✅ CORRECT: Go to list of services */}
                <button className="bg-white text-blue-900 px-5 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition">
                    Apply New Service
                </button>
            </Link>
                <Link href="/dashboard/wallet">
                    <button className="bg-blue-800 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-blue-900 transition border border-blue-600">
                        View Wallet
                    </button>
                </Link>
            </div>
        </div>
      </div>

      {/* 2. Stats Grid (Real Database Counts) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Clock size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">Verified Documents</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">Pending Actions</p>
                <p className="text-3xl font-bold text-orange-500 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><AlertCircle size={24} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. Recent Apps List (Real Data from DB) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Recent Activity</h3>
                <Link href="/dashboard/applications" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View All
                </Link>
            </div>
            <div className="p-0">
                {recentApps.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <FileText size={32} className="mx-auto mb-2 opacity-50"/>
                        <p>No recent applications found.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {recentApps.map((app) => (
                                <tr key={app._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <FileText size={16}/>
                                        </div>
                                        {app.service_type}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(app.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            app.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                            app.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {app.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>

        {/* 4. SMART SUGGESTIONS (Real AI Data from DB) */}
        <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl border border-blue-100 shadow-sm p-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <Sparkles size={12}/> SMART AI
                </span>
                <span className="text-xs text-gray-500 ml-auto">
                    Event: <strong>{triggers.length > 0 ? triggers.join(", ") : "None"}</strong>
                </span>
            </div>
            
            <h3 className="font-bold text-gray-900 text-lg mb-2">Recommended for You</h3>
            
            {recommendations.length > 0 ? (
                <div className="space-y-3 flex-1">
                    {recommendations.slice(0, 3).map((prod) => (
                        <div key={prod._id} className="flex gap-4 items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                            <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                                {prod.image?.startsWith('http') ? <img src={prod.image} className="w-full h-full object-cover"/> : "🛍️"}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm line-clamp-1">{prod.name}</p>
                                <p className="text-xs text-blue-600 font-bold">Rs. {prod.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-center text-center text-gray-500 text-sm">
                    <p className="mb-4">Complete a government service (like Birth Registration) to unlock exclusive citizen offers!</p>
                </div>
            )}

            <Link href="/marketplace">
                <button className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition">
                    <ShoppingBag size={16} /> Visit Marketplace
                </button>
            </Link>
        </div>

      </div>
    </div>
  );
}