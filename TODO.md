# Lumina Pub - Project Roadmap

Welcome to the Lumina Pub project! This roadmap outlines the current priorities, structured to help you get familiar with the codebase by starting with simple cleanups before tackling larger features.

## Phase 1: Onboarding & Project Cleanup (Good First Issues)

These tasks are ideal for your first contribution and will help clear out legacy boilerplate from the initial setup.

- [ ] **Remove AI Studio Boilerplate:** Delete the `migrated_prompt_history/` directory.
- [ ] **Clean Up Configs:** Review and remove/update `metadata.json` if it's tied to the old AI Studio template.
- [ ] **Update README.md:** Replace the generic AI Studio instructions with the actual project description, tech stack, and setup instructions for Lumina Pub.

## Phase 2: Core Feature Enhancements

The primary technical goal moving forward is to expand the file format support.

- [ ] **EPUB Parsing Integration:** Integrate a library (such as `epubjs`) to parse and display EPUB contents and metadata in the reader.
- [ ] **Update Importer Component:** Update `Importer.tsx` to officially accept and process `.epub` files alongside the existing PDF, TXT, and MD support.

## Appendix: Completed Milestones

For context on the foundation that has already been built:

- [x] **Strip Boilerplate UI:** Cleaned out `App.tsx` and generic prompt UI components.
- [x] **File Upload/Import UI:** Built drag-and-drop support for PDF, TXT, and Markdown files.
- [x] **Library Grid/List View:** Implemented the dashboard to browse imported books.
- [x] **PDF Parsing:** Built client-side PDF text extraction and chapter heuristic formatting.
- [x] **Local Persistence:** Set up `localStorage` to save book metadata and reading progress.
- [x] **Reading Experience Polish:** Added dark mode, sepia mode, font scaling, and bookmarking.
