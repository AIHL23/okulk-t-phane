
import React from 'react';
import { View } from '../types';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
  onOpenFeedback: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, onLogout, onOpenFeedback }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Ana Menü', icon: '🏠' },
    { id: 'books', label: 'Kitaplar', icon: '📚' },
    { id: 'students', label: 'Öğrenciler', icon: '🎓' },
    { id: 'loans', label: 'Ödünç / İade', icon: '🔄' },
    { id: 'ai-assistant', label: 'AI Sohbet', icon: '✨' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col hidden lg:flex sticky top-0 h-screen shadow-2xl">
      <div className="p-8 border-b border-white/5">
        <div className="text-2xl font-black tracking-tight text-emerald-400">EMAİHL</div>
        <div className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mt-1">Kütüphane Sistemi</div>
      </div>
      <nav className="flex-1 p-6 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as View)}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
              activeView === item.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 translate-x-1' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-bold text-sm tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-6 border-t border-white/5 space-y-2">
        <button 
          onClick={onOpenFeedback}
          className="w-full flex items-center space-x-4 px-5 py-4 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-2xl transition-all font-bold"
        >
          <span>💬</span>
          <span className="text-sm">Geri Bildirim</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-4 px-5 py-4 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all font-bold"
        >
          <span>🚪</span>
          <span className="text-sm">Oturumu Kapat</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
