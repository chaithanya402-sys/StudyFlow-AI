/**
 * StudyFlow AI — SQLite Authentication & Role Client
 * Replaces cloud Supabase with local SQLite-backed authentication and session security.
 */

(function (window) {
  'use strict';

  class SQLiteAuthService {
    constructor() {
      this.tokenKey = 'spp_auth_token';
      this.emailKey = 'spp_user_email';
      this.roleKey = 'spp_user_role';
      this.nameKey = 'spp_user_name';
      this.initialized = true;
    }

    isConfigured() {
      return true; // SQLite is built-in and always available
    }

    getToken() {
      return localStorage.getItem(this.tokenKey) || '';
    }

    setToken(token) {
      if (token) {
        localStorage.setItem(this.tokenKey, token);
      } else {
        localStorage.removeItem(this.tokenKey);
      }
    }

    getAuthHeaders() {
      const headers = { 'Content-Type': 'application/json' };
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      return headers;
    }

    /**
     * Authenticate User with SQLite Database
     * @param {string} email
     * @param {string} password
     * @param {string} roleHint Optional role hint
     */
    async signIn(email, password, roleHint = 'student') {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPassword = (password || '').trim();

      if (!cleanEmail || !cleanPassword) {
        return { success: false, error: 'Email and password are required.' };
      }

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: cleanPassword, roleHint })
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          return {
            success: false,
            error: data.error || 'Authentication failed. Please verify your credentials.'
          };
        }

        // Store session token and UI identification
        this.setToken(data.token);
        localStorage.setItem(this.emailKey, cleanEmail);
        localStorage.setItem(this.roleKey, data.role || roleHint);
        localStorage.setItem(this.nameKey, data.name || data.user?.fullName || cleanEmail);
        if (data.user?.id || data.profile?.id) {
          localStorage.setItem('spp_user_id', data.user?.id || data.profile?.id);
        }

        // Tell DataStore to refresh from SQLite with new credentials
        if (window.PlacementDataStore && typeof window.PlacementDataStore.syncWithServer === 'function') {
          window.PlacementDataStore.syncWithServer();
        }

        return {
          success: true,
          token: data.token,
          user: data.user,
          role: data.role,
          name: data.name,
          profile: data.profile,
          isCloud: false,
          isSqlite: true
        };
      } catch (err) {
        console.error('[SQLiteAuth] Login network error:', err);
        return {
          success: false,
          error: 'Could not connect to authentication server. Please ensure the server is running.'
        };
      }
    }

    /**
     * Register New Account in SQLite Database with Institutional Passcode Validation
     */
    async signUp({ email, password, fullName, role = 'student', rollNo = '', department = 'CSE', facultyKey = '', phone = '', currentYear = '1st Year', semester = '1st Semester' }) {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPassword = (password || '').trim();
      const cleanRole = (role || 'student').toLowerCase();
      const cleanKey = (facultyKey || '').trim();
      const cleanRollNo = (rollNo || '').trim();
      const cleanDept = (department || 'CSE').trim();
      const cleanPhone = (phone || '').trim();
      const cleanYear = (currentYear || '1st Year').trim();
      const cleanSem = (semester || '1st Semester').trim();

      if (!cleanEmail || !cleanPassword || !fullName) {
        return { success: false, error: 'Full name, email, and password are required.' };
      }

      if (cleanPassword.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: cleanPassword,
            fullName: fullName.trim(),
            role: cleanRole,
            rollNo: cleanRollNo,
            department: cleanDept,
            facultyKey: cleanKey,
            phone: cleanPhone,
            currentYear: cleanYear,
            semester: cleanSem
          })
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          return {
            success: false,
            error: data.error || 'Registration failed.'
          };
        }

        if (data.token) {
          this.setToken(data.token);
          localStorage.setItem(this.emailKey, cleanEmail);
          localStorage.setItem(this.roleKey, data.role);
          localStorage.setItem(this.nameKey, data.name);
          if (data.user?.id) {
            localStorage.setItem('spp_user_id', data.user.id);
          }
        }

        return {
          success: true,
          token: data.token,
          user: data.user,
          role: data.role,
          name: data.name,
          message: data.message || `Account created successfully as ${data.role.toUpperCase()} in SQLite database!`
        };
      } catch (err) {
        console.error('[SQLiteAuth] Registration network error:', err);
        return {
          success: false,
          error: 'Connection error while registering account.'
        };
      }
    }

    /**
     * Sign Out
     */
    async signOut() {
      try {
        const token = this.getToken();
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'same-origin',
          headers: this.getAuthHeaders()
        });
      } catch (err) {
        console.warn('[SQLiteAuth] Logout network error:', err);
      }

      this.setToken('');
      localStorage.removeItem(this.emailKey);
      localStorage.removeItem(this.roleKey);
      localStorage.removeItem(this.nameKey);
      localStorage.removeItem('spp_user_id');
      window.location.href = 'login.html';
    }

    /**
     * Get Current Active User & Profile from Verified Server Session
     */
    async getCurrentUser() {
      const token = this.getToken();

      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'same-origin',
          headers: this.getAuthHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            // Update local caches from verified server session
            if (data.token) this.setToken(data.token);
            localStorage.setItem(this.emailKey, data.user.email);
            localStorage.setItem(this.roleKey, data.role || data.user.role);
            localStorage.setItem(this.nameKey, data.user.fullName || data.name);
            localStorage.setItem('spp_user_id', data.user.id);

            return {
              user: data.user,
              role: data.role || data.user.role,
              name: data.user.fullName || data.name,
              email: data.user.email,
              profile: data.profile || null,
              verified: true
            };
          }
        }
      } catch (e) {
        console.warn('[SQLiteAuth] Error checking verified session:', e);
      }

      // If server session is invalid or expired, clear local credentials and return null
      this.setToken('');
      localStorage.removeItem(this.emailKey);
      localStorage.removeItem(this.roleKey);
      localStorage.removeItem(this.nameKey);
      localStorage.removeItem('spp_user_id');

      return {
        user: null,
        role: null,
        name: null,
        email: null,
        profile: null,
        verified: false
      };
    }

    updateConfig() {
      return true;
    }

    getSupabaseConfig() {
      return {
        projectRef: 'iquuxfmpuroewcghorvq',
        url: 'https://iquuxfmpuroewcghorvq.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdXV4Zm1wdXJvZXdjZ2hvcnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5Njg1NDMsImV4cCI6MjEwNzU0NDU0M30.wy92mBnsuCjGh43Wk3KdUA0LwWvc6aEKH3zNBUaOFIQ'
      };
    }

    async checkCloudStatus() {
      try {
        const res = await fetch('/api/supabase/status');
        return await res.json();
      } catch (err) {
        return { success: false, connected: false, error: err.message };
      }
    }

    async syncWithSupabase() {
      try {
        const res = await fetch('/api/supabase/sync', {
          method: 'POST',
          headers: this.getAuthHeaders(),
          credentials: 'same-origin'
        });
        return await res.json();
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
  }

  // Export singleton instances (both window.SupabaseAuth for full backward compatibility and window.StudyFlowAuth)
  const authInstance = new SQLiteAuthService();
  window.SupabaseAuth = authInstance;
  window.StudyFlowAuth = authInstance;
  window.SQLiteAuth = authInstance;
  window.SUPABASE_CONFIG = authInstance.getSupabaseConfig();

})(window);
