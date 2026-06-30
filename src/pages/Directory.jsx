import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import '../styles/clinics.css';

const Directory = () => {
  const navigate = useNavigate();

  // Firestore Live Facilities State
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Views: 'list' | 'detail' | 'empty'
  const [view, setView] = useState('list');
  const [selectedFacility, setSelectedFacility] = useState(null);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('All counties');
  const [checkedServices, setCheckedServices] = useState({
    'Breast screening': false,
    'Consultation': false,
    'Oncology referral': false,
    'General clinic': false,
    'Public facility': false,
    'Private facility': false
  });

  // Real-time Firestore sync (exclude deleted)
  useEffect(() => {
    const colRef = collection(db, 'healthcareFacilities');
    const q = query(colRef, orderBy('facilityName', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'deleted') return; // Filter locally
        list.push({
          id: doc.id,
          name: data.facilityName,
          location: data.address || data.location?.address || 'Location on file',
          county: data.county || 'On file',
          phone: data.contacts?.phone || 'Phone on file',
          services: data.servicesOffered?.join(', ') || 'Breast health services',
          openingHours: data.openingHours || 'Mon–Fri, 8:00 AM–5:00 PM',
          type: data.facilityType || 'General facility',
          typeShort: data.facilityType === 'Public' ? 'Public' : data.facilityType === 'Private' ? 'Private' : 'NGO',
          notes: data.notes || 'No special notes before visiting.',
          latitude: data.location?.latitude,
          longitude: data.location?.longitude
        });
      });
      setFacilities(list);
      
      // Default select the first item for details view initial state
      if (list.length > 0) {
        setSelectedFacility(list[0]);
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore facilities sync error:", err);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Services checkbox handler
  const handleCheckboxChange = (serviceName) => {
    setCheckedServices(prev => ({
      ...prev,
      [serviceName]: !prev[serviceName]
    }));
  };

  // Filter facilities logic
  const getFilteredFacilities = () => {
    return facilities.filter(fac => {
      // Search query check
      const matchesSearch = searchQuery === '' || 
        fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fac.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fac.services.toLowerCase().includes(searchQuery.toLowerCase());

      // County check
      const matchesCounty = selectedCounty === 'All counties' || fac.county === selectedCounty;

      // Service types check (if any checked, must match at least one attribute)
      let matchesServices = true;
      const activeFilters = Object.keys(checkedServices).filter(k => checkedServices[k]);
      if (activeFilters.length > 0) {
        matchesServices = activeFilters.some(filter => {
          if (filter === 'Public facility') return fac.typeShort === 'Public';
          if (filter === 'Private facility') return fac.typeShort === 'Private';
          return fac.services.toLowerCase().includes(filter.toLowerCase());
        });
      }

      return matchesSearch && matchesCounty && matchesServices;
    });
  };

  const filteredFacilities = getFilteredFacilities();

  // Unique counties list compiled from live data
  const countiesList = ['All counties', ...new Set(facilities.map(f => f.county).filter(Boolean))];

  // Detail switcher helper
  const handleViewDetails = (facility) => {
    setSelectedFacility(facility);
    setView('detail');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCounty('All counties');
    setCheckedServices({
      'Breast screening': false,
      'Consultation': false,
      'Oncology referral': false,
      'General clinic': false,
      'Public facility': false,
      'Private facility': false
    });
    setView('list');
  };

  const handleCallClinic = (phone) => {
    alert(`Calling ${phone}...`);
  };

  const handleViewMap = (fac) => {
    if (fac.latitude && fac.longitude) {
      window.open(`https://www.openstreetmap.org/?mlat=${fac.latitude}&mlon=${fac.longitude}#map=16/${fac.latitude}/${fac.longitude}`, '_blank');
    } else {
      window.open(`https://www.openstreetmap.org/search?query=${encodeURIComponent(fac.name + ' ' + fac.location)}`, '_blank');
    }
  };

  const handleSetReminder = (fac) => {
    navigate('/reminders');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div>
        <p className="eyebrow">Section 04</p>
        <h2 className="h1">Find breast health <em>facilities</em></h2>
        <p className="dek">Locate screening packages, consultation centers, and supportive care clinics in Kenya.</p>
      </div>

      <div className="notice">
        <b>Clinic Guidance</b>
        We verify these listings periodically, but schedules change. We recommend calling before you visit to verify screen package costs and diagnostic queues.
      </div>

      {/* Main Layout Split */}
      <div className="clinics-split">
        
        {/* Left Column: Filter panel */}
        <div className="filter-panel">
          <div className="section-head" style={{ marginTop: 0 }}>
            <h3>Filters</h3>
            <div className="rule" />
            <span className="tag">Find clinic</span>
          </div>

          <div className="filter-card">
            {/* Search Input */}
            <div className="field">
              <label>Search name or services</label>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Mammography, Kenyatta"
              />
            </div>

            {/* County Select */}
            <div className="field">
              <label>County</label>
              <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)}>
                {countiesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Services Checkboxes */}
            <div className="field">
              <label>Filter by services offered</label>
              <div className="checkbox-list">
                {Object.keys(checkedServices).map(serviceName => (
                  <label key={serviceName} className="checkbox-row">
                    <input 
                      type="checkbox" 
                      checked={checkedServices[serviceName]}
                      onChange={() => handleCheckboxChange(serviceName)}
                    />
                    <span>{serviceName}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="btn-mini primary" onClick={handleClearFilters}>Clear all</button>
            </div>
          </div>
        </div>

        {/* Right Column: View list / detail panel */}
        <div className="content-panel">
          {view === 'list' ? (
            <>
              <div className="section-head" style={{ marginTop: 0 }}>
                <h3>Directories</h3>
                <div className="rule" />
                <span className="tag">{filteredFacilities.length} found</span>
              </div>

              {loading ? (
                <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>Loading facilities...</div>
              ) : filteredFacilities.length === 0 ? (
                <div className="empty" style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <h3>No clinics match your filters</h3>
                  <p>Try widening your search text or removing checkbox services.</p>
                  <button className="btn-primary" onClick={handleClearFilters}>Reset Filters</button>
                </div>
              ) : (
                <div className="clinic-list">
                  {filteredFacilities.map((fac, idx) => (
                    <div key={fac.id} className={`clinic-card ${idx % 2 === 1 ? 'alt' : ''}`}>
                      <span className="corner"></span>
                      <div className="clinic-top">
                        <h4 className="clinic-title">{fac.name}</h4>
                        <span className="type-badge">{fac.type}</span>
                      </div>
                      <p className="clinic-loc">{fac.location}, {fac.county} County</p>
                      <p className="clinic-services"><strong>Services:</strong> {fac.services}</p>
                      <div className="clinic-actions">
                        <button className="btn-mini primary" onClick={() => handleViewDetails(fac)}>View details</button>
                        <button className="btn-mini" onClick={() => handleCallClinic(fac.phone)}>Call</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // DETAIL VIEW
            selectedFacility && (
              <>
                <div className="section-head" style={{ marginTop: 0 }}>
                  <h3>Clinic detail</h3>
                  <div className="rule" />
                  <span className="tag">Info</span>
                </div>

                <div className="detail-card">
                  <span className="corner"></span>
                  <button className="back-link-btn" onClick={() => setView('list')}>← Back to list</button>

                  <h3 className="detail-title">{selectedFacility.name}</h3>
                  <p className="detail-type">{selectedFacility.type}</p>

                  <div className="detail-info-group">
                    <p><strong>📍 Location:</strong> {selectedFacility.location}, {selectedFacility.county} County</p>
                    <p><strong>📞 Contact Phone:</strong> {selectedFacility.phone}</p>
                    <p><strong>🕒 Opening Hours:</strong> {selectedFacility.openingHours}</p>
                    <p><strong>🔬 Services Offered:</strong> {selectedFacility.services}</p>
                  </div>

                  <hr className="detail-divider" />

                  <div className="detail-notes">
                    <strong>Before you visit:</strong>
                    <p>{selectedFacility.notes}</p>
                  </div>

                  <div className="detail-actions">
                    <button className="btn-primary" onClick={() => handleCallClinic(selectedFacility.phone)}>Call Clinic</button>
                    <button className="btn-secondary" onClick={() => handleViewMap(selectedFacility)}>View Map location</button>
                    <button className="btn-ghost" onClick={() => handleSetReminder(selectedFacility)}>Schedule visit reminder</button>
                  </div>
                </div>
              </>
            )
          )}
        </div>

      </div>

    </div>
  );
};

export default Directory;
