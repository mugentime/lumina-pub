# Lumina Pub

Lumina Pub is an elegant reading application designed for a seamless personal library experience. It supports Text, Markdown, and PDF documents with advanced parsing heuristics to reconstruct chapters and paragraphs from raw content.

## Features

- **Advanced PDF Parsing**: Heuristics-based extraction that detects chapter titles, font sizes, and paragraph structures.
- **Elegant Reader UI**: Customizable reading experience with multiple themes (Light, Sepia, Dark) and font size controls.
- **Library Management**: Import and manage your personal collection of documents locally.
- **Bookmarks & Progress**: Save your spot with custom-labeled bookmarks and track your reading progress across chapters.
- **Responsive Design**: Optimized for both desktop and mobile reading.

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)
- **PDF Parsing**: PDF.js
- **EPUB Generation**: JSZip (for future exports)
- **Build Tool**: Vite

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository or download the source code.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

### Building for Production

To create a production-ready build:
```bash
npm run build
```
The output will be in the `dist/` directory.

## License

MIT License
