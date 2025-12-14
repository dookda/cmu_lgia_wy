import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    const logout = () => {
        document.cookie = "lgiatoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "lgiausername=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "lgiaauth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "lgiadivision=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setUser(null);
        window.location.href = '/login'; // Or use router navigation
    };

    const checkAuth = async () => {
        try {
            const token = getCookie('lgiatoken');
            const username = getCookie('lgiausername');
            const role = getCookie('lgiaauth');

            if (token) {
                // Here we assume the backend is on the same domain or proxied.
                // If porting to separate frontend dev server, we need to point to backend.
                // For now, assuming proxy setup in vite.config.js
                const response = await axios.post('/api/verify_token', {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.data.status === 'success') {
                    setUser({ username, role, token });
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Auth verification failed", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};
