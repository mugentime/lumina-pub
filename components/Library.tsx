import React from 'react';
import { Book } from '../types';
import { BookOpen, Trash2, Plus, Clock, CheckCircle2, Download } from 'lucide-react';
import { generateEpub } from '../services/epubGenerator';

interface LibraryProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onDeleteBook: (id: string) => void;
  onNavigateImport: () => void;
}

export const Library: React.FC<LibraryProps> = ({ books, onSelectBook, onDeleteBook, onNavigateImport }) => {

  const handleDownloadEpub = async (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    try {
      const blob = await generateEpub(book);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.epub`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate EPUB", err);
      alert("Failed to generate EPUB file.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="bg-gray-900 p-2 rounded-xl">
            <BookOpen size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-1">Lumina Pub</h1>
            <p className="text-gray-500">Your personal digital library</p>
          </div>
        </div>
        <button
          onClick={onNavigateImport}
          className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          <span>Add Book</span>
        </button>
      </div>

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
          <div className="bg-gray-50 p-6 rounded-full mb-6">
            <BookOpen size={48} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Your library is empty</h3>
          <p className="text-gray-500 max-w-md mb-8">
            Upload a PDF, Text, or Markdown file to add it to your personal library.
          </p>
          <button
            onClick={onNavigateImport}
            className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
          >
            Start reading now &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {books.map((book) => {
            const completedCount = book.progress.completedChapters?.length || 0;
            const totalCount = book.chapters.length;
            const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            
            return (
              <div 
                key={book.id} 
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-[340px]"
              >
                {/* Cover Mockup */}
                <div 
                  className="h-40 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 flex flex-col justify-center items-center text-center cursor-pointer relative"
                  onClick={() => onSelectBook(book)}
                >
                   {book.coverImage ? (
                     <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover opacity-80" />
                   ) : (
                     <>
                        <BookOpen size={32} className="text-indigo-200 mb-2" />
                        <h3 className="font-serif font-bold text-gray-800 line-clamp-2 px-4 text-lg leading-tight">
                          {book.title}
                        </h3>
                     </>
                   )}
                   <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all" />
                </div>

                {/* Book Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider text-xs mb-1">
                      {book.author}
                    </p>
                    <h4 className="font-medium text-gray-900 line-clamp-1 mb-2" title={book.title}>
                      {book.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>{book.chapters.length} Chapters</span>
                    </div>
                  </div>

                  {/* Progress Bar & Actions */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                      <div 
                        className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-1">
                       <div className="text-xs text-gray-400">
                          {percent > 0 ? (
                            <span className="text-indigo-600 font-medium flex items-center gap-1">
                              {percent === 100 && <CheckCircle2 size={12} />}
                              {percent}% Read
                            </span>
                          ) : (
                            "New"
                          )}
                       </div>
                       
                       <div className="flex gap-1">
                         <button
                          onClick={(e) => handleDownloadEpub(e, book)}
                          className="text-gray-300 hover:text-indigo-600 transition-colors p-1"
                          title="Download as EPUB"
                         >
                           <Download size={16} />
                         </button>
                         <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if(window.confirm('Delete this book?')) onDeleteBook(book.id);
                          }}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                          title="Delete book"
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};