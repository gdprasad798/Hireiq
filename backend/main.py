from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uvicorn

from services.screener import screen_resume, batch_screen
from services.database import init_db, save_result, get_all_results

app = FastAPI(title="HireIQ API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await init_db()

class ScreenRequest(BaseModel):
    job_description: str
    resume_text: str

class BatchRequest(BaseModel):
    job_description: str
    resumes: List[str]

@app.get("/")
def root():
    return {"message": "HireIQ API is running"}

@app.post("/screen")
async def screen(request: ScreenRequest):
    if not request.job_description.strip() or not request.resume_text.strip():
        raise HTTPException(status_code=400, detail="Both fields are required")
    result = await screen_resume(request.job_description, request.resume_text)
    await save_result(request.job_description, request.resume_text, result)
    return result

@app.post("/batch")
async def batch(request: BatchRequest):
    if not request.job_description.strip() or not request.resumes:
        raise HTTPException(status_code=400, detail="Job description and resumes are required")
    return await batch_screen(request.job_description, request.resumes)

@app.get("/results")
async def results():
    return await get_all_results()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
