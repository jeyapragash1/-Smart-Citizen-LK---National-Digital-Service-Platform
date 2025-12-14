'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Loader2, Search, Download, Eye, Plus } from 'lucide-react';
import { getGSCertificates } from '@/lib/api';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getGSCertificates();
        setCertificates(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load certificates');
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredCerts = certificates.filter(cert => {
    const name = (cert.name || '').toLowerCase();
    const recipient = (cert.recipient || '').toLowerCase();
    const status = (cert.status || '').toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || recipient.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || status === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📜 Certificates</h1>
          <p className="text-gray-600 text-sm mt-1">Manage and issue certificates to villagers</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 font-medium">
          <Plus size={18} /> Issue Certificate
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Issued</p>
          <p className="text-3xl font-bold text-blue-600">{certificates.filter(c => (c.status || '').toLowerCase() === 'issued').length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-200">
          <p className="text-gray-600 text-sm font-medium mb-2">Pending</p>
          <p className="text-3xl font-bold text-green-600">{certificates.filter(c => (c.status || '').toLowerCase() === 'pending').length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200">
          <p className="text-gray-600 text-sm font-medium mb-2">This Month</p>
          <p className="text-3xl font-bold text-purple-600">{certificates.length}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search certificates or recipients..." 
            className="bg-transparent w-full outline-none text-gray-900"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="issued">Issued</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm border-b border-red-200">{error}</div>
        )}
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin mx-auto text-blue-600 mb-3" size={32} />
            <p className="text-gray-600">Loading certificates...</p>
          </div>
        ) : filteredCerts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText size={48} className="mx-auto mb-3 opacity-30" />
            <p>No certificates found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Certificate</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Recipient</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Date Issued</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCerts.map(cert => (
                  <tr key={cert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{cert.name}</td>
                    <td className="px-6 py-4 text-gray-700">{cert.recipient}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cert.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cert.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${cert.status === 'Issued' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {cert.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 hover:bg-green-50 rounded-lg text-green-600">
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
