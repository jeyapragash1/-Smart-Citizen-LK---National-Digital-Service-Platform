'use client';

import React from 'react';
import Link from 'next/link'; // Import Link
import { Search, FileText, Briefcase, Plane, Home, ArrowLeft } from 'lucide-react';

export default function ServicesPage() {
  const categories = [
    { name: "Personal Identity", icon: <FileText className="w-5 h-5"/>, active: true },
    { name: "Land & Housing", icon: <Home className="w-5 h-5"/>, active: false },
    { name: "Travel & Visa", icon: <Plane className="w-5 h-5"/>, active: false },
    { name: "Business", icon: <Briefcase className="w-5 h-5"/>, active: false },
  ];

  // defined with specific IDs for the URL
  const services = [
    { id: "birth-certificate", title: "Birth Certificate Copy", dept: "Registrar General", type: "Personal" },
    { id: "nic-application", title: "National Identity Card (NIC)", dept: "Dept of Registration of Persons", type: "Personal" },
    { id: "police-clearance", title: "Police Clearance Report", dept: "Sri Lanka Police", type: "Legal" },
    { id: "passport-renewal", title: "Passport Renewal", dept: "Immigration & Emigration", type: "Travel" },
    { id: "visa-application", title: "Visa Application", dept: "Immigration & Emigration", type: "Travel" }, // Added Visa
    { id: "revenue-license", title: "Revenue License", dept: "Motor Traffic", type: "Transport" },
    { id: "grama-certificate", title: "Grama Niladhari Character Cert", dept: "District Secretariat", type: "Local" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center gap-4">
        <Link href="/dashboard" className="p-2 bg-white rounded-full shadow hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">E-Services Portal</h1>
      </div>

      {/* Search & Filter */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Search for a service (e.g., Visa)..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <button className="px-6 py-2 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800">
                Search
            </button>
        </div>

        {/* Categories */}
        <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
            {categories.map((cat, idx) => (
                <button key={idx} className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${cat.active ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                    {cat.icon}
                    {cat.name}
                </button>
            ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <FileText className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">{service.type}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{service.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">{service.dept}</p>
                </div>
                
                {/* ✅ CORRECT LINK TO DYNAMIC APPLICATION FORM */}
                <Link href={`/dashboard/apply/${service.id}`}>
                    <button className="w-full py-2 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition">
                        Apply Now
                    </button>
                </Link>
            </div>
        ))}
      </div>
    </div>
  );
}