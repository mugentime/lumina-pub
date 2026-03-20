# 📚 Lumina Pub

Lumina Pub is a modern, local-first personal library and reader for PDFs and EPUBs. Built with privacy in mind, it allows you to manage and read your documents directly in the browser while optionally leveraging the Google Gemini API for smart, contextual reading features.

## ✨ Features (Current & Planned)

- **Local Parsing:** Read PDFs and EPUBs natively in the browser without uploading your personal files to a server.
- **Smart Reading:** Select text to summarize, translate, or explain concepts using the Gemini API.
- **Modern UI:** A clean, distraction-free interface built with React.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite
- **AI Integration:** Google Gemini API (`@google/genai`)
- **Document Parsing:** (Evaluating `pdfjs-dist` and `epub.js`)

## 🚀 Getting Started

Follow these steps to run Lumina Pub locally on your machine.

### Prerequisites

- Node.js (v18 or higher recommended)
- A valid Google Gemini API Key

### Installation

1. **Clone the repository:**
   git clone https://github.com/mugentime/lumina-pub.git
   cd lumina-pub

2. **Install dependencies:**
   npm install

3. **Set up your environment variables:**
   Create a `.env.local` file in the root directory and add your Gemini API key:

   VITE_GEMINI_API_KEY=your_api_key_here

4. **Start the development server:**
   npm run dev

   The app will typically be available at `http://localhost:5173`.

## 🤝 Contributing & Ideas

Lumina Pub is currently in active development. If you are a developer looking to contribute or propose new features, please check out our [Brainstorming Document](BRAINSTORM.md) to see what we are currently discussing, or open an issue!
