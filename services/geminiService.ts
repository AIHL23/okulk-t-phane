
import { GoogleGenAI, Type } from "@google/genai";
import { Book, Student, Loan } from "../types";

const getAIInstance = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key eksik! Lütfen VITE_GEMINI_API_KEY tanımlayın.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const extractBookDetailsFromImage = async (base64Image: string) => {
  try {
    const ai = getAIInstance();
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          {
            text: "Bu bir kitap kapağıdır. Kitabın başlığını, yazarını, varsa ISBN numarasını, yayınevini ve kategorisini JSON formatında ver."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            isbn: { type: Type.STRING },
            publisher: { type: Type.STRING },
            category: { type: Type.STRING },
            pageCount: { type: Type.NUMBER }
          },
          required: ["title"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Kitap Analiz Hatası:", error);
    return null;
  }
};

export const getLibraryInsights = async (books: Book[], students: Student[], loans: Loan[]) => {
  try {
    const ai = getAIInstance();
    const activeLoans = loans.filter(l => l.status === 'Active').length;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Kütüphane Durumu: ${books.length} kitap var. ${students.length} öğrenci kayıtlı. ${activeLoans} kitap şu an öğrencilerde. Profesyonel ve teşvik edici bir dille kısa bir analiz yapar mısın?`,
    });
    return response.text;
  } catch (error) {
    return "Analiz şu an yapılamıyor, lütfen sonra tekrar deneyin.";
  }
};
