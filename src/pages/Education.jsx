import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import '../styles/education.css';

const Education = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync published articles in real-time
  useEffect(() => {
    const colRef = collection(db, 'educationalContent');
    const q = query(colRef, where('published', '==', true));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      // Sort locally by createdAt descending to bypass composite index requirements
      list.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 
                      a.createdAt?.toDate?.() ? a.createdAt.toDate().getTime() : 
                      new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 
                      b.createdAt?.toDate?.() ? b.createdAt.toDate().getTime() : 
                      new Date(b.createdAt || 0).getTime();
        return (timeB || 0) - (timeA || 0);
      });
      setArticles(list);
      setLoading(false);
    }, (err) => {
      console.error("Firestore education sync error:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const icons = ['?', 'i', '!', '✓', '+', '★'];
  const colors = ['', 'alt', 'alt2'];

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
        <span className="tag">{loading ? '...' : `${articles.length} articles`}</span>
      </div>

      {/* Topics Grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', opacity: 0.6 }}>Loading articles...</div>
      ) : articles.length === 0 ? (
        <div className="empty" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <h3>No topics available</h3>
          <p>Please check back later for educational content.</p>
        </div>
      ) : (
        <div className="edu-grid">
          {articles.map((article, idx) => (
            <Link
              key={article.id}
              to={`/education/article?id=${article.id}`}
              className={`edu-card ${colors[idx % 3]}`}
            >
              <span className="corner" />
              <span className="no">{(idx + 1).toString().padStart(2, '0')}</span>
              <div className="ic">{icons[idx % 6]}</div>
              <div>
                <h4>{article.title}</h4>
                <p>{article.summary}</p>
                <span className="read">Read article</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Education;
