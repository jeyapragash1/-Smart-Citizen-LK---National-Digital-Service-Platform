'use client';

import React, { useEffect, useState } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { getVillagers } from '@/lib/api';

export default function GSVillagersPage() {
  const [villagers, setVillagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getVillagers();
        setVillagers(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Villager Database</h1>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">Total: {villagers.length}</span>
      </div>

      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
        {loading ? (
            <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/> Loading Citizens...</div>
        ) : (
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {villagers.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{v.fullname}</td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-500">{v.nic}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{v.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{v.address}</td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
      </div>
    </div>
  );
}