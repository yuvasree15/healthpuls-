
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { 
  AuthProvider, 
  CartProvider, 
  NotificationProvider, 
  ThemeProvider,
  AppointmentProvider,
  ChatProvider,
  HealthRecordProvider
} from './contexts/index';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <AppointmentProvider>
                <ChatProvider>
                  <HealthRecordProvider>
                    <App />
                  </HealthRecordProvider>
                </ChatProvider>
              </AppointmentProvider>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>
);
