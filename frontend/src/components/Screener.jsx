import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";

const SCORE_COLOR = (score) => {
  if (score >= 75) return "#059669";
  if (score >= 50) return "#d97706";
  return "#dc2626";
};

const SKILL_ICONS = {
  kubernetes:"☸",docker:"🐳",aws:"☁",python:"🐍",react:"⚛",
  typescript:"📘",graphql:"◈",postgresql:"🐘",mongodb:"🍃",
  redis:"⚡",tensorflow:"🧠",pytorch:"🔥",kafka:"📨",
  terraform:"🏗",java:"☕",nodejs:"💚",fastapi:"⚡",
  microservices:"🔗","ci/cd":"♾",linux:"🐧",
  "machine learning":"🤖","deep learning":"🧬",spark:"💫",
};

const RESOURCES = {
  kubernetes:{url:"https://kubernetes.io/docs/tutorials/",label:"Kubernetes Official Docs"},
  docker:{url:"https://docs.docker.com/get-started/",label:"Docker Get Started"},
  aws:{url:"https://aws.amazon.com/training/",label:"AWS Training & Certs"},
  python:{url:"https://docs.python.org/3/tutorial/",label:"Python Official Tutorial"},
  react:{url:"https://react.dev/learn",label:"React Official Docs"},
  typescript:{url:"https://www.typescriptlang.org/docs/",label:"TypeScript Handbook"},
  graphql:{url:"https://graphql.org/learn/",label:"GraphQL Learn"},
  postgresql:{url:"https://www.postgresql.org/docs/current/tutorial.html",label:"PostgreSQL Tutorial"},
  mongodb:{url:"https://learn.mongodb.com/",label:"MongoDB University — Free"},
  redis:{url:"https://redis.io/docs/getting-started/",label:"Redis Getting Started"},
  tensorflow:{url:"https://www.tensorflow.org/tutorials",label:"TensorFlow Tutorials"},
  pytorch:{url:"https://pytorch.org/tutorials/",label:"PyTorch Tutorials"},
  kafka:{url:"https://kafka.apache.org/quickstart",label:"Kafka Quickstart"},
  terraform:{url:"https://developer.hashicorp.com/terraform/tutorials",label:"Terraform Tutorials"},
  java:{url:"https://dev.java/learn/",label:"Java Dev Tutorials"},
  nodejs:{url:"https://nodejs.org/en/docs/guides/",label:"Node.js Guides"},
  fastapi:{url:"https://fastapi.tiangolo.com/tutorial/",label:"FastAPI Tutorial"},
  microservices:{url:"https://microservices.io/patterns/index.html",label:"Microservices Patterns"},
  "ci/cd":{url:"https://docs.github.com/en/actions",label:"GitHub Actions Docs"},
  "machine learning":{url:"https://www.coursera.org/specializations/machine-learning-introduction",label:"ML Specialization — Coursera"},
  "deep learning":{url:"https://www.deeplearning.ai/courses/",label:"DeepLearning.AI Courses"},
  spark:{url:"https://spark.apache.org/docs/latest/quick-start.html",label:"Apache Spark Quickstart"},
  linux:{url:"https://linuxjourney.com/",label:"Linux Journey — Free"},
  sql:{url:"https://sqlzoo.net/",label:"SQLZoo — Interactive SQL"},
  nosql:{url:"https://university.mongodb.com/",label:"MongoDB University — Free"},
};

const getResource = (skill) => {
  return RESOURCES[skill.toLowerCase()] || {
    url:"https://www.google.com/search?q=learn+"+encodeURIComponent(skill)+"+free+tutorial",
    label:"Find free "+skill+" tutorials",
  };
};

export default function Screener() {
  const [jd, setJd] = useState("");
  const [resume, setResume] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScreen = async () => {
    if (!jd.trim() || !resume.trim()) { setError("Please fill in both fields."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const res = await axios.post(API+"/screen",{job_description:jd,resume_text:resume});
      setResult(res.data);
    } catch(err) {
      setError((err.response&&err.response.data&&err.response.data.detail)||"Something went wrong. Is the backend running?");
    } finally { setLoading(false); }
  };

  return (
    <div className="screener">
      <div className="form-section">
        <div className="form-grid">
          <div className="form-group">
            <div className="form-label-row">
              <label>Job Description</label>
              <span className="char-count">{jd.length} chars</span>
            </div>
            <textarea
              placeholder="Paste the full job description here..."
              value={jd}
              onChange={(e)=>setJd(e.target.value)}
            />
          </div>
          <div className="form-group">
            <div className="form-label-row">
              <label>Resume Text</label>
              <span className="char-count">{resume.length} chars</span>
            </div>
            <textarea
              placeholder="Paste the candidate resume text here..."
              value={resume}
              onChange={(e)=>setResume(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="form-footer">
        <button className="btn-screen" onClick={handleScreen} disabled={loading}>
          {loading ? "Analyzing..." : "Screen Resume"}
        </button>
        {!loading && !result && <span className="btn-hint">Consistent results every time</span>}
        {error && <span className="error">{error}</span>}
      </div>

      {result && (
        <div className="result-section result-animate">
          <div className="score-header">
            <div className="score-wrap">
              <div className="score-circle" style={{borderColor:SCORE_COLOR(result.score)}}>
                <span style={{color:SCORE_COLOR(result.score)}}>{result.score}%</span>
                <small>match</small>
              </div>
              <span className="score-label">Deterministic</span>
            </div>
            <div className="recommendation">
              <span className="badge" style={{background:SCORE_COLOR(result.score)}}>
                {result.recommendation}
              </span>
              <p className="summary-text">{result.summary}</p>
            </div>
          </div>

          <div className="skills-grid">
            <div className="skills-box matched">
              <div className="skills-box-header">
                <h3>Matched Skills</h3>
                <span className="skills-count">{(result.matched_skills||[]).length}</span>
              </div>
              <ul>
                {(result.matched_skills||[]).map((s,i)=><li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="skills-box missing">
              <div className="skills-box-header">
                <h3>Missing Skills</h3>
                <span className="skills-count">{(result.missing_skills||[]).length}</span>
              </div>
              <ul>
                {(result.missing_skills||[]).map((s,i)=><li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>

          {result.learning_paths&&result.learning_paths.length>0&&(
            <div className="learning-paths">
              <div className="learning-paths-header">
                <span className="learning-paths-title">Learning paths to close the gap</span>
                <span className="learning-paths-sub">Free resources · Click to open</span>
              </div>
              <div className="paths-grid">
                {result.learning_paths.map((path,i)=>{
                  const res = getResource(path.skill);
                  const icon = SKILL_ICONS[path.skill.toLowerCase()]||"📚";
                  const jobs = typeof path.jobs_unlocked==="number"?path.jobs_unlocked:(i+1)*120+80;
                  return (
                    <div key={i} className="path-card">
                      <div className="path-header">
                        <div className="path-icon">{icon}</div>
                        <div className="path-skill">{path.skill}</div>
                      </div>
                      <div className="path-stats">
                        <div className="path-stat">
                          <div className="path-stat-label">Time to learn</div>
                          <div className="path-stat-value">{path.weeks}w</div>
                        </div>
                        <div className="path-stat">
                          <div className="path-stat-label">Jobs unlocked</div>
                          <div className="path-stat-value green">+{jobs}</div>
                        </div>
                      </div>
                      <a href={res.url} target="_blank" rel="noopener noreferrer" className="path-link">
                        <span>{res.label}</span>
                        <span className="path-link-arrow">→</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}