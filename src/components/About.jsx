import React from 'react';
import './About.css';

export default function About() {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        {/* macOS Terminal Window Card */}
        <div className="terminal-window">
          {/* macOS Title Bar with Traffic Light Control Buttons */}
          <div className="terminal-header">
            <div className="terminal-controls">
              <span className="control-dot dot-red" aria-label="Close window" />
              <span className="control-dot dot-yellow" aria-label="Minimize window" />
              <span className="control-dot dot-green" aria-label="Maximize window" />
            </div>
          </div>

          {/* Terminal Content Body */}
          <div className="terminal-body">
            <p className="terminal-text">
              I'm 20-year-old IT student and software engineer passionate about building native iOS applications using Swift. My journey in tech is driven by clean architecture and mobile performance, complemented by a growing focus on cybersecurity. I love tackling complex challenges and building end-to-end solutions that deliver real impact.
              <span className="terminal-cursor" aria-hidden="true">█</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
