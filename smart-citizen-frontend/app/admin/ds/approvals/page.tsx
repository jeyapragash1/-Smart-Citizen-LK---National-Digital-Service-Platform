'use client';

import React, { useEffect, useState } from 'react';
import { Stamp, Loader2, Check, X } from 'lucide-react';
import { getDSQueue, updateApplicationStatus } from '@/lib/api';

export default function DSApprovalsPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
        setLoading(true);
        const data = await getDSQueue();
        setQueue(data);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = async (id: string, status: string) => {
    try {
        await updateApplicationStatus(id, status);
        alert(`Application ${status} successfully.`);
        loadData(); // Refresh
    } catch (e) { alert("Action failed"); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">DS Final Approval Queue</h1>
      
      {loading ? (
        <div className="text-center p-10"><Loader2 className="animate-spin mx-auto"/> Loading Queue...</div>
      ) : queue.length === 0 ? (
        <div className="p-10 bg-white rounded-xl text-center text-gray-500">All caught up! No pending approvals.</div>
      ) : (
        <div className="space-y-4">
            {queue.map((app) => (
                <div key={app._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{app.service_type}</h3>
                        <p className="text-sm text-gray-500">Applicant: {app.details.name} ({app.applicant_nic})</p>
                        <div className="mt-2 flex gap-2">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Pending DS Signature</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleAction(app._id, "Rejected")}
                            className="px-4 py-2 text-sm text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition"
                        >
                            Reject
                        </button>
                        <button 
                            onClick={() => handleAction(app._id, "Completed")}
                            className="bg-purple-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-800 flex items-center gap-2 shadow-lg"
                        >
                            <Stamp size={18} /> Sign & Issue
                        </button>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}