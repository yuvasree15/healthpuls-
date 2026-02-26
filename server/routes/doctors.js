
const express = require('express');
const router = express.Router();

const firstNames = [
  'Gokul', 'Dinesh', 'Pooja', 'Divakar', 'Anjali', 'Arjun', 'Siddharth', 'Ishani', 'Rohan', 'Vikram',
  'Priyanka', 'Aditya', 'Meera', 'Kabir', 'Sanya', 'Varun', 'Kavita', 'Rishi', 'Neha', 'Aman',
  'Tara', 'Zoya', 'Karthik', 'Suresh', 'Rahul', 'Sneha', 'Abhishek', 'Kavitha', 'Deepa', 'Vijay',
  'Laxmi', 'Saritha', 'Ramesh', 'Anitha', 'Sanjay', 'Elena', 'David', 'Sophia', 'Kenji'
];

const lastNames = [
  'Divakar', 'Kumar', 'Nair', 'Reddy', 'Sharma', 'Pillai', 'Menon', 'Iyer', 'Gupta', 'Singh',
  'Verma', 'Patil', 'Deshmukh', 'Choudhary', 'Rao', 'Shetty', 'Venkatesh', 'Bose', 'Kapoor', 'Malhotra',
  'Dutta', 'Patel', 'Joshi', 'Chopra', 'Das', 'Khan', 'Muller', 'Lee', 'Tanaka', 'Rodriguez'
];

const categories = [
  { 
    field: 'Cardiology', 
    focus: ['Heart Valve', 'Preventive Care', 'Arterial Health', 'Cardiac Rhythm'], 
    adj: ['Senior', 'Renowned', 'Diligent', 'Leading'],
    symptoms: ['chest discomfort', 'breathing difficulty', 'dizziness', 'fatigue', 'weakness']
  },
  { 
    field: 'Neurology', 
    focus: ['Brain Trauma', 'Spinal Health', 'Nerve Disorders', 'Migraine Care'], 
    adj: ['Expert', 'Advanced', 'Specialized', 'Clinical'],
    symptoms: ['headache', 'dizziness', 'weakness', 'sleep problems', 'fatigue']
  },
  { 
    field: 'Pediatrics', 
    focus: ['Neonatal Care', 'Infant Growth', 'Childhood Immunity', 'Adolescent Health'], 
    adj: ['Compassionate', 'Gentle', 'Dedicated', 'Caring'],
    symptoms: ['Fever', 'cold', 'cough', 'sore throat', 'vomiting', 'diarrhea']
  },
  { 
    field: 'Orthopedics', 
    focus: ['Joint Replacement', 'Sports Injuries', 'Bone Density', 'Fracture Recovery'], 
    adj: ['Skilled', 'Experienced', 'Trusted', 'Precision'],
    symptoms: ['body pain', 'back pain', 'joint pain', 'muscle pain', 'weakness']
  },
  { 
    field: 'Dermatology', 
    focus: ['Aesthetic Medicine', 'Skin Allergy', 'Laser Therapy', 'Psoriasis Care'], 
    adj: ['Holistic', 'Precision', 'Aesthetic', 'Clinical'],
    symptoms: ['skin rashes', 'itching']
  },
  { 
    field: 'Oncology', 
    focus: ['Targeted Therapy', 'Tumor Genetics', 'Early Detection', 'Palliative Care'], 
    adj: ['Empathetic', 'Vigilant', 'Top-tier', 'Senior'],
    symptoms: ['weakness', 'fatigue', 'loss of appetite']
  },
  { 
    field: 'Gastroenterology', 
    focus: ['Digestive Wellness', 'Liver Function', 'Endoscopy', 'Gut Microbiome'], 
    adj: ['Thorough', 'Diagnostic', 'Expert', 'Skilled'],
    symptoms: ['stomach pain', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'acidity', 'gas', 'loss of appetite']
  },
  { 
    field: 'Psychiatry', 
    focus: ['Cognitive Therapy', 'Stress Management', 'Behavioral Health', 'Sleep Science'], 
    adj: ['Supportive', 'Understanding', 'Qualified', 'Patient'],
    symptoms: ['sleep problems', 'fatigue', 'weakness', 'loss of appetite']
  },
  { 
    field: 'General Physician', 
    focus: ['Family Medicine', 'Primary Health', 'Diagnostic Care', 'Wellness'], 
    adj: ['Attentive', 'Primary', 'Community', 'Expert'],
    symptoms: ['Fever', 'cold', 'cough', 'sore throat', 'headache', 'body pain', 'sneezing', 'nose block', 'weakness', 'fatigue', 'acidity', 'gas']
  },
  { 
    field: 'ENT Specialist', 
    focus: ['Nasal Surgery', 'Ear Microsurgery', 'Voice Therapy', 'Sinus Care'], 
    adj: ['Skilled', 'Specialized', 'Precise', 'Senior'],
    symptoms: ['ear pain', 'sore throat', 'nose block', 'sneezing', 'eye irritation']
  }
];

const doctorsList = Array.from({ length: 80 }, (_, i) => {
  const cat = categories[i % categories.length];
  const fName = firstNames[(i * 13) % firstNames.length];
  const lName = lastNames[(i * 17) % lastNames.length];
  
  const fullName = `Dr. ${fName} ${lName}`;
  const focusArea = cat.focus[i % cat.focus.length];
  const adjective = cat.adj[i % cat.adj.length];
  const bio = `${adjective} ${cat.field} consultant dedicated to ${focusArea.toLowerCase()} and evidence-based clinical practices.`;

  const price = Math.floor(Math.random() * (1500 - 450 + 1)) + 450;
  const rating = (4.1 + (i % 9) / 10).toFixed(1);
  const exp = 5 + (i % 25);
  
  // Generate a mock 10-digit number
  const bookingNumber = `9${Math.floor(100000000 + Math.random() * 900000000)}`;

  return {
    id: 3000 + i,
    name: fullName,
    specialty: cat.field,
    bio: bio,
    keywords: [...(cat.symptoms || []), cat.field.toLowerCase(), fName.toLowerCase(), lName.toLowerCase()],
    experience: `${exp} yrs exp.`,
    rating: rating,
    price: `₹${price}`,
    bookingNumber: bookingNumber,
    location: i % 2 === 0 ? 'City Medical Plaza' : 'Sunrise Health Hub',
    available: true,
    symptoms: cat.symptoms || []
  };
});

router.get('/doctors', (req, res) => {
  res.json(doctorsList);
});

module.exports = router;
