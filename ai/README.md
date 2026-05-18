# 🧠 Focus Platform — AI Service (Flask + LSTM)

This folder contains the deep-learning AI components of the Focus Platform, including knowledge tracing models, preprocessing utilities, and the prediction API server.

---

## 🧭 Service Overview

*   **Host/Port**: `http://127.0.0.1:5000`
*   **Core Model**: `models/lstm_knowledge_tracing_model.h5`
*   **Framework**: Flask + TensorFlow (Keras LSTM)

The AI service tracks student progress over sequence attempts and estimates their mastery score of a skill using dynamic knowledge tracing.

---

## 📂 Project Layout

*   `api/ai_api.py` — Flask API controller (Endpoints: `/health`, `/predict`).
*   `models/` — Contains the pre-trained `lstm_knowledge_tracing_model.h5` deep learning file.
*   `preprocessing/` — Scripts for preparing training snapshots and feature datasets.
*   `training/` — Python scripts to train and evaluate models.
*   `prediction/` — Internal helper modules for prediction algorithms.
*   `data/` — Evaluation dataset folders.
*   `requirements.txt` — PIP dependency list.

---

## 🛠️ Step-by-Step Execution

To avoid system dependency conflicts and missing packages (such as `ModuleNotFoundError: No module named 'tensorflow'`), **always run the service inside the virtual environment**.

### 1. Set Up and Activate the Virtual Environment

Open a terminal at the `ai` folder:

*   **Windows (PowerShell)**:
    ```powershell
    # 1. Create virtual environment (only needed once)
    python -m venv .venv

    # 2. Activate virtual environment
    .\.venv\Scripts\Activate.ps1

    # 3. Install packages
    pip install -r requirements.txt
    ```

*   **macOS / Linux**:
    ```bash
    # 1. Create virtual environment (only needed once)
    python3 -m venv .venv

    # 2. Activate virtual environment
    source .venv/bin/activate

    # 3. Install packages
    pip install -r requirements.txt
    ```

---

### 2. Start the API Server

#### Option A: Inside your active virtual environment terminal
```powershell
python api/ai_api.py
```

#### Option B: Direct Execution without manual activation (Robust for PowerShell)
```powershell
.\.venv\Scripts\python.exe api/ai_api.py
```

*The service is ready when you see: ` [SUCCESS] LSTM Knowledge Tracing Model Loaded Successfully!` and `* Running on http://127.0.0.1:5000`.*

---

## 📡 API Reference

### 1. Health Probe (`GET http://127.0.0.1:5000/health`)
Checks if the deep learning model loaded successfully.

*   **Response**:
    ```json
    {
        "status": "healthy",
        "model_loaded": true,
        "framework": "TensorFlow (Keras LSTM)"
    }
    ```

### 2. Predict Mastery (`POST http://127.0.0.1:5000/predict`)
Estimates knowledge mastery for a student given their history sequence and skill difficulty.

*   **Request Payload**:
    ```json
    {
        "student_history": [1, 1, 0, 1],
        "skill_difficulty_avg": 0.40
    }
    ```
*   **Response Payload**:
    ```json
    {
        "mastery_score": 71.59,
        "skill_id": "",
        "skill_name": "Unknown Skill",
        "status": "Developing (On Track)",
        "total_attempts": 4,
        "total_correct": 3
    }
    ```
