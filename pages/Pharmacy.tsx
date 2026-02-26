import React, { useState, useMemo, useEffect } from 'react';
import { useCart, useAuth } from '../contexts/index';
import { Medicine } from '../types';
import { useNavigate } from 'react-router-dom';

const allMeds: Medicine[] = [
  { 
    id: 1, name: 'Paracetamol 500mg', price: 50, category: 'Pain Relief', requiresPrescription: false, 
    description: 'Effective for fever and mild to moderate pain.',
    usage: 'Take 1 tablet every 4-6 hours as needed. Do not exceed 4 tablets in 24 hours.',
    sideEffects: 'Mild nausea, stomach pain, or skin rash in rare cases.',
    storage: 'Store in a cool, dry place below 25°C. Keep away from direct sunlight.'
  },
  { 
    id: 2, name: 'Amoxicillin 250mg', price: 120, category: 'Antibiotics', requiresPrescription: true, 
    description: 'Broad-spectrum antibiotic for bacterial infections.',
    usage: 'Complete the full course as directed by your physician. Usually 3 times daily.',
    sideEffects: 'Diarrhea, yeast infection, or mild allergic reactions.',
    storage: 'Keep in original container. Store at room temperature.'
  },
  { 
    id: 3, name: 'Ibuprofen 400mg', price: 85, category: 'Pain Relief', requiresPrescription: false, 
    description: 'Anti-inflammatory medicine for joint and muscle pain.',
    usage: 'Take with food or milk to prevent stomach upset. 1 tablet every 6-8 hours.',
    sideEffects: 'Heartburn, indigestion, or dizziness.',
    storage: 'Keep tightly closed in a dry area.'
  },
  { 
    id: 4, name: 'Vitamin D3 60K', price: 210, category: 'Supplements', requiresPrescription: false, 
    description: 'Supports bone health and immunity.',
    usage: 'Take 1 capsule weekly for 8 weeks or as prescribed.',
    sideEffects: 'Excessive calcium levels if taken in very high doses.',
    storage: 'Protect from light and moisture.'
  },
  { 
    id: 5, name: 'Omeprazole 20mg', price: 145, category: 'Stomach Care', requiresPrescription: false, 
    description: 'Reduces stomach acid for heartbeat relief.',
    usage: 'Take at least 1 hour before a meal, usually in the morning.',
    sideEffects: 'Headache, stomach pain, or gas.',
    storage: 'Keep in a cool place.'
  },
  { 
    id: 6, name: 'Metformin 500mg', price: 90, category: 'Diabetes', requiresPrescription: true, 
    description: 'Controls blood sugar levels in Type 2 diabetes.',
    usage: 'Take with meals to reduce gastrointestinal side effects.',
    sideEffects: 'Metalic taste, diarrhea, or appetite loss.',
    storage: 'Store away from children.'
  }
];

