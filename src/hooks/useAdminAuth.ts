import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isSessionValid, clearSecureSession } from '@/utils/validation';

interface AdminAuthState {
  isAuthenticated: boolean;
  adminData: any;
  isLoading: boolean;
}

export const useAdminAuth = () => {
  const [authState, setAuthState] = useState<AdminAuthState>({
    isAuthenticated: false,
    adminData: null,
    isLoading: true
  });

  const validateSession = async (sessionData: any) => {
    if (!isSessionValid(sessionData)) {
      clearSecureSession();
      return false;
    }

    try {
      // Verify session exists in database and is valid
      const { data: sessionRecord, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('token', sessionData.token)
        .single();

      if (error || !sessionRecord) {
        clearSecureSession();
        return false;
      }

      // Check if session is expired
      const expiresAt = new Date(sessionRecord.expires_at);
      const now = new Date();
      
      if (now >= expiresAt) {
        // Clean up expired session
        await supabase
          .from('admin_sessions')
          .delete()
          .eq('token', sessionData.token);
        
        clearSecureSession();
        return false;
      }

      // Update last accessed time - commented out due to schema mismatch
      // In production, ensure the admin_sessions table has this column
      // await supabase
      //   .from('admin_sessions')
      //   .update({ last_accessed: new Date().toISOString() })
      //   .eq('token', sessionData.token);

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      clearSecureSession();
      return false;
    }
  };

  const checkAuth = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const sessionStr = sessionStorage.getItem('adminSession');
      
      if (!sessionStr) {
        setAuthState({
          isAuthenticated: false,
          adminData: null,
          isLoading: false
        });
        return;
      }

      const sessionData = JSON.parse(sessionStr);
      const isValid = await validateSession(sessionData);
      
      if (isValid) {
        setAuthState({
          isAuthenticated: true,
          adminData: sessionData.adminData,
          isLoading: false
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          adminData: null,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      clearSecureSession();
      setAuthState({
        isAuthenticated: false,
        adminData: null,
        isLoading: false
      });
    }
  };

  const logout = async () => {
    try {
      const sessionStr = sessionStorage.getItem('adminSession');
      if (sessionStr) {
        const sessionData = JSON.parse(sessionStr);
        
        // Delete session from database
        await supabase
          .from('admin_sessions')
          .delete()
          .eq('token', sessionData.token);
        
        // Log the logout action
        if (authState.adminData) {
          await supabase.rpc('log_admin_action', {
            p_admin_user_id: authState.adminData.id,
            p_action: 'logout',
            p_details: { ip_address: '127.0.0.1', user_agent: navigator.userAgent }
          });
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSecureSession();
      setAuthState({
        isAuthenticated: false,
        adminData: null,
        isLoading: false
      });
    }
  };

  useEffect(() => {
    checkAuth();
    
    // Set up periodic session validation (every 5 minutes)
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    ...authState,
    logout,
    checkAuth
  };
};