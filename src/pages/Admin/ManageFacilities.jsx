import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  fetchFacilities, 
  addFacility, 
  updateFacility, 
  deleteFacility, 
  restoreFacility,
  uploadFile 
} from '../../services/adminService';
import '../../styles/admin.css';

const ManageFacilities = () => {
  // Clinics state
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter/Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCounty, setFilterCounty] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Toast
  const [toast, setToast] = useState(null);

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('Public Hospital');
  const [formCounty, setFormCounty] = useState('Nairobi');
  const [formSubCounty, setFormSubCounty] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLatitude, setFormLatitude] = useState('-1.2921');
  const [formLongitude, setFormLongitude] = useState('36.8219');
  
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formEmergencyContact, setFormEmergencyContact] = useState('');
  
  const [formOpeningHours, setFormOpeningHours] = useState('8:00 AM - 5:00 PM');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState('active');

  // Services offered checkboxes
  const availableServices = [
    'Clinical Breast Examination',
    'Mammography',
    'Ultrasound',
    'Oncology',
    'Biopsy',
    'Consultation',
    'Screening',
    'Accept NHIF'
  ];
  const [selectedServices, setSelectedServices] = useState([]);

  // Media uploads
  const [featuredPhotoUrl, setFeaturedPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [galleryUrls, setGalleryUrls] = useState([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Map references
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Load Leaflet dynamically
  useEffect(() => {
    // Add Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    
    // Add Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      try {
        document.head.removeChild(link);
        document.body.removeChild(script);
      } catch (e) {
        // Safe check
      }
    };
  }, []);

  // Initialize Map inside Modal
  useEffect(() => {
    if (!isModalOpen || !window.L) return;

    // Timeout to ensure modal DOM is painted
    const timer = setTimeout(() => {
      const initLat = parseFloat(formLatitude) || -1.2921;
      const initLng = parseFloat(formLongitude) || 36.8219;

      try {
        const map = window.L.map('clinic-picker-map').setView([initLat, initLng], 13);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const marker = window.L.marker([initLat, initLng], { draggable: true }).addTo(map);
        markerRef.current = marker;

        // Map Click
        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          setFormLatitude(lat.toFixed(6));
          setFormLongitude(lng.toFixed(6));
          triggerReverseGeocoding(lat, lng);
        });

        // Drag Marker
        marker.on('dragend', () => {
          const { lat, lng } = marker.getLatLng();
          setFormLatitude(lat.toFixed(6));
          setFormLongitude(lng.toFixed(6));
          triggerReverseGeocoding(lat, lng);
        });

        mapRef.current = map;
      } catch (err) {
        console.error("Leaflet map initialization error:", err);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {}
        mapRef.current = null;
      }
    };
  }, [isModalOpen]);

  // Load facilities from Firestore
  const loadFacilities = async () => {
    setLoading(true);
    try {
      const data = await fetchFacilities(true); // load all, filter soft-deleted in UI
      setFacilities(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load facilities directory.");
      showToast("Error loading clinics", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilities();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Upload handler
  const handlePhotoUpload = async (e, category) => {
    const file = e.target.files[0];
    if (!file) return;

    if (category === 'photo') {
      setUploadingPhoto(true);
      try {
        const url = await uploadFile(file, 'clinics/featured');
        setFeaturedPhotoUrl(url);
        showToast("Clinic photo uploaded successfully!");
      } catch (err) {
        console.error(err);
        showToast("Upload failed", "error");
      } finally {
        setUploadingPhoto(false);
      }
    } else {
      setUploadingGallery(true);
      try {
        const url = await uploadFile(file, 'clinics/gallery');
        setGalleryUrls([...galleryUrls, url]);
        showToast("Added image to clinic gallery!");
      } catch (err) {
        console.error(err);
        showToast("Upload failed", "error");
      } finally {
        setUploadingGallery(false);
      }
    }
  };

  // Reverse geocoding via Nominatim
  const triggerReverseGeocoding = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        setFormAddress(data.display_name);
        
        // Auto fill Subcounty or County if found
        if (data.address) {
          const countyVal = data.address.county || data.address.state || '';
          const subCountyVal = data.address.suburb || data.address.city_district || data.address.city || '';
          if (countyVal) setFormCounty(countyVal.replace(' County', ''));
          if (subCountyVal) setFormSubCounty(subCountyVal);
        }
      }
    } catch (err) {
      console.warn("Geocoding service unavailable:", err);
    }
  };

  // Trigger manual address lookup (geocoding)
  const lookupAddressCoords = async () => {
    if (!formAddress.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formAddress)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setFormLatitude(parseFloat(lat).toFixed(6));
        setFormLongitude(parseFloat(lon).toFixed(6));
        showToast("Found address coordinates!");

        // Move Leaflet map if open
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([lat, lon], 13);
          markerRef.current.setLatLng([lat, lon]);
        }
      } else {
        showToast("Address not found on map.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Geocoding failed", "error");
    }
  };

  const handleServiceCheckboxChange = (service) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  // Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast("Clinic name is required", "error");
      return;
    }

    const payload = {
      facilityName: formName,
      facilityType: formType,
      county: formCounty,
      subCounty: formSubCounty,
      address: formAddress,
      location: {
        latitude: parseFloat(formLatitude) || -1.2921,
        longitude: parseFloat(formLongitude) || 36.8219
      },
      contacts: {
        phone: formPhone,
        email: formEmail,
        website: formWebsite,
        emergency: formEmergencyContact
      },
      servicesOffered: selectedServices,
      openingHours: formOpeningHours,
      description: formDescription,
      photoURL: featuredPhotoUrl || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500',
      gallery: galleryUrls,
      status: formStatus
    };

    const prevFacilities = [...facilities];

    try {
      if (selectedFacility && selectedFacility.id) {
        // Edit Mode
        const updated = facilities.map(fac => 
          fac.id === selectedFacility.id ? { ...fac, ...payload } : fac
        );
        setFacilities(updated);
        setIsModalOpen(false);
        showToast("Clinic updated successfully.");

        await updateFacility(selectedFacility.id, payload);
      } else {
        // Create Mode
        const tempId = `temp-${Date.now()}`;
        const newFac = { id: tempId, ...payload, createdAt: new Date().toISOString() };
        setFacilities([newFac, ...facilities]);
        setIsModalOpen(false);
        showToast("Clinic registered successfully.");

        const actualId = await addFacility(payload);
        setFacilities(prev => prev.map(fac => fac.id === tempId ? { ...fac, id: actualId } : fac));
      }
    } catch (err) {
      console.error(err);
      setFacilities(prevFacilities); // Rollback
      showToast("Failed to save clinic details.", "error");
    }
  };

  // Create Mode Init
  const startCreate = () => {
    setSelectedFacility(null);
    setFormName('');
    setFormType('Public Hospital');
    setFormCounty('Nairobi');
    setFormSubCounty('');
    setFormAddress('');
    setFormLatitude('-1.2921');
    setFormLongitude('36.8219');
    setFormPhone('');
    setFormEmail('');
    setFormWebsite('');
    setFormEmergencyContact('');
    setFormOpeningHours('8:00 AM - 5:00 PM');
    setFormDescription('');
    setSelectedServices(['Screening', 'Clinical Breast Examination']);
    setFeaturedPhotoUrl('');
    setGalleryUrls([]);
    setFormStatus('active');
    setIsModalOpen(true);
  };

  // Edit Mode Init
  const startEdit = (fac) => {
    setSelectedFacility(fac);
    setFormName(fac.facilityName || '');
    setFormType(fac.facilityType || 'Public Hospital');
    setFormCounty(fac.county || 'Nairobi');
    setFormSubCounty(fac.subCounty || '');
    setFormAddress(fac.address || '');
    setFormLatitude(String(fac.location?.latitude || fac.latitude || '-1.2921'));
    setFormLongitude(String(fac.location?.longitude || fac.longitude || '36.8219'));
    setFormPhone(fac.contacts?.phone || '');
    setFormEmail(fac.contacts?.email || '');
    setFormWebsite(fac.contacts?.website || '');
    setFormEmergencyContact(fac.contacts?.emergency || '');
    setFormOpeningHours(fac.openingHours || '8:00 AM - 5:00 PM');
    setFormDescription(fac.description || '');
    setSelectedServices(fac.servicesOffered || []);
    setFeaturedPhotoUrl(fac.photoURL || '');
    setGalleryUrls(fac.gallery || []);
    setFormStatus(fac.status || 'active');
    setIsModalOpen(true);
  };

  // Soft Delete Clinic
  const handleDeleteClinic = async (id) => {
    if (!window.confirm("Are you sure you want to delete this clinic? Users will no longer see it, but you can restore it later.")) {
      return;
    }

    const prevFacilities = [...facilities];
    // Optimistic UI soft delete
    setFacilities(facilities.map(fac => fac.id === id ? { ...fac, status: 'deleted' } : fac));
    showToast("Clinic deactivated and soft-deleted.");

    try {
      await deleteFacility(id);
    } catch (err) {
      console.error(err);
      setFacilities(prevFacilities); // Rollback
      showToast("Delete failed", "error");
    }
  };

  // Restore deleted clinic
  const handleRestore = async (id) => {
    const prevFacilities = [...facilities];
    setFacilities(facilities.map(fac => fac.id === id ? { ...fac, status: 'active' } : fac));
    showToast("Clinic restored successfully!");

    try {
      await restoreFacility(id);
    } catch (err) {
      console.error(err);
      setFacilities(prevFacilities); // Rollback
      showToast("Restore failed", "error");
    }
  };

  // Duplicate Clinic details
  const handleDuplicate = async (fac) => {
    const tempId = `temp-dup-${Date.now()}`;
    const dupPayload = {
      ...fac,
      facilityName: `${fac.facilityName} (Copy)`,
      status: 'active'
    };
    delete dupPayload.id;
    delete dupPayload.createdAt;
    delete dupPayload.updatedAt;

    setFacilities([{ id: tempId, ...dupPayload, createdAt: new Date().toISOString() }, ...facilities]);
    showToast("Clinic entry cloned successfully!");

    try {
      const actualId = await addFacility(dupPayload);
      setFacilities(prev => prev.map(f => f.id === tempId ? { ...f, id: actualId } : f));
    } catch (err) {
      console.error(err);
      loadFacilities();
      showToast("Clone failed", "error");
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Clinic Name', 'County', 'Sub County', 'Hospital Type', 'Address', 'Latitude', 'Longitude', 'Phone', 'Email', 'Website', 'Services Offered', 'Status'];
    const rows = processedFacilities.map(fac => [
      `"${fac.facilityName.replace(/"/g, '""')}"`,
      `"${fac.county}"`,
      `"${fac.subCounty}"`,
      `"${fac.facilityType}"`,
      `"${(fac.address || '').replace(/"/g, '""')}"`,
      fac.location?.latitude || fac.latitude || '',
      fac.location?.longitude || fac.longitude || '',
      `"${fac.contacts?.phone || ''}"`,
      `"${fac.contacts?.email || ''}"`,
      `"${fac.contacts?.website || ''}"`,
      `"${(fac.servicesOffered || []).join(', ')}"`,
      `"${fac.status}"`
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "healthcare_facilities_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV file exported!");
  };

  // Process filters & search
  const processedFacilities = facilities
    .filter(fac => {
      // Soft-delete display toggle check
      if (!showDeleted && fac.status === 'deleted') return false;
      if (showDeleted && fac.status !== 'deleted') return false;

      const matchesSearch = fac.facilityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fac.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fac.county?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCounty = filterCounty === 'All' || fac.county === filterCounty;
      const matchesType = filterType === 'All' || fac.facilityType === filterType;

      return matchesSearch && matchesCounty && matchesType;
    });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedFacilities.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(processedFacilities.length / itemsPerPage) || 1;

  // Counties list
  const countiesList = [
    'Nairobi', 'Kiambu', 'Mombasa', 'Kisumu', 'Nakuru', 'Uasin Gishu', 'Machakos', 'Nyeri', 'Kakamega', 'Meru', 'Kilifi'
  ];

  // Stats
  const activeCount = facilities.filter(f => f.status === 'active').length;
  const totalCount = facilities.filter(f => f.status !== 'deleted').length;
  const countiesCovered = [...new Set(facilities.filter(f => f.status !== 'deleted').map(f => f.county))].length;
  const screeningCount = facilities.filter(f => f.status !== 'deleted' && (f.servicesOffered?.includes('Screening') || f.servicesOffered?.includes('Clinical Breast Examination') || f.servicesOffered?.includes('Mammography'))).length;

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
          <h2 className="h1">Manage <em>Clinic Directory</em></h2>
          <p className="dek">Register new healthcare facilities, oncology clinics, and screening centers.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-sm btn-secondary" onClick={handleExportCSV} style={{ width: 'auto' }}>
            Export CSV
          </button>
          <button className="btn btn-sm btn-primary" onClick={startCreate} style={{ width: 'auto' }}>
            Add Clinic
          </button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="admin-grid" style={{ marginBottom: '10px' }}>
        <div className="admin-card">
          <h3>{loading ? '...' : totalCount}</h3>
          <span>Total Clinics</span>
        </div>
        <div className="admin-card">
          <h3>{loading ? '...' : activeCount}</h3>
          <span>Active Clinics</span>
        </div>
        <div className="admin-card">
          <h3>{loading ? '...' : countiesCovered}</h3>
          <span>Counties Covered</span>
        </div>
        <div className="admin-card" style={{ borderRight: 'none' }}>
          <h3>{loading ? '...' : screeningCount}</h3>
          <span>Offering Screening</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
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
            placeholder="Search clinic name, county, address..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--line)' }}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', width: '100%', flex: '2 1 auto', justifyContent: 'flex-end', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: '110px' }}>
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '3px', opacity: 0.7 }}>County</span>
            <select
              value={filterCounty}
              onChange={(e) => { setFilterCounty(e.target.value); setCurrentPage(1); }}
              style={{ padding: '6px', border: '1px solid var(--line)', fontFamily: 'var(--font-mono)', fontSize: '11px', background: 'var(--paper)' }}
            >
              <option value="All">All Counties</option>
              {countiesList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', minWidth: '130px' }}>
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '3px', opacity: 0.7 }}>Facility Type</span>
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
              style={{ padding: '6px', border: '1px solid var(--line)', fontFamily: 'var(--font-mono)', fontSize: '11px', background: 'var(--paper)' }}
            >
              <option value="All">All Types</option>
              <option value="Public Hospital">Public Hospital</option>
              <option value="Private Hospital">Private Hospital</option>
              <option value="Mission/NGO Clinic">Mission/NGO Clinic</option>
              <option value="Oncology Centre">Oncology Centre</option>
              <option value="Diagnostic Lab">Diagnostic Lab</option>
            </select>
          </div>

          {/* Soft delete toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
            <input
              type="checkbox"
              id="showDeleted"
              checked={showDeleted}
              onChange={(e) => { setShowDeleted(e.target.checked); setCurrentPage(1); }}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="showDeleted" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', cursor: 'pointer', textTransform: 'uppercase', opacity: 0.8 }}>
              Show Soft-Deleted
            </label>
          </div>
        </div>
      </div>

      {/* Clinics Directory List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ height: '75px', backgroundColor: 'var(--paper-deep)', border: '1px solid var(--line)', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
          ))}
        </div>
      ) : currentItems.length === 0 ? (
        <div style={{ border: '1px dashed var(--line)', padding: '50px 20px', textAlign: 'center', backgroundColor: 'var(--paper)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>🏥</span>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '5px' }}>No Clinics Registered</h3>
          <p style={{ opacity: 0.7, fontSize: '13.5px' }}>Add clinic registry details to launch Google maps indicators.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Clinic Name</th>
                <th>County / Sub-County</th>
                <th>Type</th>
                <th>Phone / Contacts</th>
                <th>Services</th>
                <th style={{ width: '100px' }}>Coordinates</th>
                <th style={{ width: '170px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((fac) => (
                <tr key={fac.id} style={{ 
                  opacity: fac.id.startsWith('temp-') ? 0.6 : 1,
                  backgroundColor: fac.status === 'deleted' ? '#fef2f2' : 'var(--paper)'
                }}>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <img src={fac.photoURL} alt="clinic" style={{ width: '38px', height: '38px', objectFit: 'cover', border: '1px solid var(--line)' }} />
                      <div>
                        <strong style={{ fontSize: '14.5px', color: 'var(--ink)' }}>{fac.facilityName}</strong>
                        <span style={{ fontSize: '11px', display: 'block', opacity: 0.6 }}>{fac.address}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: '600' }}>{fac.county}</span>
                    <span style={{ fontSize: '12px', display: 'block', opacity: 0.7 }}>{fac.subCounty || 'Central'}</span>
                  </td>
                  <td style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>{fac.facilityType}</td>
                  <td>
                    <div style={{ fontSize: '12.5px', color: 'var(--ink)' }}>📞 {fac.contacts?.phone || 'N/A'}</div>
                    {fac.contacts?.email && <span style={{ fontSize: '11px', display: 'block', opacity: 0.6 }}>✉️ {fac.contacts.email}</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                      {fac.servicesOffered?.map(s => (
                        <span key={s} style={{
                          backgroundColor: 'var(--paper-deep)', color: 'var(--oxblood)',
                          padding: '1px 5px', fontSize: '9px', fontFamily: 'var(--font-mono)'
                        }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', opacity: 0.7 }}>
                    Lat: {fac.location?.latitude || fac.latitude}<br />
                    Lng: {fac.location?.longitude || fac.longitude}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      {fac.status === 'deleted' ? (
                        <button className="btn-mini" onClick={() => handleRestore(fac.id)} style={{ border: '1.5px solid var(--oxblood)', color: 'var(--oxblood)' }}>
                          Restore
                        </button>
                      ) : (
                        <>
                          <button className="btn-mini" onClick={() => startEdit(fac)} disabled={fac.id.startsWith('temp-')}>
                            Edit
                          </button>
                          <button className="btn-mini" onClick={() => handleDuplicate(fac)} disabled={fac.id.startsWith('temp-')}>
                            Clone
                          </button>
                          <button className="btn-mini danger" onClick={() => handleDeleteClinic(fac.id)} disabled={fac.id.startsWith('temp-')}>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {processedFacilities.length > itemsPerPage && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '10px',
          borderTop: '1px solid var(--line)',
          paddingTop: '15px'
        }}>
          <span style={{ fontSize: '12px', opacity: 0.7, fontFamily: 'var(--font-mono)' }}>
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, processedFacilities.length)} of {processedFacilities.length}
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

      {/* Back to Admin */}
      <div style={{ marginTop: '20px' }}>
        <Link to="/admin" className="btn btn-secondary btn-sm" style={{ width: 'auto', display: 'inline-flex' }}>
          ← Back to Admin
        </Link>
      </div>

      {/* CLINIC REGISTRY EDITOR MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(36, 19, 24, 0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1500, padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--paper)', border: '2px solid var(--ink)',
            width: '90%', maxWidth: '850px', maxHeight: '92vh',
            display: 'flex', flexDirection: 'column', boxShadow: '8px 8px 0px var(--ink)'
          }}>
            
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px', borderBottom: '2px solid var(--ink)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              backgroundColor: 'var(--paper-deep)'
            }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '19px', fontWeight: 'bold' }}>
                {selectedFacility ? 'Edit Clinic Details' : 'Register Clinic Hub'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', margin: 0 }}>
              <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  {/* Name */}
                  <div className="field" style={{ margin: 0 }}>
                    <label className="input-label">Clinic Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Nairobi Women's Hospital"
                      required
                    />
                  </div>

                  {/* Hospital Type */}
                  <div className="field" style={{ margin: 0 }}>
                    <label className="input-label">Facility Type</label>
                    <select
                      className="input-field"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      style={{ padding: '11px 14px' }}
                    >
                      <option value="Public Hospital">Public Hospital</option>
                      <option value="Private Hospital">Private Hospital</option>
                      <option value="Mission/NGO Clinic">Mission/NGO Clinic</option>
                      <option value="Oncology Centre">Oncology Centre</option>
                      <option value="Diagnostic Lab">Diagnostic Lab</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  {/* County */}
                  <div className="field" style={{ margin: 0 }}>
                    <label className="input-label">County</label>
                    <select
                      className="input-field"
                      value={formCounty}
                      onChange={(e) => setFormCounty(e.target.value)}
                      style={{ padding: '11px 14px' }}
                    >
                      {countiesList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Sub County */}
                  <div className="field" style={{ margin: 0 }}>
                    <label className="input-label">Sub County</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formSubCounty}
                      onChange={(e) => setFormSubCounty(e.target.value)}
                      placeholder="e.g. Westlands"
                    />
                  </div>

                  {/* Opening Hours */}
                  <div className="field" style={{ margin: 0 }}>
                    <label className="input-label">Opening Hours</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formOpeningHours}
                      onChange={(e) => setFormOpeningHours(e.target.value)}
                      placeholder="e.g. Mon-Fri 8:00 AM - 5:00 PM"
                    />
                  </div>
                </div>

                {/* Map Picker and Coordinates */}
                <div style={{ border: '1.5px solid var(--ink)', padding: '15px', backgroundColor: 'var(--paper-deep)' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', display: 'block', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--oxblood)' }}>
                    🗺️ Google Maps Location Pin Picker (Interactive Leaflet Fallback)
                  </span>
                  
                  {/* Map canvas container */}
                  <div id="clinic-picker-map" style={{
                    width: '100%',
                    height: '200px',
                    border: '1px solid var(--line)',
                    marginBottom: '12px'
                  }}></div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '10px', alignItems: 'center' }}>
                    <div className="field" style={{ margin: 0 }}>
                      <label className="input-label" style={{ fontSize: '9px' }}>Latitude</label>
                      <input
                        type="text"
                        className="input-field"
                        value={formLatitude}
                        onChange={(e) => setFormLatitude(e.target.value)}
                        style={{ backgroundColor: 'var(--paper)', padding: '6px' }}
                      />
                    </div>
                    <div className="field" style={{ margin: 0 }}>
                      <label className="input-label" style={{ fontSize: '9px' }}>Longitude</label>
                      <input
                        type="text"
                        className="input-field"
                        value={formLongitude}
                        onChange={(e) => setFormLongitude(e.target.value)}
                        style={{ backgroundColor: 'var(--paper)', padding: '6px' }}
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={lookupAddressCoords}
                      className="btn btn-secondary btn-sm" 
                      style={{ height: '36px', minHeight: '36px', padding: '0 8px', marginTop: '14px' }}
                    >
                      Geocode
                    </button>
                  </div>
                </div>

                {/* Address Text */}
                <div className="field" style={{ margin: 0 }}>
                  <label className="input-label">Street Address</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="e.g. Upper Hill Medical Centre, Nairobi"
                    required
                  />
                </div>

                {/* Contacts Block */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                  <div className="field" style={{ margin: 0 }}>
                    <label className="input-label">Phone Number</label>
                    <input type="text" className="input-field" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="e.g. 020 2726300" />
                  </div>
                  <div className="field" style={{ margin: 0 }}>
                    <label className="input-label">Email Address</label>
                    <input type="email" className="input-field" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="e.g. info@clinic.org" />
                  </div>
                  <div className="field" style={{ margin: 0 }}>
                    <label className="input-label">Website URL</label>
                    <input type="text" className="input-field" value={formWebsite} onChange={(e) => setFormWebsite(e.target.value)} placeholder="e.g. www.clinic.org" />
                  </div>
                  <div className="field" style={{ margin: 0 }}>
                    <label className="input-label">Emergency Line</label>
                    <input type="text" className="input-field" value={formEmergencyContact} onChange={(e) => setFormEmergencyContact(e.target.value)} placeholder="e.g. 999 or Hotline" />
                  </div>
                </div>

                {/* Checkboxes list of services offered */}
                <div>
                  <label className="input-label">Services Offered</label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '8px',
                    border: '1px solid var(--line)',
                    padding: '12px',
                    backgroundColor: 'var(--paper)'
                  }}>
                    {availableServices.map(service => {
                      const isChecked = selectedServices.includes(service);
                      return (
                        <div key={service} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="checkbox"
                            id={`serv-${service}`}
                            checked={isChecked}
                            onChange={() => handleServiceCheckboxChange(service)}
                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                          />
                          <label htmlFor={`serv-${service}`} style={{ fontSize: '12px', cursor: 'pointer', opacity: isChecked ? 1 : 0.7 }}>
                            {service}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div className="field" style={{ margin: 0 }}>
                  <label className="input-label">Detailed Description</label>
                  <textarea
                    className="input-field"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Describe facility services, specialities, or payment systems..."
                    rows="2"
                  />
                </div>

                {/* Photo upload and gallery uploads */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                  <div className="field" style={{ margin: 0 }}>
                    <label className="input-label">Clinic Cover Photo (Storage Upload)</label>
                    <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'photo')} style={{ fontSize: '11px', width: '100%' }} />
                    {uploadingPhoto && <div style={{ fontSize: '10px', color: 'var(--coral)' }}>Uploading cover photo...</div>}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Or cover photo URL..."
                        value={featuredPhotoUrl}
                        onChange={(e) => setFeaturedPhotoUrl(e.target.value)}
                        style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: 'var(--paper)' }}
                      />
                      {featuredPhotoUrl && <img src={featuredPhotoUrl} alt="Cover" style={{ width: '30px', height: '30px', objectFit: 'cover' }} />}
                    </div>
                  </div>

                  <div className="field" style={{ margin: 0 }}>
                    <label className="input-label">Gallery Photos</label>
                    <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'gallery')} style={{ fontSize: '11px', width: '100%' }} />
                    {uploadingGallery && <div style={{ fontSize: '10px', color: 'var(--coral)' }}>Uploading gallery image...</div>}
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px', maxHeight: '40px', overflowY: 'auto' }}>
                      {galleryUrls.map((url, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <img src={url} alt="Gallery" style={{ width: '25px', height: '25px', objectFit: 'cover' }} />
                          <button 
                            type="button" 
                            onClick={() => setGalleryUrls(galleryUrls.filter((_, idx) => idx !== i))}
                            style={{ position: 'absolute', top: -3, right: -3, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '10px', height: '10px', fontSize: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label className="input-label" style={{ margin: 0 }}>Hub Status</label>
                  <select
                    className="input-field"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    style={{ width: '150px', padding: '6px 10px' }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

              </div>

              {/* Modal footer */}
              <div style={{
                padding: '16px 20px', border_top: '2px solid var(--ink)',
                display: 'flex', justifyContent: 'flex-end', gap: '12px',
                backgroundColor: 'var(--paper-deep)'
              }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)} style={{ width: 'auto' }}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ width: 'auto' }}>
                  {selectedFacility ? 'Save Changes' : 'Register Clinic'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageFacilities;
