# ⚛️ Focus Platform — React Frontend UI

This folder contains the frontend user interface for the Focus Platform, built using React, Vite, and tailwind styling. It provides premium dark-mode dashboard interfaces for administrators, students, and teachers.

---

## 🧭 Service Overview

*   **Host/Port**: `http://localhost:5173`
*   **Framework**: React 18 + Vite 7
*   **Key Modules**: Gemini Socratic Chat Integration, Interactive Curriculum Progress, Admin Verification panels, and Student Analytics charts.

---

## 📂 Project Layout

*   `src/components/` — Global UI elements (AuthModal, GlobalLayout, ThemeToggle, 보호/Protect Route).
*   `src/context/` — Global State context providers (Language, Notifications, Theme, Toast).
*   `src/pages/` — Application pages (AdminDashboard, Student Dashboard, TeacherDashboard, AiChat, Quiz, Remediation).
*   `src/i18n/` — Multilingual translation dictionaries.
*   `src/utils/` — Helper utility functions (subject mapping, validation, theme).
*   `package.json` — Frontend dependency declarations.

---

## 🛠️ Step-by-Step Execution

### 1. Install Node Dependencies
Open a terminal at the `frontent` folder and run:
```powershell
npm install
```

### 2. Configure Environment Variables
Create a file named `.env` in the `frontent` directory and paste your Gemini API key (which powers the Socratic AI Tutor panel):
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run the Development Server
Execute the Vite build script:
```powershell
npm run dev
```
*The React UI is now active at `http://localhost:5173/`.*
