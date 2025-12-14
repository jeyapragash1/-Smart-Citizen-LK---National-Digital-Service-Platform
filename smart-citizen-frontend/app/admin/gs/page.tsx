'use client';

import React, { useEffect, useState } from 'react';
import { FileCheck, Users, Clock, AlertTriangle } from 'lucide-react';
import { getGSStats } from '@/lib/api';

export default function GSDashboard() {
  const [stats, setStats] = useState({ pending: 0, villagers: 0, approved: 0, disputes: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getGSStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load stats", error);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      
      <h1 className="text-2xl font-bold text-gray-900">Grama Niladhari Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border-l-4 border-yellow-500 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Pending Review</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
                </div>
                <Clock className="text-yellow-500 w-6 h-6" />
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl border-l-4 border-blue-500 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Total Villagers</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.villagers}</p>
                </div>
                <Users className="text-blue-500 w-6 h-6" />
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl border-l-4 border-green-500 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Approved Total</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.approved}</p>
                </div>
                <FileCheck className="text-green-500 w-6 h-6" />
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl border-l-4 border-red-500 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Land Disputes</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.disputes}</p>
                </div>
                <AlertTriangle className="text-red-500 w-6 h-6" />
            </div>
        </div>
      </div>
    </div>
  );
}