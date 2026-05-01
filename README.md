# JudgeAI — Court Judgment Intelligence System

## Problem
Karnataka government departments receive hundreds of High Court 
judgment PDFs through CCMS every month. Officers manually read 
10-40 pages of dense legal language to extract what action is 
needed, who is responsible, and by when. This leads to missed 
deadlines, inconsistent interpretation, and compliance failures.

## Solution
JudgeAI is an AI-powered platform that reads court order PDFs, 
extracts structured action plans using Gemini AI, routes them 
through a human review workflow, and displays them on a 
department-wise compliance dashboard.

## How It Works
1. Officer uploads court order PDF
2. AI extracts: case number, parties, directions, deadline, 
   department, with confidence scores per field
3. Human reviewer approves, edits, or rejects each field
4. Verified action plans appear on dashboard with 
   deadline color coding
5. Full audit trail of AI prediction vs human decision

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Python FastAPI |
| AI | Google Gemini 1.5 Pro API |
| Database | SQLite |
| Hosting (Frontend) | Vercel |
| Hosting (Backend) | Render |

## Local Setup

### Backend
  cd backend
  pip install -r requirements.txt
  cp .env.example .env
  # Add your GEMINI_API_KEY to .env
  uvicorn main:app --reload

### Frontend
  cd frontend
  npm install
  npm run dev

### Visit
  Frontend: http://localhost:5173
  Backend API docs: http://localhost:8000/docs

## Live Demo
[Live URL will be added after deployment]

## Video Walkthrough
[YouTube link will be added]

## Team
- Member 1 — Backend & AI Integration
- Member 2 — Frontend Upload & Review
- Member 3 — Dashboard, Deployment & Demo

## Hackathon
AI for Bharat by HackerEarth
Theme 11: From Court Judgments to Verified Action Plans
Organized by Centre for e-Governance, Karnataka
