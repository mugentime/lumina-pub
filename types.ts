export interface Chapter {
  title: string;
  content: string; // HTML or Markdown content
}

export interface Bookmark {
  id: string;
  chapterIndex: number;
  scrollPosition: number;
  label: string;
  createdAt: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage?: string; // Base64 or URL
  chapters: Chapter[];
  createdAt: number;
  bookmarks: Bookmark[]; // New field for bookmarks
  progress: {
    chapterIndex: number;
    scrollPosition: number;
    completedChapters: number[]; // Indices of chapters marked as read
  };
}

export interface ConversionStatus {
  state: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message?: string;
}

export enum ViewMode {
  LIBRARY = 'LIBRARY',
  READER = 'READER',
  IMPORTER = 'IMPORTER',
}