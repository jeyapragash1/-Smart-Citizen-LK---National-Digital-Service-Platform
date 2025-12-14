'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, ScanLine, Search, CheckCircle } from 'lucide-react';

export default function VerifyPage() {
  const [docId, setDocId] = useState('');
  const [result, setResult] = useState<null | 'valid'>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // Fake verification logic
    if (docId.length > 5) setResult('valid');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Verification</h1>
            <p className="text-gray-500 mb-8">Enter the Certificate ID or Scan QR Code to verify authenticity.</p>

            <form onSubmit={handleVerify} className="relative max-w-md mx-auto mb-8">
                <input 
                    type="text" 
                    value={docId}
                    onChange={(e) => setDocId(e.target.value)}
                    placeholder="Enter Certificate ID (e.g. BC-2025-XXXX)"
                    className="w-full pl-5 pr-14 py-4 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-blue-600 transition-colors"
                />
                <button type="submit" className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 transition">
                    <Search className="w-5 h-5" />
                </button>
            </form>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><ScanLine className="w-4 h-4"/> QR Scan Supported</span>
                <span>•</span>
                <span>Real-time Database</span>
            </div>

            {/* Result Demo */}
            {result === 'valid' && (
                <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-4 text-left animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-green-100 p-2 rounded-full text-green-700">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-green-900">Valid Certificate Found</h4>
                        <p className="text-sm text-green-700">Issued to: <strong>K.G. Saman Perera</strong> on 12/12/2024</p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}