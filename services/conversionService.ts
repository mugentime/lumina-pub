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

  const chapters: Chapter[] = [];
  let currentChapterContent = "";
  let currentChapterTitle = "Front Matter";
  
  // Statistics for heuristics
  let bodyFontSize = 12;
  const fontSizeCounts = new Map<number, number>();

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });
    
    const items = textContent.items
      .filter((item: any) => 'str' in item && item.str.trim().length > 0)
      .map((item: any) => ({
        text: item.str,
        x: item.transform[4],
        y: item.transform[5],
        size: Math.abs(item.transform[3]),
        font: item.fontName || '',
        width: item.width
      }));

    if (items.length === 0) continue;

    // Sort items: Top to bottom (descending Y), then Left to right (ascending X)
    items.sort((a: any, b: any) => {
      if (Math.abs(a.y - b.y) > 3) return b.y - a.y;
      return a.x - b.x;
    });

    // Group into lines
    const lines: any[][] = [];
    let currentLine: any[] = [];
    let lastY = items[0].y;

    for (const item of items) {
      if (Math.abs(item.y - lastY) > 3) {
        lines.push(currentLine);
        currentLine = [];
        lastY = item.y;
      }
      currentLine.push(item);
    }
    if (currentLine.length > 0) lines.push(currentLine);

    // Update font size statistics to identify body text size
    for (const line of lines) {
      const size = Math.round(line[0].size);
      fontSizeCounts.set(size, (fontSizeCounts.get(size) || 0) + 1);
    }

    // Recalculate body font size (mode)
    let maxCount = 0;
    fontSizeCounts.forEach((count, size) => {
      if (count > maxCount) {
        maxCount = count;
        bodyFontSize = size;
      }
    });

    for (let i = 0; i < lines.length; i++) {
      const lineItems = lines[i];
      const lineText = lineItems.map((it: any) => it.text).join(' ').trim();
      const fontSize = lineItems[0].size;
      const isBold = /bold|black|heavy/i.test(lineItems[0].font);
      
      // Skip potential page numbers or headers/footers
      const isPageNumber = /^\d+$/.test(lineText);
      const isAtEdge = lineItems[0].y < 40 || lineItems[0].y > (viewport.height - 40);
      if (isPageNumber && isAtEdge) continue;

      // Chapter Detection Heuristics
      const isSignificantlyLarger = fontSize > bodyFontSize * 1.25;
      const isChapterKeyword = /^(chapter|section|part|book|prologue|epilogue)\s+(\d+|[ivxlcdm]+)/i.test(lineText);
      const isStandaloneHeader = (isSignificantlyLarger || (isBold && fontSize >= bodyFontSize)) && lineText.length < 80;

      if (isChapterKeyword || isStandaloneHeader) {
        // If we have enough content in the current chapter, or it's the very first one
        if (currentChapterContent.trim().length > 300 || (chapters.length === 0 && currentChapterContent.trim().length > 0)) {
          chapters.push({
            title: currentChapterTitle,
            content: currentChapterContent.endsWith('</p>') ? currentChapterContent : currentChapterContent + '</p>'
          });
          currentChapterContent = "";
          currentChapterTitle = lineText;
          continue;
        } else if (chapters.length === 0 && currentChapterContent.trim().length === 0) {
            // First header found
            currentChapterTitle = lineText;
            continue;
        }
      }

      // Paragraph Detection
      let isNewParagraph = false;
      if (i > 0) {
        const prevLineY = lines[i-1][0].y;
        const gap = Math.abs(lineItems[0].y - prevLineY);
        // If gap is more than 1.5x the font size, it's likely a new paragraph
        if (gap > fontSize * 1.5) {
          isNewParagraph = true;
        }
      } else {
        isNewParagraph = true; // Start of page
      }

      if (isNewParagraph) {
        if (currentChapterContent.length > 0 && !currentChapterContent.endsWith('</p>')) {
          currentChapterContent += '</p>';
        }
        currentChapterContent += `<p>${lineText}`;
      } else {
        // Handle hyphenation at end of line
        if (currentChapterContent.endsWith('-')) {
          currentChapterContent = currentChapterContent.slice(0, -1) + lineText;
        } else {
          currentChapterContent += ' ' + lineText;
        }
      }
    }
    
    // Safety split for extremely long chapters without headers
    if (currentChapterContent.length > 150000) {
       chapters.push({
         title: currentChapterTitle,
         content: currentChapterContent.endsWith('</p>') ? currentChapterContent : currentChapterContent + '</p>'
       });
       currentChapterContent = "";
       currentChapterTitle = `${currentChapterTitle} (cont.)`;
    }
  }

  // Final chapter push
  if (currentChapterContent.trim().length > 0) {
    chapters.push({
      title: currentChapterTitle,
      content: currentChapterContent.endsWith('</p>') ? currentChapterContent : currentChapterContent + '</p>'
    });
  }

  // Fallback if nothing was extracted
  if (chapters.length === 0) {
      chapters.push({
          title: "Full Text",
          content: "<p>No readable content could be extracted from this PDF.</p>"
      });
  }

  return {
    title: file.name.replace(/\.pdf$/i, ''),
    author: 'Imported PDF',
    chapters: chapters
  };
};