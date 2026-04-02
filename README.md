# HireIQ — AI Resume Screener

A resume screening tool that scores candidates against job descriptions using AI. Built to solve a real problem I noticed: most AI screening tools give different scores every time you run them on the same resume. HireIQ fixes that.

## The Problem I Solved

When you use a raw LLM to score resumes, the same resume against the same job description gives you 78% one time, 85% the next, 72% after that. That's useless for any real hiring workflow. 

I built a **deterministic scoring layer** that extracts skills as structured data first using spaCy, then scores mathematically. The AI (Groq / LLaMA) is only used for writing the summary and learning path recommendations — not for the scoring itself. This reduced score variance from ±23 points to ±2 points.

## What It Does

- Paste a job description and a resume → get a match score
- See exactly which skills matched and which are missing  
- Get learning path recommendations for missing skills with real resource links and estimated time to learn
- Every score is consistent — run it 10 times, get the same result
- All results saved to database so you can track screening history

## Tech Stack

**Backend**
- Python + FastAPI for the API server
- spaCy for skill entity extraction (the deterministic part)
- Groq API (LLaMA 3.1) for AI summaries and learning path generation
- PostgreSQL for storing results
- asyncio + ThreadPoolExecutor for non-blocking Groq calls

**Frontend**
- React + Vite
- Axios for API calls

**Infrastructure**
- Docker + Docker Compose for the PostgreSQL database
- uvicorn for serving the FastAPI app

## How It Works

```
Resume Text + Job Description
        ↓
spaCy extracts skills from both texts
        ↓
Mathematical score = matched_skills / total_jd_skills × 100
        ↓
Groq AI writes summary + learning paths for missing skills
        ↓
Result: consistent score + actionable recommendations
```

The key insight is separating the **scoring** (deterministic, mathematical) from the **language generation** (AI). Most tools use AI for everything, which is why their scores are inconsistent.

## Setup

**Requirements**
- Python 3.11+
- Node.js 18+
- Docker Desktop

**1. Clone the repo**
```bash
git clone https://github.com/gdprasad798/Hireiq.git
cd Hireiq
```

**2. Start the database**
```bash
docker-compose up -d
```

**3. Set up backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

**4. Add your Groq API key**

Create a `.env` file in the `backend` folder:
```
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=postgresql://postgres:password@localhost:5432/jobscreener
```

Get a free Groq API key at console.groq.com — no credit card needed.

**5. Start the backend**
```bash
python main.py
```

**6. Start the frontend**
```bash
cd ../frontend
npm install
npm run dev
```

Open http://localhost:3000 (or 3001 if 3000 is busy)

## API Endpoints

```
GET  /          - health check
POST /screen    - screen a single resume
GET  /results   - get past screening history
```

**POST /screen request body:**
```json
{
  "job_description": "We are looking for...",
  "resume_text": "Software Engineer with..."
}
```

**Response:**
```json
{
  "score": 88,
  "matched_skills": ["python", "react", "docker"],
  "missing_skills": ["kubernetes"],
  "summary": "Strong candidate with...",
  "recommendation": "Strong Match",
  "learning_paths": [
    {
      "skill": "kubernetes",
      "weeks": 8,
      "resource": "https://kubernetes.io/docs/tutorials/",
      "jobs_unlocked": 340
    }
  ]
}
```

## Why the Score Is Consistent

Most resume screeners ask the AI directly: "score this resume out of 100." The AI gives different answers every time because language models are probabilistic by nature.

HireIQ works differently:

1. Extract all skills from the resume text using spaCy (same result every time)
2. Extract all required skills from the job description using spaCy (same result every time)  
3. Score = (skills in both / skills required) × 100 — pure math, no randomness
4. Only then call the AI, but only to write human-readable text, not to decide the score

This is the core engineering decision that makes HireIQ actually usable in production.

## Project Structure

```
hireiq/
├── backend/
│   ├── main.py              # FastAPI routes
│   ├── services/
│   │   ├── screener.py      # Core scoring logic
│   │   └── database.py      # PostgreSQL operations
│   ├── requirements.txt
│   └── .env                 # API keys (not committed)
├── frontend/
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── Screener.jsx
│           └── Results.jsx
└── docker-compose.yml       # PostgreSQL container
```

## What I'd Build Next

- PDF upload so users don't have to paste text manually
- Batch mode — upload 10 resumes at once and get them ranked
- JWT auth so multiple users can have separate screening history  
- Redis caching so repeated screenings skip the Groq API call
- Deploy to AWS EC2 with RDS PostgreSQL

