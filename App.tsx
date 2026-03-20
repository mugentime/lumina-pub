import React, { useState, useEffect } from 'react';
import { Library } from './components/Library';
import { Reader } from './components/Reader';
import { Importer } from './components/Importer';
import { storageService } from './services/storageService';
import { Book, Bookmark, ViewMode } from './types';

function App() {
  const [view, setView] = useState<ViewMode>(ViewMode.LIBRARY);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [library, setLibrary] = useState<Book[]>([]);

  // Load library on mount
  useEffect(() => {
    const loadedBooks = storageService.getLibrary();
    setLibrary(loadedBooks);
  }, []);

  // Handler for completing a conversion
  const handleImportComplete = (newBook: Book) => {
    storageService.saveBook(newBook);
    setLibrary(storageService.getLibrary());
    setActiveBook(newBook);
    setView(ViewMode.READER);
  };

  const handleSelectBook = (book: Book) => {
    setActiveBook(book);
    setView(ViewMode.READER);
  };

  const handleDeleteBook = (id: string) => {
    storageService.deleteBook(id);
    setLibrary(storageService.getLibrary());
  };

  const handleUpdateProgress = (progress: Book['progress']) => {
    if (activeBook) {
      storageService.updateProgress(activeBook.id, progress);
      // Update local state without full reload
      setActiveBook(prev => prev ? ({
          ...prev, 
          progress
      }) : null);
    }
  };

  const handleUpdateBookmarks = (bookmarks: Bookmark[]) => {
    if (activeBook) {
        storageService.updateBookmarks(activeBook.id, bookmarks);
        // Update local state
        setActiveBook(prev => prev ? ({
            ...prev,
            bookmarks
        }) : null);
    }
  };

  return (
    <div className="antialiased text-gray-900 bg-gray-50 min-h-screen">
      {view === ViewMode.LIBRARY && (
        <Library 
          books={library} 
          onSelectBook={handleSelectBook} 
          onDeleteBook={handleDeleteBook}
          onNavigateImport={() => setView(ViewMode.IMPORTER)}
        />
      )}

      {view === ViewMode.IMPORTER && (
        <Importer 
          onConversionComplete={handleImportComplete}
          onCancel={() => setView(ViewMode.LIBRARY)}
        />
      )}

      {view === ViewMode.READER && activeBook && (
        <Reader 
          book={activeBook} 
          onBack={() => {
              // Refresh library in case progress changed
              setLibrary(storageService.getLibrary());
              setView(ViewMode.LIBRARY);
              setActiveBook(null);
          }}
          onUpdateProgress={handleUpdateProgress}
          onUpdateBookmarks={handleUpdateBookmarks}
        />
      )}
    </div>
  );
}

export default App;