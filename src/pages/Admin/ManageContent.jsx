import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  fetchArticles, 
  addArticle, 
  updateArticle, 
  deleteArticle, 
  duplicateArticle, 
  uploadFile 
} from '../../services/adminService';
import '../../styles/admin.css';

const ManageContent = () => {
  // Articles state
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Article Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Breast Cancer Basics');
  const [formSummary, setFormSummary] = useState('');
  const [formContentBody, setFormContentBody] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formReadTime, setFormReadTime] = useState('5');
  const [formAuthor, setFormAuthor] = useState('Admin Staff');
  const [formPublished, setFormPublished] = useState(false);
  
  // Media uploads
  const [featuredImage, setFeaturedImage] = useState(null);
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [galleryUrls, setGalleryUrls] = useState([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const textareaRef = useRef(null);

  // Category Options
  const categories = [
    'Breast Cancer Basics',
    'Risk Factors',
    'Symptoms',
    'Prevention',
    'Myths & Facts',
    'Early Detection',
    'Treatment Information',
    'Survivor Stories'
  ];

  // Load articles
  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await fetchArticles();
      setArticles(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching articles:", err);
      setError("Failed to load educational content. Please try again.");
      showToast("Error loading articles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Handle image upload to storage
  const handleFeaturedImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadFile(file, 'articles/featured');
      setFeaturedImageUrl(url);
      showToast("Featured image uploaded successfully!");
    } catch (err) {
      console.error(err);
      showToast("Failed to upload featured image", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle gallery images upload
  const handleGalleryImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploadingGallery(true);
    try {
      const urls = [];
      for (const file of files) {
        const url = await uploadFile(file, 'articles/gallery');
        if (url) urls.push(url);
      }
      setGalleryUrls([...galleryUrls, ...urls]);
      showToast(`${urls.length} gallery images uploaded!`);
    } catch (err) {
      console.error(err);
      showToast("Failed to upload some gallery images", "error");
    } finally {
      setUploadingGallery(false);
    }
  };

  // Rich text helper insertion
  const insertFormatting = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + selected + after;
    setFormContentBody(text.substring(0, start) + replacement + text.substring(end));
    
    // Maintain focus & selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 50);
  };

  // Save or Update Article
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast("Title is required", "error");
      return;
    }

    const payload = {
      title: formTitle,
      category: formCategory,
      summary: formSummary,
      contentBody: formContentBody,
      mediaURL: featuredImageUrl || 'https://images.unsplash.com/photo-1579684389782-64d84b5e9053?w=500',
      gallery: galleryUrls,
      tags: formTags.split(',').map(tag => tag.trim()).filter(Boolean),
      readingTime: parseInt(formReadTime, 10) || 5,
      author: formAuthor,
      published: formPublished
    };

    // Optimistic UI state updates
    const prevArticles = [...articles];

    try {
      if (selectedArticle && selectedArticle.id) {
        // Edit mode
        const updated = articles.map(art => 
          art.id === selectedArticle.id 
            ? { ...art, ...payload, updatedAt: new Date().toISOString() } 
            : art
        );
        setArticles(updated);
        setIsModalOpen(false);
        showToast("Article updated successfully!");
        
        await updateArticle(selectedArticle.id, payload);
      } else {
        // Create mode
        const tempId = `temp-${Date.now()}`;
        const newArt = { id: tempId, ...payload, views: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setArticles([newArt, ...articles]);
        setIsModalOpen(false);
        showToast("Article created successfully!");
        
        const actualId = await addArticle(payload);
        setArticles(prev => prev.map(art => art.id === tempId ? { ...art, id: actualId } : art));
      }
    } catch (err) {
      console.error(err);
      setArticles(prevArticles); // Rollback
      showToast("Failed to save article", "error");
    }
  };

  // Open Edit Modal
  const startEdit = (article) => {
    setSelectedArticle(article);
    setFormTitle(article.title || '');
    setFormCategory(article.category || 'Breast Cancer Basics');
    setFormSummary(article.summary || '');
    setFormContentBody(article.contentBody || '');
    setFormTags(article.tags?.join(', ') || '');
    setFormReadTime(String(article.readingTime || 5));
    setFormAuthor(article.author || 'Admin Staff');
    setFormPublished(article.published || false);
    setFeaturedImageUrl(article.mediaURL || '');
    setGalleryUrls(article.gallery || []);
    setIsModalOpen(true);
  };

  // Open Create Modal
  const startCreate = () => {
    setSelectedArticle(null);
    setFormTitle('');
    setFormCategory('Breast Cancer Basics');
    setFormSummary('');
    setFormContentBody('');
    setFormTags('');
    setFormReadTime('5');
    setFormAuthor('Admin Staff');
    setFormPublished(false);
    setFeaturedImageUrl('');
    setGalleryUrls([]);
    setIsModalOpen(true);
  };

  // Delete Article
  const handleDeleteArticle = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this article? This action cannot be undone.")) {
      return;
    }

    const prevArticles = [...articles];
    setArticles(articles.filter(art => art.id !== id));
    showToast("Article deleted successfully.");

    try {
      await deleteArticle(id);
    } catch (err) {
      console.error(err);
      setArticles(prevArticles); // Rollback
      showToast("Failed to delete article", "error");
    }
  };

  // Duplicate Article
  const handleDuplicate = async (article) => {
    const tempId = `temp-dup-${Date.now()}`;
    const dup = {
      ...article,
      id: tempId,
      title: `${article.title} (Copy)`,
      published: false,
      views: 0,
      createdAt: new Date().toISOString()
    };
    
    setArticles([dup, ...articles]);
    showToast("Article duplicated as draft!");

    try {
      const actualId = await duplicateArticle(article);
      setArticles(prev => prev.map(art => art.id === tempId ? { ...art, id: actualId } : art));
    } catch (err) {
      console.error(err);
      setArticles(articles.filter(art => art.id !== tempId));
      showToast("Failed to duplicate article", "error");
    }
  };

  // Toggle Publish Status
  const togglePublishStatus = async (article) => {
    const updated = articles.map(art => 
      art.id === article.id ? { ...art, published: !art.published } : art
    );
    setArticles(updated);
    showToast(article.published ? "Article unpublished (draft)" : "Article published!");

    try {
      await updateArticle(article.id, { published: !article.published });
    } catch (err) {
      console.error(err);
      setArticles(articles); // Reset
      showToast("Failed to update status", "error");
    }
  };

  // Open Preview View Modal
  const viewArticleDetails = (article) => {
    setSelectedArticle(article);
    setIsViewModalOpen(true);
  };

  // Stats computation (using local array state)
  const totalArticles = articles.length;
  const publishedCount = articles.filter(art => art.published).length;
  const draftCount = totalArticles - publishedCount;
  const totalViews = articles.reduce((sum, art) => sum + (art.views || 0), 0);

  // Search & Filter & Sort Processing
  const processedArticles = articles
    .filter(art => {
      const matchesSearch = art.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        art.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        art.author?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'All' || art.category === filterCategory;
      const matchesStatus = filterStatus === 'All' || 
        (filterStatus === 'Published' && art.published) || 
        (filterStatus === 'Draft' && !art.published);
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'alpha') return a.title.localeCompare(b.title);
      return 0;
    });

  // Pagination processing
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedArticles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(processedArticles.length / itemsPerPage) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
      
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: toast.type === 'error' ? 'var(--coral)' : 'var(--oxblood-deep)',
          color: 'white',
          padding: '12px 24px',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          border: '1.5px solid var(--ink)',
          zIndex: 2000,
          boxShadow: '4px 4px 0px var(--ink)',
          textTransform: 'uppercase'
        }}>
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <p className="eyebrow">Admin Portal</p>
          <h2 className="h1">Manage <em>Educational Content</em></h2>
          <p className="dek">Write and publish medical awareness resources for the client app.</p>
        </div>
        <button className="btn btn-sm btn-primary" onClick={startCreate} style={{ width: 'auto' }}>
          Add New Article
        </button>
      </div>

      {/* Dashboard Metrics Grid */}
      <div className="admin-grid" style={{ marginBottom: '10px' }}>
        <div className="admin-card">
          <h3>{loading ? '...' : totalArticles}</h3>
          <span>Total Articles</span>
        </div>
        <div className="admin-card">
          <h3>{loading ? '...' : publishedCount}</h3>
          <span>Published</span>
        </div>
        <div className="admin-card">
          <h3>{loading ? '...' : draftCount}</h3>
          <span>Drafts</span>
        </div>
        <div className="admin-card" style={{ borderRight: 'none' }}>
          <h3>{loading ? '...' : totalViews.toLocaleString()}</h3>
          <span>Total Views</span>
        </div>
      </div>

      {/* Search and Filters Panel */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: 'var(--paper-deep)',
        padding: '15px',
        border: '1px solid var(--line)',
        alignItems: 'center'
      }}>
        <div style={{ flex: '1 1 250px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search title, summary, author..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--line)' }}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', width: '100%', flex: '2 1 auto', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: '120px' }}>
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '3px', opacity: 0.7 }}>Category</span>
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              style={{ padding: '6px', border: '1px solid var(--line)', fontFamily: 'var(--font-mono)', fontSize: '11px', background: 'var(--paper)' }}
            >
              <option value="All">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', minWidth: '100px' }}>
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '3px', opacity: 0.7 }}>Status</span>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              style={{ padding: '6px', border: '1px solid var(--line)', fontFamily: 'var(--font-mono)', fontSize: '11px', background: 'var(--paper)' }}
            >
              <option value="All">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', minWidth: '120px' }}>
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '3px', opacity: 0.7 }}>Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '6px', border: '1px solid var(--line)', fontFamily: 'var(--font-mono)', fontSize: '11px', background: 'var(--paper)' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Articles Content List */}
      {loading ? (
        // Skeleton loader
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1, 2, 3, 4].map(n => (
            <div key={n} style={{
              height: '70px',
              backgroundColor: 'var(--paper-deep)',
              border: '1px solid var(--line)',
              animation: 'pulse 1.5s infinite ease-in-out'
            }}></div>
          ))}
        </div>
      ) : currentItems.length === 0 ? (
        // Empty state
        <div style={{
          border: '1px dashed var(--line)',
          padding: '50px 20px',
          textAlign: 'center',
          backgroundColor: 'var(--paper)'
        }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>📖</span>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '5px' }}>No Articles Found</h3>
          <p style={{ opacity: 0.7, fontSize: '13.5px' }}>Change your filters or create a new article to get started.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Thumb</th>
                <th>Title & Author</th>
                <th>Category</th>
                <th style={{ width: '90px' }}>Status</th>
                <th style={{ width: '120px' }}>Updated</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Views</th>
                <th style={{ width: '180px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((article) => (
                <tr key={article.id} style={{ opacity: article.id.startsWith('temp-') ? 0.6 : 1 }}>
                  <td>
                    <img 
                      src={article.mediaURL} 
                      alt="Thumbnail" 
                      style={{
                        width: '45px',
                        height: '45px',
                        objectFit: 'cover',
                        border: '1px solid var(--line)'
                      }}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', fontSize: '14.5px', color: 'var(--ink)' }}>{article.title}</div>
                    <span style={{ fontSize: '11px', opacity: 0.6, fontFamily: 'var(--font-mono)' }}>By {article.author}</span>
                  </td>
                  <td>
                    <span style={{
                      backgroundColor: 'var(--paper-deep)',
                      padding: '2px 6px',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--oxblood)'
                    }}>{article.category}</span>
                  </td>
                  <td>
                    <button 
                      onClick={() => togglePublishStatus(article)}
                      disabled={article.id.startsWith('temp-')}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      <span className={`status-pill ${article.published ? 'status-active' : 'status-pending'}`} style={{
                        backgroundColor: article.published ? '#d1fae5' : '#fef3c7',
                        color: article.published ? '#065f46' : '#92400e',
                        padding: '3px 8px',
                        fontSize: '10.5px',
                        fontFamily: 'var(--font-mono)',
                        textTransform: 'uppercase',
                        borderRadius: '0px',
                        border: '1px solid var(--line)'
                      }}>
                        {article.published ? 'Published' : 'Draft'}
                      </span>
                    </button>
                  </td>
                  <td style={{ fontSize: '12px', opacity: 0.7 }}>
                    {article.updatedAt ? new Date(article.updatedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                    {article.views || 0}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn-mini" 
                        onClick={() => viewArticleDetails(article)}
                        style={{ border: '1px solid var(--line)' }}
                      >
                        View
                      </button>
                      <button 
                        className="btn-mini" 
                        onClick={() => startEdit(article)}
                        disabled={article.id.startsWith('temp-')}
                        style={{ border: '1px solid var(--line)' }}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-mini" 
                        onClick={() => handleDuplicate(article)}
                        disabled={article.id.startsWith('temp-')}
                        style={{ border: '1px solid var(--line)' }}
                      >
                        Clone
                      </button>
                      <button 
                        className="btn-mini danger" 
                        onClick={() => handleDeleteArticle(article.id)}
                        disabled={article.id.startsWith('temp-')}
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
      )}

      {/* Pagination Controls */}
      {processedArticles.length > itemsPerPage && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '10px',
          borderTop: '1px solid var(--line)',
          paddingTop: '15px'
        }}>
          <span style={{ fontSize: '12px', opacity: 0.7, fontFamily: 'var(--font-mono)' }}>
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, processedArticles.length)} of {processedArticles.length}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{ width: 'auto', minHeight: '34px', padding: '6px 12px' }}
            >
              Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{ width: 'auto', minHeight: '34px', padding: '6px 12px' }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Back button */}
      <div style={{ marginTop: '20px' }}>
        <Link to="/admin" className="btn btn-secondary btn-sm" style={{ width: 'auto', display: 'inline-flex' }}>
          ← Back to Admin
        </Link>
      </div>

      {/* ADD/EDIT MODAL OVERLAY */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(36, 19, 24, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1500,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--paper)',
            border: '2px solid var(--ink)',
            width: '90%',
            maxWidth: '850px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '8px 8px 0px var(--ink)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '2px solid var(--ink)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--paper-deep)'
            }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 'bold' }}>
                {selectedArticle ? 'Edit Article' : 'Add New Article'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  color: 'var(--ink)'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', margin: 0 }}>
              <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Title */}
                <div className="field" style={{ margin: 0 }}>
                  <label className="input-label">Article Title</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Understanding Breast Cancer Stages"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  {/* Category */}
                  <div className="field" style={{ margin: 0 }}>
                    <label className="input-label">Category</label>
                    <select
                      className="input-field"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      style={{ padding: '11px 14px' }}
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  {/* Read Time */}
                  <div className="field" style={{ margin: 0 }}>
                    <label className="input-label">Reading Time (Minutes)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={formReadTime}
                      onChange={(e) => setFormReadTime(e.target.value)}
                      min="1"
                      required
                    />
                  </div>

                  {/* Author */}
                  <div className="field" style={{ margin: 0 }}>
                    <label className="input-label">Author/Reviewer</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="field" style={{ margin: 0 }}>
                  <label className="input-label">Summary / Teaser</label>
                  <textarea
                    className="input-field"
                    value={formSummary}
                    onChange={(e) => setFormSummary(e.target.value)}
                    placeholder="Short 2-3 sentence overview for card listings..."
                    rows="2"
                    style={{ resize: 'vertical' }}
                    required
                  />
                </div>

                {/* Rich text editor with formatting toolbar */}
                <div className="field" style={{ margin: 0 }}>
                  <label className="input-label">Content Body</label>
                  
                  {/* Editor Toolbar */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                    border: '1.5px solid var(--line)',
                    borderBottom: 'none',
                    padding: '6px',
                    backgroundColor: 'var(--paper-deep)'
                  }}>
                    <button type="button" className="btn-mini" onClick={() => insertFormatting('<b>', '</b>')}>B</button>
                    <button type="button" className="btn-mini" onClick={() => insertFormatting('<i>', '</i>')}>I</button>
                    <button type="button" className="btn-mini" onClick={() => insertFormatting('<h1>', '</h1>')}>H1</button>
                    <button type="button" className="btn-mini" onClick={() => insertFormatting('<h2>', '</h2>')}>H2</button>
                    <button type="button" className="btn-mini" onClick={() => insertFormatting('<blockquote>', '</blockquote>')}>Quote</button>
                    <button type="button" className="btn-mini" onClick={() => insertFormatting('<ul>\n  <li>', '\n  </li>\n</ul>')}>List</button>
                    <button type="button" className="btn-mini" onClick={() => insertFormatting('<a href="', '" target="_blank">Link</a>')}>Link</button>
                    <button type="button" className="btn-mini" onClick={() => {
                      const url = prompt("Enter image URL:");
                      if (url) insertFormatting(`<img src="${url}" alt="Article Image" style="width:100%; border:1px solid var(--line);" />`);
                    }}>Img URL</button>
                  </div>
                  
                  <textarea
                    id="article-content-body"
                    ref={textareaRef}
                    className="input-field"
                    value={formContentBody}
                    onChange={(e) => setFormContentBody(e.target.value)}
                    placeholder="Write article body in HTML or plain text here..."
                    rows="8"
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      resize: 'vertical',
                      borderTop: 'none',
                      backgroundColor: 'var(--paper)'
                    }}
                    required
                  />
                </div>

                {/* Featured Image URL & Upload */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                  <div className="field" style={{ margin: 0 }}>
                    <label className="input-label">Featured Image (Storage Upload)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFeaturedImageChange}
                      style={{ fontSize: '12px' }}
                    />
                    {uploadingImage && <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--coral)', marginTop: '4px' }}>Uploading image to Firebase...</div>}
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="input-field"
                        value={featuredImageUrl}
                        onChange={(e) => setFeaturedImageUrl(e.target.value)}
                        placeholder="Or paste an image URL..."
                        style={{ padding: '6px 8px', fontSize: '12px' }}
                      />
                      {featuredImageUrl && (
                        <img 
                          src={featuredImageUrl} 
                          alt="Preview" 
                          style={{ width: '40px', height: '40px', objectFit: 'cover', border: '1px solid var(--line)' }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Gallery uploads */}
                  <div className="field" style={{ margin: 0 }}>
                    <label className="input-label">Additional Media Gallery</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryImagesChange}
                      style={{ fontSize: '12px' }}
                    />
                    {uploadingGallery && <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--coral)', marginTop: '4px' }}>Uploading gallery files...</div>}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '5px',
                      marginTop: '8px',
                      maxHeight: '60px',
                      overflowY: 'auto'
                    }}>
                      {galleryUrls.map((url, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <img src={url} alt="Gallery" style={{ width: '30px', height: '30px', objectFit: 'cover', border: '1px solid var(--line)' }} />
                          <button 
                            type="button" 
                            onClick={() => setGalleryUrls(galleryUrls.filter((_, idx) => idx !== i))}
                            style={{
                              position: 'absolute', top: -3, right: -3, padding: 0, 
                              background: 'var(--coral)', color: 'white', border: 'none', 
                              borderRadius: '50%', width: '12px', height: '12px', fontSize: '8px', 
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="field" style={{ margin: 0 }}>
                  <label className="input-label">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="e.g. selfcheck, education, symptoms, oncology"
                  />
                </div>

                {/* Status Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                  <input
                    type="checkbox"
                    id="published"
                    checked={formPublished}
                    onChange={(e) => setFormPublished(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="published" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase' }}>
                    Publish Immediately (Active on user feed)
                  </label>
                </div>

              </div>

              {/* Modal Footer Actions */}
              <div style={{
                padding: '16px 20px',
                borderTop: '2px solid var(--ink)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                backgroundColor: 'var(--paper-deep)'
              }}>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setIsModalOpen(false)}
                  style={{ width: 'auto' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-sm" 
                  style={{ width: 'auto' }}
                >
                  {selectedArticle ? 'Save Changes' : 'Create Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {isViewModalOpen && selectedArticle && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(36, 19, 24, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1500,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--paper)',
            border: '2px solid var(--ink)',
            width: '90%',
            maxWidth: '750px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '8px 8px 0px var(--ink)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '2px solid var(--ink)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--paper-deep)'
            }}>
              <div>
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--coral)', textTransform: 'uppercase' }}>
                  {selectedArticle.category} • {selectedArticle.readingTime} min read
                </span>
                <h3 style={{ margin: '4px 0 0', fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 'bold' }}>
                  {selectedArticle.title}
                </h3>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  color: 'var(--ink)'
                }}
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <img 
                src={selectedArticle.mediaURL} 
                alt="Featured" 
                style={{ width: '100%', height: '240px', objectFit: 'cover', border: '1px solid var(--line)' }}
              />

              <div className="editor-note" style={{ margin: 0 }}>
                <b>Summary</b>
                {selectedArticle.summary}
              </div>

              {/* Formatted body HTML parser */}
              <div 
                style={{
                  fontSize: '14.5px',
                  lineHeight: '1.6',
                  color: 'var(--ink)'
                }}
                dangerouslySetInnerHTML={{ __html: selectedArticle.contentBody || '<i>No content written yet.</i>' }}
              />

              {/* Gallery (if any) */}
              {selectedArticle.gallery && selectedArticle.gallery.length > 0 && (
                <div>
                  <h5 style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--oxblood)' }}>
                    Additional Media Gallery
                  </h5>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedArticle.gallery.map((url, index) => (
                      <img 
                        key={index}
                        src={url}
                        alt={`Gallery ${index}`}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', border: '1px solid var(--line)' }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata details */}
              <div style={{
                marginTop: '15px',
                borderTop: '1px solid var(--line)',
                paddingTop: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                opacity: 0.7
              }}>
                <div>Author: {selectedArticle.author}</div>
                <div>Status: {selectedArticle.published ? 'Published' : 'Draft'}</div>
                <div>Views: {selectedArticle.views || 0}</div>
                <div>Last Updated: {selectedArticle.updatedAt ? new Date(selectedArticle.updatedAt).toLocaleString() : 'N/A'}</div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 20px',
              borderTop: '2px solid var(--ink)',
              display: 'flex',
              justifyContent: 'flex-end',
              backgroundColor: 'var(--paper-deep)'
            }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => setIsViewModalOpen(false)}
                style={{ width: 'auto' }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageContent;
