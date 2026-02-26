import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, UserRole, CartItem, Medicine, Appointment, ChatMessage, Order, HealthRecord } from '../types';
import { useNavigate } from 'react-router-dom';

// --- Theme Context ---
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('hc_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('hc_theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('hc_theme', 'light');
    }
  }, [isDarkMode]);

  const value = useMemo(() => ({ isDarkMode, toggleTheme }), [isDarkMode, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

// --- Auth Context ---
interface AuthContextType {
  user: UserProfile | null;
  originalAdmin: UserProfile | null;
  isAuthenticated: boolean;
  login: (username: string, role: UserRole) => void;
  loginAs: (fullName: string, username: string, role: UserRole) => void;
  revertToAdmin: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('hc_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [originalAdmin, setOriginalAdmin] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('hc_original_admin');
    return saved ? JSON.parse(saved) : null;
  });

  const navigate = useNavigate();

  const login = useCallback((username: string, role: UserRole) => {
    let fullName = username.charAt(0).toUpperCase() + username.slice(1);
    let extraFields: Partial<UserProfile> = {};

    if (role === UserRole.DOCTOR) {
      if (username === 'doctor1') fullName = 'Dr. Gokul Nair';
      else if (username === 'doctor2') fullName = 'Dr. Pooja Sharma';
      else if (!fullName.startsWith('Dr.')) fullName = 'Dr. ' + fullName;
      
      extraFields = {
        fee: '800',
        clinicAddress: 'Floor 4, Wellness Heights, Medical Square, Mumbai',
        specialty: 'Senior Consultant',
        experience: '12',
        bio: 'Dedicated medical professional with over a decade of experience in providing high-quality patient care.'
      };
    } else if (role === UserRole.PATIENT) {
      if (username === 'user1' || username === 'gokul') {
        fullName = 'Yuvashree';
        extraFields = {
          email: 'yuva@gmail.com',
          phone: '+91 6369151414',
          dob: '12-04-2005',
          address: '24 ragavendra nagar,villivakkam,chennai-600049',
          bloodGroup: 'O+',
          emergencyContact: 'Srimathi (+91 9884980015)',
          allergies: 'None'
        };
      }
    }
    
    const newUser: UserProfile = { 
      username, 
      role, 
      fullName, 
      age: 20, 
      phone: '7358318322', 
      password: role === 'patient' ? 'user123' : (role === 'doctor' ? 'doctor123' : 'admin123'),
      ...extraFields
    };
    
    setUser(newUser);
    setOriginalAdmin(null);
    localStorage.setItem('hc_user', JSON.stringify(newUser));
    localStorage.removeItem('hc_original_admin');
    
    if (role === UserRole.DOCTOR) navigate('/doctor');
    else navigate('/dashboard');
  }, [navigate]);

  const loginAs = useCallback((fullName: string, username: string, role: UserRole) => {
    if (user && !originalAdmin && (user.role === UserRole.DOCTOR)) {
      setOriginalAdmin(user);
      localStorage.setItem('hc_original_admin', JSON.stringify(user));
    }

    const newUser: UserProfile = {
      username,
      role,
      fullName,
      age: 35,
      phone: '9000000000',
      password: 'bypass_admin',
      fee: role === UserRole.DOCTOR ? '1200' : undefined,
      clinicAddress: role === UserRole.DOCTOR ? 'City General Hospital, Wing B, Suite 102' : undefined
    };
    
    setUser(newUser);
    localStorage.setItem('hc_user', JSON.stringify(newUser));
    
    if (role === UserRole.DOCTOR) navigate('/doctor');
    else navigate('/dashboard');
  }, [originalAdmin, user, navigate]);

  const revertToAdmin = useCallback(() => {
    if (originalAdmin) {
      setUser(originalAdmin);
      setOriginalAdmin(null);
      localStorage.setItem('hc_user', JSON.stringify(originalAdmin));
      localStorage.removeItem('hc_original_admin');
      if (originalAdmin.role === UserRole.DOCTOR) navigate('/doctor');
      else navigate('/dashboard');
    }
  }, [originalAdmin, navigate]);

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem('hc_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setOriginalAdmin(null);
    localStorage.removeItem('hc_user');
    localStorage.removeItem('hc_original_admin');
    navigate('/login');
  }, [navigate]);

  const authValue = useMemo(() => ({
    user,
    originalAdmin,
    isAuthenticated: !!user,
    login,
    loginAs,
    revertToAdmin,
    updateUser,
    logout
  }), [user, originalAdmin, login, loginAs, revertToAdmin, updateUser, logout]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// --- Chat Context ---
interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (recipientName: string, text: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('hc_chats');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('hc_chats', JSON.stringify(messages));
  }, [messages]);

  const sendMessage = useCallback((recipientName: string, text: string) => {
    if (!user) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderName: user.fullName,
      senderRole: user.role,
      recipientName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
  }, [user]);

  const chatValue = useMemo(() => ({ messages, sendMessage }), [messages, sendMessage]);

  return (
    <ChatContext.Provider value={chatValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};

// --- Notification Context ---
export interface AppNotification {
  id: string;
  recipientUsername: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  date: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  addNotification: (recipientUsername: string, title: string, message: string, type?: AppNotification['type']) => void;
  markAsRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('hc_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('hc_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((recipientUsername: string, title: string, message: string, type: AppNotification['type'] = 'info') => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      recipientUsername,
      title,
      message,
      type,
      date: new Date().toLocaleString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const value = useMemo(() => ({ notifications, addNotification, markAsRead }), [notifications, addNotification, markAsRead]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};

// --- Appointment Context ---
interface AppointmentContextType {
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'status'> & { patientUsername: string }) => void;
  updateAppointment: (id: number, updates: Partial<Appointment>) => void;
  cancelAppointment: (id: number) => void;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const AppointmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addNotification } = useNotifications();
  const [appointments, setAppointments] = useState<(Appointment & { patientUsername: string })[]>(() => {
    const saved = localStorage.getItem('hc_appointments');
    if (saved) return JSON.parse(saved);
    
    // Hardcoded initial data
    return [
      { id: 1, doctorName: 'Dr. Gokul Nair', patientName: 'Yuvashree', patientUsername: 'user1', patientPhone: '+91 6369151414', patientAge: 20, city: 'Chennai', date: '2024-06-20', time: '10:00 AM', status: 'Accepted' },
      { id: 2, doctorName: 'Dr. Pooja Sharma', patientName: 'Yuvashree', patientUsername: 'user1', patientPhone: '+91 6369151414', patientAge: 20, city: 'Chennai', date: '2024-06-21', time: '11:30 AM', status: 'Pending' },
      { id: 3, doctorName: 'Dr. Gokul Nair', patientName: 'Sarah Jones', patientUsername: 'user2', patientPhone: '9000011111', patientAge: 32, city: 'Delhi', date: '2024-06-22', time: '02:00 PM', status: 'Accepted' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('hc_appointments', JSON.stringify(appointments));
  }, [appointments]);

  const addAppointment = useCallback((data: Omit<Appointment, 'id' | 'status'> & { patientUsername: string }) => {
    const newAppointment: Appointment & { patientUsername: string } = { ...data, id: Date.now(), status: 'Pending' };
    setAppointments(prev => [newAppointment, ...prev]);
    addNotification('doctor1', 'New Appointment Request', `Patient ${data.patientName} (${data.patientPhone}) from ${data.city} has booked a consultation for ${data.date} at ${data.time}. Status: Pending review.`, 'info');
  }, [addNotification]);

  const updateAppointment = useCallback((id: number, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(app => {
      if (app.id === id) {
        const updated = { ...app, ...updates };
        if (updates.status === 'Confirmed' || updates.status === 'Accepted') {
          addNotification(app.patientUsername, 'Appointment Confirmed', `Dr. ${app.doctorName} has accepted and confirmed your request for ${app.date} at ${app.time}.`, 'success');
        }
        return updated;
      }
      return app;
    }));
  }, [addNotification]);

  const cancelAppointment = useCallback((id: number) => {
    setAppointments(prev => prev.map(app => {
      if (app.id === id) {
        addNotification(app.patientUsername, 'Appointment Cancelled', `You have successfully cancelled your appointment with Dr. ${app.doctorName}.`, 'warning');
        return { ...app, status: 'Cancelled' as const };
      }
      return app;
    }));
  }, [addNotification]);

  const value = useMemo(() => ({ appointments, addAppointment, updateAppointment, cancelAppointment }), [appointments, addAppointment, updateAppointment, cancelAppointment]);

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const ctx = useContext(AppointmentContext);
  if (!ctx) throw new Error("useAppointments must be used within AppointmentProvider");
  return ctx;
};

// --- Health Records Context ---
interface HealthRecordContextType {
  records: HealthRecord[];
  addRecord: (record: Omit<HealthRecord, 'id' | 'status'>) => void;
  updateRecordStatus: (id: number, status: HealthRecord['status']) => void;
}

const HealthRecordContext = createContext<HealthRecordContextType | undefined>(undefined);

export const HealthRecordProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<HealthRecord[]>(() => {
    const saved = localStorage.getItem('hc_records');
    return saved ? JSON.parse(saved) : [
      { 
        id: 101, title: 'Complete Blood Count (CBC)', date: '2024-05-10', type: 'Report', 
        doctorName: 'Dr. Gokul Nair', patientUsername: 'user1', status: 'Reviewed',
        content: 'WBC: 6.8 x10^3/uL (Ref: 4.5-11.0)\nRBC: 4.8 x10^6/uL (Ref: 4.2-5.9)\nHemoglobin: 13.8 g/dL (Ref: 13.5-17.5)\nHematocrit: 41.2% (Ref: 41-50)\nPlatelets: 245 x10^3/uL (Ref: 150-450)\n\nSummary: All hematological parameters are within optimal clinical limits. No evidence of anemia or infection.'
      },
      {
        id: 102, title: 'MRI Brain & Cervical Spine', date: '2024-05-12', type: 'Report',
        doctorName: 'Dr. Gokul Nair', patientUsername: 'user1', status: 'Signed',
        content: 'Findings: No evidence of acute intracranial pathology or hemorrhage. Mild disc bulge noted at C5-C6 level without significant cord compression or nerve root exit narrowing.\n\nImpression: Unremarkable brain study. Minor degenerative changes in cervical spine. Clinical correlation with current symptoms recommended.'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('hc_records', JSON.stringify(records));
  }, [records]);

  const addRecord = useCallback((data: Omit<HealthRecord, 'id' | 'status'>) => {
    const newRecord: HealthRecord = { ...data, id: Date.now(), status: 'New' };
    setRecords(prev => [newRecord, ...prev]);
  }, []);

  const updateRecordStatus = useCallback((id: number, status: HealthRecord['status']) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }, []);

  const recordValue = useMemo(() => ({ records, addRecord, updateRecordStatus }), [records, addRecord, updateRecordStatus]);

  return (
    <HealthRecordContext.Provider value={recordValue}>
      {children}
    </HealthRecordContext.Provider>
  );
};

export const useHealthRecords = () => {
  const ctx = useContext(HealthRecordContext);
  if (!ctx) throw new Error("useHealthRecords must be used within HealthRecordProvider");
  return ctx;
};

// --- Cart Context ---
interface CartContextType {
  cart: CartItem[];
  orderHistory: Order[];
  addToCart: (item: Medicine) => void;
  decrementFromCart: (id: number) => void;
  removeFromCart: (id: number) => void;
  checkout: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>(() => {
    const saved = localStorage.getItem('hc_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const addToCart = useCallback((medicine: Medicine) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === medicine.id);
      if (existing) return prev.map(i => i.id === medicine.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...medicine, quantity: 1 }];
    });
  }, []);

  const decrementFromCart = useCallback((id: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (!existing) return prev;
      if (existing.quantity > 1) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== id);
    });
  }, []);

  const removeFromCart = useCallback((id: number) => setCart(prev => prev.filter(i => i.id !== id)), []);
  const total = useMemo(() => cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0), [cart]);

  const checkout = useCallback(() => {
    if (cart.length === 0) return;
    const newOrder: Order = {
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      items: [...cart],
      total: total,
      date: new Date().toLocaleString()
    };
    setOrderHistory(prev => {
      const updated = [newOrder, ...prev];
      localStorage.setItem('hc_orders', JSON.stringify(updated));
      return updated;
    });
    setCart([]);
  }, [cart, total]);

  const value = useMemo(() => ({ cart, orderHistory, addToCart, decrementFromCart, removeFromCart, checkout, total }), [cart, orderHistory, addToCart, decrementFromCart, removeFromCart, checkout, total]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
