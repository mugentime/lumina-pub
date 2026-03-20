import React, { useState, useEffect, useRef } from 'react';
import { Book, Bookmark } from '../types';
import { ArrowLeft, Settings, ChevronLeft, ChevronRight, Menu, CheckCircle, Circle, Bookmark as BookmarkIcon, List, Trash2, X, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReaderProps {
  book: Book;
  onBack: () => void;
  onUpdateProgress: (progress: Book['progress']) => void;
  onUpdateBookmarks: (bookmarks: Bookmark[]) => void;
}

export const Reader: React.FC<ReaderProps> = ({ book, onBack, onUpdateProgress, onUpdateBookmarks }) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(book.progress.chapterIndex);
  const [completedChapters, setCompletedChapters] = useState<number[]>(book.progress.completedChapters || []);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(book.bookmarks || []);
  
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('sepia');
  const [showControls, setShowControls] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'toc' | 'bookmarks'>('toc');
  
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [pendingBookmarkLabel, setPendingBookmarkLabel] = useState('');
  
  // Used to handle programmatic scrolling after state updates
  const [targetScroll, setTargetScroll] = useState<number | null>(null);
  
  const contentRef = useRef<HTMLDivElement>(null);

  const currentChapter = book.chapters[currentChapterIndex];
  const isCurrentChapterRead = completedChapters.includes(currentChapterIndex);

  // Initial scroll restoration and scroll syncing after navigation/bookmarks
  useEffect(() => {
     if (targetScroll !== null) {
         setTimeout(() => {
             window.scrollTo(0, targetScroll);
         }, 100);
         setTargetScroll(null);
     } else if (currentChapterIndex === book.progress.chapterIndex) {
         // If we are just opening the book or normal nav, restore saved progress
         setTimeout(() => {
             window.scrollTo(0, book.progress.scrollPosition);
         }, 100);
     } else {
         window.scrollTo(0, 0);
     }
  }, [currentChapterIndex, targetScroll]);

  // Sync scroll position to parent for persistence
  useEffect(() => {
      const handleScroll = () => {
          onUpdateProgress({
            chapterIndex: currentChapterIndex,
            scrollPosition: window.scrollY,
            completedChapters
          });
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
  }, [currentChapterIndex, completedChapters, onUpdateProgress]);

  const markChapterAsRead = (index: number) => {
    if (!completedChapters.includes(index)) {
      const newCompleted = [...completedChapters, index];
      setCompletedChapters(newCompleted);
      onUpdateProgress({
        chapterIndex: currentChapterIndex,
        scrollPosition: window.scrollY,
        completedChapters: newCompleted
      });
    }
  };

  const handleNextChapter = () => {
    markChapterAsRead(currentChapterIndex);
    if (currentChapterIndex < book.chapters.length - 1) {
      setCurrentChapterIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleAddBookmark = () => {
      const defaultLabel = `${currentChapter.title} - ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
      setPendingBookmarkLabel(defaultLabel);
      setIsBookmarkModalOpen(true);
  };

  const confirmAddBookmark = () => {
      const newBookmark: Bookmark = {
          id: crypto.randomUUID(),
          chapterIndex: currentChapterIndex,
          scrollPosition: window.scrollY,
          label: pendingBookmarkLabel.trim() || `${currentChapter.title} - ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
          createdAt: Date.now()
      };
      
      const updatedBookmarks = [newBookmark, ...bookmarks];
      setBookmarks(updatedBookmarks);
      onUpdateBookmarks(updatedBookmarks);
      setIsBookmarkModalOpen(false);
      setPendingBookmarkLabel('');
  };

  const handleRemoveBookmark = (id: string) => {
      const updatedBookmarks = bookmarks.filter(b => b.id !== id);
      setBookmarks(updatedBookmarks);
      onUpdateBookmarks(updatedBookmarks);
  };

  const handleJumpToBookmark = (bm: Bookmark) => {
      setTargetScroll(bm.scrollPosition);
      if (bm.chapterIndex !== currentChapterIndex) {
          setCurrentChapterIndex(bm.chapterIndex);
      } else {
          // Same chapter, force scroll effect manually if needed or let effect run (deps on targetScroll)
          setTimeout(() => window.scrollTo(0, bm.scrollPosition), 100);
      }
      setShowSidebar(false);
  };

  const toggleControls = () => {
    setShowControls(prev => !prev);
  };

  const getThemeColors = () => {
    switch(theme) {
      case 'dark': return 'bg-gray-900 text-gray-300';
      case 'sepia': return 'bg-paper-dark text-ink';
      default: return 'bg-white text-gray-900';
    }
  };

  // Calculate overall progress
  const progressPercent = Math.round((completedChapters.length / book.chapters.length) * 100);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${getThemeColors()} font-serif`}>
      {/* Sticky Header */}
      <div 
        className={`fixed top-0 left-0 right-0 p-4 flex flex-col justify-center transition-transform duration-300 z-50 ${
          showControls ? 'translate-y-0' : '-translate-y-full'
        } ${theme === 'dark' ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}
      >
        <div className="flex justify-between items-center w-full max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100/10 transition-colors">
                    <ArrowLeft size={20} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} />
                </button>
                <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 rounded-full hover:bg-gray-100/10 transition-colors">
                    <Menu size={20} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} />
                </button>
                <div className="hidden md:block">
                     <h2 className="font-sans font-medium text-sm truncate max-w-[200px]">{book.title}</h2>
                     <div className="w-32 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                     </div>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={handleAddBookmark}
                    className="p-2 rounded-full hover:bg-gray-100/10 transition-colors text-indigo-500"
                    title="Add Bookmark"
                >
                    <BookmarkIcon size={22} fill={theme === 'dark' ? 'none' : 'currentColor'} className="text-indigo-500" />
                </button>

                <div className="flex items-center gap-2 bg-gray-100/10 rounded-full p-1 border border-gray-200/20">
                    <button 
                        onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-500/10 font-sans text-sm"
                    >
                        A-
                    </button>
                    <span className="text-xs font-sans w-4 text-center">{fontSize}</span>
                    <button 
                        onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-500/10 font-sans text-lg"
                    >
                        A+
                    </button>
                </div>
                
                <div className="flex items-center gap-1">
                    <button onClick={() => setTheme('light')} className={`w-6 h-6 rounded-full border border-gray-300 bg-white ${theme === 'light' ? 'ring-2 ring-indigo-500' : ''}`} />
                    <button onClick={() => setTheme('sepia')} className={`w-6 h-6 rounded-full border border-orange-200 bg-[#eaddcf] ${theme === 'sepia' ? 'ring-2 ring-indigo-500' : ''}`} />
                    <button onClick={() => setTheme('dark')} className={`w-6 h-6 rounded-full border border-gray-700 bg-gray-900 ${theme === 'dark' ? 'ring-2 ring-indigo-500' : ''}`} />
                </div>
            </div>
        </div>
      </div>

      {/* Sidebar (TOC & Bookmarks) */}
      {showSidebar && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowSidebar(false)}>
            <div 
                className={`absolute left-0 top-0 bottom-0 w-80 max-w-[85%] ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} shadow-2xl overflow-hidden flex flex-col`}
                onClick={e => e.stopPropagation()}
            >
                {/* Sidebar Header/Tabs */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/10">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-500 p-1 rounded-md">
                            <BookOpen size={12} className="text-white" />
                        </div>
                        <span className="text-xs font-serif font-bold uppercase tracking-widest">Lumina Pub</span>
                    </div>
                    <button onClick={() => setShowSidebar(false)} className="p-2 hover:bg-gray-500/10 rounded-full transition-colors">
                        <X size={16} />
                    </button>
                </div>
                <div className="flex border-b border-gray-200/20 relative">
                    <button 
                        onClick={() => setSidebarTab('toc')}
                        className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-sans font-medium transition-all relative ${
                            sidebarTab === 'toc' ? 'text-indigo-500' : 'text-gray-500 hover:text-gray-400'
                        }`}
                    >
                        <List size={16} />
                        Chapters
                        {sidebarTab === 'toc' && (
                            <motion.div 
                                layoutId="activeSidebarTab" 
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" 
                            />
                        )}
                    </button>
                    <button 
                        onClick={() => setSidebarTab('bookmarks')}
                        className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-sans font-medium transition-all relative ${
                            sidebarTab === 'bookmarks' ? 'text-indigo-500' : 'text-gray-500 hover:text-gray-400'
                        }`}
                    >
                        <BookmarkIcon size={16} />
                        Bookmarks
                        {sidebarTab === 'bookmarks' && (
                            <motion.div 
                                layoutId="activeSidebarTab" 
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" 
                            />
                        )}
                    </button>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {sidebarTab === 'toc' ? (
                            <motion.div 
                                key="toc"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className="p-6"
                            >
                                <ul className="space-y-4">
                                    {book.chapters.map((chap, idx) => {
                                        const isRead = completedChapters.includes(idx);
                                        return (
                                            <li key={idx} className="flex items-start gap-3">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isRead) {
                                                            const newCompleted = completedChapters.filter(c => c !== idx);
                                                            setCompletedChapters(newCompleted);
                                                            onUpdateProgress({ ...book.progress, completedChapters: newCompleted });
                                                        } else {
                                                            markChapterAsRead(idx);
                                                        }
                                                    }}
                                                    className={`mt-1 flex-shrink-0 hover:opacity-80 transition-opacity ${isRead ? 'text-green-500' : 'text-gray-300'}`}
                                                >
                                                    {isRead ? <CheckCircle size={16} /> : <Circle size={16} />}
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setCurrentChapterIndex(idx);
                                                        setShowSidebar(false);
                                                        window.scrollTo(0,0);
                                                    }}
                                                    className={`text-left w-full hover:text-indigo-500 transition-colors ${currentChapterIndex === idx ? 'text-indigo-500 font-bold' : ''}`}
                                                >
                                                    {chap.title}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="bookmarks"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="p-6"
                            >
                                <div className="space-y-4">
                                    {bookmarks.length === 0 ? (
                                        <div className="text-center text-gray-500 py-10">
                                            <BookmarkIcon className="mx-auto mb-3 opacity-30" size={32} />
                                            <p>No bookmarks yet.</p>
                                            <p className="text-xs mt-1">Tap the bookmark icon in the top right to save your spot.</p>
                                        </div>
                                    ) : (
                                        <ul className="space-y-4">
                                            {bookmarks.map((bm) => (
                                                <li key={bm.id} className="group flex items-start justify-between gap-2 p-3 rounded-lg hover:bg-gray-100/10 border border-transparent hover:border-gray-200/20">
                                                    <button 
                                                        onClick={() => handleJumpToBookmark(bm)}
                                                        className="text-left flex-1"
                                                    >
                                                        <div className="text-sm font-bold font-serif mb-1">{bm.label}</div>
                                                        <div className="text-xs text-gray-400">
                                                            {new Date(bm.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleRemoveBookmark(bm.id); }}
                                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
      )}

      {/* Bookmark Label Modal */}
      {isBookmarkModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div 
                className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} border w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200`}
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-xl font-sans font-bold mb-4">Add Bookmark</h3>
                <p className="text-sm opacity-60 mb-4 font-sans">Enter a label for this bookmark to help you find it later.</p>
                
                <input 
                    autoFocus
                    type="text"
                    value={pendingBookmarkLabel}
                    onChange={(e) => setPendingBookmarkLabel(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') confirmAddBookmark();
                        if (e.key === 'Escape') setIsBookmarkModalOpen(false);
                    }}
                    placeholder="Bookmark label..."
                    className={`w-full p-3 rounded-xl border mb-6 font-sans outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                        theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                />
                
                <div className="flex gap-3 justify-end font-sans">
                    <button 
                        onClick={() => setIsBookmarkModalOpen(false)}
                        className={`px-4 py-2 rounded-lg hover:bg-gray-500/10 transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmAddBookmark}
                        className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        Save Bookmark
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Main Content */}
      <div 
        className="max-w-2xl mx-auto px-6 py-24 md:px-12 min-h-screen cursor-text"
        onClick={toggleControls}
      >
        <div className="mb-12 text-center">
             <h3 className="font-sans text-xs uppercase tracking-widest opacity-50 mb-2">Chapter {currentChapterIndex + 1}</h3>
             <h1 className="text-3xl md:text-4xl font-bold">{currentChapter.title}</h1>
        </div>

        <div 
            ref={contentRef}
            style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
            className="prose prose-lg max-w-none prose-p:mb-6 prose-p:indent-0"
            dangerouslySetInnerHTML={{ __html: currentChapter.content }} 
        />
        
        {/* Chapter Actions */}
        <div className="mt-16 mb-8 flex justify-center">
             <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (isCurrentChapterRead) {
                        const newCompleted = completedChapters.filter(c => c !== currentChapterIndex);
                        setCompletedChapters(newCompleted);
                        onUpdateProgress({ ...book.progress, completedChapters: newCompleted });
                    } else {
                        markChapterAsRead(currentChapterIndex);
                    }
                }}
                className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-all ${
                    isCurrentChapterRead 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-transparent border-gray-300 hover:border-indigo-500 hover:text-indigo-500 opacity-60 hover:opacity-100'
                }`}
             >
                {isCurrentChapterRead ? (
                    <>
                        <CheckCircle size={18} />
                        <span className="font-sans text-sm font-medium">Read</span>
                    </>
                ) : (
                    <>
                        <Circle size={18} />
                        <span className="font-sans text-sm font-medium">Mark as Read</span>
                    </>
                )}
             </button>
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between items-center pt-10 border-t border-gray-200/20 font-sans">
            <button 
                onClick={(e) => { e.stopPropagation(); handlePrevChapter(); }}
                disabled={currentChapterIndex === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentChapterIndex === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-gray-500/10'}`}
            >
                <ChevronLeft size={20} />
                Previous
            </button>
            <div className="text-sm opacity-50">
                {currentChapterIndex + 1} / {book.chapters.length}
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); handleNextChapter(); }}
                disabled={currentChapterIndex === book.chapters.length - 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentChapterIndex === book.chapters.length - 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-gray-500/10'}`}
            >
                Next
                <ChevronRight size={20} />
            </button>
        </div>
      </div>
    </div>
  );
};