const Pharmacy: React.FC = () => {
  const { addToCart, decrementFromCart, removeFromCart, cart, checkout, orderHistory, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'shop' | 'history'>('shop');
  
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'form' | 'processing' | 'confirmed'>('idle');
  const [showFullBill, setShowFullBill] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string>('');
  const [lastOrderItems, setLastOrderItems] = useState<any[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<Set<number>>(new Set());

  const [checkoutData, setCheckoutData] = useState({
    name: user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    altPhone: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const requiresPrescriptionInCart = useMemo(() => {
    return cart.some(item => item.requiresPrescription);
  }, [cart]);

  const arrivingDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }, []);

  const handleAddToCart = (med: Medicine) => {
    addToCart(med);
    setRecentlyAdded(prev => new Set(prev).add(med.id));
    setTimeout(() => {
      setRecentlyAdded(prev => {
        const next = new Set(prev);
        next.delete(med.id);
        return next;
      });
    }, 1000);
  };

  const handleOpenForm = () => {
    if (cart.length === 0) return;
    setCheckoutStatus('form');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStatus('processing');
    await new Promise(resolve => setTimeout(resolve, 2000));
    const generatedId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setLastOrderItems([...cart]);
    checkout();
    setLastOrderId(generatedId);
    setCheckoutStatus('confirmed');
  };

  const downloadBill = () => {
    const tax = total * 0.05;
    const finalTotal = total + tax;
    const billContent = `
MediConnect Pharmacy - Official Invoice
--------------------------------------
Order ID: ${lastOrderId}
Date: ${new Date().toLocaleString()}
Customer: ${checkoutData.name}
Contact: ${checkoutData.phone}
Address: ${checkoutData.address}

Items:
${lastOrderItems.map(item => `- ${item.name} (Qty: ${item.quantity}) @ ₹${item.price} each = ₹${item.price * item.quantity}`).join('\n')}

Subtotal: ₹${total}
GST (5%): ₹${(total * 0.05).toFixed(2)}
--------------------------------------
TOTAL PAID: ₹${(total * 1.05).toFixed(2)}

Status: Payment Confirmed (Card **${checkoutData.cardNumber.slice(-4)})
Estimated Delivery: ${arrivingDate}

Thank you for choosing MediConnect.
    `.trim();

    const blob = new Blob([billContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MediConnect_Bill_${lastOrderId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDone = () => {
    setCheckoutStatus('idle');
    setView('history');
    setShowFullBill(false);
    setCheckoutData(prev => ({ ...prev, cardNumber: '', expiry: '', cvv: '' }));
  };

  const closeCheckout = () => {
    setCheckoutStatus('idle');
    setShowFullBill(false);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCheckoutData({ ...checkoutData, cardNumber: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    setCheckoutData({ ...checkoutData, expiry: val });
  };

  const renderCheckoutContent = () => {
    if (checkoutStatus === 'form') {
      return (
        <div style={{ animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.6rem' }}>Checkout</h2>
            <button className="secondary" onClick={closeCheckout} style={{ padding: '0.5rem', borderRadius: '50%', width: '36px', height: '36px' }}>✕</button>
          </div>
          <form onSubmit={handlePlaceOrder}>
            {/* Delivery Details */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Delivery Recipient</label>
              <input type="text" required value={checkoutData.name} onChange={e => setCheckoutData({...checkoutData, name: e.target.value})} placeholder="Patient full name" style={{ marginBottom: 0, height: '54px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Phone Number</label>
                <input type="tel" required value={checkoutData.phone} onChange={e => setCheckoutData({...checkoutData, phone: e.target.value})} placeholder="Contact" style={{ marginBottom: 0, height: '54px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Alt. Contact</label>
                <input type="tel" value={checkoutData.altPhone} onChange={e => setCheckoutData({...checkoutData, altPhone: e.target.value})} placeholder="Optional" style={{ marginBottom: 0, height: '54px' }} />
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Full Address</label>
              <textarea required rows={2} value={checkoutData.address} onChange={e => setCheckoutData({...checkoutData, address: e.target.value})} placeholder="Complete home address..." style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'inherit', resize: 'none', outline: 'none' }} />
            </div>

            {requiresPrescriptionInCart && (
              <div style={{ background: 'var(--warning-glow)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--warning)', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '1.5rem' }}>📝</span>
                <div style={{ fontSize: '0.85rem', color: 'var(--warning)', fontWeight: 700 }}>
                  Prescription required for some items. Please ensure you have it ready for verification at delivery.
                </div>
              </div>
            )}

            {/* Payment Section */}
            <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
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
                  value={checkoutData.cardNumber} 
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
                    value={checkoutData.expiry} 
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
                    value={checkoutData.cvv} 
                    onChange={e => setCheckoutData({...checkoutData, cvv: e.target.value.replace(/\D/g, '')})}
                    style={{ marginBottom: 0, height: '54px', textAlign: 'center' }} 
                  />
                </div>
              </div>
            </div>

            <div style={{ padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>PAYABLE AMOUNT:</span>
                <span style={{ color: 'var(--primary)', fontSize: '1.4rem', fontWeight: 800 }}>₹{total}</span>
            </div>
            <button type="submit" style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', borderRadius: '18px', height: '64px', fontWeight: 800 }}>Authorize & Place Order</button>
          </form>
        </div>
      );
    }
    if (checkoutStatus === 'processing') {
      return (
        <div style={{ textAlign: 'center', padding: '4rem 0', animation: 'fadeInUp 0.4s ease' }}>
          <div style={{ 
            width: '70px', height: '70px', border: '5px solid var(--primary-glow)', 
            borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 2.5rem', 
            animation: 'spin 1s linear infinite' 
          }}></div>
          <h2 style={{ marginBottom: '0.75rem', color: 'var(--text-main)', fontSize: '1.5rem' }}>Processing Transaction</h2>
          <p style={{ color: 'var(--text-muted)' }}>Encrypting clinical order logistics...</p>
        </div>
      );
    }
    if (checkoutStatus === 'confirmed') {
      const orderTotal = (orderHistory[0]?.total || 0);
      const taxAmount = orderTotal * 0.05;
      const finalAmount = orderTotal + taxAmount;

      if (showFullBill) {
        return (
          <div style={{ animation: 'popIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0 }}>Clinical Invoice</h2>
              <button className="secondary" onClick={() => setShowFullBill(false)}>✕</button>
            </div>
            <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '2rem', borderRadius: '24px', fontFamily: 'monospace' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>MediConnect Pharmacy</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Order ID: {lastOrderId}</div>
              </div>
              <div style={{ marginBottom: '1.5rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Customer:</span>
                  <span>{checkoutData.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Date:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span>Item</span>
                  <span>Qty × Price</span>
                </div>
                {lastOrderItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span>{item.name}</span>
                    <span>{item.quantity} × ₹{item.price}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span>Subtotal:</span>
                  <span>₹{orderTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span>GST (5%):</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem', marginTop: '0.75rem' }}>
                  <span>Total Paid:</span>
                  <span>₹{finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button style={{ flex: 1 }} onClick={downloadBill}>Download PDF/TXT</button>
              <button className="secondary" style={{ flex: 1 }} onClick={() => setShowFullBill(false)}>Back to Summary</button>
            </div>
          </div>
        );
      }

      return (
        <div style={{ textAlign: 'center', animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
          <div className="gpay-success-circle">✓</div>
          <h1 style={{ color: 'var(--success)', marginBottom: '0.5rem', fontSize: '2.5rem', fontWeight: 800 }}>Success!</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>Paid via card ending in **{checkoutData.cardNumber.slice(-4)}</p>
          
          <div style={{ 
            background: 'var(--bg-main)', padding: '2rem', borderRadius: '24px', 
            border: '1px solid var(--border-color)', textAlign: 'left', marginBottom: '2.5rem',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Delivery By</div>
                <div style={{ fontWeight: 800, color: 'var(--success)', fontSize: '1rem' }}>{arrivingDate}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Paid Amount</div>
                <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-main)' }}>₹{finalAmount.toFixed(2)}</div>
              </div>
            </div>
            
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
               <div style={{ color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Delivery To</div>
               <div style={{ fontWeight: 800 }}>{checkoutData.name}</div>
               <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{checkoutData.address}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button style={{ flex: 1, height: '56px', background: 'var(--success-glow)', color: 'var(--success)', borderRadius: '16px', fontWeight: 800, border: '1px solid var(--success)' }} onClick={() => setShowFullBill(true)}>📄 View Full Bill</button>
              <button style={{ flex: 1, height: '56px', background: 'var(--bg-card)', color: 'var(--text-main)', borderRadius: '16px', fontWeight: 800, border: '1px solid var(--border-color)' }} onClick={downloadBill}>📥 Download</button>
            </div>
            <button style={{ width: '100%', height: '56px', background: 'var(--primary)', color: 'white', borderRadius: '16px', fontWeight: 800 }} onClick={handleDone}>Return to Portal</button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Pharmacy Hub</h1>
          <p style={{ color: 'var(--text-muted)' }}>Quality clinical pharmacy delivered to your home.</p>
        </div>
        <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
          <button className="secondary" style={{ background: view === 'shop' ? 'var(--primary)' : 'transparent', color: view === 'shop' ? 'white' : 'var(--text-muted)', border: 'none', padding: '0.7rem 1.4rem', fontWeight: 800 }} onClick={() => setView('shop')}>Store</button>
          <button className="secondary" style={{ background: view === 'history' ? 'var(--primary)' : 'transparent', color: view === 'history' ? 'white' : 'var(--text-muted)', border: 'none', padding: '0.7rem 1.4rem', fontWeight: 800 }} onClick={() => setView('history')}>Orders ({orderHistory.length})</button>
        </div>
      </div>

      {view === 'shop' && (
        <>
          {requiresPrescriptionInCart && (
            <div style={{ 
              background: 'var(--warning-glow)', 
              border: '1px solid var(--warning)', 
              borderRadius: '16px', 
              padding: '1.25rem 2rem', 
              marginBottom: '2rem', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              animation: 'fadeInUp 0.4s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📝</span>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>Prescription Required</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Items in your cart need a valid medical prescription for fulfillment.</div>
                </div>
              </div>
              <button onClick={() => navigate('/profile')} style={{ background: 'var(--warning)', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                Upload Prescription
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem' }}>
            <div>
              <div style={{ position: 'relative', marginBottom: '2rem' }}>
                <input placeholder="Search medical catalog..." style={{ paddingLeft: '3.5rem', marginBottom: 0, height: '60px', borderRadius: '16px' }} value={search} onChange={(e) => setSearch(e.target.value)} />
                <span style={{ position: 'absolute', left: '1.4rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.4rem', opacity: 0.5 }}>🔍</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {allMeds.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase())).map(med => {
                  const isAdded = recentlyAdded.has(med.id);
                  return (
                    <div key={med.id} className="card" style={{ display: 'flex', flexDirection: 'column', transition: 'transform 0.2s ease' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'var(--primary-glow)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontWeight: 800, textTransform: 'uppercase' }}>{med.category}</span>
                        <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-main)' }}>₹{med.price}</span>
                      </div>
                      <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 800 }}>{med.name}</h3>
                      {med.requiresPrescription && <div style={{ fontSize: '0.65rem', color: 'var(--warning)', fontWeight: 800, marginBottom: '0.5rem' }}>⚠️ PRESCRIPTION REQUIRED</div>}
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1, marginBottom: '2rem', lineHeight: '1.6' }}>{med.description}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <button className="secondary" onClick={() => setSelectedMed(med)} style={{ fontSize: '0.8rem' }}>View Profile</button>
                        <button onClick={() => handleAddToCart(med)} style={{ 
                          fontSize: '0.8rem', 
                          background: isAdded ? 'var(--success)' : 'var(--primary)',
                          animation: isAdded ? 'cartBounce 0.3s ease' : 'none'
                        }}>
                          {isAdded ? '✓ Added' : 'Buy Now'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card" style={{ height: 'fit-content', position: 'sticky', top: '100px', borderRadius: '28px', padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>🛒 Shopping Cart</h3>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.5 }}>
                  <p>Your clinical basket is empty.</p>
                </div>
              ) : (
                <>
                  <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                    {cart.map(item => (
                      <div key={item.id} style={{ display: 'flex', flexDirection: 'column', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{item.name}</div>
                            {item.requiresPrescription && <div style={{ fontSize: '0.6rem', color: 'var(--warning)', fontWeight: 800 }}>Needs Prescription</div>}
                          </div>
                          <div style={{ fontWeight: 800 }}>₹{item.price * item.quantity}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-main)', padding: '4px', borderRadius: '10px' }}>
                              <button className="secondary" style={{ padding: '0', width: '28px', height: '28px', fontSize: '0.8rem', minWidth: '0' }} onClick={() => decrementFromCart(item.id)}>-</button>
                              <span style={{ fontSize: '0.85rem', fontWeight: 800, width: '24px', textAlign: 'center' }}>{item.quantity}</span>
                              <button className="secondary" style={{ padding: '0', width: '28px', height: '28px', fontSize: '0.8rem', minWidth: '0' }} onClick={() => addToCart(item)}>+</button>
                          </div>
                          <button className="secondary" style={{ border: 'none', color: 'var(--danger)', fontSize: '0.7rem', padding: '0.4rem', fontWeight: 800 }} onClick={() => removeFromCart(item.id)}>Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {requiresPrescriptionInCart && (
                    <div style={{ background: 'var(--warning-glow)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--warning)', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.2rem' }}>📝</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--warning)', fontWeight: 800 }}>Some items require a prescription. Ensure you upload it for approval.</span>
                    </div>
                  )}

                  <div style={{ borderTop: '2px dashed var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Total Amount</span>
                    <span style={{ color: 'var(--primary)', fontSize: '1.6rem', fontWeight: 800 }}>₹{total}</span>
                  </div>
                  <button style={{ width: '100%', marginTop: '2rem', background: 'var(--success)', height: '60px', fontSize: '1.1rem', borderRadius: '16px' }} onClick={handleOpenForm}>Proceed to Checkout</button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {view === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orderHistory.map(order => (
            <div key={order.id} className="card" style={{ padding: '2rem', borderRadius: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'monospace' }}>{order.id}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Transaction Date: {order.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>₹{order.total}</div>
                  <span className="status status-success" style={{ fontSize: '0.6rem' }}>DISPATCHED</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {order.items.map(item => (
                  <div key={item.id} style={{ background: 'var(--bg-main)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 700 }}>{item.name}</span> <span style={{ opacity: 0.6 }}>× {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {orderHistory.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>No previous orders found.</p>
            </div>
          )}
        </div>
      )}

      {selectedMed && (
        <div className="modal-overlay" onClick={() => setSelectedMed(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '2.5rem', background: 'var(--primary)', color: 'white', position: 'relative' }}>
              <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'white' }}>{selectedMed.name}</h2>
              <button 
                className="secondary" 
                onClick={() => setSelectedMed(null)} 
                style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '40px', height: '40px' }}
              >✕</button>
            </div>
            
            <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <section>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Clinical Profile</div>
                <p style={{ margin: 0, lineHeight: '1.6', fontSize: '0.95rem' }}>{selectedMed.description}</p>
                {selectedMed.requiresPrescription && (
                  <div style={{ marginTop: '1rem', background: 'var(--warning-glow)', padding: '0.75rem 1rem', borderRadius: '10px', color: 'var(--warning)', fontWeight: 800, fontSize: '0.8rem', border: '1px solid var(--warning)' }}>
                    ⚠️ This medication requires a valid physician prescription.
                  </div>
                )}
              </section>

              <button style={{ width: '100%', height: '64px', fontSize: '1.1rem', borderRadius: '18px' }} onClick={() => { handleAddToCart(selectedMed); setSelectedMed(null); }}>
                Add to Cart — ₹{selectedMed.price}
              </button>
            </div>
          </div>
        </div>
      )}

      {checkoutStatus !== 'idle' && (
        <div className="modal-overlay" onClick={checkoutStatus === 'confirmed' ? handleDone : closeCheckout}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            {renderCheckoutContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Pharmacy;