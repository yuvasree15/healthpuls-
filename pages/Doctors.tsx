import React, { useState, useEffect, useMemo } from 'react';
import { useAppointments, useChat, useAuth } from '../contexts/index';
import { useNavigate } from 'react-router-dom';

interface DoctorData {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  keywords: string[];
  rating: string;
  experience: string;
  price: string;
  bookingNumber: string;
  location: string;
  symptoms: string[];
  phone: string;
}

const CATEGORIES = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Oncology', 'Gastroenterology', 'Psychiatry', 'General Physician', 'ENT Specialist'];

const FIRST_NAMES = [
  'Aarav', 'Ananya', 'Vihaan', 'Ira', 'Ishaan', 'Diya', 'Arjun', 'Myra', 'Sai', 'Anvi', 
  'Krishna', 'Kyra', 'Rudra', 'Anaya', 'Aryan', 'Aadhya', 'Aayush', 'Sara', 'Vedant', 'Kavya',
  'Gokul', 'Dinesh', 'Pooja', 'Divakar', 'Anjali', 'Siddharth', 'Ishani', 'Rohan', 'Vikram', 'Priyanka'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Malhotra', 'Kapoor', 'Khanna', 'Reddy', 'Patel', 'Nair', 'Menon', 
  'Iyer', 'Pillai', 'Dubey', 'Trivedi', 'Chatterjee', 'Banerjee', 'Sinha', 'Singh', 'Deshmukh', 'Patil',
  'Reddy', 'Pillai', 'Venkatesh', 'Bose', 'Chopra', 'Das', 'Khan', 'Joshi', 'Muller', 'Lee'
];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
];

