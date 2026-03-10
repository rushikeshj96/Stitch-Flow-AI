import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService.js';
import { setAuthToken } from '../services/apiClient.js';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session from localStorage on mount, then refresh from server
    useEffect(() => {
        const storedUser = localStorage.getItem('sf_user');
        const storedToken = localStorage.getItem('sf_token');
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setAuthToken(storedToken);
            // BUG-13 fix: Refresh user data from server to avoid stale localStorage
            authService.getProfile()
                .then(res => {
                    const freshUser = res.data?.data?.user;
                    if (freshUser) {
                        setUser(freshUser);
                        localStorage.setItem('sf_user', JSON.stringify(freshUser));
                    }
                })
                .catch(() => {
                    // Token invalid – clear session (interceptor also handles 401)
                    localStorage.removeItem('sf_user');
                    localStorage.removeItem('sf_token');
                    setAuthToken(null);
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (credentials) => {
        // Backend returns: { success, token, data: { user } }
        const res = await authService.login(credentials);
        const token = res.data?.token;
        const loggedUser = res.data?.data?.user;
        localStorage.setItem('sf_user', JSON.stringify(loggedUser));
        localStorage.setItem('sf_token', token);
        setAuthToken(token);
        setUser(loggedUser);
        toast.success(`Welcome back, ${loggedUser.name}! 👋`);
        return loggedUser;
    }, []);

    const signup = useCallback(async (userData) => {
        // Backend returns: { success, token, data: { user } }
        const res = await authService.signup(userData);
        const token = res.data?.token;
        const newUser = res.data?.data?.user;
        localStorage.setItem('sf_user', JSON.stringify(newUser));
        localStorage.setItem('sf_token', token);
        setAuthToken(token);
        setUser(newUser);
        toast.success('Account created! Welcome to StitchFlow AI 🎉');
        return newUser;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('sf_user');
        localStorage.removeItem('sf_token');
        setAuthToken(null);
        setUser(null);
        toast.success('Logged out successfully');
    }, []);

    const updateUser = useCallback((updatedData) => {
        const merged = { ...user, ...updatedData };
        setUser(merged);
        localStorage.setItem('sf_user', JSON.stringify(merged));
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
    return ctx;
}
