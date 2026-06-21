import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/education.css';

const ArticleDetail = () => {
  const handleFeedback = (isHelpful) => {
    // Placeholder click handler
    alert(`Feedback recorded: ${isHelpful ? 'Helpful' : 'Not helpful'} (Placeholder only)`);
  };

  return (
    <div style={{ maxWidth: '680px' }}>
      {/* Back to Topics */}
      <Link to="/education" className="edu-article-back">
        Back to topics
      </Link>

      {/* Article Header info */}
      <div>
        <span className="edu-article-tag">Article 01 of 06</span>
        <h1 className="edu-article-title">
          What is breast <em>cancer?</em>
        </h1>
        <p className="edu-article-meta">4 minute read · Available offline</p>
      </div>

      {/* Article Icon */}
      <div className="edu-article-ic-hero">?</div>

      {/* Article Body */}
      <article className="edu-article-body">
        <p>
          Breast cancer happens when cells in the breast begin to grow in an unusual way and form a lump, called a tumour. It can affect anyone with breast tissue, though it is far more common in women.
        </p>

        <h2>How it starts</h2>
        <p>
          Our bodies are always making new cells to replace old ones. Sometimes, a small number of cells grow out of control instead of following the body's usual pattern. Over time, this can form a lump that wasn't there before.
        </p>

        {/* Pull Quote */}
        <div className="edu-article-pull">
          Most lumps found during a self-check are not cancer — but every change is worth having looked at by a professional.
        </div>

        <h2>Why checking matters</h2>
        <p>
          Breast self-checks don't diagnose cancer. What they do is help you learn what's normal for your own body, so that if something changes, you notice it early — while it's usually easiest to treat.
        </p>

        <h2>What happens next, if something is noticed</h2>
        <p>
          If you or a healthcare worker notice a change, the next step is usually a simple clinical exam, and sometimes an imaging test like an ultrasound or mammogram. These tests are how a diagnosis is actually made — not a self-check alone.
        </p>
      </article>

      {/* Health Note Banner */}
      <div className="edu-article-notice">
        <b>Health note</b>
        This content is for breast health awareness and education only. It does not diagnose breast cancer or replace professional medical advice. Please visit a qualified healthcare provider if you notice unusual changes or need medical support.
      </div>

      {/* Feedback section */}
      <div className="edu-article-feedback">
        <p>Was this article helpful?</p>
        <div className="btns">
          <button aria-label="Helpful" onClick={() => handleFeedback(true)}>👍</button>
          <button aria-label="Not helpful" onClick={() => handleFeedback(false)}>👎</button>
        </div>
      </div>

      {/* Next Up Card */}
      <div className="edu-article-next-up">
        <span className="corner" />
        <p className="label">Next article</p>
        <h4>Risk factors</h4>
        <Link to="/education/article">Continue reading →</Link>
      </div>
    </div>
  );
};

export default ArticleDetail;
