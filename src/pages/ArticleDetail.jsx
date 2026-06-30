import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import '../styles/education.css';

const ArticleDetail = () => {
  const [searchParams] = useSearchParams();
  const articleId = searchParams.get('id');

  const [article, setArticle] = useState(null);
  const [nextArticle, setNextArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    const loadArticleData = async () => {
      if (!articleId) return;
      setLoading(true);
      setFeedbackSubmitted(false);
      try {
        // Load active article
        const docRef = doc(db, 'educationalContent', articleId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const activeData = { id: docSnap.id, ...docSnap.data() };
          setArticle(activeData);

          // Fetch all published articles to find "Next Up" article dynamically
          const colRef = collection(db, 'educationalContent');
          const q = query(colRef, where('published', '==', true));
          const snapshot = await getDocs(q);
          const list = [];
          snapshot.forEach(d => {
            list.push({ id: d.id, ...d.data() });
          });

          // Sort list locally to avoid composite index requirements
          list.sort((a, b) => {
            const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 
                          a.createdAt?.toDate?.() ? a.createdAt.toDate().getTime() : 
                          new Date(a.createdAt || 0).getTime();
            const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 
                          b.createdAt?.toDate?.() ? b.createdAt.toDate().getTime() : 
                          new Date(b.createdAt || 0).getTime();
            return (timeB || 0) - (timeA || 0);
          });

          // Find current index
          const currIdx = list.findIndex(item => item.id === articleId);
          if (list.length > 1 && currIdx !== -1) {
            const nextIdx = (currIdx + 1) % list.length;
            setNextArticle(list[nextIdx]);
          } else {
            setNextArticle(null);
          }
        }
      } catch (err) {
        console.error("Error loading article detail:", err);
      } finally {
        setLoading(false);
      }
    };

    loadArticleData();
  }, [articleId]);

  const handleFeedbackSubmit = async (isHelpful) => {
    if (!article) return;
    try {
      await addDoc(collection(db, 'userFeedback'), {
        tag: 'Article feedback',
        comment: `User marked article "${article.title}" as ${isHelpful ? 'helpful' : 'not helpful'}.`,
        meta: `Helpful: ${isHelpful ? 'Yes' : 'No'}`,
        status: 'New',
        reviewed: false,
        createdAt: new Date().toISOString()
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error("Error saving user feedback:", err);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', opacity: 0.6 }}>Loading article content...</div>;
  }

  if (!article) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Article not found</h3>
        <p>The requested educational topic does not exist or is unpublished.</p>
        <Link to="/education" className="edu-article-back">Back to topics</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px' }}>
      {/* Back to Topics */}
      <Link to="/education" className="edu-article-back">
        Back to topics
      </Link>

      {/* Article Header info */}
      <div>
        <span className="edu-article-tag">Educational Content</span>
        <h1 className="edu-article-title">
          {article.title}
        </h1>
        <p className="edu-article-meta">
          {article.readingTime ? `${article.readingTime} minute read` : '4 minute read'} · Available offline
        </p>
      </div>

      {/* Hero Cover Image or default placeholder */}
      {article.mediaURL ? (
        <img 
          src={article.mediaURL} 
          alt={article.title} 
          style={{ width: '100%', height: '240px', objectFit: 'cover', border: '1px solid var(--line)', marginBottom: '24px' }} 
        />
      ) : (
        <div className="edu-article-ic-hero">?</div>
      )}

      {/* Article Body */}
      <article 
        className="edu-article-body" 
        dangerouslySetInnerHTML={{ __html: article.contentBody }}
      />

      {/* Media Gallery if exists */}
      {article.gallery && article.gallery.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '24px 0' }}>
          {article.gallery.map((url, index) => (
            <img 
              key={index} 
              src={url} 
              alt={`Gallery ${index}`} 
              style={{ width: '80px', height: '80px', objectFit: 'cover', border: '1px solid var(--line)' }} 
            />
          ))}
        </div>
      )}

      {/* Health Note Banner */}
      <div className="edu-article-notice">
        <b>Health note</b>
        This content is for breast health awareness and education only. It does not diagnose breast cancer or replace professional medical advice. Please visit a qualified healthcare provider if you notice unusual changes or need medical support.
      </div>

      {/* Feedback section */}
      <div className="edu-article-feedback">
        {feedbackSubmitted ? (
          <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓ Thank you for your feedback!</p>
        ) : (
          <>
            <p>Was this article helpful?</p>
            <div className="btns">
              <button aria-label="Helpful" onClick={() => handleFeedbackSubmit(true)}>👍</button>
              <button aria-label="Not helpful" onClick={() => handleFeedbackSubmit(false)}>👎</button>
            </div>
          </>
        )}
      </div>

      {/* Next Up Card */}
      {nextArticle && (
        <div className="edu-article-next-up">
          <span className="corner" />
          <p className="label">Next article</p>
          <h4>{nextArticle.title}</h4>
          <Link to={`/education/article?id=${nextArticle.id}`}>Continue reading →</Link>
        </div>
      )}
    </div>
  );
};

export default ArticleDetail;
