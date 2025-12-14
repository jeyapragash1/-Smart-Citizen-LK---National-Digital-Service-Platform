'use client';

import React from 'react';
import { BarChart, PieChart, TrendingUp } from 'lucide-react';

export default function DSReportsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Divisional Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><BarChart size={18}/> Service Requests per Month</h3>
            {/* Visual Placeholder for a Chart */}
            <div className="h-48 flex items-end justify-between gap-2 px-4 border-b border-l border-gray-300 pb-2 pl-2">
                <div className="w-full bg-purple-200 h-20 rounded-t hover:bg-purple-300"></div>
                <div className="w-full bg-purple-300 h-32 rounded-t hover:bg-purple-400"></div>
                <div className="w-full bg-purple-500 h-40 rounded-t hover:bg-purple-600 relative group">
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">450</span>
                </div>
                <div className="w-full bg-purple-400 h-36 rounded-t hover:bg-purple-500"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
         </div>

         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><TrendingUp size={18}/> Revenue Collection</h3>
            <div className="text-center py-10">
                <p className="text-sm text-gray-500">Total Revenue (Dec)</p>
                <p className="text-4xl font-bold text-green-600 mt-2">LKR 4.2 Million</p>
                <p className="text-sm text-green-600 mt-2 bg-green-50 inline-block px-2 py-1 rounded">+15% vs last month</p>
            </div>
         </div>
      </div>
    </div>
  );
}