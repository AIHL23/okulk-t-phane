
import React, { useState, useEffect } from 'react';
import { View, Book, Student, Loan } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import BookList from './components/BookList';
import StudentList from './components/StudentList';
import LoanList from './components/LoanList';
import AIAssistant from './components/AIAssistant';
import Login from './components/Login';
import FeedbackModal from './components/FeedbackModal';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  
  const [books, setBooks] = useState<Book[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);

  const loadAllData = async () => {
    setIsLoading(true);
    setErrorState(null);
    try {
      await storageService.init();
      const [b, s, l] = await Promise.all([
        storageService.getBooks(),
        storageService.getStudents(),
        storageService.getLoans()
      ]);
      setBooks(b);
      setStudents(s);
      setLoans(l);
    } catch (error: any) {
      setErrorState(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Yapılandırma Hatası Görünümü
  if (errorState) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-xl bg-white rounded-[48px] p-12 shadow-2xl">
          <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[32px] flex items-center justify-center text-5xl mx-auto mb-8">🌩️</div>
          <h2 className="text-3xl font-black text-slate-800 mb-6">Bulut Bağlantısı Kurulamadı</h2>
          
          <div className="text-left bg-slate-50 p-8 rounded-3xl mb-8 space-y-4 border border-slate-100">
            {errorState === "WRONG_URL_FORMAT" ? (
              <p className="text-slate-600 text-sm leading-relaxed">
                <span className="font-black text-rose-600">HATA:</span> Girdiğiniz link <code>mongodb+srv://</code> ile başlıyor. Tarayıcılar bu linki doğrudan tanımaz. <br/><br/>
                <strong>Çözüm:</strong> MongoDB Atlas panelinde <strong>Data API</strong> sekmesine gidin ve orada size verilen <strong>URL Endpoint</strong> (<code>https://...</code>) linkini <code>VITE_MONGODB_URL</code> olarak kaydedin.
              </p>
            ) : (
              <p className="text-slate-600 text-sm leading-relaxed">
                Lütfen Vercel panelinden <strong>MONGODB_URI</strong> ve <strong>VITE_GEMINI_API_KEY</strong> değişkenlerinin tanımlandığından emin olun.
              </p>
            )}
          </div>
          
          <button onClick={() => window.location.reload()} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs hover:bg-black transition-all">Sistemi Yeniden Bağla</button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-emerald-500 font-black tracking-widest uppercase text-xs animate-pulse">Bulut Verileri Alınıyor...</p>
        </div>
      </div>
    );
  }

  const goBack = () => setActiveView('dashboard');

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        onLogout={() => setIsAuthenticated(false)} 
        onOpenFeedback={() => setIsFeedbackModalOpen(true)} 
      />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto pb-24">
          <header className="mb-12 flex items-center justify-between">
            <div onClick={goBack} className="cursor-pointer group">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-sm">Atlas Bulut Aktif</span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">EMAİHL Kütüphane</h1>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center text-2xl shadow-emerald-50">☁️</div>
          </header>

          <div className="animate-fade-in">
            {activeView === 'dashboard' && <Dashboard books={books} students={students} loans={loans} onNavigate={setActiveView} />}
            {activeView === 'books' && (
              <BookList 
                books={books} 
                onAddBook={async (b) => { await storageService.saveBook(b); setBooks([...books, b]); }} 
                onDeleteBook={async (id) => { await storageService.deleteBook(id); setBooks(books.filter(b => b.id !== id)); }} 
                onBack={goBack} 
              />
            )}
            {activeView === 'students' && (
              <StudentList 
                students={students} 
                onAddStudent={async (s) => { await storageService.saveStudent(s); setStudents([...students, s]); }} 
                onDeleteStudent={async (id) => { await storageService.deleteStudent(id); setStudents(students.filter(s => s.id !== id)); }} 
                onBack={goBack} 
              />
            )}
            {activeView === 'loans' && (
              <LoanList 
                loans={loans} 
                books={books} 
                students={students} 
                onReturnBook={async (id) => { 
                  const l = loans.find(x => x.id === id); 
                  if(l) { 
                    const u: Loan = {...l, status: 'Returned', returnDate: new Date().toISOString()}; 
                    await storageService.updateLoan(u); 
                    setLoans(loans.map(x => x.id === id ? u : x)); 
                    setBooks(books.map(b => b.id === l.bookId ? {...b, status: 'Available'} : b)); 
                  } 
                }} 
                onAddLoan={async (l) => { 
                  await storageService.saveLoan(l); 
                  setLoans([...loans, l]); 
                  setBooks(books.map(b => b.id === l.bookId ? {...b, status: 'Loaned'} : b)); 
                }} 
                onBack={goBack} 
              />
            )}
            {activeView === 'ai-assistant' && <AIAssistant books={books} students={students} loans={loans} onBack={goBack} />}
          </div>
        </div>
      </main>
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
    </div>
  );
};

export default App;
