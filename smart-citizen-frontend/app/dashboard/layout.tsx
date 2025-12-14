'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Wallet, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  Loader2
} from 'lucide-react';
import { getUserProfile } from '@/lib/api'; // Import API helper

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // State for User Data
  const [user, setUser] = useState({
    fullname: 'Loading...',
    nic: 'Checking...',
    initials: '..'
  });

  // 1. Fetch User Data on Mount
  useEffect(() => {
    async function loadUserData() {
      try {
        const data = await getUserProfile();
        
        // Calculate Initials (e.g. "Saman Perera" -> "SP")
        const nameParts = data.fullname.split(' ');
        const initials = nameParts.length > 1 
          ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase() 
          : data.fullname.substring(0, 2).toUpperCase();

        setUser({
          fullname: data.fullname,
          nic: data.nic,
          initials: initials
        });
      } catch (error) {
        console.error("Layout Load Error:", error);
        // If 401 (Unauthorized), redirect might happen here or handle gracefully
      }
    }
    loadUserData();
  }, []);

  // 🔴 LOGOUT FUNCTION
  const handleLogout = () => {
    // Clear ALL auth data
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    
    // Redirect
    router.push('/login');
  };

  const menuItems = [
    { name: 'Overview', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'My Applications', icon: <FileText size={20} />, path: '/dashboard/applications' },
    { name: 'Digital Wallet', icon: <Wallet size={20} />, path: '/dashboard/wallet' },
    { name: 'Profile', icon: <User size={20} />, path: '/dashboard/profile' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 text-white transition-transform duration-300 ease-in-out transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-auto`}>
        
        <div className="flex items-center justify-center h-16 border-b border-blue-800 bg-blue-950">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">SL</div>
              <span className="text-xl font-bold tracking-tight">SmartCitizen</span>
           </div>
        </div>

        <nav className="p-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}>
                  {item.icon}
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* 🔴 LOGOUT BUTTON */}
        <div className="absolute bottom-4 left-4 right-4">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-4 py-3 text-blue-200 hover:bg-red-600 hover:text-white rounded-xl transition-colors text-left"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-gray-500 hover:text-gray-700">
                    {sidebarOpen ? <X /> : <Menu />}
                </button>
                <div className="hidden md:flex relative text-gray-400 focus-within:text-gray-600">
                    <Search className="absolute left-3 top-2.5 w-4 h-4" />
                    <input type="text" placeholder="Search services..." className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64" />
                </div>
            </div>

            {/* REAL USER INFO */}
            <div className="flex items-center gap-4">
                <button className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Bell size={20} />
                    {/* Only show dot if not loading */}
                    {user.initials !== '..' && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
                </button>
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-900">{user.fullname}</p>
                        <p className="text-xs text-gray-500">NIC: {user.nic}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm overflow-hidden">
                        {user.initials}
                    </div>
                </div>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-gray-900/50 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
}