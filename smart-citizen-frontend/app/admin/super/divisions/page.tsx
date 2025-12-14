'use client';

import { useState, useEffect } from 'react';
import { assignDSToDiv, getAllDivisions } from '@/lib/api';
import { AlertCircle, CheckCircle, Plus, Loader } from 'lucide-react';

interface Division {
  ds_nic: string;
  ds_name: string;
  province: string;
  district: string;
  division: string;
  phone: string;
  email: string;
}

export default function ManageDivisions() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    ds_nic: '',
    province: '',
    district: '',
    ds_division: '',
  });

  useEffect(() => {
    fetchDivisions();
  }, []);

  const fetchDivisions = async () => {
    try {
      setLoading(true);
      const data = await getAllDivisions();
      setDivisions(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load divisions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ds_nic || !formData.province || !formData.district || !formData.ds_division) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      await assignDSToDiv(formData);
      setSuccess('DS assigned to division successfully!');
      setFormData({ ds_nic: '', province: '', district: '', ds_division: '' });
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
      await fetchDivisions();
    } catch (err: any) {
      setError(err.message || 'Failed to assign DS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Manage DS Divisions</h1>
          <p className="text-slate-600">Assign Divisional Secretaries to districts and divisions</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-900">Success</p>
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* Add Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex gap-2 items-center transition"
          >
            <Plus size={20} />
            Assign DS to Division
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Assign DS to Division</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">DS NIC</label>
                  <input
                    type="text"
                    placeholder="e.g., 777777777V"
                    value={formData.ds_nic}
                    onChange={(e) => setFormData({ ...formData, ds_nic: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Province</label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Province</option>
                    <option value="Western">Western</option>
                    <option value="Central">Central</option>
                    <option value="Southern">Southern</option>
                    <option value="Northern">Northern</option>
                    <option value="Eastern">Eastern</option>
                    <option value="North Central">North Central</option>
                    <option value="North Western">North Western</option>
                    <option value="Uva">Uva</option>
                    <option value="Sabaragamuwa">Sabaragamuwa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">District</label>
                  <input
                    type="text"
                    placeholder="e.g., Colombo"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">DS Division</label>
                  <input
                    type="text"
                    placeholder="e.g., Colombo DS Division"
                    value={formData.ds_division}
                    onChange={(e) => setFormData({ ...formData, ds_division: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  {loading ? 'Assigning...' : 'Assign Division'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-slate-300 hover:bg-slate-400 text-slate-900 px-6 py-3 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Divisions List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Current Divisions</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center flex justify-center items-center gap-3">
              <Loader className="animate-spin" />
              <span>Loading divisions...</span>
            </div>
          ) : divisions.length === 0 ? (
            <div className="p-12 text-center text-slate-600">
              <p>No divisions assigned yet. Create your first assignment above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">DS Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">NIC</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Province</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">District</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Division</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {divisions.map((div, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-900 font-semibold">{div.ds_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{div.ds_nic}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{div.province}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{div.district}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{div.division}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{div.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
