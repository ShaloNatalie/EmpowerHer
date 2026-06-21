import React, { useState } from 'react';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const Directory = () => {
  const [search, setSearch] = useState('');
  const [county, setCounty] = useState('All');

  const counties = ['All', 'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'];

  const facilities = [
    {
      id: 1,
      name: 'Kenyatta National Hospital (Cancer Centre)',
      county: 'Nairobi',
      phone: '020 2726300',
      services: 'Clinical Breast Examination (CBE), Mammography, Oncology support',
      address: 'Hospital Road, Nairobi'
    },
    {
      id: 2,
      name: 'Coast General Teaching & Referral Hospital',
      county: 'Mombasa',
      phone: '0722 203053',
      services: 'Ultrasound, Clinical Breast Exam, Diagnostic counseling',
      address: 'Mombasa Island'
    },
    {
      id: 3,
      name: 'Jaramogi Oginga Odinga Teaching & Referral Hospital',
      county: 'Kisumu',
      phone: '057 2020801',
      services: 'Oncology support, Screening, Mammograms',
      address: 'Kisumu Town'
    },
    {
      id: 4,
      name: 'Nairobi West Hospital Oncology Hub',
      county: 'Nairobi',
      phone: '0730 600000',
      services: 'Advanced Screening, CBE, Consultation',
      address: 'Gandhi Ave, Nairobi'
    },
    {
      id: 5,
      name: 'Nakuru Level 5 County Hospital',
      county: 'Nakuru',
      phone: '051 2215580',
      services: 'Free Maternal Health screening, CBE, Referral Clinic',
      address: 'Nakuru Town'
    }
  ];

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleMapRedirect = (facility) => {
    const query = encodeURIComponent(`${facility.name}, ${facility.address}, Kenya`);
    window.open(`https://www.openstreetmap.org/search?query=${query}`, '_blank');
  };

  const filteredFacilities = facilities.filter(fac => {
    const matchesSearch = fac.name.toLowerCase().includes(search.toLowerCase()) || 
                          fac.services.toLowerCase().includes(search.toLowerCase());
    const matchesCounty = county === 'All' || fac.county === county;
    return matchesSearch && matchesCounty;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="masthead-row">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '500' }}>
            Directory 🏥
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Screening and oncology support centres, found near wherever you are.
          </p>
        </div>
        <div className="stamp">Clinic Locator</div>
      </div>

      {/* Filter and Search controls */}
      <div className="card d-flex flex-column gap-2" style={{ border: '1px solid var(--line)', backgroundColor: 'white', padding: '24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '14px', height: '14px', backgroundColor: 'var(--coral)', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
        
        <Input
          label="Search by clinic name or services"
          value={search}
          onChange={handleSearchChange}
          placeholder="e.g. Mammography or Kenyatta"
        />

        <div>
          <label className="input-label">Filter by County</label>
          <select
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1.5px solid var(--line)',
              backgroundColor: 'var(--paper)',
              fontSize: '14px',
              fontFamily: 'var(--font-body)',
              outline: 'none'
            }}
          >
            {counties.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Facilities Lists */}
      <div className="zine-grid">
        {filteredFacilities.length === 0 ? (
          <div className="zine-card">
            <p style={{ color: 'var(--text-muted)' }}>No health clinics found matching search criteria.</p>
          </div>
        ) : (
          filteredFacilities.map((fac, idx) => (
            <div key={fac.id} className={`zine-card ${idx % 3 === 1 ? 'alt' : idx % 3 === 2 ? 'alt2' : ''}`}>
              <span className="corner" />
              <span className="no">Hub {idx + 1}</span>
              
              <span className="mono-label" style={{ color: 'var(--coral)', display: 'block', marginBottom: '4px' }}>
                📍 {fac.county} County
              </span>
              
              <h4 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: '600', paddingRight: '32px' }}>{fac.name}</h4>
              
              <div style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                <p>📍 <strong>Location:</strong> {fac.address}</p>
                <p>📞 <strong>Phone:</strong> {fac.phone}</p>
                <p>🛡️ <strong>Available Services:</strong> {fac.services}</p>
              </div>
              <div style={{ marginTop: '16px' }}>
                <Button variant="secondary" onClick={() => handleMapRedirect(fac)}>
                  🗺️ View on Map
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Directory;
