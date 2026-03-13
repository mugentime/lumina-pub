import { Book, Chapter } from '../types';

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export const processFileToBook = async (file: File): Promise<Partial<Book>> => {
  const fileName = file.name;
  const fileType = file.type;

  // Handle Text and Markdown files
  if (fileType === 'text/plain' || fileName.endsWith('.md') || fileName.endsWith('.txt')) {
    const text = await file.text();
    const formattedContent = text
      .split('\n\n')
      .map(para => `<p>${para.trim()}</p>`)
      .join('');

    return {
      title: fileName.replace(/\.(txt|md)$/i, ''),
      author: 'Local Document',
      chapters: [
        {
          title: 'Document Content',
          content: formattedContent || '<p><em>Empty file</em></p>'
        }
      ]
    };
  }

  // Real Client-Side PDF Extraction
  if (fileType === 'application/pdf') {
    return await extractPdfContent(file);
  }

  throw new Error("Unsupported file type");
};

const extractPdfContent = async (file: File): Promise<Partial<Book>> => {
  if (!window.pdfjsLib) {
    throw new Error("PDF parser library not loaded. Please check your internet connection.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  let fullText = "";
  const chapters: Chapter[] = [];
  let currentChapterContent = "";
  let currentChapterTitle = "Start of Book";

  // Configuration for heuristics
  const PAGES_PER_CHAPTER = 20; // Fallback: split every 20 pages if no headers found
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Simple heuristic to reconstruct paragraphs from lines
    let pageText = "";
    let lastY = -1;
    
    // Sort items by vertical position (top to bottom) then horizontal
    const items = textContent.items.sort((a: any, b: any) => {
        if (Math.abs(a.transform[5] - b.transform[5]) > 5) {
            return b.transform[5] - a.transform[5]; // Top to bottom
        }
        return a.transform[4] - b.transform[4]; // Left to right
    });

    for (const item of items) {
       const text = item.str;
       if (!text.trim()) continue;

       // Check for vertical gap implying new paragraph
       if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 12) {
           pageText += "\n"; 
       } else if (pageText.length > 0 && !pageText.endsWith(" ") && !pageText.endsWith("\n")) {
           pageText += " ";
       }
       
       pageText += text;
       lastY = item.transform[5];
    }

    // Wrap page text in paragraphs
    const paragraphs = pageText.split('\n').filter(p => p.trim().length > 0);
    const htmlContent = paragraphs.map(p => `<p>${p}</p>`).join('');
    
    currentChapterContent += htmlContent;

    // Split logic: Arbitrary chunking to prevent massive DOM nodes
    // In a real reader, we might look for "Chapter" regex in the text
    if (pageNum % PAGES_PER_CHAPTER === 0 || pageNum === pdf.numPages) {
        chapters.push({
            title: currentChapterTitle + (chapters.length > 0 ? ` (Part ${chapters.length + 1})` : ''),
            content: currentChapterContent
        });
        currentChapterContent = "";
        currentChapterTitle = `Part ${chapters.length + 1}`;
    }
  }

  // If the PDF is small (fewer than PAGES_PER_CHAPTER), push what we have
  if (chapters.length === 0 && currentChapterContent.length > 0) {
      chapters.push({
          title: "Full Text",
          content: currentChapterContent
      });
  }

  return {
    title: file.name.replace('.pdf', ''),
    author: 'Imported PDF',
    chapters: chapters
  };
};