# Focus Learning Platform — Project Report

**Date:** 2026-05-19  
**Repository:** `solommo/Project`

---

## 1. Executive Summary
The Focus Learning Platform is a multi-service educational system that personalizes learning by combining a modern web interface, a robust API backend, and an AI-driven knowledge tracing service. The platform tracks student performance, estimates mastery at the subtopic level, and delivers tailored feedback to students, teachers, and administrators.

---

## 2. Objectives and Scope
**Primary objectives**
- Deliver a responsive, role-based learning interface for students, teachers, and administrators.
- Provide a secure API that manages curriculum content, user roles, and quiz activity.
- Use AI-based knowledge tracing to estimate mastery from historical performance.

**Scope**
- Frontend web application for dashboards, quizzes, and analytics.
- Backend API for authentication, data persistence, and orchestration.
- AI service for prediction and mastery scoring.

---

## 3. System Architecture
The platform is composed of three independent services connected via REST APIs.

```mermaid
graph TD
    subgraph Frontend [Client Layer (React & Vite)]
        A[React UI: Dashboard, Quizzes, Analytics] --> B[Vite Dev Server]
    end

    subgraph Backend [Logic & Database Layer (Laravel)]
        C[Laravel API] --> D[(Database)]
        C --> E[JWT Auth]
    end

    subgraph AI [Deep Learning Service (Flask)]
        F[Flask Prediction API] --> G[TensorFlow LSTM Model]
    end

    A -->|REST API| C
    C -->|POST /predict| F
    F -->|Mastery Scores| C
```

---

## 4. Key Components
### 4.1 Frontend (React + Vite)
- Role-specific dashboards for students, teachers, and administrators.
- Interactive analytics and remediation views.
- Socratic chat integration (Gemini API key required).

### 4.2 Backend (Laravel API)
- JWT-based authentication and role management.
- CRUD operations for subjects, units, lessons, quizzes, and questions.
- Orchestrates prediction calls to the AI service and stores results.

### 4.3 AI Service (Flask + LSTM)
- Loads a pre-trained LSTM model for knowledge tracing.
- Provides `/health` and `/predict` endpoints for model status and inference.
- Normalizes and returns mastery status based on student history.

---

## 5. Core Data Flow
1. A student completes a quiz in the web interface.
2. The frontend submits results to the Laravel API.
3. The backend aggregates historical performance and requests predictions from the AI service.
4. The AI service returns mastery scores and status.
5. The backend persists results and returns updated analytics to the UI.

---

## 6. Technology Stack (Summary)
| Layer | Primary Technologies |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, Framer Motion |
| Backend | Laravel, PHP 8+, JWT-Auth, Spatie Permissions |
| AI | Python, Flask, TensorFlow/Keras, Pandas, Scikit-Learn |
| Data | MySQL or SQLite (environment-configured) |

---

## 7. Setup & Operations
Run the three services concurrently:
- **Frontend:** `http://localhost:5173`
- **Backend:** `http://127.0.0.1:8000`
- **AI Service:** `http://127.0.0.1:5000`

For detailed setup instructions, see:
- `README.md` (system overview)
- `QUICKSTART.md` (full installation and run steps)
- `backend/README.md` and `ai/README.md` (service-specific details)

---

## 8. Security & Access Control
- JWT-based authentication protects all API endpoints.
- Role-based permissions ensure proper access for students, teachers, and administrators.
- Service boundaries reduce risk by isolating UI, API, and AI execution contexts.

---

## 9. Current Limitations & Future Enhancements
**Known limitations**
- The AI service depends on a pre-trained model file being present locally.
- Environment configuration is required for database selection and secrets.

**Potential enhancements**
- Add automated model retraining pipelines.
- Expand analytics with cohort-level insights and alerts.
- Package services for containerized deployment.