const Doctors: React.FC = () => {
  const { addAppointment, appointments } = useAppointments();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingDoc, setBookingDoc] = useState<DoctorData | null>(null);
  
  const [bookingState, setBookingState] = useState<'form' | 'processing' | 'success'>('form');
  const [transactionId] = useState(() => 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase());

  const [formData, setFormData] = useState({ 
    name: user?.fullName || '', 
    age: user?.age?.toString() || '', 
    phone: user?.phone || '',
    city: '',
    date: '',
    time: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const doctorsWithNewBookings = useMemo(() => {
    const pendingSet = new Set<string>();
    appointments.forEach(app => {
      if (app.status === 'Pending') pendingSet.add(app.doctorName);
    });
    return pendingSet;
  }, [appointments]);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/doctors');
        if (response.ok) {
          const data = await response.json();
          // Ensure phone property is present if coming from API
          setDoctors(data.map((d: any) => ({ ...d, phone: d.phone || `9${Math.floor(100000000 + Math.random() * 900000000)}` })));
        } else {
          throw new Error('Local Fallback');
        }
      } catch (err) {
        const specs = CATEGORIES.slice(1);
        
        const nameCombinations: string[] = [];
        for (const fn of FIRST_NAMES) {
          for (const ln of LAST_NAMES) {
            nameCombinations.push(`Dr. ${fn} ${ln}`);
          }
        }
        for (let i = nameCombinations.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [nameCombinations[i], nameCombinations[j]] = [nameCombinations[j], nameCombinations[i]];
        }

        const simulatedDoctors: DoctorData[] = Array.from({ length: 70 }, (_, i) => {
          const spec = specs[i % specs.length];
          const exp = 5 + (i % 15);
          const bookingNumber = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
          const randomName = nameCombinations[i % nameCombinations.length];
          const randomPhone = `9${String(i).padStart(2, '0')}${Math.floor(1000000 + Math.random() * 9000000)}`;
          
          let docSymptoms: string[] = [];
          if (spec === 'General Physician') docSymptoms = ['Fever', 'cold', 'cough', 'headache', 'body pain'];
          else if (spec === 'Pediatrics') docSymptoms = ['Fever', 'cold', 'cough', 'vomiting'];
          else if (spec === 'Gastroenterology') docSymptoms = ['stomach pain', 'acidity', 'gas', 'nausea'];
          else if (spec === 'Cardiology') docSymptoms = ['chest discomfort', 'breathing difficulty'];
          else if (spec === 'ENT Specialist') docSymptoms = ['sore throat', 'ear pain', 'nose block'];

          return {
            id: 5000 + i,
            name: randomName,
            specialty: spec,
            bio: `Dedicated ${spec} professional with ${exp} years of clinical expertise. Focused on modern patient-centric treatment plans.`,
            keywords: [spec.toLowerCase(), ...docSymptoms.map(s => s.toLowerCase()), randomName.toLowerCase()],
            rating: (4.0 + (i % 10) / 10).toFixed(1),
            experience: `${exp} yrs exp.`,
            price: `₹${500 + (i % 5) * 100}`,
            bookingNumber: bookingNumber,
            location: 'Health Hub Plaza',
            symptoms: docSymptoms,
            phone: randomPhone
          };
        });
        setDoctors(simulatedDoctors);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      const matchesCategory = selectedCategory === 'All' || doc.specialty === selectedCategory;
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        doc.name.toLowerCase().includes(lowerSearch) || 
        doc.specialty.toLowerCase().includes(lowerSearch) ||
        doc.symptoms.some(s => s.toLowerCase().includes(lowerSearch));

      return matchesCategory && matchesSearch;
    }).sort((a, b) => (doctorsWithNewBookings.has(a.name) ? -1 : 1));
  }, [searchTerm, selectedCategory, doctors, doctorsWithNewBookings]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDoc || !user || !formData.time) {
      if (!formData.time) alert("Please select a time slot.");
      return;
    }
    if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
      alert("Please enter a valid 16-digit card number.");
      return;
    }
    if (formData.cvv.length < 3) {
      alert("Please enter a valid 3-digit CVV.");
      return;
    }
    
    setBookingState('processing');
    await new Promise(resolve => setTimeout(resolve, 2200));

    addAppointment({ 
      doctorName: bookingDoc.name, 
      patientName: formData.name, 
      patientUsername: user.username, 
      patientPhone: formData.phone,
      patientAge: parseInt(formData.age) || 25, 
      city: formData.city,
      date: formData.date,
      time: formData.time
    });

    setBookingState('success');
  };

  const closeBooking = () => {
    setBookingDoc(null);
    setBookingState('form');
    setFormData(prev => ({ ...prev, cardNumber: '', expiry: '', cvv: '', time: '', city: '' }));
  };

  const handleDone = () => {
    closeBooking();
    navigate('/appointments');
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
        .time-slot-btn { transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .time-slot-btn:active { transform: scale(0.9); }
        .booking-input:focus { transform: translateY(-2px); box-shadow: 0 4px 12px var(--primary-glow); }
        
        /* TICK ANIMATION */
        .checkmark-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: block;
          stroke-width: 4;
          stroke: var(--success);
          stroke-miterlimit: 10;
          margin: 10% auto;
          box-shadow: inset 0px 0px 0px var(--success);
          animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
        }
        .checkmark-check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke .3s cubic-bezier(0.65, 0, 0.45, 1) .8s forwards;
        }
        @keyframes stroke { 100% { stroke-dashoffset: 0; } }
        @keyframes scale { 0%, 100% { transform: none; } 50% { transform: scale3d(1.1, 1.1, 1); } }
        @keyframes fill { 100% { box-shadow: inset 0px 0px 0px 50px var(--success-glow); } }
        
        .confirmed-text {
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--success);
          margin-top: 1rem;
          animation: slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.2s both;
        }
        .success-summary {
           animation: fadeInUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.5s both;
        }
      `}</style>

      <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Specialist Directory</h1>
        <p style={{ color: 'var(--text-muted)' }}>Search symptoms like <strong>Fever, headache, or joint pain</strong> to find top doctors.</p>
        
        <div style={{ position: 'relative', maxWidth: '600px', margin: '1.5rem auto 0' }}>
          <input 
            placeholder="Search symptoms or doctors..." 
            style={{ paddingLeft: '3rem', height: '60px', borderRadius: '16px' }} 
            className="booking-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '1.2rem' }}>🔍</span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', marginTop: '1.5rem', paddingBottom: '0.5rem', justifyContent: 'flex-start' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className="secondary"
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-card)',
                color: selectedCategory === cat ? 'white' : 'var(--text-muted)',
                borderColor: selectedCategory === cat ? 'var(--primary)' : 'var(--border-color)',
                whiteSpace: 'nowrap',
                fontSize: '0.75rem',
                padding: '0.5rem 1rem'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--primary-glow)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 1.5rem', animation: 'spin 1s linear infinite' }}></div>
          <p>Scanning medical registry...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredDoctors.map(doc => {
            const hasNewBooking = doctorsWithNewBookings.has(doc.name);
            return (
              <div key={doc.id} className="card" style={{ 
                display: 'flex', 
                flexDirection: 'column',
                position: 'relative',
                border: hasNewBooking ? '1px solid var(--danger)' : '1px solid var(--border-color)',
                boxShadow: hasNewBooking ? '0 10px 25px var(--danger-glow)' : 'var(--card-shadow)',
              }}>
                {hasNewBooking && (
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--danger-glow)', padding: '0.3rem 0.6rem', borderRadius: '8px', border: '1px solid var(--danger)' }}>
                    <div style={{ width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%', boxShadow: '0 0 8px var(--danger)' }}></div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--danger)', fontWeight: 800 }}>NEW REQUESTS</span>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="avatar" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', width: '40px', height: '40px' }}>{doc.name.charAt(4)}</div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>{doc.name}</h3>
                      <div style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800 }}>{doc.specialty}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginTop: '2px' }}>📞 {doc.phone}</div>
                    </div>
                  </div>
                  {!hasNewBooking && <span style={{ color: 'var(--warning)', fontWeight: 800, fontSize: '0.85rem' }}>⭐ {doc.rating}</span>}
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
                   <span style={{ background: 'var(--bg-main)', padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', border: '1px solid var(--border-color)', textTransform: 'uppercase' }}>
                     {doc.experience || 'Experience not specified'}
                   </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Treats Conditions:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {doc.symptoms.slice(0, 4).map(s => (
                      <span key={s} style={{ fontSize: '0.65rem', background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>{s}</span>
                    ))}
                    {doc.symptoms.length > 4 && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>+{doc.symptoms.length - 4} more</span>}
                  </div>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '1rem', borderRadius: '16px', flex: 1, marginBottom: '1.25rem', lineHeight: '1.6' }}>{doc.bio}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{doc.price}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Session Fee</div>
                  </div>
                  <button onClick={() => setBookingDoc(doc)} style={{ padding: '0.7rem 1.25rem', borderRadius: '10px' }}>Book Now</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {bookingDoc && (
        <div className="modal-overlay" onClick={bookingState === 'success' ? handleDone : closeBooking}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px', padding: 0, overflowY: 'auto', maxHeight: '90vh', borderRadius: '32px' }}>
            {bookingState === 'form' && (
              <>
                <div style={{ padding: '2rem 2.5rem', background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.6rem', color: 'white' }}>Finalize Booking</h2>
                    <p style={{ margin: '0.4rem 0 0', opacity: 0.8, fontSize: '0.85rem' }}>Appointment with {bookingDoc.name}</p>
                  </div>
                  <button className="secondary" onClick={closeBooking} style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white' }}>✕</button>
                </div>
                
                <div style={{ padding: '2.5rem' }}>
                  <form onSubmit={handleBooking}>
                    {/* Patient Detail Section */}
                    <div style={{ marginBottom: '2.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>📋</span>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>Clinical Profile</h3>
                      </div>
                      
                      <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontWeight: 800, fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>PATIENT FULL NAME</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="booking-input" style={{ marginBottom: 0, height: '54px' }} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        <div>
                          <label style={{ display: 'block', fontWeight: 800, fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>AGE</label>
                          <input type="number" required value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="booking-input" style={{ marginBottom: 0, height: '54px' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontWeight: 800, fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>PATIENT CITY</label>
                          <input type="text" required placeholder="e.g. Mumbai" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="booking-input" style={{ marginBottom: 0, height: '54px' }} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        <div>
                          <label style={{ display: 'block', fontWeight: 800, fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>APPOINTMENT DATE</label>
                          <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} min={new Date().toISOString().split('T')[0]} className="booking-input" style={{ marginBottom: 0, height: '54px' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontWeight: 800, fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>CONTACT NUMBER</label>
                          <input type="tel" required placeholder="10 Digits" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').substring(0, 10)})} className="booking-input" style={{ marginBottom: 0, height: '54px' }} />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontWeight: 800, fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>TIME SLOT</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
                          {TIME_SLOTS.map(slot => (
                            <button
                              key={slot}
                              type="button"
                              className={`secondary time-slot-btn`}
                              onClick={() => setFormData({...formData, time: slot})}
                              style={{
                                padding: '0.6rem 0', fontSize: '0.7rem', borderRadius: '12px',
                                background: formData.time === slot ? 'var(--primary)' : 'var(--bg-card)',
                                color: formData.time === slot ? 'white' : 'var(--text-muted)',
                                border: formData.time === slot ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                                fontWeight: 800
                              }}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Secure Payment Section */}
                    <div style={{ marginBottom: '2.5rem', padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>💳</span>
                          <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-main)', fontWeight: 800 }}>Secure Authorization</h3>
                        </div>
                        <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--success)', background: 'var(--success-glow)', padding: '0.3rem 0.6rem', borderRadius: '8px' }}>SSL SECURED</span>
                      </div>
                      
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontWeight: 800, fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>CARD NUMBER</label>
                        <input type="text" placeholder="XXXX XXXX XXXX XXXX" required value={formData.cardNumber} onChange={handleCardNumberChange} className="booking-input" style={{ height: '54px', marginBottom: 0, fontFamily: 'monospace', letterSpacing: '2px', fontSize: '1.1rem' }} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontWeight: 800, fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>EXPIRY DATE</label>
                          <input type="text" placeholder="MM/YY" required value={formData.expiry} onChange={handleExpiryChange} className="booking-input" style={{ height: '54px', marginBottom: 0, textAlign: 'center' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontWeight: 800, fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>SECURE CVV</label>
                          <input type="password" placeholder="***" maxLength={3} required value={formData.cvv} onChange={e => setFormData({...formData, cvv: e.target.value.replace(/\D/g, '').substring(0, 3)})} className="booking-input" style={{ height: '54px', marginBottom: 0, textAlign: 'center' }} />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem', marginBottom: '2rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>PAYABLE AMOUNT:</span>
                        <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{bookingDoc.price}</span>
                    </div>

                    <button type="submit" style={{ width: '100%', height: '64px', fontSize: '1.1rem', borderRadius: '20px', fontWeight: 800, boxShadow: '0 8px 24px var(--primary-glow)' }}>
                       Authorize & Confirm Session
                    </button>
                  </form>
                </div>
              </>
            )}

            {bookingState === 'processing' && (
              <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
                <div style={{ 
                  width: '80px', height: '80px', border: '5px solid var(--primary-glow)', 
                  borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 2.5rem', 
                  animation: 'spin 1s linear infinite' 
                }}></div>
                <h2 style={{ marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Validating Transaction</h2>
                <p style={{ color: 'var(--text-muted)', animation: 'subtlePulse 2s infinite' }}>Securing your consultation slot in the clinical archive...</p>
              </div>
            )}

            {bookingState === 'success' && (
              <div style={{ textAlign: 'center', padding: '4rem 2.5rem' }}>
                <svg className="checkmark-circle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                  <circle className="checkmark-circle-path" cx="26" cy="26" r="25" fill="none"/>
                  <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
                
                <h1 className="confirmed-text">Confirmed!</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem', animation: 'fadeIn 1s ease-in 1.3s both' }}>
                  Your clinical session has been successfully registered.
                </p>
                
                <div className="success-summary" style={{ 
                  background: 'var(--bg-main)', padding: '2rem', borderRadius: '28px', border: '1px solid var(--border-color)', 
                  textAlign: 'left', marginBottom: '3rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-color)' }}>
                    <div>
                       <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Transaction Ref</div>
                       <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', fontFamily: 'monospace' }}>{transactionId}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Session Cost</div>
                       <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--success)' }}>{bookingDoc.price}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                       <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Specialist</div>
                       <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{bookingDoc.name}</div>
                    </div>
                    <div>
                       <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Scheduled Slot</div>
                       <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{formData.date} | {formData.time}</div>
                    </div>
                  </div>
                </div>

                <button onClick={handleDone} style={{ width: '100%', height: '64px', fontSize: '1.1rem', borderRadius: '20px', fontWeight: 800, animation: 'fadeInUp 1s ease-out 1.8s both' }}>
                   View My Appointments
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;