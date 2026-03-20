import React, { useState } from 'react';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { processFileToBook } from '../services/conversionService';
import { Book } from '../types';

interface ImporterProps {
  onConversionComplete: (book: Book) => void;
  onCancel: () => void;
}

export const Importer: React.FC<ImporterProps> = ({ onConversionComplete, onCancel }) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = ['application/pdf', 'text/plain', 'text/markdown'];
      const fileName = selectedFile.name.toLowerCase();
      
      if (validTypes.includes(selectedFile.type) || fileName.endsWith('.md') || fileName.endsWith('.txt')) {
         setFile(selectedFile);
         setErrorMessage('');
      } else {
         setErrorMessage('Please select a valid PDF, Text, or Markdown file.');
      }
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setStatus('processing');
    try {
      const bookData = await processFileToBook(file);
      
      const newBook: Book = {
        id: crypto.randomUUID(),
        title: bookData.title || file.name,
        author: bookData.author || 'Unknown',
        chapters: bookData.chapters || [],
        createdAt: Date.now(),
        bookmarks: [],
        progress: { 
          chapterIndex: 0, 
          scrollPosition: 0, 
          completedChapters: [] 
        },
        coverImage: undefined
      };

      setStatus('success');
      setTimeout(() => {
        onConversionComplete(newBook);
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || "Failed to process file.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl p-8 md:p-12 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-50px] left-[-50px] w-32 h-32 bg-purple-100 rounded-full blur-3xl opacity-50" />

        <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                    <FileText size={18} className="text-white" />
                </div>
                <span className="font-serif font-bold text-xl text-gray-900">Lumina Pub</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Import Book</h2>
            <p className="text-gray-500 mb-8">Convert PDF, Text, or Markdown files to reading format.</p>

            {status === 'idle' && (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 bg-gray-50 transition-colors hover:bg-gray-100 hover:border-indigo-300 group">
                    <input 
                        type="file" 
                        accept=".pdf,.txt,.md" 
                        onChange={handleFileChange}
                        className="hidden" 
                        id="file-upload"
                    />
                    
                    {!file ? (
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                            <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="text-indigo-600" size={32} />
                            </div>
                            <span className="font-medium text-gray-900">Click to upload file</span>
                            <span className="text-sm text-gray-400 mt-1">PDF, TXT, or MD (Max 10MB)</span>
                        </label>
                    ) : (
                        <div className="flex flex-col items-center">
                             <div className="bg-indigo-50 p-4 rounded-full mb-4">
                                <FileText className="text-indigo-600" size={32} />
                            </div>
                            <span className="font-medium text-gray-900 mb-1">{file.name}</span>
                            <span className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            <button 
                                onClick={() => setFile(null)}
                                className="text-red-500 text-sm font-medium mt-4 hover:underline"
                            >
                                Remove
                            </button>
                        </div>
                    )}
                </div>
            )}

            {status === 'processing' && (
                <div className="py-12 flex flex-col items-center">
                    <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900">Converting...</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                        Extracting text and formatting your book as EPUB structure.
                    </p>
                </div>
            )}

            {status === 'success' && (
                <div className="py-12 flex flex-col items-center">
                    <div className="bg-green-100 p-4 rounded-full mb-4">
                        <CheckCircle className="text-green-600" size={48} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Import Complete!</h3>
                    <p className="text-sm text-gray-500 mt-2">Book added to your library.</p>
                </div>
            )}

            {status === 'error' && (
                 <div className="py-8 flex flex-col items-center">
                    <div className="bg-red-100 p-4 rounded-full mb-4">
                        <AlertCircle className="text-red-600" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Import Failed</h3>
                    <p className="text-sm text-red-500 mt-2 max-w-sm mx-auto mb-6">{errorMessage}</p>
                    <button 
                        onClick={() => setStatus('idle')}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}
            
            <div className="mt-8 flex gap-4 justify-center">
                {status === 'idle' && (
                    <>
                        <button 
                            onClick={onCancel}
                            className="px-6 py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConvert}
                            disabled={!file}
                            className={`px-8 py-3 rounded-xl font-medium text-white transition-all shadow-lg shadow-indigo-200 ${
                                file ? 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105' : 'bg-gray-300 cursor-not-allowed'
                            }`}
                        >
                            Convert & Import
                        </button>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};