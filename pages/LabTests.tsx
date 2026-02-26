import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/index';
import { LabTest, LabBooking } from '../types';

const availableTests: LabTest[] = [
  { id: 1, name: 'Thyroid Function Test (TFT)', price: 450, category: 'Hormonal', description: 'Measures T3, T4, and TSH levels to evaluate thyroid health.' },
  { id: 2, name: 'Chest X-Ray', price: 650, category: 'Imaging', description: 'Diagnostic imaging of the heart and lungs.' },
  { id: 3, name: 'Complete Blood Count (CBC)', price: 320, category: 'Routine', description: 'Screening for anemia, infection, and various disorders.' },
  { id: 4, name: 'Lipid Profile', price: 580, category: 'Heart', description: 'Measures cholesterol and triglycerides levels.' },
  { id: 5, name: 'HbA1c (Diabetes)', price: 490, category: 'Diabetes', description: 'Measures average blood sugar levels over 3 months.' },
  { id: 6, name: 'Liver Function Test (LFT)', price: 750, category: 'Organ Care', description: 'Assesses liver health and protein levels.' },
  { id: 7, name: 'Vitamin B12 Check', price: 950, category: 'Deficiency', description: 'Checks for B12 levels vital for nerve health.' },
  { id: 8, name: 'Kidney Function Test (KFT)', price: 800, category: 'Organ Care', description: 'Evaluates urea and creatinine levels in blood.' }
];

