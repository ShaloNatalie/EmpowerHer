import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  fetchArticles, 
  fetchSteps, 
  fetchFacilities, 
  deleteArticle, 
  deleteFacility 
} from '../../services/adminService';
import '../../styles/admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Live database states
  const [articles, setArticles] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [stepsCount, setStepsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Static feedback list from mockup
  const [feedbackList, setFeedbackList] = useState([
    {
      id: 'fb1',
      tag: 'Article feedback',
      comment: '"This explained things very clearly, thank you." — on "What is breast cancer?"',
      meta: 'Helpful: Yes',
      status: 'New',
      reviewed: false
    },
    {
      id: 'fb2',
      tag: 'Self-exam guide feedback',
      comment: '"Step 5 was a bit confusing, maybe add a picture." — on guided self-examination',
      meta: 'Helpful: Not fully',
      status: 'Reviewed',
      reviewed: true
    },
    {
      id: 'fb3',
      tag: 'Clinic directory feedback',
      comment: '"Phone number for County Referral Hospital didn\'t work." — on facility listing',
      meta: 'Helpful: No',
      status: 'New',
      reviewed: false
    }
  ]);

  // Load metrics and preview content
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const articlesData = await fetchArticles();
      const facilitiesData = await fetchFacilities(false); // active/inactive, exclude deleted
      const stepsData = await fetchSteps();

      setArticles(articlesData);
      setFacilities(facilitiesData);
      setStepsCount(stepsData.length);
    } catch (err) {
      console.error("Error loading dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Delete handlers for quick dashboard previews
  const handleDeleteArticle = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    try {
      await deleteArticle(id);
      setArticles(articles.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFacility = async (id) => {
    if (!window.confirm("Are you sure you want to delete this clinic?")) return;
    try {
      await deleteFacility(id);
      setFacilities(facilities.filter(f => f.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkReviewed = (id) => {
    setFeedbackList(feedbackList.map(fb => 
      fb.id === id ? { ...fb, status: 'Reviewed', reviewed: true } : fb
    ));
  };

  // Stats summaries
  const articlesCount = articles.length;
  const clinicsCount = facilities.length;
  const pendingUpdatesCount = 3; // mock static metric matching design reference

  // Preview slices
  const articlesPreview = articles.slice(0, 6);
  const facilitiesPreview = facilities.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Header */}
      <div>
        <p className="eyebrow">Admin</p>
        <h2 className="h1">Admin <em>Dashboard</em></h2>
        <p className="dek">Manage educational content, clinic information, feedback, and system resources for EmpowerHer.</p>
      </div>

      {/* Notice block */}
      <div className="notice">
        <b>Admin scope</b>
        Admin actions should support accurate breast health education and safe user guidance. EmpowerHer does not provide diagnosis, risk prediction, or medical decision-making. Admins cannot view private self-check records or personal health notes.
      </div>

      {/* Section Head: Overview */}
      <div className="section-head">
        <h3>Overview</h3>
        <div className="rule"></div>
        <span className="tag">System summary</span>
      </div>

      {/* Summary Metrics Row */}
      <div className="summary-row">
        <div className="sum-card">
          <span className="corner"></span>
          <p className="value">{loading ? '...' : articlesCount}</p>
          <p className="label">Educational articles</p>
        </div>
        <div className="sum-card alt">
          <span className="corner"></span>
          <p className="value">{loading ? '...' : clinicsCount}</p>
          <p className="label">Listed facilities</p>
        </div>
        <div className="sum-card alt2">
          <span className="corner"></span>
          <p className="value">12</p>
          <p className="label">Feedback responses</p>
        </div>
        <div className="sum-card">
          <span className="corner"></span>
          <p className="value">{loading ? '...' : stepsCount}</p>
          <p className="label">Self-exam steps</p>
        </div>
        <div className="sum-card alt">
          <span className="corner"></span>
          <p className="value flag">{pendingUpdatesCount}</p>
          <p className="label">Pending updates</p>
        </div>
      </div>

      {/* Section Head: Manage */}
      <div className="section-head">
        <h3>Manage</h3>
        <div className="rule"></div>
        <span className="tag">Six areas</span>
      </div>

      {/* Bento Grid Tools */}
      <div className="bento-grid">
        <Link to="/admin/content" className="bento-card">
          <span className="corner"></span>
          <span className="no">01</span>
          <div>
            <h4>Manage Educational Content</h4>
            <p>Create, view, update, and remove breast health awareness articles shown on the Learn page.</p>
            <ul className="act-list">
              <li>Add article</li>
              <li>View articles</li>
              <li>Edit article</li>
              <li>Delete article</li>
            </ul>
          </div>
          <span className="arrow">Edit Library &rarr;</span>
        </Link>

        <Link to="/admin/self-exam-guide" className="bento-card alt">
          <span className="corner"></span>
          <span className="no">02</span>
          <div>
            <h4>Manage Self-Examination Guide</h4>
            <p>Update the step-by-step guidance, health notes, and supportive messages used in the guided self-examination page.</p>
            <ul className="act-list">
              <li>View guide steps</li>
              <li>Edit step</li>
              <li>Update health note</li>
              <li>Manage tutorial images</li>
            </ul>
          </div>
          <span className="arrow">Configure Guide &rarr;</span>
        </Link>

        <Link to="/admin/facilities" className="bento-card alt2">
          <span className="corner"></span>
          <span className="no">03</span>
          <div>
            <h4>Manage Clinic Directory</h4>
            <p>Add and update health facilities shown on the Find Clinic page.</p>
            <ul className="act-list">
              <li>Add facility</li>
              <li>View facilities</li>
              <li>Edit facility</li>
              <li>Delete outdated facility</li>
            </ul>
          </div>
          <span className="arrow">Manage Facilities &rarr;</span>
        </Link>

        <Link to="/admin/feedback" className="bento-card">
          <span className="corner"></span>
          <span className="no">04</span>
          <div>
            <h4>View User Feedback</h4>
            <p>Review article feedback, guide feedback, and clinic listing feedback to improve the app.</p>
            <ul className="act-list">
              <li>View feedback</li>
              <li>Filter by type</li>
              <li>Mark as reviewed</li>
            </ul>
          </div>
          <span className="arrow">Read Feedback &rarr;</span>
        </Link>

        <Link to="/admin/summary" className="bento-card wide alt">
          <span className="corner"></span>
          <span className="no">05</span>
          <div>
            <h4>System Summary</h4>
            <p>View general, non-sensitive system activity such as number of articles, clinics, and feedback submissions.</p>
            <ul className="act-list">
              <li>View summary</li>
              <li>Export report</li>
            </ul>
          </div>
          <span className="arrow">Open Summary &rarr;</span>
        </Link>

        <Link to="/admin/settings" className="bento-card wide alt2">
          <span className="corner"></span>
          <span className="no">06</span>
          <div>
            <h4>Admin Settings</h4>
            <p>Manage admin account preferences and basic system settings.</p>
            <ul className="act-list">
              <li>View admin profile</li>
              <li>Change password</li>
              <li>Log out</li>
            </ul>
          </div>
          <span className="arrow">Configure System &rarr;</span>
        </Link>
      </div>

      {/* Section Head: Educational Content Preview */}
      <div className="section-head">
        <h3>Educational content</h3>
        <div className="rule"></div>
        <span className="tag">Preview</span>
      </div>

      {/* Articles Preview Table */}
      <div className="table-wrap">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>Loading preview...</div>
        ) : articlesPreview.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>No educational articles registered.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Article title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Last updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articlesPreview.map(article => (
                <tr key={article.id}>
                  <td style={{ fontWeight: '600' }}>{article.title}</td>
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
                      <button onClick={() => navigate('/admin/content')}>View</button>
                      <button onClick={() => navigate('/admin/content')}>Edit</button>
                      <button className="danger" onClick={() => handleDeleteArticle(article.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="table-foot" style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '20px' }}>
        <button className="btn-primary" onClick={() => navigate('/admin/content')}>
          Add new article
        </button>
      </div>

      {/* Section Head: Clinic Directory Preview */}
      <div className="section-head">
        <h3>Clinic directory</h3>
        <div className="rule"></div>
        <span className="tag">Preview</span>
      </div>

      {/* Clinics Preview Table */}
      <div className="table-wrap">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>Loading preview...</div>
        ) : facilitiesPreview.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>No clinics registered.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Facility name</th>
                <th>County</th>
                <th>Services</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {facilitiesPreview.map(fac => (
                <tr key={fac.id}>
                  <td style={{ fontWeight: '600' }}>{fac.facilityName}</td>
                  <td>{fac.county}</td>
                  <td>{fac.servicesOffered?.slice(0, 3).join(', ')}</td>
                  <td>{fac.contacts?.phone || 'On file'}</td>
                  <td>
                    <span className={`pill ${fac.status === 'active' ? 'pub' : 'draft'}`}>
                      {fac.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button onClick={() => navigate('/admin/facilities')}>View</button>
                      <button onClick={() => navigate('/admin/facilities')}>Edit</button>
                      <button className="danger" onClick={() => handleDeleteFacility(fac.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="table-foot" style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '20px' }}>
        <button className="btn-primary" onClick={() => navigate('/admin/facilities')}>
          Add new facility
        </button>
      </div>

      {/* Section Head: Feedback Preview */}
      <div className="section-head">
        <h3>Feedback</h3>
        <div className="rule"></div>
        <span className="tag">Preview</span>
      </div>

      {/* Feedback cards lists */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {feedbackList.map(feed => (
          <div key={feed.id} className="fb-card">
            <div>
              <p className="fb-tag">{feed.tag}</p>
              <p className="fb-comment">{feed.comment}</p>
              <p className="fb-meta">{feed.meta}</p>
            </div>
            <div className="fb-right">
              <span className={`pill ${feed.reviewed ? 'reviewed' : 'new'}`}>
                {feed.status}
              </span>
              {!feed.reviewed && (
                <div className="row-actions" style={{ marginTop: '8px' }}>
                  <button onClick={() => navigate('/admin/feedback')}>View</button>
                  <button onClick={() => handleMarkReviewed(feed.id)}>Mark reviewed</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Exit Button */}
      <div style={{ marginTop: '30px', display: 'flex' }}>
        <Link to="/dashboard" className="btn btn-secondary btn-sm" style={{ width: 'auto' }}>
          ← Exit Admin Area
        </Link>
      </div>

    </div>
  );
};

export default AdminDashboard;
