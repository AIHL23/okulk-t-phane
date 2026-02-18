
import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '9595') {
      onLogin();
    } else {
      setError('Hatalı şifre! Lütfen yönetici şifresini kontrol edin.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden text-center">
      {/* Dekoratif Işıklar */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>

      <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl relative z-10 animate-fade-in border border-white/20">
        <div className="mb-10">
          <div className="inline-block p-5 bg-slate-50 rounded-[32px] text-5xl mb-6 shadow-inner ring-4 ring-slate-100/50">🕌</div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">EMAİHL Kütüphane</h1>
          <p className="text-emerald-600 font-black mt-3 text-[10px] uppercase tracking-[0.3em] bg-emerald-50 inline-block px-4 py-1.5 rounded-full">Bulut Tabanlı Sistem</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 text-left">
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Yönetici Şifresi</label>
            <input 
              type="password" 
              autoFocus
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-[24px] px-8 py-5 text-center text-3xl font-mono tracking-[0.6em] outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-inner focus:ring-4 focus:ring-emerald-500/5"
              placeholder="••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
            />
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 text-xs font-bold py-4 px-6 rounded-2xl text-center border border-rose-100 animate-[shake_0.5s_ease-in-out]">
              ⚠️ {error}
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-[24px] shadow-2xl shadow-slate-900/20 transition-all active:scale-95 uppercase tracking-widest text-xs"
            >
              Sistemi Başlat
            </button>
            <p className="mt-6 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">
              © 2024 EMAİHL - Tüm Sistemler Aktif
            </p>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default Login;
