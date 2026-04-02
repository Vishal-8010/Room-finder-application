import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('userData');
        const token = localStorage.getItem('authToken');
        if (savedUser && token) {
            const parsedUser = JSON.parse(savedUser);
            // Normalize user data to ensure _id is always available
            const normalizedUser = {
                ...parsedUser,
                _id: parsedUser._id || parsedUser.id,
                name: parsedUser.name || `${parsedUser.firstName || ''} ${parsedUser.lastName || ''}`.trim() || parsedUser.email
            };
            setUser(normalizedUser);
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        // Normalize user data to ensure _id is always available
        const normalizedUser = {
            ...userData,
            _id: userData._id || userData.id,
            name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email
        };
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setUser(null);
    };

    const updateUser = (userData) => {
        // Normalize user data to ensure _id is always available
        const normalizedUser = {
            ...userData,
            _id: userData._id || userData.id,
            name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email
        };
        localStorage.setItem('userData', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}