'use client';

import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Server, 
  Users, 
  ShieldAlert, 
  Database, 
  DollarSign,
  Map,
  ArrowUp,
  Loader2
} from 'lucide-react';
import { getSystemStats } from '@/lib/api'; // Import the API helper

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Real Data from Backend
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getSystemStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load admin stats", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="animate-spin w-10 h-10 mb-4 text-blue-900" />
        <p>Connecting to Government Cloud...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* 1. Header & Live Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">National System Monitor</h1>
            <p className="text-sm text-gray-500">Lanka Government Cloud (LGC) • Zone: Colombo-1</p>
        </div>
        <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                ALL SYSTEMS OPERATIONAL
            </span>
            <span className="text-xs font-mono text-gray-500">Latency: 24ms</span>
        </div>
      </div>

      {/* 2. National Stats Grid (Dynamic Data) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Citizens */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={20} /></div>
                <span className="text-xs font-bold text-green-600 flex items-center gap-1"><ArrowUp size={12}/> Live</span>
            </div>
            <p className="text-sm text-gray-500">Total Digital Citizens</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.citizens || 0}</h3>
        </div>

        {/* Transactions */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Activity size={20} /></div>
                <span className="text-xs font-bold text-green-600 flex items-center gap-1"><ArrowUp size={12}/> +12%</span>
            </div>
            <p className="text-sm text-gray-500">Total Applications</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.transactions || 0}</h3>
        </div>

        {/* Revenue */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign size={20} /></div>
                <span className="text-xs font-bold text-gray-400">YTD</span>
            </div>
            <p className="text-sm text-gray-500">Revenue (LKR)</p>
            <h3 className="text-2xl font-bold text-gray-900">{(stats?.revenue || 0).toLocaleString()}</h3>
        </div>

        {/* Security */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg"><ShieldAlert size={20} /></div>
                <span className="text-xs font-bold text-red-600 flex items-center gap-1"><ArrowUp size={12}/> Low</span>
            </div>
            <p className="text-sm text-gray-500">Security Threats</p>
            <h3 className="text-2xl font-bold text-gray-900">0</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. Server Health & Database */}
        <div className="bg-slate-900 text-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold mb-6 flex items-center gap-2">
                <Server size={18} className="text-blue-400"/> Infrastructure Health
            </h3>
            
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">API Gateway Load</span>
                        <span className="font-mono text-blue-300">42%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">MongoDB Atlas (Storage)</span>
                        <span className="font-mono text-green-300">68%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Memory Usage (Redis)</span>
                        <span className="font-mono text-yellow-300">81%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '81%' }}></div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white/5 rounded-lg">
                    <Database size={20} className="mx-auto text-purple-400 mb-2"/>
                    <p className="text-xs text-gray-400">Replica Set</p>
                    <p className="font-bold text-sm text-green-400">Healthy</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                    <Activity size={20} className="mx-auto text-orange-400 mb-2"/>
                    <p className="text-xs text-gray-400">Uptime</p>
                    <p className="font-bold text-sm">99.99%</p>
                </div>
            </div>
        </div>

        {/* 4. Live Activity Log (Dynamic) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Real-time System Logs</h3>
                <button className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-gray-600 font-medium">Download Logs</button>
            </div>
            <div className="p-0">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-3">Timestamp</th>
                            <th className="px-6 py-3">Level</th>
                            <th className="px-6 py-3">Module</th>
                            <th className="px-6 py-3">Message</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm font-mono text-gray-600">
                        {/* Map through logs if available, otherwise show skeleton/loading */}
                        {stats?.logs ? (
                            stats.logs.map((log: any, index: number) => (
                                <tr key={index} className={log.level === 'WARN' ? 'bg-red-50' : ''}>
                                    <td className="px-6 py-3">{log.time}</td>
                                    <td className="px-6 py-3">
                                        <span className={`font-bold ${log.level === 'INFO' ? 'text-blue-600' : log.level === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
                                            {log.level}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">{log.module}</td>
                                    <td className="px-6 py-3">{log.msg}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                                    Waiting for logs...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>

      {/* 5. Regional Map Placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><Map size={18} /> Regional Activity Heatmap</h3>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg p-2">
                <option>Western Province</option>
                <option>Central Province</option>
                <option>Southern Province</option>
            </select>
        </div>
        <div className="h-64 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100 border-dashed">
            <div className="text-center text-blue-400">
                <Map size={48} className="mx-auto mb-2 opacity-50"/>
                <p>Interactive Sri Lanka Map Module Loading...</p>
                <p className="text-xs">(Requires Mapbox/Google Maps API Key)</p>
            </div>
        </div>
      </div>

    </div>
  );
}