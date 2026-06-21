import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/education.css';

const Education = () => {
  const topics = [
    {
      no: '01',
      ic: '?',
      title: 'What is breast cancer?',
      description: 'A simple explanation of how it develops and what it means for the body.',
      classSuffix: ''
    },
    {
      no: '02',
      ic: 'i',
      title: 'Risk factors',
      description: 'What can raise the chance of breast cancer — and what doesn\'t.',
      classSuffix: 'alt'
    },
    {
      no: '03',
      ic: '!',
      title: 'Common symptoms',
      description: 'Changes worth noticing, explained gently and clearly.',
      classSuffix: 'alt2'
    },
    {
      no: '04',
      ic: '✓',
      title: 'Myths and facts',
      description: 'Common things people believe about breast cancer — and what\'s actually true.',
      classSuffix: ''
    },
    {
      no: '05',
      ic: '+',
      title: 'Prevention and healthy habits',
      description: 'Everyday habits that support your overall breast health.',
      classSuffix: 'alt'
    },
    {
      no: '06',
      ic: '★',
      title: 'Why early detection matters',
      description: 'How noticing changes sooner gives you more options, sooner.',
      classSuffix: 'alt2'
    }
  ];

  return (
    <div>
      <p className="edu-eyebrow">Section 02</p>
      <h2 className="edu-h1">Learn about breast <em>health</em></h2>
      <p className="edu-dek">Plain-language reading, in small pieces — no medical jargon, no fear. Pick a topic to begin.</p>

      {/* Health Note Banner */}
      <div className="edu-banner">
        <b>Health note</b>
        This content is for breast health awareness and education only. It does not diagnose breast cancer or replace professional medical advice. Please visit a qualified healthcare provider if you notice unusual changes or need medical support.
      </div>

      {/* Topics Header */}
      <div className="edu-section-head">
        <h3>Topics</h3>
        <div className="rule" />
        <span className="tag">Six articles</span>
      </div>

      {/* Topics Grid */}
      <div className="edu-grid">
        {topics.map((topic) => (
          <Link
            key={topic.no}
            to="/education/article"
            className={`edu-card ${topic.classSuffix}`}
          >
            <span className="corner" />
            <span className="no">{topic.no}</span>
            <div className="ic">{topic.ic}</div>
            <div>
              <h4>{topic.title}</h4>
              <p>{topic.description}</p>
              <span className="read">Read article</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Education;
