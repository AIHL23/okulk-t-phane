
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  addedDate: string;
  publisher: string;
  pageCount: number;
  status: 'Available' | 'Loaned';
}

export interface Student {
  id: string;
  name: string;
  studentNumber: string;
  grade: string;
  email: string;
  phone: string;
}

export interface Loan {
  id: string;
  bookId: string;
  studentId: string;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'Active' | 'Returned' | 'Overdue';
}

export type View = 'dashboard' | 'books' | 'students' | 'loans' | 'ai-assistant';
