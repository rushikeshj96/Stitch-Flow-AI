import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <ThemeProvider>
                <CartProvider>
                    <AuthProvider>
                        <NotificationProvider>
                            <App />
                            <Toaster
                                position="top-right"
                                toastOptions={{
                                    duration: 4000,
                                    style: {
                                        background: '#1a1a2e',
                                        color: '#f1f5f9',
                                        border: '1px solid rgba(217,70,239,0.3)',
                                    },
                                    success: { iconTheme: { primary: '#d946ef', secondary: '#fff' } },
                                    error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                                }}
                            />
                        </NotificationProvider>
                    </AuthProvider>
                </CartProvider>
            </ThemeProvider>
        </BrowserRouter>
    </React.StrictMode>
);
