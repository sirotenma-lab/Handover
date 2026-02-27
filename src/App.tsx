import React, { useState, useEffect } from 'react';
import { Search, Plus, Menu, Bell, LogOut, LayoutDashboard, Users, Settings, History, Share2 } from 'lucide-react';
import { MOCK_PATIENTS } from './mockData';
import { PatientCard } from './components/PatientCard';
import { HandoverDetail } from './components/HandoverDetail';
import { Patient } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export default function App() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(MOCK_PATIENTS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsGoogleConnected(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setIsGoogleConnected(data.connected);
    } catch (e) {
      console.error('Failed to check auth status');
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await fetch('/api/auth/google/url');
      const { url } = await res.json();
      window.open(url, 'google_oauth', 'width=600,height=700');
    } catch (e) {
      alert('Gagal menghubungkan ke Google');
    }
  };

  const selectedPatient = MOCK_PATIENTS.find(p => p.id === selectedPatientId);

  const filteredPatients = MOCK_PATIENTS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            H
          </div>
          <h1 className="font-bold text-lg tracking-tight text-slate-900 leading-tight">
            Handover<br/><span className="text-blue-600">Digital</span>
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<Users size={20} />} label="Daftar Pasien" />
          <NavItem icon={<History size={20} />} label="Riwayat" />
          <NavItem icon={<Settings size={20} />} label="Pengaturan" />
          
          <div className="pt-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Integrasi</p>
            <button 
              onClick={handleConnectGoogle}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-sm",
                isGoogleConnected ? "text-emerald-600 bg-emerald-50" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <Share2 size={20} />
              {isGoogleConnected ? "Google Terhubung" : "Hubungkan Google"}
            </button>
          </div>
        </nav>

        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              NS
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">Ns. Sarah</p>
              <p className="text-xs text-slate-500 truncate">Perawat Pelaksana</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 p-3 text-slate-500 hover:text-red-600 transition-colors">
            <LogOut size={20} />
            <span className="text-sm font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 lg:hidden">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Menu size={24} />
            </button>
            <h1 className="font-bold text-slate-900">Handover</h1>
          </div>
          
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari pasien, ruangan, atau diagnosa..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
              <Plus size={18} />
              <span className="hidden sm:inline">Pasien Baru</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Patient List Column */}
          <div className="w-full md:w-80 border-r border-slate-200 bg-white flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Pasien Aktif</h2>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                {MOCK_PATIENTS.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {filteredPatients.map(patient => (
                <PatientCard 
                  key={patient.id} 
                  patient={patient} 
                  isSelected={selectedPatientId === patient.id}
                  onClick={() => setSelectedPatientId(patient.id)}
                />
              ))}
              {filteredPatients.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-400 text-sm">Pasien tidak ditemukan.</p>
                </div>
              )}
            </div>
          </div>

          {/* Detail Column */}
          <div className="hidden md:block flex-1 overflow-y-auto bg-slate-50/50">
            <div className="max-w-4xl mx-auto p-6 lg:p-10">
              <AnimatePresence mode="wait">
                {selectedPatient ? (
                  <HandoverDetail key={selectedPatient.id} patient={selectedPatient} />
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-slate-400 py-20"
                  >
                    <Users size={64} className="mb-4 opacity-10" />
                    <p>Pilih pasien untuk melihat detail handover.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium text-sm",
      active 
        ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/5" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    )}>
      {icon}
      {label}
    </button>
  );
}
