
import { Book, Student, Loan } from '../types';

/**
 * EMAİHL BULUT VERİ SERVİSİ (Vercel API & MongoDB Native Driver)
 * Bu servis, Vercel üzerinden güvenli bir şekilde MongoDB Atlas'a bağlanır.
 */

const mongoRequest = async (action: string, collection: string, body: any) => {
  const response = await fetch('/api/mongo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      collection,
      body
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("MongoDB API Hatası:", errorData);
    throw new Error(`API_ERROR: ${response.status}`);
  }

  return await response.json();
};

export const storageService = {
  getBooks: async (): Promise<Book[]> => {
    try {
      const res = await mongoRequest('find', 'books', {});
      return res.documents || [];
    } catch (e) {
      console.error("Kitaplar getirilemedi:", e);
      return [];
    }
  },
  saveBook: async (book: Book): Promise<void> => {
    await mongoRequest('insertOne', 'books', { document: book });
  },
  deleteBook: async (id: string): Promise<void> => {
    await mongoRequest('deleteOne', 'books', { filter: { id } });
  },
  getStudents: async (): Promise<Student[]> => {
    try {
      const res = await mongoRequest('find', 'students', {});
      return res.documents || [];
    } catch (e) {
      console.error("Öğrenciler getirilemedi:", e);
      return [];
    }
  },
  saveStudent: async (student: Student): Promise<void> => {
    await mongoRequest('insertOne', 'students', { document: student });
  },
  deleteStudent: async (id: string): Promise<void> => {
    await mongoRequest('deleteOne', 'students', { filter: { id } });
  },
  getLoans: async (): Promise<Loan[]> => {
    try {
      const res = await mongoRequest('find', 'loans', {});
      return res.documents || [];
    } catch (e) {
      console.error("Ödünç listesi getirilemedi:", e);
      return [];
    }
  },
  saveLoan: async (loan: Loan): Promise<void> => {
    await mongoRequest('insertOne', 'loans', { document: loan });
  },
  updateLoan: async (loan: Loan): Promise<void> => {
    await mongoRequest('updateOne', 'loans', {
      filter: { id: loan.id },
      update: { 
        $set: { 
          status: loan.status, 
          returnDate: loan.returnDate 
        } 
      }
    });
  },
  init: async () => {
    console.log("EMAİHL Bulut Sistemi (Serverless) Başlatıldı...");
  }
};
