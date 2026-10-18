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
    async signUp({ email, password, fullName, role = 'student', rollNo = '', department = 'CSE', facultyKey = '', phone = '' }) {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPassword = (password || '').trim();
      const cleanRole = (role || 'student').toLowerCase();
      const cleanKey = (facultyKey || '').trim();

      if (!cleanEmail || !cleanPassword || !fullName) {
        return { success: false, error: 'Full name, email, and password are required.' };
      }

      if (cleanPassword.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: cleanPassword,
            fullName: fullName.trim(),
            role: cleanRole,
            rollNo: rollNo.trim(),
            department: department.trim(),
            facultyKey: cleanKey,
            phone: phone.trim()
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
        if (token) {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: this.getAuthHeaders()
          });
        }
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
     * Get Current Active User & Profile from SQLite
     */
    async getCurrentUser() {
      const email = localStorage.getItem(this.emailKey) || '';
      const role = localStorage.getItem(this.roleKey) || 'student';
      const name = localStorage.getItem(this.nameKey) || 'Student';
      const token = this.getToken();

      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: this.getAuthHeaders()
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.user) {
              return {
                user: data.user,
                role: data.role || data.user.role || role,
                name: data.user.fullName || name,
                email: data.user.email || email,
                profile: data.profile || null
              };
            }
          }
        } catch (e) {
          console.warn('[SQLiteAuth] Error checking active session:', e);
        }
      }

      return {
        user: email ? { email, id: localStorage.getItem('spp_user_id') || '' } : null,
        role,
        name: name || 'Student',
        email,
        profile: null
      };
    }

    updateConfig() {
      return true;
    }
  }

  // Export singleton instances (both window.SupabaseAuth for full backward compatibility and window.StudyFlowAuth)
  const authInstance = new SQLiteAuthService();
  window.SupabaseAuth = authInstance;
  window.StudyFlowAuth = authInstance;
  window.SQLiteAuth = authInstance;

})(window);
