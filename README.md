# 🎓 Focus Learning Platform — System Architecture & Ecosystem

Welcome to the **Focus Learning Platform**, a cutting-edge, state-of-the-art educational ecosystem designed to personalize student learning. By combining a modern web frontend, a robust business logic backend, and a deep-learning AI system, the platform dynamically analyzes student learning trajectories and estimates subtopic mastery.

---

## 🏗️ System Architecture

The Focus Platform is engineered using a decoupled, service-oriented architecture:

```mermaid
graph TD
    subgraph Frontend [Client Layer (React & Vite)]
        A[React UI: Dashboard, Quizzes, Analytics] -- Axios Requests (Port 5173) --> B[Vite Development Server]
    end

    subgraph Backend [Logic & Database Layer (Laravel)]
        C[Laravel HTTP Core (Port 8000)] -- DB Queries (Port 3306) --> D[(MySQL Database)]
        C -- JWT Authentication --> E[tymon/jwt-auth]
    end

    subgraph AI [Deep Learning AI Service (Flask)]
        F[Flask Prediction Server (Port 5000)] -- Model Inference --> G[TensorFlow LSTM Model]
        F -- Load Trained Weights --> H[lstm_knowledge_tracing_model.h5]
    end

    A -- REST API Calls (JWT Authorized) --> C
    C -- HTTP POST /predict (Payload) --> F
    F -- Return Mastery Scores & Statuses --> C
```

### How the Components Interconnect
1. **User Interaction**: Students and teachers interact with the **React Frontend** (`http://localhost:5173`).
2. **API Requests**: The frontend sends REST requests (authenticated with JWT) to the **Laravel Backend** (`http://127.0.0.1:8000/api`).
3. **Deep Learning Evaluation**: When a student completes a quiz, the Laravel Backend aggregates their cumulative historical performance on the relevant subtopics and sends an HTTP POST request to the **AI Flask Service** (`http://127.0.0.1:5000/predict`).
4. **Knowledge Tracing**: The AI service processes the sequence through a trained **LSTM (Long Short-Term Memory) Network**, predicts their probability of answering future questions correctly, applies normalization scaling, and returns a tailored mastery status.
5. **Feedback Loop**: Laravel updates the student's subtopic evaluation record in **MySQL**, which is immediately pushed back to the React UI dashboard.

---

## 📁 Repository Layout

The project is structured into three self-contained directories:

*   **[`/frontent`](./frontent)**: The web application interface. Built with **React 19**, **Vite 7**, **Tailwind CSS**, and **Framer Motion** for premium interactive animations. It uses **Lucide React** for icons and **Recharts** for student progress visualization.
*   **[`/backend`](./backend)**: The core API server. Built with **Laravel 12**, using **JWT-Auth** for secure session management and **Spatie Laravel Permission** for role management (Students, Teachers, Admins). It includes database migrations and robust seeders.
*   **[`/ai`](./ai)**: The machine learning component. Built with **Flask**, **TensorFlow/Keras**, **Pandas**, and **Scikit-Learn**. It loads a trained LSTM weights bundle (`.h5`) to perform Real-Time Socratic Knowledge Tracing.

---

## 🛠️ Main Tech Stack

| Component | Key Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 7, Tailwind CSS, Framer Motion, Axios, Recharts, i18next |
| **Backend** | PHP 8.2+, Laravel 12, JWT-Auth, Spatie Permissions, MySQL |
| **AI Model** | Python 3.13, TensorFlow 2.11+, Flask, Pandas, Joblib, Scikit-Learn |

---

## 🚀 Quickstart Guide

To configure, migrate, seed, and run all services in a few simple steps, refer to our unified **[QUICKSTART.md](./QUICKSTART.md)** guide.

---

## 📈 Key Features
*   **Deep LSTM Knowledge Tracing**: Real-time student performance tracking across subtopics, normalized to reflect authentic progress.
*   **Modern Interactive Dashboard**: Stunning visual analytics featuring progress charts and adaptive study recommendations.
*   **Multi-Role Control**: Dedicated portal workflows for **Students** (quizzes, analytics), **Teachers** (student logs, class groups), and **Administrators** (curriculum and user verification controls).
