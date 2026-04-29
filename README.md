# 🚀 AI-First CRM (HCP Interaction Module)

An AI-powered CRM system for Healthcare Professional (HCP) interaction logging using **LangGraph, Groq LLM, FastAPI, React, Redux, and MySQL**.

The system allows users to log interactions using natural language or structured input, which is processed by an AI agent that extracts structured CRM data and stores it in a database.

---

# 🧠 Key Features

## 🤖 AI-Powered Logging
- Accepts natural language input
- Extracts structured CRM data using LLM:
  - Doctor name
  - Notes
  - Sentiment
  - Follow-up

## 🔗 LangGraph AI Agent
- Routes user requests intelligently
- Selects correct tools automatically:
  - Log Interaction
  - Edit Interaction
  - Fetch Interaction

## 🧰 Tool-Based Architecture
- Log Interaction Tool
- Edit Interaction Tool
- Fetch Interaction Tool

## 🗄️ Database Integration
- MySQL database
- Persistent interaction storage

## 💬 Dual Interface
- Chat-based AI interface
- Manual form-based logging

---

# ⚙️ Tech Stack

## Frontend
- React.js
- Redux Toolkit
- Axios
- Google Inter Font

## Backend
- FastAPI
- SQLAlchemy ORM
- MySQL
- Pydantic

## AI Layer
- LangGraph (Agent orchestration)
- LangChain
- Groq LLM (gemma2-9b-it)

---

# 🏗️ System Architecture

User (React UI)
→ FastAPI Backend
→ LangGraph Agent
→ LLM (Groq)
→ Tool Execution Layer
→ MySQL Database

---

# 🔥 AI Workflow

1. User enters natural language interaction
2. LangGraph agent analyzes intent
3. LLM extracts structured CRM data
4. Appropriate tool is selected
5. Data is stored or updated in MySQL

---

# 🧰 API Endpoints

## Backend APIs

GET /
→ Health check

GET /test-db
→ DB connection test

POST /interaction/log
→ Log interaction manually

GET /interaction/list
→ Get all interactions

GET /interaction/{id}
→ Get single interaction

PUT /interaction/edit/{id}
→ Edit interaction

POST /ai/agent
→ AI agent endpoint (LangGraph)

---

# 🤖 AI Agent (LangGraph)

The LangGraph agent handles:

- Intent detection
- Tool selection
- Execution routing
- Response generation

## Supported Actions:
- log interaction
- edit interaction
- fetch interactions

---

# 🧠 LLM Usage

Model: gemma2-9b-it (Groq)

Used for:
- Intent understanding
- Entity extraction
- CRM data structuring
- Sentiment detection
- Follow-up prediction

---

# 🗄️ Database Schema

Interaction Table:

- id (PK)
- doctor_name (string)
- notes (text)
- sentiment (string)
- follow_up (string)
- created_at (datetime)

---

# 🖥️ Frontend Features

- AI chat interface
- Interaction logging screen
- Real-time AI response display
- Redux state management

---

# ▶️ How to Run

## Backend

cd backend
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
uvicorn main:app --reload

Backend runs at:
http://127.0.0.1:8000

---

## Frontend

cd frontend
npm install
npm start

Frontend runs at:
http://localhost:3000

---

# 🔑 Environment Variables

GROQ_API_KEY=your_api_key_here

---

# 📌 Example Input

Met Dr Sharma, discussed diabetes medicine, follow up next week

---

# 📌 Example AI Output

{
  "doctor_name": "Dr Sharma",
  "notes": "discussed diabetes medicine",
  "sentiment": "Positive",
  "follow_up": "next week"
}

---

# 🚀 Key Highlights

✔ AI-first CRM system  
✔ LangGraph-based tool orchestration  
✔ Real-time LLM data extraction  
✔ MySQL persistence layer  
✔ React + Redux frontend  
✔ Production-style backend design  

---

# 🎯 Future Improvements

- Multi-user authentication
- Dashboard analytics
- Email/WhatsApp integration
- Vector memory for HCP history
- Advanced CRM scoring system

---

# 👨‍💻 Author

Built as part of AI-first CRM assignment using:
LangGraph + FastAPI + React + MySQL + Groq LLM
