🤖 Crisp AI Interview Assistant
This application is a Full Stack AI-Powered Interview Simulator built as a React Single Page Application (SPA). It is designed to provide a structured, timed technical interview for a Full Stack (React/Node) role, coupled with a persistent dashboard for the reviewer.

The project successfully demonstrates robust front-end logic, Redux state management, local data persistence, and complex component synchronization.

🚀 Key Features and Requirements
All core deliverables outlined in the assignment have been met, implemented using a modular React and Redux architecture.

Feature

Implementation Detail

Two Synchronized Tabs

Interviewee (Chat) for the candidate flow, and Interviewer (Dashboard) for reviewer management. Both views are synced via a single Redux store.

Data Persistence

Implemented using Redux-Persist (localStorage) to save all session data (progress, answers, timers, and scores). Progress is restored automatically after a browser refresh.

Missing Fields Chatbot

Resume parsing failure immediately triggers a controlled, sequential Step 2 (Confirm Details) flow, prompting the user to manually input Name, Email, and Phone Number before starting the interview.

Timed Interview Flow

Total of 6 questions (2 Easy, 2 Medium, 2 Hard). Each has a strict timer: Easy (20s), Medium (60s), Hard (120s). Answers are submitted automatically on timeout.

Scoring & Review

Mock AI Logic judges individual answers (0-10 score) and provides a Final Score/Summary upon completion. A "Thank You" modal appears after the final submission.

Interviewer Dashboard

Provides a list of candidates ordered by final score, with Search and Sort functionality, and a detail view for reviewing the complete chat history and individual scores.

🛠️ Technology Stack
Frontend: React (Vite)

State Management: Redux Toolkit

Persistence: Redux-Persist (Local Storage)

UI/Styling: Ant Design (AntD)

Parsing (Mocked): pdfjs-dist (used for browser-based text extraction logic)

