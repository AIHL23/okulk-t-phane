
import React, { useState } from 'react';
import { Student } from '../types';

interface StudentListProps {
  students: Student[];
  onAddStudent: (student: Student) => Promise<void>;
  onDeleteStudent: (id: string) => Promise<void>;
  onBack: () => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, onAddStudent, onDeleteStudent, onBack }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');
  
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    name: '', studentNumber: '', grade: '', email: '', phone: ''
  });

  // Mevcut sınıfları dinamik olarak çıkar (Filtre için)
  const availableGrades = ['All', ...Array.from(new Set(students.map(s => s.grade))).sort()];

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.studentNumber.includes(searchTerm);
    const matchesGrade = gradeFilter === 'All' || s.grade === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.studentNumber) return;
    
    setIsSubmitting(true);
    const student: Student = {
      id: Date.now().toString(),
      name: newStudent.name,
      studentNumber: newStudent.studentNumber,
      grade: newStudent.grade || 'Belirtilmedi',
      email: newStudent.email || '',
      phone: newStudent.phone || '',
    };
    await onAddStudent(student);
    setIsSubmitting(false);
    setIsModalOpen(false);
    setNewStudent({ name: '', studentNumber: '', grade: '', email: '', phone: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Öğrenci Kayıtları</h2>
            <p className="text-slate-400 text-sm font-medium">Güncel Okul Listesi</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Sınıf Filtresi (Dropdown) */}
          <select 
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 outline-none focus:border-blue-500 shadow-sm transition-all"
          >
            {availableGrades.map(grade => (
              <option key={grade} value={grade}>{grade === 'All' ? 'Tüm Sınıflar' : grade}</option>
            ))}
          </select>

          <div className="flex gap-2 flex-1">
            <input 
              type="text" 
              placeholder="No veya isim ara..."
              className="flex-1 md:w-64 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
            >
              <span>👤</span>
              <span className="hidden sm:inline">Yeni Kayıt</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.length > 0 ? filteredStudents.map((student) => (
          <div key={student.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-[24px] flex items-center justify-center font-black text-2xl shadow-xl shadow-blue-100 group-hover:scale-110 transition-transform">
                {student.name.charAt(0)}
              </div>
              <button onClick={() => onDeleteStudent(student.id)} className="text-slate-200 hover:text-rose-500 transition-colors p-2">🗑️</button>
            </div>
            
            <div className="mb-6 relative z-10">
              <h4 className="text-xl font-black text-slate-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{student.name}</h4>
              <div className="flex gap-2">
                <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">No: {student.studentNumber}</span>
                <span className="text-[10px] bg-slate-50 text-slate-500 px-3 py-1 rounded-full font-black uppercase tracking-widest">Sınıf: {student.grade}</span>
              </div>
            </div>
            
            <div className="space-y-3 pt-6 border-t border-slate-50 relative z-10">
              <div className="flex items-center gap-3 text-sm text-slate-400 group-hover:text-slate-600 transition-colors">
                <span className="text-lg">📧</span>
                <span className="font-medium truncate">{student.email || 'İletişim yok'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400 group-hover:text-slate-600 transition-colors">
                <span className="text-lg">📞</span>
                <span className="font-medium">{student.phone || 'Telefon yok'}</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-32 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-slate-400 italic font-medium">Bu kriterlere uygun öğrenci kaydı bulunamadı.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Yeni Kayıt</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Adı Soyadı</label>
                <input 
                  type="text" required
                  placeholder="Öğrenci Adı"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-3 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold shadow-sm"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Okul No</label>
                  <input 
                    type="text" required
                    placeholder="2023..."
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-3 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold shadow-sm"
                    value={newStudent.studentNumber}
                    onChange={(e) => setNewStudent({...newStudent, studentNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Sınıf</label>
                  <input 
                    type="text" required
                    placeholder="11-A"
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-3 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold shadow-sm"
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent({...newStudent, grade: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all font-black uppercase tracking-widest text-[10px]"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-100 disabled:opacity-50"
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
