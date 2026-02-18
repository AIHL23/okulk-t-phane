
import React, { useState, useRef } from 'react';
import { Book } from '../types';
import { extractBookDetailsFromImage } from '../services/geminiService';

interface BookListProps {
  books: Book[];
  onAddBook: (book: Book) => Promise<void>;
  onDeleteBook: (id: string) => Promise<void>;
  onBack: () => void;
}

const BookList: React.FC<BookListProps> = ({ books, onAddBook, onDeleteBook, onBack }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Available' | 'Loaned'>('All');
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [newBook, setNewBook] = useState<Partial<Book>>({
    title: '', author: '', isbn: '', category: 'Roman', publisher: '', pageCount: 0
  });

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         b.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Kameraya ulaşılamadı. İzinleri kontrol edin.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsCameraActive(false);
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsScanning(true);
    const context = canvasRef.current.getContext('2d');
    if (context) {
      // 400 Hatalarını önlemek için MAX_SIZE 800px yapıldı (Daha stabil)
      const MAX_SIZE = 800;
      let width = videoRef.current.videoWidth;
      let height = videoRef.current.videoHeight;
      
      if (width > MAX_SIZE) {
        height = Math.round((height * MAX_SIZE) / width);
        width = MAX_SIZE;
      }

      canvasRef.current.width = width;
      canvasRef.current.height = height;
      context.drawImage(videoRef.current, 0, 0, width, height);
      
      // JPEG kalitesi %75 yapılarak dosya boyutu küçültüldü
      const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.75).split(',')[1];
      
      const details = await extractBookDetailsFromImage(base64Image);
      
      if (details && details.title) {
        setNewBook(prev => ({
          ...prev,
          title: details.title || prev.title,
          author: details.author || prev.author,
          isbn: details.isbn || prev.isbn,
          publisher: details.publisher || prev.publisher,
          category: details.category || prev.category
        }));
        stopCamera();
      } else {
        alert("Kitap tespit edilemedi veya bir hata oluştu. Lütfen ışıklı bir ortamda tekrar deneyin.");
      }
    }
    setIsScanning(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title) return;
    
    setIsSubmitting(true);
    await onAddBook({
      id: Date.now().toString(),
      title: newBook.title,
      author: newBook.author || 'Bilinmiyor',
      isbn: newBook.isbn || 'ISBN-YOK',
      category: newBook.category || 'Roman',
      addedDate: new Date().toISOString().split('T')[0],
      publisher: newBook.publisher || '-',
      pageCount: Number(newBook.pageCount) || 0,
      status: 'Available'
    });
    setIsSubmitting(false);
    setIsModalOpen(false);
    setNewBook({ title: '', author: '', isbn: '', category: 'Roman', publisher: '', pageCount: 0 });
  };

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">←</button>
          <h2 className="text-2xl font-bold text-slate-800">Kitap Envanteri</h2>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Durum Filtreleme Tuşları */}
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
            <button 
              onClick={() => setStatusFilter('All')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${statusFilter === 'All' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Tümü
            </button>
            <button 
              onClick={() => setStatusFilter('Available')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${statusFilter === 'Available' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-emerald-600'}`}
            >
              Rafta
            </button>
            <button 
              onClick={() => setStatusFilter('Loaned')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${statusFilter === 'Loaned' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-amber-600'}`}
            >
              Ödünçte
            </button>
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="İsim veya yazar ara..."
              className="flex-1 md:w-64 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl font-black shadow-lg shadow-emerald-100 flex items-center gap-2"
            >
              <span>➕</span>
              <span className="hidden sm:inline">Yeni Kitap</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Eser Bilgisi</th>
              <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Yazar</th>
              <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Durum</th>
              <th className="px-6 py-5 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredBooks.length > 0 ? filteredBooks.map((book) => (
              <tr key={book.id} className="hover:bg-slate-50/50 group transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-12 rounded-lg flex items-center justify-center text-xl shadow-sm ${book.status === 'Available' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>📖</div>
                    <div>
                      <p className="font-bold text-slate-800 leading-tight">{book.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono uppercase mt-1">ISBN: {book.isbn}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-slate-600 text-sm">{book.author}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    book.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>{book.status === 'Available' ? 'Rafta' : 'Ödünçte'}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onDeleteBook(book.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2">🗑️</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center text-slate-300 italic font-medium">Aranan kriterlerde kitap bulunamadı.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-[40px] p-6 md:p-10 w-full max-w-2xl shadow-2xl relative">
            <button onClick={() => { stopCamera(); setIsModalOpen(false); }} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-slate-600">✕</button>
            <h3 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">Akıllı Kitap Kaydı</h3>

            <div className="mb-8 relative rounded-3xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border-4 border-slate-50 shadow-inner">
              {isCameraActive ? (
                <>
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-2/3 h-2/3 border-2 border-dashed border-emerald-500/50 rounded-2xl relative">
                      {isScanning && <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 animate-[scan_2s_linear_infinite]"></div>}
                    </div>
                  </div>
                  <div className="absolute bottom-6 flex gap-3">
                    <button onClick={captureAndScan} disabled={isScanning} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl disabled:opacity-50 active:scale-95 transition-all">
                      {isScanning ? 'TANIYOR...' : '📷 OKUT'}
                    </button>
                    <button onClick={stopCamera} className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-2xl font-bold transition-all">Kapat</button>
                  </div>
                </>
              ) : (
                <div className="text-center p-10">
                  <div className="text-5xl mb-4">📷</div>
                  <button onClick={startCamera} className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-slate-50 transition-all">KAMERAYI AÇ</button>
                  <p className="mt-4 text-slate-500 text-xs font-bold uppercase tracking-widest">Kitabı Kameraya Gösterin</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Eser Adı</label>
                  <input type="text" required placeholder="Kitap İsmi" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-emerald-500 outline-none font-bold transition-all shadow-sm" value={newBook.title} onChange={(e) => setNewBook({...newBook, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Yazar</label>
                  <input type="text" placeholder="Yazar Adı" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-emerald-500 outline-none font-bold transition-all shadow-sm" value={newBook.author} onChange={(e) => setNewBook({...newBook, author: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ISBN</label>
                  <input type="text" placeholder="978..." className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-emerald-500 outline-none font-mono shadow-sm" value={newBook.isbn} onChange={(e) => setNewBook({...newBook, isbn: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { stopCamera(); setIsModalOpen(false); }} className="flex-1 px-6 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">İPTAL</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] px-6 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50">EKLE</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes scan { 0% { top: 0; } 100% { top: 100%; } }`}</style>
    </div>
  );
};

export default BookList;
