import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const ManageFacilities = () => {
  const [facilities, setFacilities] = useState([
    { id: 1, name: 'Kenyatta National Hospital', county: 'Nairobi', phone: '020 2726300' },
    { id: 2, name: 'Coast Teaching Hospital', county: 'Mombasa', phone: '0722 203053' },
    { id: 3, name: 'JOOTRH Oncology clinic', county: 'Kisumu', phone: '057 2020801' }
  ]);

  const [name, setName] = useState('');
  const [county, setCounty] = useState('Nairobi');
  const [phone, setPhone] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newFac = {
      id: Date.now(),
      name,
      county,
      phone
    };

    setFacilities([...facilities, newFac]);
    setName('');
    setPhone('');
  };

  const handleDelete = (id) => {
    setFacilities(facilities.filter(fac => fac.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="masthead-row">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '500' }}>
            Clinics Panel 🏥
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Register new healthcare screening clinics and update contact numbers.
          </p>
        </div>
        <div className="stamp">Clinic Registry</div>
      </div>

      {/* Add Facility Form */}
      <form onSubmit={handleCreate} className="card d-flex flex-column gap-2" style={{ border: '1px solid var(--line)', backgroundColor: 'white', padding: '24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '14px', height: '14px', backgroundColor: 'var(--oxblood)', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
        
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '600' }}>Register Clinic Hub</h3>
        <Input
          label="Clinic Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Kakamega County Hospital"
          required
        />
        
        <div className="form-row-responsive">
          <div>
            <label className="input-label">County</label>
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1.5px solid var(--line)',
                backgroundColor: 'var(--paper)',
                fontSize: '14px',
                fontFamily: 'var(--font-body)',
                outline: 'none'
              }}
            >
              <option value="Nairobi">Nairobi</option>
              <option value="Mombasa">Mombasa</option>
              <option value="Kisumu">Kisumu</option>
              <option value="Nakuru">Nakuru</option>
              <option value="Kakamega">Kakamega</option>
            </select>
          </div>
          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 0712 345678"
            required
          />
        </div>

        <div style={{ marginTop: '16px' }}>
          <Button type="submit" variant="primary">Add Facility</Button>
        </div>
      </form>

      {/* Directory Table */}
      <div>
        <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: '600', marginBottom: '16px' }}>Registered Facilities</h3>
        
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Clinic Name</th>
                <th>County</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((fac) => (
                <tr key={fac.id}>
                  <td>
                    <strong>{fac.name}</strong>
                    <br />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Tel: {fac.phone}</span>
                  </td>
                  <td>
                    <span className="badge badge-success" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>{fac.county}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => alert(`Edit trigger for "${fac.name}" (placeholder)`)}
                        style={{ color: 'var(--oxblood)', fontWeight: '600', fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(fac.id)}
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

export default ManageFacilities;
