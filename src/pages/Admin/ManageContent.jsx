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

  // Active View Tab State: 'list' | 'form' | 'empty'
  const [currentView, setCurrentView] = useState('list');

  // Search & Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Article Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Breast Cancer Basics');
  const [formSummary, setFormSummary] = useState('');
  const [formContentBody, setFormContentBody] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formReadTime, setFormReadTime] = useState('4 minute read');
  const [formAuthor, setFormAuthor] = useState('Admin Staff');
  const [formPublished, setFormPublished] = useState(false);
  
  // Media uploads
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
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
      if (data.length === 0) {
        setCurrentView('empty');
      } else {
        setCurrentView('list');
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching articles:", err);
      setError("Failed to load educational content.");
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
    }, 4500);
  };

  // Upload featured image
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

  // Upload gallery images
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
      showToast("Failed to upload gallery images", "error");
    } finally {
      setUploadingGallery(false);
    }
  };

  // Formatting insert
  const insertFormatting = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + selected + after;
    setFormContentBody(text.substring(0, start) + replacement + text.substring(end));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 50);
  };

  // Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast("Title is required", "error");
      return;
    }

    // Parse reading time to integer if possible, default to 4
    const numericReadTime = parseInt(formReadTime.replace(/[^0-9]/g, ''), 10) || 4;

    const payload = {
      title: formTitle,
      category: formCategory,
      summary: formSummary,
      contentBody: formContentBody,
      mediaURL: featuredImageUrl || 'https://images.unsplash.com/photo-1579684389782-64d84b5e9053?w=500',
      gallery: galleryUrls,
      tags: formTags.split(',').map(tag => tag.trim()).filter(Boolean),
      readingTime: numericReadTime,
      author: formAuthor,
      published: formPublished
    };

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
        setCurrentView('list');
        showToast("Article updated successfully!");
        
        await updateArticle(selectedArticle.id, payload);
      } else {
        // Create mode
        const tempId = `temp-${Date.now()}`;
        const newArt = { id: tempId, ...payload, views: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setArticles([newArt, ...articles]);
        setCurrentView('list');
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

  // Open Edit Form
  const startEdit = (article) => {
    setSelectedArticle(article);
    setFormTitle(article.title || '');
    setFormCategory(article.category || 'Breast Cancer Basics');
    setFormSummary(article.summary || '');
    setFormContentBody(article.contentBody || '');
    setFormTags(article.tags?.join(', ') || '');
    setFormReadTime(article.readingTime ? `${article.readingTime} minute read` : '4 minute read');
    setFormAuthor(article.author || 'Admin Staff');
    setFormPublished(article.published || false);
    setFeaturedImageUrl(article.mediaURL || '');
    setGalleryUrls(article.gallery || []);
    setCurrentView('form');
  };

  // Open Create Form
  const startCreate = () => {
    setSelectedArticle(null);
    setFormTitle('');
    setFormCategory('Breast Cancer Basics');
    setFormSummary('');
    setFormContentBody('');
    setFormTags('');
    setFormReadTime('4 minute read');
    setFormAuthor('Admin Staff');
    setFormPublished(false);
    setFeaturedImageUrl('');
    setGalleryUrls([]);
    setCurrentView('form');
  };

  // Trigger Delete Confirmation Modal
  const triggerDelete = (id) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  // Close Delete Modal
  const closeDelete = () => {
    setDeleteTargetId(null);
    setIsDeleteModalOpen(false);
  };

  // Confirmed Delete
  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    
    const prevArticles = [...articles];
    const updatedArticles = articles.filter(art => art.id !== deleteTargetId);
    setArticles(updatedArticles);
    closeDelete();
    showToast("Article deleted successfully.");

    if (updatedArticles.length === 0) {
      setCurrentView('empty');
    }

    try {
      await deleteArticle(deleteTargetId);
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

  const viewArticleDetails = (article) => {
    setSelectedArticle(article);
    setIsViewModalOpen(true);
  };

  // Search & Filters processing
  const processedArticles = articles.filter(art => {
    const matchesSearch = art.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.author?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'All' || art.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || 
      (filterStatus === 'Published' && art.published) || 
      (filterStatus === 'Draft' && !art.published);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination processing
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedArticles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(processedArticles.length / itemsPerPage) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
      
      {/* Toast Notification Banner */}
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
      <div>
        <p className="eyebrow">Admin / A2</p>
        <h2 className="h1">Manage Educational <em>Content</em></h2>
        <p className="dek">Create and update breast health awareness articles shown to users.</p>
      </div>

      {/* Demo Switch Tabs */}
      <div className="demo-switch">
        <button 
          className={currentView === 'list' ? 'on' : ''} 
          onClick={() => setCurrentView(articles.length === 0 ? 'empty' : 'list')}
        >
          Article list
        </button>
        <button 
          className={currentView === 'form' ? 'on' : ''} 
          onClick={() => {
            if (!selectedArticle) startCreate();
            setCurrentView('form');
          }}
        >
          Add / edit article
        </button>
        <button 
          className={currentView === 'empty' ? 'on' : ''} 
          onClick={() => setCurrentView('empty')}
        >
          Empty state
        </button>
      </div>

      {/* VIEW: ARTICLE LIST */}
      {currentView === 'list' && (
        <div className="view show" id="view-list">
          {/* Filters and search toolbar */}
          <div className="toolbar">
            <div className="filters">
              <input 
                type="text" 
                placeholder="Search articles..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
              <select 
                value={filterCategory} 
                onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">All categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select 
                value={filterStatus} 
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">All statuses</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
            <button className="btn-primary" onClick={startCreate}>Add new article</button>
          </div>

          {/* Table Container */}
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>Loading articles...</div>
          ) : currentItems.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>No matching articles found.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Last updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((article) => (
                    <tr key={article.id} style={{ opacity: article.id.startsWith('temp-') ? 0.6 : 1 }}>
                      <td style={{ fontWeight: '600' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <img src={article.mediaURL} alt="Thumb" style={{ width: '30px', height: '30px', objectFit: 'cover', border: '1px solid var(--line)' }} />
                          <span>{article.title}</span>
                        </div>
                      </td>
                      <td>{article.category}</td>
                      <td>
                        <span className={`pill ${article.published ? 'pub' : 'draft'}`}>
                          {article.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td>
                        {article.updatedAt ? new Date(article.updatedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button onClick={() => viewArticleDetails(article)}>View</button>
                          <button onClick={() => startEdit(article)} disabled={article.id.startsWith('temp-')}>Edit</button>
                          <button onClick={() => handleDuplicate(article)} disabled={article.id.startsWith('temp-')}>Clone</button>
                          <button className="danger" onClick={() => triggerDelete(article.id)} disabled={article.id.startsWith('temp-')}>Delete</button>
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
              marginTop: '15px'
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

        </div>
      )}

      {/* VIEW: ADD / EDIT FORM */}
      {currentView === 'form' && (
        <div className="view show" id="view-form">
          <div className="form-card">
            <p className="form-title">
              {selectedArticle ? 'Edit Article' : 'Add New Article'}
            </p>
            <p className="form-sub">Fields shown here match what appears on the Learn page.</p>
            
            <form onSubmit={handleFormSubmit}>
              {/* Title */}
              <div className="field">
                <label>Article title</label>
                <input 
                  type="text" 
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. What is breast cancer?"
                  required
                />
              </div>

              {/* Category & Read Time Row */}
              <div className="field-row">
                <div className="field">
                  <label>Category</label>
                  <select 
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Read time</label>
                  <input 
                    type="text" 
                    value={formReadTime}
                    onChange={(e) => setFormReadTime(e.target.value)}
                    placeholder="e.g. 4 minute read"
                    required
                  />
                </div>
              </div>

              {/* Short description */}
              <div className="field">
                <label>Short description</label>
                <input 
                  type="text" 
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="One line shown on the Learn category card"
                  required
                />
              </div>

              {/* Article body with toolbar */}
              <div className="field">
                <label>Article body</label>
                
                {/* Micro Editor Toolbar */}
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  border: '1.5px solid var(--line)',
                  borderBottom: 'none',
                  padding: '6px',
                  backgroundColor: 'var(--paper-deep)'
                }}>
                  <button type="button" className="btn-mini" onClick={() => insertFormatting('<b>', '</b>')} style={{ padding: '4px 8px' }}>B</button>
                  <button type="button" className="btn-mini" onClick={() => insertFormatting('<i>', '</i>')} style={{ padding: '4px 8px' }}>I</button>
                  <button type="button" className="btn-mini" onClick={() => insertFormatting('<h1>', '</h1>')} style={{ padding: '4px 8px' }}>H1</button>
                  <button type="button" className="btn-mini" onClick={() => insertFormatting('<h2>', '</h2>')} style={{ padding: '4px 8px' }}>H2</button>
                  <button type="button" className="btn-mini" onClick={() => insertFormatting('<blockquote>', '</blockquote>')} style={{ padding: '4px 8px' }}>Quote</button>
                  <button type="button" className="btn-mini" onClick={() => insertFormatting('<ul>\n  <li>', '\n  </li>\n</ul>')} style={{ padding: '4px 8px' }}>List</button>
                </div>

                <textarea 
                  ref={textareaRef}
                  value={formContentBody}
                  onChange={(e) => setFormContentBody(e.target.value)}
                  placeholder="Write the full article content here..."
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '13.5px',
                    borderTop: 'none',
                    backgroundColor: 'var(--paper)'
                  }}
                  required
                />
              </div>

              {/* Media uploads (Storage Integration) */}
              <div className="field-row" style={{ border: '1px solid var(--line)', padding: '15px', backgroundColor: 'var(--paper-deep)', marginBottom: '20px' }}>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Featured Cover Image</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFeaturedImageChange}
                    style={{ fontSize: '11px', borderBottom: 'none' }}
                  />
                  {uploadingImage && <div style={{ fontSize: '11px', color: 'var(--coral)', fontFamily: 'var(--font-mono)' }}>Uploading featured cover...</div>}
                  <input 
                    type="text" 
                    placeholder="Or paste cover URL..."
                    value={featuredImageUrl}
                    onChange={(e) => setFeaturedImageUrl(e.target.value)}
                    style={{ fontSize: '12px', padding: '6px', marginTop: '6px', background: 'var(--paper)' }}
                  />
                </div>

                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Media Gallery Files</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleGalleryImagesChange}
                    style={{ fontSize: '11px', borderBottom: 'none' }}
                  />
                  {uploadingGallery && <div style={{ fontSize: '11px', color: 'var(--coral)', fontFamily: 'var(--font-mono)' }}>Uploading gallery images...</div>}
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {galleryUrls.map((url, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={url} alt="Gallery item" style={{ width: '25px', height: '25px', objectFit: 'cover', border: '1px solid var(--line)' }} />
                        <button 
                          type="button" 
                          onClick={() => setGalleryUrls(galleryUrls.filter((_, idx) => idx !== i))}
                          style={{
                            position: 'absolute', top: -3, right: -3, background: 'var(--coral)', color: 'white', border: 'none', 
                            borderRadius: '50%', width: '10px', height: '10px', fontSize: '6px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="field">
                <label>Tags (Comma-separated)</label>
                <input 
                  type="text" 
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="e.g. Basics, Awareness, Symptoms"
                />
              </div>

              {/* Status Radio Options & Author */}
              <div className="field-row">
                <div className="field">
                  <label>Status</label>
                  <div className="choice-row">
                    <label className="choice">
                      <input 
                        type="radio" 
                        name="status" 
                        checked={formPublished}
                        onChange={() => setFormPublished(true)}
                      /> 
                      Published
                    </label>
                    <label className="choice">
                      <input 
                        type="radio" 
                        name="status" 
                        checked={!formPublished}
                        onChange={() => setFormPublished(false)}
                      /> 
                      Draft
                    </label>
                  </div>
                </div>
                
                <div className="field">
                  <label>Author / admin</label>
                  <input 
                    type="text" 
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="Admin name"
                  />
                </div>
              </div>

              {/* Form actions */}
              <div className="form-actions">
                <button type="submit" className="btn-primary">Save article</button>
                <button 
                  type="button" 
                  className="btn-ghost" 
                  onClick={() => setCurrentView(articles.length === 0 ? 'empty' : 'list')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW: EMPTY STATE */}
      {currentView === 'empty' && (
        <div className="view show" id="view-empty">
          <div className="empty">
            <h3>No articles yet</h3>
            <p>Add your first educational article so it appears on the Learn page.</p>
            <button className="btn-primary" onClick={startCreate}>Add new article</button>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      <div className={`modal-overlay ${isDeleteModalOpen ? 'show' : ''}`} id="deleteModal">
        <div className="modal">
          <h4>Delete this article?</h4>
          <p>This will remove the article from the Learn page. This action cannot be undone.</p>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={closeDelete}>Cancel</button>
            <button 
              className="btn-secondary" 
              style={{ borderColor: 'var(--oxblood)', color: 'var(--oxblood)' }} 
              onClick={confirmDelete}
            >
              Delete article
            </button>
          </div>
        </div>
      </div>

      {/* VIEW ARTICLE PREVIEW MODAL */}
      {isViewModalOpen && selectedArticle && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(36, 19, 24, 0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1500, padding: '20px'
        }}>
          <div className="form-card" style={{ backgroundColor: 'var(--paper)', width: '90%', maxWidth: '700px', maxHeight: '85vh', overflowY: 'auto' }}>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--coral)', textTransform: 'uppercase' }}>
              {selectedArticle.category} • {selectedArticle.readingTime} min read
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', margin: '4px 0 12px', fontWeight: 'bold' }}>
              {selectedArticle.title}
            </h3>
            
            <img src={selectedArticle.mediaURL} alt="Featured cover" style={{ width: '100%', height: '220px', objectFit: 'cover', border: '1px solid var(--line)', marginBottom: '15px' }} />
            
            <p style={{ fontWeight: '500', fontSize: '14px', fontStyle: 'italic', marginBottom: '15px' }}>{selectedArticle.summary}</p>
            
            <div style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }} dangerouslySetInnerHTML={{ __html: selectedArticle.contentBody }} />

            {selectedArticle.gallery && selectedArticle.gallery.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '15px' }}>
                {selectedArticle.gallery.map((url, i) => (
                  <img key={i} src={url} alt="gallery" style={{ width: '70px', height: '70px', objectFit: 'cover', border: '1px solid var(--line)' }} />
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid var(--line)', paddingTop: '15px' }}>
              <button className="btn-mini" onClick={() => setIsViewModalOpen(false)}>Close Preview</button>
            </div>
          </div>
        </div>
      )}

      {/* Back button */}
      <div style={{ marginTop: '20px' }}>
        <Link to="/admin" className="btn btn-secondary btn-sm" style={{ width: 'auto', display: 'inline-flex' }}>
          ← Back to Admin
        </Link>
      </div>

    </div>
  );
};

export default ManageContent;
