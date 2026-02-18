
import React, { useState, useEffect, useRef } from 'react';
import { Book, Student, Loan } from '../types';
import { GoogleGenAI } from "@google/genai";

interface AIAssistantProps {
  books: Book[];
  students: Student[];
  loans: Loan[];
  onBack: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ books, students, loans, onBack }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Selamün Aleyküm! Ben EMAİHL Kütüphane Akıllı Rehberi. Bulut verilerinize bağlandım. Size nasıl yardımcı olabilirim?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API_KEY_MISSING");
      
      const ai = new GoogleGenAI({ apiKey });
      
      const context = `
        Kütüphane İstatistikleri:
        - Kayıtlı Kitap: ${books.length}
        - Kayıtlı Öğrenci: ${students.length}
        - Ödünç Verilenler: ${loans.filter(l => l.status === 'Active').length}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `${context}\n\nKullanıcı sorusu: ${userMessage}\n\nYanıtı EMAİHL kütüphane asistanı olarak, nazik ve bilgilendirici bir dille ver.`,
      });

      setMessages(prev => [...prev, { role: 'ai', text: response.text || 'Maalesef yanıt oluşturulamadı.' }]);
    } catch (error) {
      console.error("Gemini Hatası:", error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Üzgünüm, şu an bağlantı kuramıyorum. Lütfen API anahtarınızı kontrol edin.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-slate-900 p-6 text-white flex items-center justify-between shadow-lg relative z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white">←</button>
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-white/10">🤖</div>
          <div>
            <h3 className="font-bold">Akıllı Rehber</h3>
            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest font-mono">Veri Merkezi Bağlı</p>
          </div>
        </div>
        <div className="hidden md:block">
          <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gemini 3 Flash</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-[28px] ${
              msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none shadow-md' : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white p-5 rounded-3xl rounded-tl-none shadow-sm border border-slate-100 flex gap-2 items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Yanıt Hazırlanıyor...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-100 flex gap-4">
        <input 
          type="text" 
          placeholder="Merak ettiğiniz bir şeyi sorun..."
          className="flex-1 bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-emerald-500 transition-all font-medium"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={!input.trim() || isTyping} className="bg-slate-900 hover:bg-black text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all disabled:opacity-50">
          <span className="text-xl">➔</span>
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
