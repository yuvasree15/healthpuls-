
import React, { useState } from 'react';
import { Hospital } from '../types';

const facilities: Hospital[] = [
  { id: 1, name: 'City General Hospital', type: 'Hospital', rating: 4.8, distance: '1.2 km', timings: '24/7', contact: '555-0101', specialties: ['Emergency', 'Surgery', 'Cardiology'] },
  { id: 2, name: 'Wellness Family Clinic', type: 'Clinic', rating: 4.5, distance: '0.8 km', timings: '08:00 - 20:00', contact: '555-0102', specialties: ['GP', 'Pediatrics'] },
  { id: 3, name: 'St. Jude Children Hospital', type: 'Hospital', rating: 4.9, distance: '3.5 km', timings: '24/7', contact: '555-0103', specialties: ['Pediatrics', 'Oncology'] },
  { id: 4, name: 'Northside Medical Center', type: 'Clinic', rating: 4.2, distance: '2.1 km', timings: '09:00 - 18:00', contact: '555-0104', specialties: ['Dermatology', 'Dental'] },
  { id: 5, name: 'Ortho-Care Specialty Clinic', type: 'Clinic', rating: 4.7, distance: '1.5 km', timings: '10:00 - 19:00', contact: '555-0105', specialties: ['Orthopedics'] },
];

const HospitalFinder: React.FC = () => {
  const [filterType, setFilterType] = useState<'All' | 'Hospital' | 'Clinic'>('All');
  const [maxDistance, setMaxDistance] = useState<number>(5);

  const filteredFacilities = facilities.filter(f => {
    const matchesType = filterType === 'All' || f.type === filterType;
    const distanceVal = parseFloat(f.distance);
    return matchesType && distanceVal <= maxDistance;
  });

  return (
    <div>
      <h1>Clinic & Hospital Finder</h1>
      
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Facility Type</label>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value as any)}
            style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #ddd', minWidth: '150px' }}
          >
            <option value="All">All Types</option>
            <option value="Hospital">Hospitals Only</option>
            <option value="Clinic">Clinics Only</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Max Distance: {maxDistance} km</label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            step="0.5" 
            value={maxDistance}
            onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
            style={{ width: '200px' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {filteredFacilities.map(f => (
          <div key={f.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ 
                background: f.type === 'Hospital' ? '#e74c3c' : '#2ecc71', 
                color: 'white', 
                padding: '0.2rem 0.6rem', 
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}>{f.type}</span>
              <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>⭐ {f.rating}</span>
            </div>
            
            <h3 style={{ margin: '0 0 0.5rem' }}>{f.name}</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>📍 {f.distance} away</p>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>🕒 {f.timings}</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
              {f.specialties.map(spec => (
                <span key={spec} style={{ background: '#f0f0f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>{spec}</span>
              ))}
            </div>

            <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button onClick={() => window.open(`tel:${f.contact}`)}>Call Facility</button>
              <button className="secondary" onClick={() => alert(`Showing directions to ${f.name}`)}>Directions</button>
            </div>
          </div>
        ))}
        {filteredFacilities.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#666' }}>
            No facilities found within the selected criteria. Try increasing the distance.
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalFinder;
