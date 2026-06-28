import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  fetchSteps, 
  addStep, 
  updateStep, 
  deleteStep, 
  saveStepsOrder, 
  uploadFile 
} from '../../services/adminService';
import '../../styles/admin.css';

const ManageSelfExamGuide = () => {
  // Steps State
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStepId, setExpandedStepId] = useState(null);
  const [toast, setToast] = useState(null);
  
  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewActiveStep, setPreviewActiveStep] = useState(0);
  const [selectedStep, setSelectedStep] = useState(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formStepNumber, setFormStepNumber] = useState('');
  const [formShortExplanation, setFormShortExplanation] = useState('');
  const [formInstruction, setFormInstruction] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formDuration, setFormDuration] = useState('2 mins');
  const [formWarning, setFormWarning] = useState('');
  const [formSafetyNote, setFormSafetyNote] = useState('');
  const [formTipBox, setFormTipBox] = useState('');
  const [formOfflineMode, setFormOfflineMode] = useState(true);
  const [formPublished, setFormPublished] = useState(false);

  // Form Media Uploads
  const [imageUrl, setImageUrl] = useState('');
  const [illustrationUrl, setIllustrationUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  
  // Upload status indicator
  const [uploadProgress, setUploadProgress] = useState({ type: '', active: false });

  // Load steps from Firestore
  const loadSteps = async () => {
    setLoading(true);
    try {
      const data = await fetchSteps();
      // Sort by stepNumber ascending
      const sorted = [...data].sort((a, b) => a.stepNumber - b.stepNumber);
      setSteps(sorted);
      setError(null);
    } catch (err) {
      console.error("Error fetching self exam guide steps:", err);
      setError("Failed to load guide steps. Please try again.");
      showToast("Error loading steps", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSteps();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Upload handler for different media fields
  const handleMediaUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadProgress({ type, active: true });
    try {
      const url = await uploadFile(file, `self-exam/${type}`);
      if (type === 'image') setImageUrl(url);
      if (type === 'illustration') setIllustrationUrl(url);
      if (type === 'audio') setAudioUrl(url);
      showToast(`${type.toUpperCase()} file uploaded successfully!`);
    } catch (err) {
      console.error(err);
      showToast(`Failed to upload ${type}`, 'error');
    } finally {
      setUploadProgress({ type: '', active: false });
    }
  };

  // Open Editor for Creating Step
  const startCreate = () => {
    setSelectedStep(null);
    setFormTitle('');
    // Auto-calculate next step number
    setFormStepNumber(String(steps.length + 1));
    setFormShortExplanation('');
    setFormInstruction('');
    setImageUrl('');
    setIllustrationUrl('');
    setFormVideoUrl('');
    setAudioUrl('');
    setFormDuration('2 mins');
    setFormWarning('');
    setFormSafetyNote('');
    setFormTipBox('');
    setFormOfflineMode(true);
    setFormPublished(false);
    setIsEditorOpen(true);
  };

  // Open Editor for Editing Step
  const startEdit = (step) => {
    setSelectedStep(step);
    setFormTitle(step.title || '');
    setFormStepNumber(String(step.stepNumber || 1));
    setFormShortExplanation(step.shortExplanation || '');
    setFormInstruction(step.instruction || '');
    setImageUrl(step.imageURL || '');
    setIllustrationUrl(step.illustrationURL || '');
    setFormVideoUrl(step.videoURL || '');
    setAudioUrl(step.audioURL || '');
    setFormDuration(step.duration || '2 mins');
    setFormWarning(step.warning || '');
    setFormSafetyNote(step.safetyNote || '');
    setFormTipBox(step.tipBox || '');
    setFormOfflineMode(step.offlineMode ?? true);
    setFormPublished(step.published || false);
    setIsEditorOpen(true);
  };

  // Submit Step (Add or Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast("Step title is required", "error");
      return;
    }

    const payload = {
      title: formTitle,
      stepNumber: parseInt(formStepNumber, 10) || steps.length + 1,
      shortExplanation: formShortExplanation,
      instruction: formInstruction,
      imageURL: imageUrl,
      illustrationURL: illustrationUrl,
      videoURL: formVideoUrl,
      audioURL: audioUrl,
      duration: formDuration,
      warning: formWarning,
      safetyNote: formSafetyNote,
      tipBox: formTipBox,
      offlineMode: formOfflineMode,
      published: formPublished
    };

    const prevSteps = [...steps];

    try {
      if (selectedStep && selectedStep.id) {
        // Edit Mode (Optimistic UI)
        const updated = steps.map(s => 
          s.id === selectedStep.id ? { ...s, ...payload } : s
        ).sort((a, b) => a.stepNumber - b.stepNumber);
        setSteps(updated);
        setIsEditorOpen(false);
        showToast("Step updated successfully.");

        await updateStep(selectedStep.id, payload);
      } else {
        // Create Mode (Optimistic UI)
        const tempId = `temp-${Date.now()}`;
        const newStep = { id: tempId, ...payload, updatedAt: new Date().toISOString() };
        const updated = [...steps, newStep].sort((a, b) => a.stepNumber - b.stepNumber);
        setSteps(updated);
        setIsEditorOpen(false);
        showToast("Step created successfully.");

        const actualId = await addStep(payload);
        setSteps(prev => prev.map(s => s.id === tempId ? { ...s, id: actualId } : s));
      }
    } catch (err) {
      console.error(err);
      setSteps(prevSteps); // Rollback
      showToast("Failed to save step.", "error");
    }
  };

  // Delete Step
  const handleDeleteStep = async (id) => {
    if (!window.confirm("Are you sure you want to delete this step from the guide?")) {
      return;
    }

    const prevSteps = [...steps];
    const filtered = steps.filter(s => s.id !== id);
    // Auto-adjust remaining steps numbers
    const renumbered = filtered.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setSteps(renumbered);
    showToast("Step deleted. Reordering tutorial...");

    try {
      await deleteStep(id);
      await saveStepsOrder(renumbered);
    } catch (err) {
      console.error(err);
      setSteps(prevSteps); // Rollback
      showToast("Failed to delete step.", "error");
    }
  };

  // Reordering steps (Up & Down)
  const moveStep = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === steps.length - 1) return;

    const newSteps = [...steps];
    const swapTarget = direction === 'up' ? index - 1 : index + 1;
    
    // Swap steps
    const temp = newSteps[index];
    newSteps[index] = newSteps[swapTarget];
    newSteps[swapTarget] = temp;

    // Renumber strictly
    const reordered = newSteps.map((s, idx) => ({
      ...s,
      stepNumber: idx + 1
    }));

    setSteps(reordered);
    showToast("Step reordered successfully.");

    try {
      await saveStepsOrder(reordered);
    } catch (err) {
      console.error(err);
      setSteps(steps); // Rollback
      showToast("Failed to persist reordering to database", "error");
    }
  };

  // Duplicate step
  const handleDuplicate = async (step) => {
    const tempId = `temp-dup-${Date.now()}`;
    // Insert duplicated step immediately after current step
    const index = steps.findIndex(s => s.id === step.id);
    
    const dupPayload = {
      ...step,
      title: `${step.title} (Copy)`,
      published: false
    };
    delete dupPayload.id;
    delete dupPayload.updatedAt;

    const tempStep = { id: tempId, ...dupPayload, stepNumber: step.stepNumber + 1 };
    
    const copyList = [...steps];
    copyList.splice(index + 1, 0, tempStep);
    
    // Renumber
    const renumbered = copyList.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setSteps(renumbered);
    showToast("Duplicated step! Reordering guide...");

    try {
      const actualId = await addStep(dupPayload);
      const finalRenumbered = renumbered.map(s => s.id === tempId ? { ...s, id: actualId } : s);
      setSteps(finalRenumbered);
      await saveStepsOrder(finalRenumbered);
    } catch (err) {
      console.error(err);
      loadSteps(); // Full reload to ensure sync
      showToast("Failed to duplicate step", "error");
    }
  };

  // Toggle publish status of a step
  const togglePublishStatus = async (step) => {
    const updated = steps.map(s => 
      s.id === step.id ? { ...s, published: !s.published } : s
    );
    setSteps(updated);
    showToast(step.published ? "Step unpublished (draft)" : "Step published!");

    try {
      await updateStep(step.id, { published: !step.published });
    } catch (err) {
      console.error(err);
      setSteps(steps); // Reset
      showToast("Failed to update status", "error");
    }
  };

  // Release/Publish full tutorial to users
  const handlePublishAll = async () => {
    if (!window.confirm("Publish tutorial updates? All published steps will immediately update on user client applications.")) {
      return;
    }
    
    // Find all published steps
    const publishedSteps = steps.filter(s => s.published);
    if (publishedSteps.length === 0) {
      showToast("No published steps found. Publish some steps first!", "error");
      return;
    }

    showToast("Guide tutorial changes released successfully!");
  };

  // Accordion toggle
  const toggleAccordion = (id) => {
    setExpandedStepId(expandedStepId === id ? null : id);
  };

  // Filtered steps based on search title
  const filteredSteps = steps.filter(s => 
    s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.shortExplanation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.instruction?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats computation
  const totalSteps = steps.length;
  const publishedStepsCount = steps.filter(s => s.published).length;
  const draftStepsCount = totalSteps - publishedStepsCount;
  const mediaCount = steps.filter(s => s.imageURL || s.illustrationURL || s.videoURL || s.audioURL).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
      
      {/* Toast Banner */}
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
          <h2 className="h1">Manage <em>Self-Exam Guide</em></h2>
          <p className="dek">Build and reorder the step-by-step guided check for breast examinations.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-sm btn-secondary" onClick={() => { setPreviewActiveStep(0); setIsPreviewOpen(true); }} style={{ width: 'auto' }}>
            Preview Tutorial
          </button>
          <button className="btn btn-sm btn-primary" onClick={startCreate} style={{ width: 'auto' }}>
            Add Step
          </button>
        </div>
      </div>

      {/* Metrics Dashboards */}
      <div className="admin-grid" style={{ marginBottom: '10px' }}>
        <div className="admin-card">
          <h3>{loading ? '...' : totalSteps}</h3>
          <span>Total Steps</span>
        </div>
        <div className="admin-card">
          <h3>{loading ? '...' : publishedStepsCount}</h3>
          <span>Published steps</span>
        </div>
        <div className="admin-card">
          <h3>{loading ? '...' : draftStepsCount}</h3>
          <span>Drafts</span>
        </div>
        <div className="admin-card" style={{ borderRight: 'none' }}>
          <h3>{loading ? '...' : mediaCount}</h3>
          <span>Media Files Attached</span>
        </div>
      </div>

      {/* Top Search & Publish actions bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: 'var(--paper-deep)',
        padding: '15px',
        border: '1px solid var(--line)',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ flex: '0 1 300px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search guide steps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--line)' }}
          />
        </div>
        <div>
          <button className="btn btn-sm btn-primary" onClick={handlePublishAll} style={{ width: 'auto', backgroundColor: 'var(--oxblood)' }}>
            Publish Tutorial changes
          </button>
        </div>
      </div>

      {/* Interactive Accordions Steps Builder */}
      {loading ? (
        // Skeletons
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ height: '60px', backgroundColor: 'var(--paper-deep)', border: '1px solid var(--line)', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
          ))}
        </div>
      ) : filteredSteps.length === 0 ? (
        <div style={{ border: '1px dashed var(--line)', padding: '50px 20px', textAlign: 'center', backgroundColor: 'var(--paper)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>🧘</span>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '5px' }}>No Steps in Tutorial</h3>
          <p style={{ opacity: 0.7, fontSize: '13.5px' }}>Add step to launch breast examination builder.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredSteps.map((step, index) => {
            const isExpanded = expandedStepId === step.id;
            return (
              <div key={step.id} style={{
                border: '1.5px solid var(--ink)',
                backgroundColor: 'var(--paper)',
                boxShadow: isExpanded ? '4px 4px 0px var(--ink)' : '2px 2px 0px var(--ink)',
                transition: 'box-shadow 0.2s',
                opacity: step.id.startsWith('temp-') ? 0.6 : 1
              }}>
                {/* Accordion Trigger Header */}
                <div style={{
                  padding: '12px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  backgroundColor: isExpanded ? 'var(--paper-deep)' : 'var(--paper)'
                }} onClick={() => toggleAccordion(step.id)}>
                  
                  {/* Left part */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: 'var(--oxblood)',
                      color: 'white',
                      width: '26px',
                      height: '26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {step.stepNumber}
                    </span>
                    <div>
                      <strong style={{ fontSize: '15px', color: 'var(--ink)' }}>{step.title}</strong>
                      <span style={{ fontSize: '12px', opacity: 0.6, display: 'block' }}>{step.duration || '2 mins'} • {step.shortExplanation || 'Inspect breasts'}</span>
                    </div>
                  </div>

                  {/* Right part: Actions and Expand icon */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }} onClick={(e) => e.stopPropagation()}>
                    {/* Move up / down buttons */}
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <button 
                        className="btn-mini" 
                        onClick={() => moveStep(index, 'up')}
                        disabled={index === 0}
                        style={{ padding: '2px 6px', minWidth: '24px' }}
                      >
                        ▲
                      </button>
                      <button 
                        className="btn-mini" 
                        onClick={() => moveStep(index, 'down')}
                        disabled={index === steps.length - 1}
                        style={{ padding: '2px 6px', minWidth: '24px' }}
                      >
                        ▼
                      </button>
                    </div>

                    <span className={`status-pill ${step.published ? 'status-active' : 'status-pending'}`} style={{
                      backgroundColor: step.published ? '#d1fae5' : '#fef3c7',
                      color: step.published ? '#065f46' : '#92400e',
                      padding: '2px 6px',
                      fontSize: '9.5px',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {step.published ? 'Active' : 'Draft'}
                    </span>

                    <button 
                      onClick={() => toggleAccordion(step.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold'
                      }}
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div style={{
                    padding: '20px',
                    borderTop: '1.5px solid var(--ink)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    backgroundColor: 'var(--paper)'
                  }}>
                    
                    {/* Media content previews */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                      {step.imageURL && (
                        <div>
                          <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', opacity: 0.6 }}>Image Guide</span>
                          <img src={step.imageURL} alt="Step Guide" style={{ width: '100%', height: '140px', objectFit: 'cover', border: '1px solid var(--line)', marginTop: '4px' }} />
                        </div>
                      )}
                      {step.illustrationURL && (
                        <div>
                          <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', opacity: 0.6 }}>Illustration</span>
                          <img src={step.illustrationURL} alt="Illustration Guide" style={{ width: '100%', height: '140px', objectFit: 'cover', border: '1px solid var(--line)', marginTop: '4px' }} />
                        </div>
                      )}
                      {(step.videoURL || step.audioURL) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {step.videoURL && (
                            <div>
                              <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', opacity: 0.6 }}>Video URL</span>
                              <div style={{ fontSize: '12px', marginTop: '4px', wordBreak: 'break-all' }}>
                                🎥 <a href={step.videoURL} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: 'var(--coral)' }}>{step.videoURL}</a>
                              </div>
                            </div>
                          )}
                          {step.audioURL && (
                            <div>
                              <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', opacity: 0.6 }}>Audio Guide</span>
                              <audio src={step.audioURL} controls style={{ width: '100%', height: '32px', marginTop: '4px' }} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Instruction content */}
                    <div>
                      <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', opacity: 0.6 }}>Detailed Instructions</span>
                      <p style={{ fontSize: '13.5px', marginTop: '4px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{step.instruction}</p>
                    </div>

                    {/* Warning / Notes boxes */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                      {step.warning && (
                        <div style={{ backgroundColor: '#fee2e2', padding: '10px 14px', borderLeft: '4px solid #ef4444', fontSize: '12.5px' }}>
                          <strong style={{ color: '#b91c1c', display: 'block', fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase' }}>⚠️ Important Warning</strong>
                          {step.warning}
                        </div>
                      )}
                      {step.safetyNote && (
                        <div style={{ backgroundColor: '#fef3c7', padding: '10px 14px', borderLeft: '4px solid #f59e0b', fontSize: '12.5px' }}>
                          <strong style={{ color: '#b45309', display: 'block', fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase' }}>🩺 Clinical Safety Note</strong>
                          {step.safetyNote}
                        </div>
                      )}
                      {step.tipBox && (
                        <div style={{ backgroundColor: '#dbeafe', padding: '10px 14px', borderLeft: '4px solid #3b82f6', fontSize: '12.5px' }}>
                          <strong style={{ color: '#1d4ed8', display: 'block', fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase' }}>💡 Helpful Tip</strong>
                          {step.tipBox}
                        </div>
                      )}
                    </div>

                    {/* Offline indicator */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: 'var(--font-mono)', opacity: 0.7 }}>
                      <span>Offline support: {step.offlineMode ? 'Enabled (Cached on local device)' : 'Disabled (Online Only)'}</span>
                      <span>Last Updated: {step.updatedAt ? new Date(step.updatedAt).toLocaleDateString() : 'N/A'}</span>
                    </div>

                    {/* Step Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--line)', paddingTop: '15px', marginTop: '5px' }}>
                      <button className="btn-mini" onClick={() => startEdit(step)}>Edit Step Details</button>
                      <button className="btn-mini" onClick={() => togglePublishStatus(step)}>
                        {step.published ? 'Deactivate Step' : 'Activate Step'}
                      </button>
                      <button className="btn-mini" onClick={() => handleDuplicate(step)}>Clone Step</button>
                      <button className="btn-mini danger" onClick={() => handleDeleteStep(step.id)}>Delete Step</button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Back button */}
      <div style={{ marginTop: '20px' }}>
        <Link to="/admin" className="btn btn-secondary btn-sm" style={{ width: 'auto', display: 'inline-flex' }}>
          ← Back to Admin
        </Link>
      </div>

      {/* ACCORDION STEP EDITOR MODAL */}
      {isEditorOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(36, 19, 24, 0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1500, padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--paper)', border: '2px solid var(--ink)',
            width: '90%', maxWidth: '800px', maxHeight: '92vh',
            display: 'flex', flexDirection: 'column', boxShadow: '8px 8px 0px var(--ink)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px', borderBottom: '2px solid var(--ink)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              backgroundColor: 'var(--paper-deep)'
            }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '19px', fontWeight: 'bold' }}>
                {selectedStep ? `Edit Step #${formStepNumber}` : 'Add Tutorial Step'}
              </h3>
              <button onClick={() => setIsEditorOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            {/* Modal Form content */}
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', margin: 0 }}>
              <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 150px', gap: '12px' }}>
                  {/* Step number */}
                  <div className="field" style={{ margin: 0 }}>
                    <label className="input-label">Step No.</label>
                    <input
                      type="number"
                      className="input-field"
                      value={formStepNumber}
                      onChange={(e) => setFormStepNumber(e.target.value)}
                      required
                    />
                  </div>
                  
                  {/* Title */}
                  <div className="field" style={{ margin: 0 }}>
                    <label className="input-label">Step Title</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Inspecting Breast Symmetry"
                      required
                    />
                  </div>

                  {/* Duration */}
                  <div className="field" style={{ margin: 0 }}>
                    <label className="input-label">Est. Duration</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      placeholder="e.g. 2 mins"
                      required
                    />
                  </div>
                </div>

                {/* Short explanation */}
                <div className="field" style={{ margin: 0 }}>
                  <label className="input-label">Short Summary (1 sentence)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formShortExplanation}
                    onChange={(e) => setFormShortExplanation(e.target.value)}
                    placeholder="Short description shown when the accordion is collapsed"
                    required
                  />
                </div>

                {/* Detailed instructions */}
                <div className="field" style={{ margin: 0 }}>
                  <label className="input-label">Detailed Instruction Text</label>
                  <textarea
                    className="input-field"
                    value={formInstruction}
                    onChange={(e) => setFormInstruction(e.target.value)}
                    placeholder="Write detailed, step-by-step physical self check guide directions here..."
                    rows="4"
                    required
                  />
                </div>

                {/* Media uploads (Storage upload + url text inputs) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', border: '1px solid var(--line)', padding: '15px', backgroundColor: 'var(--paper-deep)' }}>
                  
                  {/* Image Guide */}
                  <div>
                    <label className="input-label">Instruction Image</label>
                    <input type="file" accept="image/*" onChange={(e) => handleMediaUpload(e, 'image')} style={{ fontSize: '11px', width: '100%' }} />
                    {uploadProgress.active && uploadProgress.type === 'image' && <div style={{ fontSize: '10px', color: 'var(--coral)' }}>Uploading image...</div>}
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Or image URL..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      style={{ fontSize: '11px', padding: '4px 8px', marginTop: '6px', backgroundColor: 'var(--paper)' }}
                    />
                  </div>

                  {/* Illustration */}
                  <div>
                    <label className="input-label">Guide Illustration</label>
                    <input type="file" accept="image/*" onChange={(e) => handleMediaUpload(e, 'illustration')} style={{ fontSize: '11px', width: '100%' }} />
                    {uploadProgress.active && uploadProgress.type === 'illustration' && <div style={{ fontSize: '10px', color: 'var(--coral)' }}>Uploading illustration...</div>}
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Or illustration URL..."
                      value={illustrationUrl}
                      onChange={(e) => setIllustrationUrl(e.target.value)}
                      style={{ fontSize: '11px', padding: '4px 8px', marginTop: '6px', backgroundColor: 'var(--paper)' }}
                    />
                  </div>

                  {/* Audio */}
                  <div>
                    <label className="input-label">Audio Guide (Optional)</label>
                    <input type="file" accept="audio/*" onChange={(e) => handleMediaUpload(e, 'audio')} style={{ fontSize: '11px', width: '100%' }} />
                    {uploadProgress.active && uploadProgress.type === 'audio' && <div style={{ fontSize: '10px', color: 'var(--coral)' }}>Uploading audio...</div>}
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Or audio URL..."
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      style={{ fontSize: '11px', padding: '4px 8px', marginTop: '6px', backgroundColor: 'var(--paper)' }}
                    />
                  </div>
                </div>

                {/* Video URL */}
                <div className="field" style={{ margin: 0 }}>
                  <label className="input-label">Instruction Video URL (Optional)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formVideoUrl}
                    onChange={(e) => setFormVideoUrl(e.target.value)}
                    placeholder="e.g. /videos/self-check-video.mp4 or YouTube embed link"
                  />
                </div>

                {/* Highlight boxes */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                  {/* Warning */}
                  <div className="field" style={{ margin: 0 }}>
                    <label className="input-label">Important Warning (Red Box)</label>
                    <textarea
                      className="input-field"
                      value={formWarning}
                      onChange={(e) => setFormWarning(e.target.value)}
                      placeholder="e.g. Do not squeeze the nipple..."
                      rows="2"
                    />
                  </div>

                  {/* Safety Note */}
                  <div className="field" style={{ margin: 0 }}>
                    <label className="input-label">Clinical Safety Note (Amber Box)</label>
                    <textarea
                      className="input-field"
                      value={formSafetyNote}
                      onChange={(e) => setFormSafetyNote(e.target.value)}
                      placeholder="e.g. Always report new discharges to a physician..."
                      rows="2"
                    />
                  </div>

                  {/* Tip Box */}
                  <div className="field" style={{ margin: 0 }}>
                    <label className="input-label">Helpful Tip (Blue Box)</label>
                    <textarea
                      className="input-field"
                      value={formTipBox}
                      onChange={(e) => setFormTipBox(e.target.value)}
                      placeholder="e.g. You can perform this while in the shower..."
                      rows="2"
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="offlineMode"
                      checked={formOfflineMode}
                      onChange={(e) => setFormOfflineMode(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="offlineMode" style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', cursor: 'pointer', textTransform: 'uppercase' }}>
                      Enable Offline Caching
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="published"
                      checked={formPublished}
                      onChange={(e) => setFormPublished(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="published" style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', cursor: 'pointer', textTransform: 'uppercase' }}>
                      Publish Immediately
                    </label>
                  </div>
                </div>

              </div>

              {/* Modal actions */}
              <div style={{
                padding: '16px 20px', borderTop: '2px solid var(--ink)',
                display: 'flex', justifyContent: 'flex-end', gap: '12px',
                backgroundColor: 'var(--paper-deep)'
              }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditorOpen(false)} style={{ width: 'auto' }}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ width: 'auto' }}>
                  {selectedStep ? 'Save Details' : 'Add Step'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* USER SIMULATED TUTORIAL PREVIEW MODAL */}
      {isPreviewOpen && steps.length > 0 && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(36, 19, 24, 0.6)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1500, padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--paper)', border: '2px solid var(--ink)',
            width: '90%', maxWidth: '550px', display: 'flex',
            flexDirection: 'column', boxShadow: '8px 8px 0px var(--ink)',
            padding: '24px', position: 'relative'
          }}>
            {/* Close */}
            <button 
              onClick={() => setIsPreviewOpen(false)}
              style={{
                position: 'absolute', top: '15px', right: '15px', background: 'none', 
                border: 'none', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              ✕
            </button>

            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span className="stamp" style={{ marginBottom: '10px' }}>
                Preview Mode
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: 0 }}>
                Breast Self-Examination
              </h2>
              <p style={{ fontSize: '12px', opacity: 0.6, fontFamily: 'var(--font-mono)' }}>
                Step {previewActiveStep + 1} of {steps.length}
              </p>
            </div>

            {/* Active Step Content */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '15px',
              minHeight: '260px', justifyContent: 'center'
            }}>
              
              {/* Media visual representation */}
              {(steps[previewActiveStep].imageURL || steps[previewActiveStep].illustrationURL) ? (
                <img 
                  src={steps[previewActiveStep].imageURL || steps[previewActiveStep].illustrationURL} 
                  alt="Visual Step" 
                  style={{ width: '100%', height: '180px', objectFit: 'cover', border: '1px solid var(--line)' }}
                />
              ) : (
                <div style={{
                  height: '100px', border: '1px dashed var(--line)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: 'var(--paper-deep)', opacity: 0.6
                }}>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>[No graphic media attached]</span>
                </div>
              )}

              {/* Title & info */}
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', margin: 0, fontWeight: 'bold' }}>
                  {steps[previewActiveStep].title}
                </h4>
                <p style={{ fontSize: '13px', opacity: 0.7, fontStyle: 'italic', marginTop: '4px' }}>
                  {steps[previewActiveStep].shortExplanation}
                </p>
              </div>

              {/* Instructions text */}
              <p style={{ fontSize: '14px', lineHeight: '1.5', textAlign: 'center', whiteSpace: 'pre-wrap' }}>
                {steps[previewActiveStep].instruction}
              </p>

              {/* Warning/Notes inside preview */}
              {steps[previewActiveStep].warning && (
                <div style={{
                  backgroundColor: '#fee2e2', border: '1px solid #fecaca', 
                  padding: '8px 12px', fontSize: '12px', color: '#7f1d1d', 
                  textAlign: 'center'
                }}>
                  <b>Warning:</b> {steps[previewActiveStep].warning}
                </div>
              )}

              {/* Audio playback */}
              {steps[previewActiveStep].audioURL && (
                <audio src={steps[previewActiveStep].audioURL} controls style={{ width: '100%', height: '30px' }} />
              )}
            </div>

            {/* Stepper Navigation actions */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', 
              marginTop: '25px', borderTop: '1px solid var(--line)', paddingTop: '15px'
            }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setPreviewActiveStep(prev => Math.max(prev - 1, 0))}
                disabled={previewActiveStep === 0}
                style={{ width: 'auto' }}
              >
                Back
              </button>
              
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (previewActiveStep < steps.length - 1) {
                    setPreviewActiveStep(prev => prev + 1);
                  } else {
                    setIsPreviewOpen(false);
                    showToast("Guide tutorial preview completed successfully!");
                  }
                }}
                style={{ width: 'auto' }}
              >
                {previewActiveStep === steps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManageSelfExamGuide;
