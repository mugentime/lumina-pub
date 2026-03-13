import { Book, Bookmark } from '../types';

const STORAGE_KEY = 'lumina_library_v1';

// Simulating a Redis-like key-value store interface
export const storageService = {
  getLibrary: (): Book[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const books = JSON.parse(data);
      // Migration: Ensure completedChapters and bookmarks exist for older records
      return books.map((b: any) => ({
        ...b,
        bookmarks: b.bookmarks || [], // Migration for bookmarks
        progress: {
          chapterIndex: 0,
          scrollPosition: 0,
          ...b.progress, // overwrite defaults
          completedChapters: b.progress?.completedChapters || []
        }
      }));
    } catch (e) {
      console.error("Failed to load library", e);
      return [];
    }
  },

  saveBook: (book: Book): void => {
    const library = storageService.getLibrary();
    // Check if book exists, update if so
    const existingIndex = library.findIndex(b => b.id === book.id);
    if (existingIndex >= 0) {
      library[existingIndex] = book;
    } else {
      library.unshift(book);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  },

  deleteBook: (bookId: string): void => {
    const library = storageService.getLibrary();
    const newLibrary = library.filter(b => b.id !== bookId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLibrary));
  },

  getBook: (bookId: string): Book | undefined => {
    const library = storageService.getLibrary();
    return library.find(b => b.id === bookId);
  },
  
  updateProgress: (bookId: string, progress: Book['progress']) => {
    const library = storageService.getLibrary();
    const bookIndex = library.findIndex(b => b.id === bookId);
    if (bookIndex >= 0) {
      library[bookIndex].progress = progress;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
    }
  },

  updateBookmarks: (bookId: string, bookmarks: Bookmark[]) => {
    const library = storageService.getLibrary();
    const bookIndex = library.findIndex(b => b.id === bookId);
    if (bookIndex >= 0) {
      library[bookIndex].bookmarks = bookmarks;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
    }
  }
};