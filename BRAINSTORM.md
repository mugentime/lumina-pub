# 💡 Lumina Pub: Brainstorming & Ideas

**Welcome!** This document is our sandbox. Nothing here is a strict commitment yet. If you have an idea for a feature, a library we should use, or a wild AI integration, drop it in the relevant section below. 

Feel free to add your name `[YourName]` next to your ideas so we know who to tag in discussions!

---

## 📖 1. The Core Vision: What is Lumina Pub?
*Is this a local-only offline reader? A cloud-synced personal library? A smart-reader built around AI?*

+++ Local...? 

* **Idea:** A purely local, privacy-first web reader where your PDFs and EPUBs never leave your browser, but we use an API key just for the "smart" features. `[kiddhex]`
* **Idea:** ... si pues cuál sería la mejor forma de usar un servidor local?

## 📚 2. The Reading Experience (PDF & EPUB)
*Handling heavy documents in the browser is tricky. How do we make the reading experience buttery smooth?*

* **Parsers:** What are we thinking for the heavy lifting? 
    * *EPUB:* `epub.js` is the standard, but are there lighter modern alternatives?
    * *PDF:* `pdfjs-dist` (Mozilla) is powerful but heavy. Do we need full rendering or just text extraction?
* **UI/UX:**
    * Dark mode is a must. What about custom fonts, adjustable spacing, and a distraction-free mode?
    * Should we build a dynamic grid/gallery for the library view? 
* **Idea:** ... si, creo que hacer un front muy original y dinámico, que contraste con los readers que existen, estaría chido.

## 🤖 3. The AI Angle (Gemini Integration)
*Since the repo started from the AI Studio template, how do we best use the Gemini API without making it feel like a cheap gimmick?* se supone que no tiene interacción con gemini.

* **Contextual Chat:** A sidebar where you can "talk" to the specific book you are reading. (e.g., "Summarize this chapter," or "Explain this concept like I'm 5"). eso está chingon. un compañero de lectura

* **Auto-Tagging:** Automatically generating tags, genres, and summaries when a new book is imported. si
* **Translation:** Highlighting a difficult paragraph and having Gemini translate or simplify it inline.
* **Idea:** ...

## 🛠️ 4. Tech Stack & Architecture
*Currently sitting on Vite + TypeScript + React (from the template). What's the plan for state and storage?*

* **Storage:** `IndexedDB` (via something like `localforage` or `Dexie.js`) seems like the only logical way to store massive PDF/EPUB blobs locally without crashing the browser. Thoughts?
* **State Management:** Zustand? Redux? Context API?
* **Styling:** Tailwind CSS? Or keep it raw and custom?
* **Idea:** ...

## 🚀 5. The "Wild Ideas / Maybe Someday" List
*No bad ideas here. What would make this the ultimate reading app?*

* **Idea:** Syncing reading progress across devices via a lightweight peer-to-peer connection (WebRTC) so we don't need a database.
* **Idea:** Text-to-speech using browser APIs for an "audiobook" mode.
* **Idea:** ...muy valioso tener un modo de audiolibro. 

---
**How to contribute:** Just make a PR to this file or edit it directly if you have access. If an idea sparks a serious technical requirement, we'll move it over to the official `TODO.md` or GitHub Issues.
