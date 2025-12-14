'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Added useRouter
import { 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  Building2,
  Stamp,
  FileText,
  Activity,
  MapPin,
  Lock,
  ShoppingBag,
  Settings,
  DollarSign
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter(); // Hook for navigation
  const [authChecked, setAuthChecked] = useState(false);

  // 🔴 LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    router.push('/login');
  };

  // 🚦 Client-side auth/role guard
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;

    // Map path to required role
    const requiredRole = pathname.startsWith('/admin/gs')
      ? 'gs'
      : pathname.startsWith('/admin/ds')
      ? 'ds'
      : pathname.startsWith('/admin/super')
      ? 'admin'
      : null;

    if (!token || !role) {
      router.replace('/login');
      return;
    }

    if (requiredRole && role !== requiredRole) {
      router.replace('/dashboard');
      return;
    }

    setAuthChecked(true);
  }, [pathname, router]);

  // 🤖 AUTO-DETECT ROLE
  let currentRole = 'GUEST';
  let menuItems: any[] = [];
  let themeColor = 'bg-slate-900'; 

  // Role Logic (Same as before)
  if (pathname.startsWith('/admin/gs')) {
    currentRole = 'GRAMA NILADHARI';
    themeColor = 'bg-blue-900';
    menuItems = [
      { name: 'GS Overview', icon: <LayoutDashboard size={20} />, path: '/admin/gs' },
      { name: 'Pending Verifications', icon: <FileCheck size={20} />, path: '/admin/gs/verify' },
      { name: 'Villager Database', icon: <Users size={20} />, path: '/admin/gs/villagers' },
      { name: 'Land Disputes', icon: <MapPin size={20} />, path: '/admin/gs/land' },
    ];
  } else if (pathname.startsWith('/admin/ds')) {
    currentRole = 'DIVISIONAL SECRETARY';
    themeColor = 'bg-purple-900';
    menuItems = [
      { name: 'DS Overview', icon: <LayoutDashboard size={20} />, path: '/admin/ds' },
      { name: 'Approval Queue', icon: <Stamp size={20} />, path: '/admin/ds/approvals' },
      { name: 'Signed Certificates', icon: <FileText size={20} />, path: '/admin/ds/certificates' },
      { name: 'Regional Reports', icon: <Building2 size={20} />, path: '/admin/ds/reports' },
    ];
  } else if (pathname.startsWith('/admin/super')) {
    currentRole = 'SUPER ADMIN';
    themeColor = 'bg-slate-950';
    menuItems = [
      { name: 'System Monitor', icon: <Activity size={20} />, path: '/admin/super' },
      { name: 'Officer Management', icon: <Users size={20} />, path: '/admin/super/users' },
      { name: 'Marketplace Manager', icon: <ShoppingBag size={20} />, path: '/admin/super/products' },
      { name: 'Service Configuration', icon: <Settings size={20} />, path: '/admin/super/services' },
      { name: 'Revenue Analytics', icon: <DollarSign size={20} />, path: '/admin/super/revenue' },
      { name: 'Security & Logs', icon: <ShieldAlert size={20} />, path: '/admin/super/logs' },
      { name: 'Database Config', icon: <Lock size={20} />, path: '/admin/super/db' },
    ];
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Verifying access...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 ${themeColor} text-white transition-transform duration-300 ease-in-out transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>
        
        {/* Header */}
        <div className="h-16 flex items-center justify-center border-b border-white/10 bg-black/20 gap-2">
           <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold border-2 border-white shadow-lg">🦁</div>
           <div>
             <h1 className="font-bold text-xs tracking-widest text-white/90">GOV.LK OFFICIAL</h1>
             <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider">{currentRole}</p>
           </div>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-1 mt-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-white/20 text-white shadow-lg border-l-4 border-yellow-400' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
                  {item.icon}
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* 🔴 LOGOUT BUTTON (UPDATED) */}
        <div className="absolute bottom-4 left-4 right-4">
          <button 
            onClick={handleLogout} // Calls the function
            className="w-full flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors border border-transparent hover:border-red-500/30 text-left"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-gray-600"><Menu /></button>
            <div className="flex items-center gap-4 ml-auto">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-900">System Admin</p>
                    <p className="text-xs text-gray-500">{currentRole}</p>
                </div>
                <div className={`w-10 h-10 ${themeColor} rounded-full flex items-center justify-center text-white font-bold shadow-md`}>OP</div>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">{children}</main>
      </div>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
}