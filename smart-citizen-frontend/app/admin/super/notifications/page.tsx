'use client';

import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, Mail, Loader2 } from 'lucide-react';
import { getDSNotifications } from '@/lib/api';

export default function NotificationsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAlerts() {
      try {
        setError('');
        const data = await getDSNotifications();
        setAlerts(Array.isArray(data) ? data : data.notifications || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load alerts');
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );
  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
      <AlertTriangle size={16} /> {error}
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="text-sm text-gray-600">Broadcast system notices and review operational alerts</p>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
          <Bell size={14} /> Live feed
        </span>
      </header>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-800 font-semibold"><AlertTriangle size={18} className="text-amber-600" /> Recent alerts</div>
          <CheckCircle size={16} className="text-emerald-500" />
        </div>
        <ul className="divide-y divide-gray-100 text-sm">
          {alerts.map((a) => (
            <li key={a.id} className="p-4 flex items-start gap-3 hover:bg-gray-50">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${a.level === 'High' ? 'bg-red-50 text-red-600' : a.level === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>{a.level[0]}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{a.id} · {a.type}</p>
                  <span className="text-xs text-gray-500">{a.time}</span>
                </div>
                <p className="text-gray-700">{a.message}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-2 text-gray-800 font-semibold mb-3"><Mail size={18} /> Broadcast a notice</div>
        <p className="text-sm text-gray-600">Hook this form to your backend queue or email/SMS provider.</p>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Title" />
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option>All users</option>
            <option>DS officers</option>
            <option>GS officers</option>
            <option>Citizens</option>
          </select>
          <textarea className="border border-gray-200 rounded-lg px-3 py-2 text-sm md:col-span-2" rows={3} placeholder="Message body" />
          <div className="md:col-span-2 flex justify-end">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Send notice</button>
          </div>
        </div>
      </div>
    </div>
  );
}
