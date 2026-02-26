import React, { useState } from 'react';
import { useHealthRecords } from '../contexts/index';
import { HealthRecord } from '../types';

const HealthRecords: React.FC = () => {
  const { records } = useHealthRecords();
  const [viewingRecord, setViewingRecord] = useState<HealthRecord | null>(null);

  const handleDownload = (record: HealthRecord) => {
    const blob = new Blob([
      `MediConnect Official Health Record\n`,
      `==============================\n`,
      `Title: ${record.title}\n`,
      `Type: ${record.type}\n`,
      `Date: ${record.date}\n`,
      `Doctor: ${record.doctorName}\n\n`,
      `Findings:\n`,
      `${record.content}\n\n`,
      `This is a computer-generated report and remains valid until further clinical review.\n`,
      `MediConnect Health Network © 2024`
    ], { type: 'text/plain' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.title.replace(/\s+/g, '_')}_${record.date}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    alert('Document downloaded successfully for offline viewing.');
  };

  return (
    <div style={{ animation: 'popIn 0.3s ease-out' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1>My Health Records</h1>
        <p style={{ color: 'var(--text-muted)' }}>View and manage your medical reports and prescriptions securely.</p>
      </header>

      <div className="card" style={{ padding: 0, borderRadius: '24px', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th style={{ paddingLeft: '2rem' }}>Document</th>
              <th>Issued On</th>
              <th>Specialist</th>
              <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map(record => (
              <tr key={record.id}>
                <td style={{ paddingLeft: '2rem' }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{record.title}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>{record.type}</div>
                </td>
                <td style={{ fontWeight: 600 }}>{record.date}</td>
                <td>{record.doctorName}</td>
                <td style={{ textAlign: 'right', paddingRight: '2rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button className="secondary" onClick={() => handleDownload(record)} title="Download as Text">📥</button>
                    <button onClick={() => setViewingRecord(record)}>Open Record</button>
                  </div>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No health records found in your profile.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewingRecord && (
        <div className="modal-overlay" onClick={() => setViewingRecord(null)}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-handle"></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ margin: 0 }}>{viewingRecord.title}</h2>
                <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.75rem' }}>OFFICIAL CLINICAL DOCUMENT</span>
              </div>
              <button className="secondary" onClick={() => setViewingRecord(null)} style={{ borderRadius: '50%', width: '40px', height: '40px' }}>✕</button>
            </div>
            
            <div style={{ padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '20px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>ISSUED BY</div>
                  <div style={{ fontWeight: 700 }}>{viewingRecord.doctorName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>REPORT DATE</div>
                  <div style={{ fontWeight: 700 }}>{viewingRecord.date}</div>
                </div>
              </div>
              
              <div style={{ minHeight: '150px' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '0.5rem' }}>CLINICAL FINDINGS</div>
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  fontFamily: 'inherit', 
                  fontSize: '0.95rem', 
                  lineHeight: '1.6',
                  color: 'var(--text-main)',
                  margin: 0
                }}>
                  {viewingRecord.content}
                </pre>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button style={{ flex: 1 }} onClick={() => handleDownload(viewingRecord)}>Download Official Copy</button>
              <button className="secondary" style={{ flex: 1 }} onClick={() => setViewingRecord(null)}>Close Viewer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthRecords;