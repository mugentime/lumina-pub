import { Book } from '../types';

declare global {
  interface Window {
    JSZip: any;
  }
}

export const generateEpub = async (book: Book): Promise<Blob> => {
  if (!window.JSZip) {
    throw new Error('JSZip library not loaded');
  }

  const zip = new window.JSZip();

  // 1. Mimetype file (must be first, uncompressed)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2. META-INF/container.xml
  zip.folder('META-INF').file(
    'container.xml',
    `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
   <rootfiles>
      <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
   </rootfiles>
</container>`
  );

  // 3. OEBPS folder structure
  const oebps = zip.folder('OEBPS');

  // Generate unique IDs
  const uniqueId = `urn:uuid:${book.id}`;
  const timestamp = new Date().toISOString();

  // Create HTML files for each chapter
  let manifestItems = '';
  let spineRefs = '';
  let navPoints = '';

  book.chapters.forEach((chapter, index) => {
    const fileName = `chapter_${index + 1}.xhtml`;
    const fileId = `chap${index + 1}`;

    // Minimal valid XHTML for EPUB
    const xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
<title>${chapter.title}</title>
<style>
body { font-family: serif; line-height: 1.5; margin: 5%; }
p { margin-bottom: 1em; text-indent: 1em; }
</style>
</head>
<body>
<h2>${chapter.title}</h2>
${chapter.content}
</body>
</html>`;

    oebps.file(fileName, xhtml);

    // Add to manifest
    manifestItems += `<item id="${fileId}" href="${fileName}" media-type="application/xhtml+xml" />\n`;
    // Add to spine
    spineRefs += `<itemref idref="${fileId}" />\n`;
    // Add to NCX
    navPoints += `
    <navPoint id="navPoint-${index + 1}" playOrder="${index + 1}">
      <navLabel><text>${chapter.title}</text></navLabel>
      <content src="${fileName}"/>
    </navPoint>`;
  });

  // 4. Content.opf
  const opfContent = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
   <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
      <dc:title>${book.title}</dc:title>
      <dc:creator opf:role="aut">${book.author}</dc:creator>
      <dc:language>en</dc:language>
      <dc:identifier id="BookId" opf:scheme="UUID">${uniqueId}</dc:identifier>
      <dc:date>${timestamp}</dc:date>
   </metadata>
   <manifest>
      <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
      ${manifestItems}
   </manifest>
   <spine toc="ncx">
      ${spineRefs}
   </spine>
</package>`;

  oebps.file('content.opf', opfContent);

  // 5. TOC.ncx (for navigation)
  const ncxContent = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
   <head>
      <meta name="dtb:uid" content="${uniqueId}"/>
      <meta name="dtb:depth" content="1"/>
      <meta name="dtb:totalPageCount" content="0"/>
      <meta name="dtb:maxPageNumber" content="0"/>
   </head>
   <docTitle><text>${book.title}</text></docTitle>
   <navMap>
      ${navPoints}
   </navMap>
</ncx>`;

  oebps.file('toc.ncx', ncxContent);

  // Generate blob
  return await zip.generateAsync({ type: 'blob' });
};
