import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';
import '../styles/global.css';

const Landing = () => {
  return (
    <div className="landing-wrap">
      {/* Landing Navigation Header */}
      <nav className="landing-nav">
        <div className="landing-logo">
          Empower<em style={{ color: 'var(--coral)', fontStyle: 'italic', fontWeight: '500' }}>Her</em>
        </div>
        <div className="landing-nav-links">
          <Link to="/education">Learn</Link>
          <Link to="/self-examination">Self-check guide</Link>
          <Link to="/clinics">Clinics</Link>
          <Link to="/login" className="landing-nav-cta">Sign in</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div>
          <p className="landing-hero-mark">A field guide for your own two hands</p>
          <h1>
            Know what's <em>normal</em> for you, before anything else does.
          </h1>
          <p className="landing-hero-dek">
            EmpowerHer is a private, guided companion for monthly breast self-checks — built for sisters who'd rather catch a change early than wonder later.
          </p>
          <div className="landing-hero-actions">
            <Link to="/register">
              <button className="landing-btn-primary">Create your account</button>
            </Link>
            <a href="#how-it-works" className="landing-btn-ghost">See how it works</a>
          </div>
        </div>

        <div className="landing-hero-visual">
          <p className="tag">This month's assignment</p>
          <h3>Five minutes, once a month, in private.</h3>
          <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: 'rgba(248, 238, 240, 0.8)', margin: 0 }}>
            A guided walkthrough takes you through the exam step by step, then logs it quietly for next time.
          </p>
          <div className="landing-stat-row">
            <div className="landing-stat">
              <div className="num">5 min</div>
              <div className="label">per check</div>
            </div>
            <div className="landing-stat">
              <div className="num">100%</div>
              <div className="label">private</div>
            </div>
            <div className="landing-stat">
              <div className="num">0</div>
              <div className="label">data shared</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ribbon Ticker */}
      <div className="landing-ticker">
        <div className="landing-ticker-inner">
          <span>Educational, not diagnostic</span><span>•</span><span>Private by design</span><span>•</span>
          <span>Built with health workers</span><span>•</span><span>Free to use</span><span>•</span>
          <span>Educational, not diagnostic</span><span>•</span><span>Private by design</span><span>•</span>
        </div>
      </div>

      {/* Inside Features Grid */}
      <section className="section">
        <div className="section-head">
          <h2>What's inside</h2>
          <div className="rule" />
          <span className="tag">Six sections</span>
        </div>
        
        <div className="zine-grid">
          <div className="zine-card">
            <span className="corner" />
            <span className="no">01</span>
            <h4>Learn</h4>
            <p>Simple, pictorial reading on symptoms, prevention, myths, and early detection.</p>
          </div>
          <div className="zine-card alt">
            <span className="corner" />
            <span className="no">02</span>
            <h4>Guided self-examination</h4>
            <p>A clear, step-by-step walkthrough of the examination method, at your own pace.</p>
          </div>
          <div className="zine-card alt2">
            <span className="corner" />
            <span className="no">03</span>
            <h4>Check history</h4>
            <p>A private log of your monthly checks, so you can track your own patterns.</p>
          </div>
          <div className="zine-card alt2">
            <span className="corner" />
            <span className="no">04</span>
            <h4>Reminders</h4>
            <p>One nudge a month, so checking yourself stays a habit, not an afterthought.</p>
          </div>
          <div className="zine-card">
            <span className="corner" />
            <span className="no">05</span>
            <h4>Clinic directory</h4>
            <p>Screening and oncology support centres, found near wherever you are.</p>
          </div>
          <div className="zine-card alt">
            <span className="corner" />
            <span className="no">06</span>
            <h4>Profile &amp; settings</h4>
            <p>Language, notifications, and the small things that make this app yours.</p>
          </div>
        </div>
      </section>

      {/* How it works anchor */}
      <section className="section" id="how-it-works" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <h2>How it works</h2>
          <div className="rule" />
          <span className="tag">Four steps</span>
        </div>
        
        <div className="landing-steps">
          <div className="landing-step">
            <p className="no">01</p>
            <h4>Create your account</h4>
            <p>Takes under a minute. No clinic visit required.</p>
          </div>
          <div className="landing-step">
            <p className="no">02</p>
            <h4>Set a monthly reminder</h4>
            <p>Pick a day that suits your cycle and your routine.</p>
          </div>
          <div className="landing-step">
            <p className="no">03</p>
            <h4>Follow the guide</h4>
            <p>A calm, step-by-step walkthrough talks you through the check.</p>
          </div>
          <div className="landing-step">
            <p className="no">04</p>
            <h4>Log and notice patterns</h4>
            <p>Your history stays private, just for you to refer back to.</p>
          </div>
        </div>
      </section>

      {/* Quote Ribbon */}
      <div className="pull-quote">
        <p>"Your health is your power. Regular check-ups and self-exams give you control."</p>
        <span>— a reminder, every issue</span>
      </div>

      {/* Action CTA Block */}
      <section className="landing-cta">
        <p className="tag">Start your own column</p>
        <h2>Five minutes a month is all it takes to know your <em>normal</em>.</h2>
        <Link to="/register">
          <button className="landing-btn-primary">Create your account</button>
        </Link>
      </section>

      {/* Zine Footer */}
      <footer className="landing-footer">
        <div className="landing-logo">
          Empower<em>Her</em>
        </div>
        <div className="landing-footer-links">
          <a href="#about" onClick={(e) => e.preventDefault()}>About</a>
          <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy</a>
          <a href="#terms" onClick={(e) => e.preventDefault()}>Terms</a>
          <a href="#contact" onClick={(e) => e.preventDefault()}>Contact</a>
        </div>
        <div className="landing-footer-mark">EmpowerHer PWA — ED. 2026</div>
      </footer>
    </div>
  );
};

export default Landing;
