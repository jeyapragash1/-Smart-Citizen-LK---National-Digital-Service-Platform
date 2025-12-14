'use client';

import React, { useEffect, useState } from 'react';
import { UserPlus, Trash2, Edit, X, Save, Loader2, Mail, Phone } from 'lucide-react';
import { getAllOfficers, deleteOfficer, registerUser } from '@/lib/api';

export default function AdminUsersPage() {
  const [officers, setOfficers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ 
    fullname: '', 
    nic: '', 
    email: '', 
    role: 'gs', 
    phone: '', 
    password: 'admin' 
  });

  // 1. Load Data
  const loadData = async () => {
    try {
        const data = await getAllOfficers();
        setOfficers(data);
    } catch(e) { 
        console.error("Failed to load officers", e); 
    }
  };

  useEffect(() => { loadData(); }, []);

  // 2. Handle Create Officer
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        await registerUser(formData); 
        alert("Officer Created Successfully!");
        setIsModalOpen(false);
        // Reset form
        setFormData({ fullname: '', nic: '', email: '', role: 'gs', phone: '', password: 'admin' });
        loadData(); 
    } catch (e: any) { 
        console.error(e);
        // Show exact error from backend
        alert(`Error: ${e.message}`); 
    } finally {
        setLoading(false);
    }
  };

  // 3. Handle Delete
  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to remove this officer?")) return;
    try {
        await deleteOfficer(id);
        loadData();
    } catch (e) { 
        alert("Failed to delete officer."); 
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Officer Management</h1>
        <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition shadow-md"
        >
            <UserPlus size={18} /> Add New Officer
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Email / Contact</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
                {officers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-gray-900">{user.fullname}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                user.role === 'gs' ? 'bg-blue-100 text-blue-800' : 
                                user.role === 'ds' ? 'bg-purple-100 text-purple-800' : 
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {user.role}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <button className="text-gray-400 hover:text-blue-600 transition"><Edit size={16}/></button>
                            <button onClick={() => handleDelete(user.id)} className="text-gray-400 hover:text-red-600 transition"><Trash2 size={16}/></button>
                        </td>
                    </tr>
                ))}
                {officers.length === 0 && (
                    <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                            No officers found.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* ADD USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gray-900 text-white p-6 flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <UserPlus size={20}/> Register New Officer
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
                
                {/* Row 1: Name & NIC */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                        <input required placeholder="K. Silva" className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 text-sm" value={formData.fullname} onChange={e => setFormData({...formData, fullname: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">NIC Number</label>
                        <input required placeholder="1990xxxxxxV" className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 text-sm font-mono" value={formData.nic} onChange={e => setFormData({...formData, nic: e.target.value})} />
                    </div>
                </div>

                {/* Row 2: Role Selection */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Assigned Role</label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 text-sm bg-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="gs">Grama Niladhari (GS)</option>
                        <option value="ds">Divisional Secretary (DS)</option>
                        <option value="admin">System Admin</option>
                    </select>
                </div>

                {/* Row 3: Email & Phone (THIS WAS MISSING!) */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Official Email</label>
                        <div className="relative">
                            <Mail className="absolute left-2 top-2.5 text-gray-400 w-4 h-4"/>
                            <input required type="email" placeholder="officer@gov.lk" className="w-full pl-8 p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-2 top-2.5 text-gray-400 w-4 h-4"/>
                            <input required type="tel" placeholder="077xxxxxxx" className="w-full pl-8 p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                    </div>
                </div>

                {/* Row 4: Password */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Default Password</label>
                    <input required type="password" placeholder="••••••" className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>

                {/* Buttons */}
                <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium text-sm transition flex items-center justify-center gap-2 disabled:opacity-70">
                        {loading ? <Loader2 className="animate-spin" size={16}/> : <><Save size={16} /> Create Account</>}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}