import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";

const SCORE_COLOR = (score) => {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
};

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    axios.get(`${API}/results`)
      .then((res) => setResults(res.data))
      .catch(() => setError("Could not load results. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading">Loading results...</p>;
  if (error)   return <p className="error">{error}</p>;
  if (results.length === 0) return <p className="empty">No screenings yet. Go screen a resume!</p>;

  return (
    <div className="results">
      <h2>Past Screening Results</h2>
      <div className="results-list">
        {results.map((r) => (
          <div key={r.id} className="result-row">
            <div
              className="mini-score"
              style={{ color: SCORE_COLOR(r.score), borderColor: SCORE_COLOR(r.score) }}
            >
              {r.score}%
            </div>
            <div className="result-info">
              <span className="badge" style={{ background: SCORE_COLOR(r.score) }}>
                {r.recommendation}
              </span>
              <p>{r.summary}</p>
              <small>{new Date(r.created_at).toLocaleString()}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
