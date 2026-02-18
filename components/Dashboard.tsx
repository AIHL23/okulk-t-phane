
import React, { useMemo } from 'react';
import { Book, Student, Loan, View } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';

interface DashboardProps {
  books: Book[];
  students: Student[];
  loans: Loan[];
  onNavigate: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ books, students, loans, onNavigate }) => {
  // --- İSTATİSTİK HESAPLAMALARI ---

  // 1. En Çok Okuyan Öğrenciler (Leaderboard)
  const topStudents = useMemo(() => {
    const studentCountMap: Record<string, number> = {};
    loans.forEach(loan => {
      studentCountMap[loan.studentId] = (studentCountMap[loan.studentId] || 0) + 1;
    });

    return Object.entries(studentCountMap)
      .map(([id, count]) => ({
        id,
        count,
        name: students.find(s => s.id === id)?.name || 'Bilinmeyen Öğrenci'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [loans, students]);

  // 2. Aylık Kitap Verilme Grafiği Verisi
  const chartData = useMemo(() => {
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const currentYear = new Date().getFullYear();
    
    const monthlyStats: Record<number, number> = {};
    for (let i = 0; i < 12; i++) monthlyStats[i] = 0;

    loans.forEach(loan => {
      const date = new Date(loan.loanDate);
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth();
        monthlyStats[month]++;
      }
    });

    return Object.entries(monthlyStats).map(([idx, count]) => ({
      name: months[parseInt(idx)],
      kitap: count
    }));
  }, [loans]);

  const activeLoansCount = loans.filter(l => l.status === 'Active').length;
  const overdueCount = loans.filter(l => l.status === 'Active' && new Date(l.dueDate) < new Date()).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Toplam Eser', value: books.length, icon: '📚', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Kayıtlı Öğrenci', value: students.length, icon: '🎓', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Aktif Ödünç', value: activeLoansCount, icon: '📤', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Geciken Kitap', value: overdueCount, icon: '⚠️', color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center text-2xl mb-3`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color} mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Analiz ve Grafikler Paneli */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Aylık Kitap Dağılım Grafiği */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Kitap Hareket Analizi</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Aylara Göre Verilen Kitap Sayısı</p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorKitap" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px'}}
                  cursor={{stroke: '#10b981', strokeWidth: 2}}
                />
                <Area type="monotone" dataKey="kitap" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorKitap)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* En Çok Okuyanlar - Lider Tablosu */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Kitap Kurtları</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">En Çok Ödünç Alanlar</p>
            </div>
            <div className="text-2xl">🥇</div>
          </div>
          <div className="space-y-5">
            {topStudents.length > 0 ? topStudents.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                    i === 0 ? 'bg-amber-100 text-amber-600 shadow-amber-50' : 
                    i === 1 ? 'bg-slate-100 text-slate-500' : 
                    i === 2 ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'
                  }`}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Toplam {s.count} Kitap</p>
                  </div>
                </div>
                {i === 0 && <span className="text-lg">✨</span>}
              </div>
            )) : (
              <div className="text-center py-10">
                <p className="text-slate-400 italic text-sm font-medium">Henüz ödünç işlemi yapılmamış.</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => onNavigate('loans')}
            className="w-full mt-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all"
          >
            Tüm Hareketleri Gör
          </button>
        </div>
      </div>

      {/* Hızlı İşlemler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: 'books', label: 'Kitap Ekle', icon: '➕', color: 'hover:border-emerald-500' },
          { id: 'students', label: 'Yeni Öğrenci', icon: '👤', color: 'hover:border-blue-500' },
          { id: 'loans', label: 'Kitap Ver', icon: '🔄', color: 'hover:border-amber-500' },
          { id: 'ai-assistant', label: 'Yapay Zeka', icon: '✨', color: 'hover:border-purple-500' },
        ].map(action => (
          <button
            key={action.id}
            onClick={() => onNavigate(action.id as View)}
            className={`bg-white p-6 rounded-3xl border border-slate-100 transition-all ${action.color} flex items-center justify-center gap-3 group shadow-sm`}
          >
            <span className="text-xl group-hover:scale-125 transition-transform">{action.icon}</span>
            <span className="font-bold text-slate-700 text-sm">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
