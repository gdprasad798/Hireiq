import os
import json
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from dotenv import load_dotenv

load_dotenv()

llm = ChatGroq(
    model="llama3-8b-8192",
    temperature=0,
    groq_api_key=os.getenv("GROQ_API_KEY")
)

prompt_template = PromptTemplate(
    input_variables=["job_description", "resume_text"],
    template="""You are an expert technical recruiter at a top tech company.

Analyze the resume against the job description and return a JSON response.

JOB DESCRIPTION:
{job_description}

RESUME:
{resume_text}

Return ONLY a valid JSON object with exactly these fields:
{{
  "score": <integer 0-100>,
  "matched_skills": [<list of skills found in both>],
  "missing_skills": [<list of skills in JD but missing from resume>],
  "summary": "<2-3 sentence summary>",
  "recommendation": "<one of: Strong Match, Good Match, Partial Match, Not a Match>"
}}

Return ONLY the JSON. No extra text. No markdown."""
)

chain = LLMChain(llm=llm, prompt=prompt_template)

async def screen_resume(job_description: str, resume_text: str) -> dict:
    try:
        raw = await chain.arun(
            job_description=job_description,
            resume_text=resume_text
        )
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
        result = json.loads(cleaned.strip())
        return result
    except json.JSONDecodeError:
        return {
            "score": 0,
            "matched_skills": [],
            "missing_skills": [],
            "summary": "Could not parse AI response. Please try again.",
            "recommendation": "Not a Match"
        }
    except Exception as e:
        raise Exception(f"Screening failed: {str(e)}")