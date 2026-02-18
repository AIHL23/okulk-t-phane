
import React, { useState } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [type, setType] = useState<'feedback' | 'bug'>('feedback');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simüle edilmiş gönderim süreci
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Geri Bildirim Gönderildi:", { type, message, date: new Date().toISOString() });
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      setIsSuccess(false);
      setMessage('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[40px] p-8 md:p-10 w-full max-w-lg shadow-2xl animate-scale-up relative">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-all"
        >
          ✕
        </button>

        {isSuccess ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto animate-bounce">
              ✓
            </div>
            <h3 className="text-2xl font-black text-slate-800">Teşekkürler Cemile Abla!</h3>
            <p className="text-slate-500 font-medium">Mesajın kütüphane yönetimine iletildi.</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Geri Bildirim & Hata Bildir</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Sistemi geliştirmemize yardımcı olun</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setType('feedback')}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    type === 'feedback' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Öneri / Görüş
                </button>
                <button
                  type="button"
                  onClick={() => setType('bug')}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    type === 'bug' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Hata Bildir
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mesajınız</label>
                <textarea
                  required
                  rows={4}
                  placeholder={type === 'feedback' ? "Sistem hakkında ne düşünüyorsunuz?" : "Hata detaylarını buraya yazabilirsiniz..."}
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                >
                  Vazgeç
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className={`flex-[2] px-6 py-4 rounded-2xl font-black text-white uppercase tracking-widest text-[10px] shadow-xl transition-all disabled:opacity-50 ${
                    type === 'feedback' ? 'bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700' : 'bg-rose-600 shadow-rose-100 hover:bg-rose-700'
                  }`}
                >
                  {isSubmitting ? 'GÖNDERİLİYOR...' : 'GÖNDERİSİ YAP'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
