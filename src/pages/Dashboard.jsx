import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/dashboard.css';

const Dashboard = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Notice Panel */}
      <div className="dashboard-notice">
        <b>Health note</b>
        EmpowerHer provides educational breast health support only. It does not diagnose breast cancer, predict risk, or replace care from a qualified healthcare provider. Please visit a health facility if you notice unusual changes or need medical advice.
      </div>

      {/* Greeting Area without stamp */}
      <div className="dashboard-masthead-row">
        <div>
          <h2 className="dashboard-greeting">
            Welcome back, <em>Sister.</em>
          </h2>
          <p className="dashboard-greeting-sub">
            Your private space for learning, self-check guidance, reminders, and breast health support.
          </p>
        </div>
      </div>

      {/* Hero card with clip-path torn bottom edge */}
      <div className="dashboard-hero-wrap">
        <div className="dashboard-hero">
          <p className="dashboard-hero-eyebrow">MONTHLY SELF-CHECK</p>
          <h2>Start your guided breast self-examination</h2>
          <p>
            Follow simple step-by-step guidance to help you understand what is normal for your body and notice changes early.
          </p>
          <Link to="/self-examination" className="dashboard-hero-cta">
            Start self-check
          </Link>
        </div>
      </div>

      {/* Section Header */}
      <div className="dashboard-section-head">
        <h3>Your breast health tools</h3>
        <div className="rule" />
        <span className="tag">Main features</span>
      </div>

      {/* Zine Shared Border Grid */}
      <div className="dashboard-grid">
        {/* Card 1 */}
        <Link to="/education" className="dashboard-card">
          <span className="corner" />
          <span className="no">01</span>
          <h4>Learn</h4>
          <p>Read simple information about breast cancer symptoms, risk factors, prevention, myths, and early detection.</p>
        </Link>
        
        {/* Card 2 */}
        <Link to="/self-examination" className="dashboard-card alt">
          <span className="corner" />
          <span className="no">02</span>
          <h4>Self-examination guide</h4>
          <p>Follow clear step-by-step guidance for monthly breast self-examination at your own pace.</p>
        </Link>
        
        {/* Card 3 */}
        <Link to="/records" className="dashboard-card alt2">
          <span className="corner" />
          <span className="no">03</span>
          <h4>Self-check records</h4>
          <p>Keep a private record of your monthly checks and notes for personal reference.</p>
        </Link>
        
        {/* Card 4 */}
        <Link to="/reminders" className="dashboard-card alt2">
          <span className="corner" />
          <span className="no">04</span>
          <h4>Reminders</h4>
          <p>Set monthly reminders to help you make breast self-checks part of your routine.</p>
        </Link>
        
        {/* Card 5 */}
        <Link to="/clinics" className="dashboard-card">
          <span className="corner" />
          <span className="no">05</span>
          <h4>Clinic directory</h4>
          <p>Find health facilities where you can seek screening, consultation, or professional support.</p>
        </Link>
        
        {/* Card 6 */}
        <Link to="/profile" className="dashboard-card alt">
          <span className="corner" />
          <span className="no">06</span>
          <h4>Profile &amp; settings</h4>
          <p>Manage your language, notification preferences, privacy settings, and account details.</p>
        </Link>
      </div>

      {/* Pull Quote Footer */}
      <div className="dashboard-quote">
        <p>"Your health matters. Learning your body and seeking help early can make a difference."</p>
        <span>EMPOWERHER REMINDER</span>
      </div>

    </div>
  );
};

export default Dashboard;
