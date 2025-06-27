import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check both localStorage and Supabase auth session
        const localAuth = JSON.parse(localStorage.getItem('auth'));
        const { data: { session } } = await supabase.auth.getSession();

        if (localAuth?.user && session) {
          // Verify user in signup table
          const { data, error } = await supabase
            .from('signup')
            .select('*')
            .eq('id', localAuth.user.id)
            .single();

          if (data && !error) {
            setUser(data);
          } else {
            await clearAuth();
          }
        } else {
          await clearAuth();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        await clearAuth();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        await clearAuth();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const clearAuth = async () => {
    localStorage.removeItem('auth');
    setUser(null);
  };

  const login = async (userData) => {
    localStorage.setItem('auth', JSON.stringify({
      user: userData,
      token: 'dummy-token'
    }));
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear local storage and state
      await clearAuth();
      
      // Navigate to signin page
      navigate('/signin');
      
      // Force a full page reload to clear any residual state
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout,
      clearAuth
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};