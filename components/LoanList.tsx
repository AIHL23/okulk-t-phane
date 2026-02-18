
import React, { useState, useEffect, useRef } from 'react';
import { Loan, Book, Student } from '../types';

interface LoanListProps {
  loans: Loan[];
  books: Book[];
  students: Student[];
  onAddLoan: (loan: Loan) => void;
  onReturnBook: (loanId: string) => void;
  onBack: () => void;
}

const LoanList: React.FC<LoanListProps> = ({ loans, books, students, onAddLoan, onReturnBook, onBack }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLoan, setNewLoan] = useState({ bookId: '', studentId: '', days: 15 });
  
  // Arama ve Filtreleme Durumları
  const [bookSearch, setBookSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [showBookResults, setShowBookResults] = useState(false);
  const [showStudentResults, setShowStudentResults] = useState(false);

  const availableBooks = books.filter(b => b.status === 'Available');

  // Filtrelenmiş Listeler
  const filteredBooks = availableBooks.filter(b => 
    b.title.toLocaleLowerCase('tr').startsWith(bookSearch.toLocaleLowerCase('tr')) ||
    b.title.toLocaleLowerCase('tr').includes(bookSearch.toLocaleLowerCase('tr'))
  ).slice(0, 5);

  const filteredStudents = students.filter(s => 
    s.name.toLocaleLowerCase('tr').startsWith(studentSearch.toLocaleLowerCase('tr')) ||
    s.name.toLocaleLowerCase('tr').includes(studentSearch.toLocaleLowerCase('tr'))
  ).slice(0, 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoan.bookId || !newLoan.studentId) {
      alert("Lütfen hem kitap hem de öğrenci seçiniz.");
      return;
    }

    const loanDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(loanDate.getDate() + newLoan.days);

    const loan: Loan = {
      id: 'L-' + Date.now().toString().slice(-6),
      bookId: newLoan.bookId,
      studentId: newLoan.studentId,
      loanDate: loanDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'Active'
    };
    onAddLoan(loan);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewLoan({ bookId: '', studentId: '', days: 15 });
    setBookSearch('');
    setStudentSearch('');
    setShowBookResults(false);
    setShowStudentResults(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Emanet Takibi</h2>
            <p className="text-slate-400 text-sm font-medium">Ödünç Verilen ve İade Edilen Kitaplar</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-2xl font-black shadow-lg shadow-amber-100 transition-all flex items-center gap-2 active:scale-95"
        >
          <span className="text-xl">🤝</span>
          <span>YENİ ÖDÜNÇ VER</span>
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kitap Bilgisi</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Öğrenci</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Teslim Tarihi</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Durum</th>
                <th className="px-6 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loans.length === 0 ? (
                <tr><td colSpan={5} className="py-24 text-center text-slate-300 italic font-medium">Şu an kayıtlı bir ödünç işlemi bulunmuyor.</td></tr>
              ) : (
                [...loans].reverse().map((loan) => {
                  const book = books.find(b => b.id === loan.bookId);
                  const student = students.find(s => s.id === loan.studentId);
                  const isOverdue = new Date(loan.dueDate) < new Date() && loan.status === 'Active';
                  
                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${loan.status === 'Returned' ? 'bg-slate-100' : 'bg-amber-50 text-amber-600'}`}>📖</div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm leading-none">{book?.title || 'Silinmiş Kitap'}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase">{book?.isbn}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">{student?.name.charAt(0)}</div>
                          <p className="text-sm font-bold text-slate-600">{student?.name || 'Kayıtsız Öğrenci'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-xs font-mono font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
                          {loan.dueDate}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          loan.status === 'Returned' ? 'bg-emerald-100 text-emerald-700' : isOverdue ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {loan.status === 'Returned' ? 'İade Edildi' : isOverdue ? 'GECİKTİ' : 'ÖDÜNÇTE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {loan.status === 'Active' && (
                          <button 
                            onClick={() => onReturnBook(loan.id)}
                            className="px-5 py-2.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                          >
                            İade Al
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] p-8 md:p-10 w-full max-w-lg shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Hızlı Ödünç Ver</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Kitap Arama */}
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Kitap Bul (İlk harfi yaz)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2">📖</span>
                  <input 
                    type="text"
                    placeholder="Kitap adını yazmaya başla..."
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-12 pr-5 py-4 focus:bg-white focus:border-amber-500 outline-none transition-all font-bold"
                    value={bookSearch}
                    onFocus={() => setShowBookResults(true)}
                    onChange={(e) => {
                      setBookSearch(e.target.value);
                      setNewLoan({...newLoan, bookId: ''});
                      setShowBookResults(true);
                    }}
                  />
                </div>
                {showBookResults && bookSearch && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                    {filteredBooks.length > 0 ? filteredBooks.map(b => (
                      <button
                        key={b.id}
                        type="button"
                        className="w-full text-left px-5 py-3 hover:bg-amber-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                        onClick={() => {
                          setNewLoan({...newLoan, bookId: b.id});
                          setBookSearch(b.title);
                          setShowBookResults(false);
                        }}
                      >
                        <span className="font-bold text-slate-700 text-sm">{b.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{b.author}</span>
                      </button>
                    )) : (
                      <div className="px-5 py-4 text-slate-400 text-sm italic">Bulunamadı veya zaten ödünçte.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Öğrenci Arama */}
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Öğrenci Bul (İsim gir)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2">🎓</span>
                  <input 
                    type="text"
                    placeholder="Öğrenci adını yazmaya başla..."
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-12 pr-5 py-4 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                    value={studentSearch}
                    onFocus={() => setShowStudentResults(true)}
                    onChange={(e) => {
                      setStudentSearch(e.target.value);
                      setNewLoan({...newLoan, studentId: ''});
                      setShowStudentResults(true);
                    }}
                  />
                </div>
                {showStudentResults && studentSearch && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                    {filteredStudents.length > 0 ? filteredStudents.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        className="w-full text-left px-5 py-3 hover:bg-blue-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                        onClick={() => {
                          setNewLoan({...newLoan, studentId: s.id});
                          setStudentSearch(s.name);
                          setShowStudentResults(false);
                        }}
                      >
                        <span className="font-bold text-slate-700 text-sm">{s.name}</span>
                        <span className="text-[10px] text-blue-500 font-black tracking-widest uppercase">No: {s.studentNumber}</span>
                      </button>
                    )) : (
                      <div className="px-5 py-4 text-slate-400 text-sm italic">Öğrenci bulunamadı.</div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Kiralama Süresi (Gün)</label>
                  <input 
                    type="number" required min="1" max="60"
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 focus:bg-white focus:border-emerald-500 outline-none font-bold transition-all text-center"
                    value={newLoan.days}
                    onChange={(e) => setNewLoan({...newLoan, days: Number(e.target.value)})}
                  />
                </div>
                <div className="col-span-2 md:col-span-1 flex items-end">
                   <div className="w-full bg-emerald-50 rounded-2xl p-3 text-center">
                      <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Tahmini İade</p>
                      <p className="text-xs font-bold text-emerald-700">
                        {new Date(Date.now() + newLoan.days * 86400000).toLocaleDateString('tr-TR')}
                      </p>
                   </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                >
                  VAZGEÇ
                </button>
                <button 
                  type="submit"
                  disabled={!newLoan.bookId || !newLoan.studentId}
                  className="flex-[2] px-6 py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-600 transition-all shadow-xl shadow-amber-100 disabled:opacity-30 disabled:shadow-none"
                >
                  İŞLEMİ TAMAMLA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanList;
