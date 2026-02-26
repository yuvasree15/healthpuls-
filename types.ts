export enum UserRole {
  DOCTOR = 'doctor',
  PATIENT = 'patient'
}

export interface UserProfile {
  username: string;
  role: UserRole;
  fullName: string;
  age?: number;
  phone?: string;
  password?: string;
  fee?: string;
  clinicAddress?: string;
  specialty?: string;
  experience?: string;
  bio?: string;
  // New healthcare fields
  dob?: string;
  address?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  allergies?: string;
  email?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: UserRole;
  recipientName: string;
  text: string;
  timestamp: string;
}

export interface Appointment {
  id: number;
  doctorName: string;
  patientName: string;
  patientUsername: string;
  patientPhone: string;
  patientAge: number;
  city: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Rescheduled' | 'Cancelled' | 'Accepted' | 'Completed';
  reminded24h?: boolean;
  reminded1h?: boolean;
}

export interface Medicine {
  id: number;
  name: string;
  price: number;
  category: string;
  requiresPrescription: boolean;
  description?: string;
  usage?: string;
  sideEffects?: string;
  storage?: string;
}

export interface CartItem extends Medicine {
  quantity: number;
}

export interface HealthRecord {
  id: number;
  title: string;
  date: string;
  type: 'Prescription' | 'Report';
  doctorName: string;
  patientUsername: string;
  content: string;
  status: 'New' | 'Reviewed' | 'Signed';
}

export interface Hospital {
  id: number;
  name: string;
  type: 'Hospital' | 'Clinic';
  rating: number;
  distance: string;
  timings: string;
  contact: string;
  specialties: string[];
}

export interface LabTest {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
}

export interface LabBooking {
  id: number;
  testName: string;
  patientName: string;
  date: string;
  location: string;
  status: 'Scheduled' | 'Completed';
}