const LabTests: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'tests' | 'bookings'>('tests');
  const [selectedTestIds, setSelectedTestIds] = useState<number[]>([]);
  const [bookingStep, setBookingStep] = useState<'selecting' | 'details' | 'processing' | 'success'>('selecting');
  
  const [formData, setFormData] = useState({ 
    name: user?.fullName || '', 
    date: '', 
    location: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const [bookings, setBookings] = useState<LabBooking[]>(() => {
    const saved = localStorage.getItem('hc_lab_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('hc_lab_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const toggleTestSelection = (id: number) => {
    setSelectedTestIds(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const removeTest = (id: number) => {
    const next = selectedTestIds.filter(tid => tid !== id);
    setSelectedTestIds(next);
    if (next.length === 0) setBookingStep('selecting');
  };

  const selectedTests = useMemo(() => availableTests.filter(t => selectedTestIds.includes(t.id)), [selectedTestIds]);
  const totalPrice = useMemo(() => selectedTests.reduce((sum, t) => sum + t.price, 0), [selectedTests]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTests.length === 0) return;

    setBookingStep('processing');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newBookings: LabBooking[] = selectedTests.map(test => ({
      id: Date.now() + Math.random(),
      testName: test.name,
      patientName: formData.name,
      date: formData.date,
      location: formData.location,
      status: 'Scheduled'
    }));

    setBookings(prev => [...newBookings, ...prev]);
    setBookingStep('success');
  };

  const resetForm = () => {
    setSelectedTestIds([]);
    setBookingStep('selecting');
    setFormData({ name: user?.fullName || '', date: '', location: '', cardNumber: '', expiry: '', cvv: '' });
  };

  const handleViewBookings = () => {
    resetForm();
    setView('bookings');
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setFormData({ ...formData, cardNumber: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    setFormData({ ...formData, expiry: val });
  };

  return (
    <div style={{ animation: 'popIn 0.3s ease-out' }}>
      <style>{`
        .staggered-item { opacity: 0; animation: slideUp 0.5s ease-out forwards; }
        .checkmark-anim { animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Diagnostic Center</h1>
          <p style={{ color: 'var(--text-muted)' }}>Secure health diagnostics with clinical accuracy.</p>
        </div>
        <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
          <button 
            className="secondary" 
            style={{ 
              background: view === 'tests' ? 'var(--primary)' : 'transparent', 
              color: view === 'tests' ? 'white' : 'var(--text-muted)',
              border: 'none', padding: '0.7rem 1.4rem', borderRadius: '12px', fontWeight: 800
            }}
            onClick={() => setView('tests')}
          >
            Test Catalog
          </button>
          <button 
            className="secondary" 
            style={{ 
              background: view === 'bookings' ? 'var(--primary)' : 'transparent', 
              color: view === 'bookings' ? 'white' : 'var(--text-muted)',
              border: 'none', padding: '0.7rem 1.4rem', borderRadius: '12px', fontWeight: 800
            }}
            onClick={() => setView('bookings')}
          >
            My Appointments ({bookings.length})
          </button>
        </div>
      </div>

      {view === 'tests' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', marginBottom: '8rem' }}>
            {availableTests.map((test, index) => {
              const isSelected = selectedTestIds.includes(test.id);
              return (
                <div 
                  key={test.id} 
                  className="card staggered-item" 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    animationDelay: `${index * 0.1}s`,
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    transform: isSelected ? 'translateY(-8px)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      color: isSelected ? 'white' : 'var(--primary)', 
                      background: isSelected ? 'var(--primary)' : 'var(--primary-glow)', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '20px', 
                      fontWeight: 800, 
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {test.category}
                    </span>
                    <span style={{ fontWeight: 800, color: 'var(--success)', fontSize: '1.25rem' }}>₹{test.price}</span>
                  </div>
                  <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.2rem', fontWeight: 800 }}>{test.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', flex: 1, marginBottom: '2rem', lineHeight: '1.6' }}>{test.description}</p>
                  <button 
                    className={isSelected ? 'success' : 'secondary'}
                    onClick={() => toggleTestSelection(test.id)} 
                    style={{ width: '100%', height: '54px' }}
                  >
                    {isSelected ? '✓ In Booking List' : 'Add to Selection'}
                  </button>
                </div>
              );
            })}
          </div>

          {selectedTestIds.length > 0 && (
            <div style={{ 
              position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', 
              width: '90%', maxWidth: '850px', background: 'var(--bg-card)', padding: '1.5rem 2.5rem', 
              borderRadius: '28px', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100,
              border: '1px solid var(--border-color)', animation: 'slideUp 0.5s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: '56px', height: '56px', background: 'var(--primary-glow)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🧪</div>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedTestIds.length} Medical Tests Selected</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Final Package: <span style={{ color: 'var(--success)', fontWeight: 800 }}>₹{totalPrice}</span></div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="secondary" onClick={() => setSelectedTestIds([])} style={{ height: '54px' }}>Clear</button>
                <button onClick={() => setBookingStep('details')} style={{ height: '54px', padding: '0 2.5rem', fontSize: '1rem' }}>Confirm & Book</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card" style={{ padding: 0, borderRadius: '28px', overflow: 'hidden' }}>
          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
              <div style={{ fontSize: '5rem', marginBottom: '2rem', opacity: 0.1 }}>🔬</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Your clinical schedule is clear</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '400px', marginInline: 'auto' }}>No pending or completed diagnostic appointments found.</p>
              <button onClick={() => setView('tests')} style={{ padding: '1rem 2.5rem', borderRadius: '16px' }}>Explore Lab Catalog</button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ margin: 0 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-main)' }}>
                    <th style={{ padding: '1.5rem 2rem' }}>Diagnostic Test</th>
                    <th style={{ padding: '1.5rem 2rem' }}>Patient Details</th>
                    <th style={{ padding: '1.5rem 2rem' }}>Location</th>
                    <th style={{ padding: '1.5rem 2rem' }}>Schedule</th>
                    <th style={{ padding: '1.5rem 2rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, idx) => (
                    <tr key={b.id} style={{ animation: `slideUp 0.4s ease-out forwards`, animationDelay: `${idx * 0.05}s`, opacity: 0 }}>
                      <td style={{ padding: '1.5rem 2rem', fontWeight: 800, fontSize: '1rem' }}>{b.testName}</td>
                      <td style={{ padding: '1.5rem 2rem' }}>{b.patientName}</td>
                      <td style={{ padding: '1.5rem 2rem' }}><span style={{ color: 'var(--text-muted)' }}>📍 {b.location}</span></td>
                      <td style={{ padding: '1.5rem 2rem', fontWeight: 700 }}>{b.date}</td>
                      <td style={{ padding: '1.5rem 2rem' }}><span className="status status-success" style={{ fontSize: '0.7rem' }}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL CHECKOUT SYSTEM */}
      {(bookingStep !== 'selecting') && (
        <div className="modal-overlay" onClick={bookingStep === 'success' ? resetForm : undefined}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ 
            maxWidth: (bookingStep === 'success' || bookingStep === 'processing') ? '500px' : '650px',
            textAlign: (bookingStep === 'success' || bookingStep === 'processing') ? 'center' : 'left',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div className="modal-handle" style={{ width: '40px', height: '5px', background: 'var(--border-color)', borderRadius: '10px', margin: '0 auto 1.5rem' }}></div>

            {bookingStep === 'details' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>Clinical Checkout</h2>
                  <button className="secondary" style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px' }} onClick={() => setBookingStep('selecting')}>✕</button>
                </div>
                
                <form onSubmit={handleBookingSubmit}>
                  {/* Package Summary */}
                  <div style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}>Order Summary</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                      {selectedTests.map(test => (
                        <div key={test.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                          <div>
                            <span style={{ fontWeight: 800 }}>{test.name}</span>
                            <button type="button" onClick={() => removeTest(test.id)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem', background: 'transparent', color: 'var(--danger)', border: 'none', fontWeight: 800, marginLeft: '0.5rem' }}>Remove</button>
                          </div>
                          <span style={{ fontWeight: 800 }}>₹{test.price}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
                      <span style={{ fontWeight: 800 }}>{selectedTests.length} Tests Selected</span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>₹{totalPrice}</span>
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>👤</span>
                      <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Patient Information</h3>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontWeight: 800, fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>PATIENT FULL NAME</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ height: '54px', marginBottom: 0 }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 800, fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>COLLECTION DATE</label>
                        <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} min={new Date().toISOString().split('T')[0]} style={{ height: '54px', marginBottom: 0 }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 800, fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>CITY</label>
                        <input type="text" required placeholder="City name" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={{ height: '54px', marginBottom: 0 }} />
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.1rem' }}>💳</span>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-main)' }}>Secure Payment</h3>
                      </div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--success)', background: 'var(--success-glow)', padding: '0.3rem 0.6rem', borderRadius: '8px' }}>SSL SECURED</span>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontWeight: 800, fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>CARD NUMBER</label>
                      <input 
                        type="text" 
                        placeholder="0000 0000 0000 0000"
                        required 
                        value={formData.cardNumber} 
                        onChange={handleCardNumberChange}
                        style={{ marginBottom: 0, height: '54px', fontSize: '1.1rem', letterSpacing: '0.1em', fontFamily: 'monospace' }} 
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 800, fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>EXPIRY DATE</label>
                        <input 
                          type="text" 
                          placeholder="MM/YY"
                          required 
                          value={formData.expiry} 
                          onChange={handleExpiryChange}
                          style={{ marginBottom: 0, height: '54px', textAlign: 'center' }} 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 800, fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>SECURE CVV</label>
                        <input 
                          type="password" 
                          placeholder="***"
                          required 
                          maxLength={3}
                          value={formData.cvv} 
                          onChange={e => setFormData({...formData, cvv: e.target.value.replace(/\D/g, '')})}
                          style={{ marginBottom: 0, height: '54px', textAlign: 'center' }} 
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" style={{ width: '100%', height: '64px', fontSize: '1.1rem', borderRadius: '18px', fontWeight: 800 }}>Authorize & Schedule Tests</button>
                </form>
              </>
            )}

            {bookingStep === 'processing' && (
              <div style={{ padding: '4rem 0' }}>
                <div style={{ width: '64px', height: '64px', border: '4px solid var(--primary-glow)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 2.5rem', animation: 'spin 1s linear infinite' }}></div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Encrypting Transaction</h2>
                <p style={{ color: 'var(--text-muted)' }}>Coordinating with diagnostic lab technicians...</p>
              </div>
            )}

            {bookingStep === 'success' && (
              <div style={{ padding: '2rem 0' }}>
                <div className="gpay-success-circle">✓</div>
                <h1 style={{ color: 'var(--success)', fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem' }}>Booking Confirmed</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                  Transaction authorized from card ending in **{formData.cardNumber.slice(-4)}
                </p>

                <div style={{ 
                  background: 'var(--bg-main)', padding: '2rem', borderRadius: '24px', 
                  border: '1px solid var(--border-color)', marginBottom: '2.5rem',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Scheduled Date</div>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>{formData.date}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Amount Paid</div>
                      <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--primary)' }}>₹{totalPrice}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Collection At</div>
                    <div style={{ fontWeight: 800 }}>Health Hub Plaza, {formData.location}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button style={{ height: '60px', fontSize: '1.1rem' }} onClick={handleViewBookings}>View My Bookings</button>
                  <button className="secondary" style={{ height: '60px' }} onClick={resetForm}>Done</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LabTests;