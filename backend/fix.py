import os

content = '''import os
import json
import spacy
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
nlp = spacy.load("en_core_web_sm")

SKILLS = [
    "python","javascript","typescript","java","react","node","nodejs","fastapi",
    "django","flask","postgresql","mongodb","mysql","redis","docker","kubernetes",
    "aws","gcp","azure","git","graphql","rest","api","sql","nosql",
    "machine learning","deep learning","tensorflow","pytorch","pandas","numpy",
    "spark","kafka","microservices","ci/cd","jenkins","terraform","linux"
]

def extract_skills(text):
    text_lower = text.lower()
    return list(set([s for s in SKILLS if s in text_lower]))

def calc_score(resume_skills, jd_skills):
    if not jd_skills:
        return 0
    matched = [s for s in jd_skills if s in resume_skills]
    return min(int((len(matched) / len(jd_skills)) * 100), 100)

def get_recommendation(score):
    if score >= 80: return "Strong Match"
    if score >= 60: return "Good Match"
    if score >= 40: return "Partial Match"
    return "Not a Match"

async def screen_resume(job_description, resume_text):
    resume_skills = extract_skills(resume_text)
    jd_skills = extract_skills(job_description)
    matched = [s for s in jd_skills if s in resume_skills]
    missing = [s for s in jd_skills if s not in resume_skills]
    score = calc_score(resume_skills, jd_skills)
    recommendation = get_recommendation(score)

    try:
        prompt = "You are a technical recruiter. Return ONLY valid JSON with fields: summary (string, 2-3 sentences), learning_paths (array of objects with skill, weeks, resource, jobs_unlocked). Missing skills: " + str(missing[:3]) + ". No markdown."
        r = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        raw = r.choices[0].message.content.strip()
        if "{" in raw:
            raw = raw[raw.index("{"):raw.rindex("}")+1]
        ai_data = json.loads(raw)
        summary = ai_data.get("summary", "")
        learning_paths = ai_data.get("learning_paths", [])
    except Exception:
        summary = f"Candidate matched {len(matched)} of {len(jd_skills)} required skills."
        learning_paths = []

    return {
        "score": score,
        "matched_skills": matched,
        "missing_skills": missing,
        "summary": summary,
        "recommendation": recommendation,
        "learning_paths": learning_paths
    }

async def batch_screen(job_description, resumes):
    import asyncio
    tasks = [screen_resume(job_description, r) for r in resumes]
    results = await asyncio.gather(*tasks)
    ranked = sorted(enumerate(results), key=lambda x: x[1]["score"], reverse=True)
    return [{"rank": i+1, "resume_index": idx, **r} for i, (idx, r) in enumerate(ranked)]
'''

with open("services/screener.py", "w", encoding="utf-8") as f:
    f.write(content)
print("Done! screener.py written successfully.")
