import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const ManageEducation = () => {
  const [articles, setArticles] = useState([
    { id: 1, title: 'Visual Examination Steps', category: 'Self-Exam', author: 'Dr. Jane' },
    { id: 2, title: 'Common Myths Busted', category: 'Myths', author: 'Staff Nurse' },
    { id: 3, title: 'County Support Hubs', category: 'Early Detection', author: 'Admin' }
  ]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Prevention');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title) return;

    const newArt = {
      id: Date.now(),
      title,
      category,
      author: 'Admin'
    };

    setArticles([...articles, newArt]);
    setTitle('');
  };

  const handleDelete = (id) => {
    setArticles(articles.filter(art => art.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="masthead-row">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '500' }}>
            Articles Panel 📚
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Publish new educational articles or revise screening guides.
          </p>
        </div>
        <div className="stamp">Content Control</div>
      </div>

      {/* Add Article Form */}
      <form onSubmit={handleCreate} className="card d-flex flex-column gap-2" style={{ border: '1px solid var(--line)', backgroundColor: 'white', padding: '24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '14px', height: '14px', backgroundColor: 'var(--coral)', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
        
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '600' }}>Add Article Draft</h3>
        <Input
          label="Article Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Diet & Exercise Guidelines"
          required
        />
        
        <div>
          <label className="input-label">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1.5px solid var(--line)',
              backgroundColor: 'var(--paper)',
              fontSize: '14px',
              fontFamily: 'var(--font-body)',
              outline: 'none',
              marginBottom: '12px'
            }}
          >
            <option value="Symptoms">Symptoms</option>
            <option value="Risk Factors">Risk Factors</option>
            <option value="Prevention">Prevention</option>
            <option value="Myths">Myths</option>
            <option value="Early Detection">Early Detection</option>
          </select>
        </div>

        <Button type="submit" variant="primary">Add Draft</Button>
      </form>

      {/* Directory Table */}
      <div>
        <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: '600', marginBottom: '16px' }}>Current Articles</h3>
        
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((art) => (
                <tr key={art.id}>
                  <td>
                    <strong>{art.title}</strong>
                    <br />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>By {art.author}</span>
                  </td>
                  <td>
                    <span className="badge badge-info" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>{art.category}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => alert(`Edit trigger for "${art.title}" (placeholder)`)}
                        style={{ color: 'var(--oxblood)', fontWeight: '600', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(art.id)}
                        style={{ color: 'var(--coral)', fontWeight: '600', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: '8px' }}>
        <Link to="/admin">
          <Button variant="secondary">Back to Admin</Button>
        </Link>
      </div>
    </div>
  );
};

export default ManageEducation;
