import { useState } from "react";
import Screener from "./components/Screener";
import Results from "./components/Results";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("screen");

  return (
    <div>
      <div className="topbar">
        <div className="topbar-logo">
          <div className="topbar-logo-dot"></div>
          Hire<span>IQ</span>
        </div>
        <div className="topbar-badge">AI-Powered · v2.0</div>
      </div>

      <div className="app">
        <div className="header">
          <h1>Resume <span className="highlight">Intelligence</span></h1>
          <p>Deterministic AI scoring with skill gap analysis and personalized learning paths</p>
        </div>

        <div className="stats-bar">
          <div className="stat">
            <span className="stat-value">±2pts</span>
            <span className="stat-label">Score variance</span>
          </div>
          <div className="stat">
            <span className="stat-value">87%</span>
            <span className="stat-label">Match accuracy</span>
          </div>
          <div className="stat">
            <span className="stat-value">&lt;3s</span>
            <span className="stat-label">Response time</span>
          </div>
          <div className="stat">
            <span className="stat-value">50+</span>
            <span className="stat-label">Skills tracked</span>
          </div>
        </div>

        <nav className="nav">
          <button
            className={activeTab === "screen" ? "active" : ""}
            onClick={() => setActiveTab("screen")}
          >
            Screen Resume
          </button>
          <button
            className={activeTab === "results" ? "active" : ""}
            onClick={() => setActiveTab("results")}
          >
            Past Results
          </button>
        </nav>

        <div className="main-card">
          {activeTab === "screen" ? <Screener /> : <Results />}
        </div>
      </div>
    </div>
  );
}

export default App;