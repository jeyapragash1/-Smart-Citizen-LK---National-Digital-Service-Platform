'use client';

import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

export default function AdminLogsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Security Audit Logs</h1>

      <div className="bg-black text-green-400 font-mono text-sm p-6 rounded-xl shadow-lg h-96 overflow-y-auto">
         <p className="mb-2"><span className="text-gray-500">[10:00:01]</span> SYSTEM_INIT: Security protocol started.</p>
         <p className="mb-2"><span className="text-gray-500">[10:05:22]</span> AUTH_LOGIN: User 'Admin' logged in from IP 192.168.1.5</p>
         <p className="mb-2 text-yellow-400"><span className="text-gray-500">[10:12:00]</span> WARN: Failed login attempt for user 'K.Silva' (3 attempts).</p>
         <p className="mb-2"><span className="text-gray-500">[10:15:30]</span> DB_WRITE: New citizen record created (ID: 99281).</p>
         <p className="mb-2 text-red-500"><span className="text-gray-500">[10:20:00]</span> CRITICAL: Unathorized API access blocked from external IP.</p>
         <p className="mb-2"><span className="text-gray-500">[10:25:00]</span> SERVICE: Email notification service heatbeat OK.</p>
         {/* Simulated many lines */}
         <p className="mb-2 animate-pulse">_ Waiting for incoming data...</p>
      </div>
    </div>
  );
}