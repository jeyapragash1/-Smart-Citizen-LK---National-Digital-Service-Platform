'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, FileText, MapPin, Loader2 } from 'lucide-react';
import { getPendingApplications, updateApplicationStatus } from '@/lib/api';

export default function GSVerifyPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getPendingApplications();
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    if(!confirm(`Mark this application as ${newStatus}?`)) return;
    try {
      await updateApplicationStatus(id, newStatus);
      loadData(); 
    } catch (error) {
      alert("Error updating status");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pending Verifications</h1>
      
      {loading ? (
        <div className="text-center p-10"><Loader2 className="animate-spin mx-auto text-blue-600"/> Loading...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white p-10 rounded-xl text-center text-gray-500">No pending applications found.</div>
      ) : (
        <div className="space-y-4">
            {requests.map((req) => (
                <div key={req._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><FileText size={24} /></div>
                        <div>
                            <h3 className="font-bold text-gray-900">{req.service_type}</h3>
                            <p className="text-sm font-medium text-gray-700">{req.details.name} (NIC: {req.applicant_nic})</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin size={12}/> {req.details.address || "Address not provided"}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => handleStatusChange(req._id, "Completed")} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2">
                            <CheckCircle size={16}/> Approve
                        </button>
                        <button onClick={() => handleStatusChange(req._id, "Rejected")} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-medium flex items-center gap-2">
                            <XCircle size={16}/> Reject
                        </button>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}