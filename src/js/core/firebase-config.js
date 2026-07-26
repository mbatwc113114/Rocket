/**
 * ============================================================================
 * ROKETRY AEROSPACE PLATFORM - FIREBASE SERVICE & AUTH MANAGER (firebase-config.js)
 * ============================================================================
 * Handles Firebase Realtime Database (RTDB) CRUD operations, Google OAuth 2.0
 * authentication, user roles, notifications, and commit audit changelog logging.
 *
 * @module Core/FirebaseService
 * @architecture Service Layer Architecture
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getDatabase, 
  ref as dbRef, 
  get, 
  set, 
  update, 
  child,
  push,
  onValue
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Exclusive Super Admin Email Configuration
const EXCLUSIVE_ADMIN_EMAIL = "mbatwc@gmail.com";

// Firebase RTDB Live Project Configuration Keys
const firebaseConfig = {
  apiKey: "AIzaSyDmb9HZBVzaWfcR1-6taNS-TrBa5FSNV64",
  authDomain: "robotics-community.firebaseapp.com",
  databaseURL: "https://robotics-community-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "robotics-community",
  storageBucket: "robotics-community.firebasestorage.app",
  messagingSenderId: "765920768785",
  appId: "1:765920768785:web:b2eb5d1e3ba2fb659092b0",
  measurementId: "G-75R2VCPKPP"
};

// Initialize Core Firebase Services
let app, auth, db, googleProvider;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getDatabase(app, firebaseConfig.databaseURL);
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch (err) {
  console.warn("Firebase Services Initialization Warning:", err);
}

/**
 * ActualAuthManager
 * Single-source of truth for Authentication, Authorization Roles, and RTDB Data Operations.
 */
class ActualAuthManager {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('roketry-user')) || null;
    
    if (this.currentUser && this.isSuperAdmin()) {
      this.currentUser.role = "admin";
      localStorage.setItem('roketry-user', JSON.stringify(this.currentUser));
    }
    
    setTimeout(() => this.updateNavUI(), 50);
    this.initAuthStateListener();
  }

  /**
   * Verifies if the current user matches Super Admin credentials.
   * @returns {boolean} True if super admin
   */
  isSuperAdmin() {
    return !!(this.currentUser && this.currentUser.email && this.currentUser.email.toLowerCase().trim() === EXCLUSIVE_ADMIN_EMAIL);
  }

  /**
   * Verifies if the current user has administrative permissions.
   * @returns {boolean} True if admin or super admin
   */
  isAdmin() {
    if (!this.currentUser) return false;
    return this.isSuperAdmin() || this.currentUser.role === 'admin';
  }

  /**
   * Returns current active user object.
   * @returns {Object|null}
   */
  getUser() {
    return this.currentUser;
  }

  /**
   * Initializes real-time Firebase Auth state change listener.
   */
  initAuthStateListener() {
    if (auth) {
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          let rtdbProfile = await this.fetchRTDBProfile(firebaseUser.uid);
          const email = (firebaseUser.email || "").toLowerCase().trim();
          let role = "user";
          if (email === EXCLUSIVE_ADMIN_EMAIL || (rtdbProfile && rtdbProfile.role === 'admin')) {
            role = "admin";
          }

          const profile = {
            uid: firebaseUser.uid,
            name: rtdbProfile?.name || firebaseUser.displayName || "Rocket Engineer",
            email: firebaseUser.email,
            photoURL: rtdbProfile?.photoURL || firebaseUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
            role: role,
            bio: rtdbProfile?.bio || "Aerospace & Rocket Systems Developer",
            lastLogin: new Date().toISOString()
          };

          this.currentUser = profile;
          localStorage.setItem('roketry-user', JSON.stringify(profile));

          // Sync user node into Firebase Realtime Database
          if (db) {
            try {
              await update(dbRef(db, `users/${firebaseUser.uid}`), profile);
            } catch (err) {
              console.warn("RTDB Sync Error:", err);
            }
          }
        }
        this.updateNavUI();
      });
    }
  }

  /**
   * Triggers Google Popup Sign In Flow.
   */
  async signInWithGoogle() {
    if (auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const email = (user.email || "").toLowerCase().trim();
        const role = (email === EXCLUSIVE_ADMIN_EMAIL) ? "admin" : "user";

        let existingProfile = await this.fetchRTDBProfile(user.uid);

        const profile = {
          uid: user.uid,
          name: existingProfile?.name || user.displayName || "Rocket Engineer",
          email: user.email,
          photoURL: existingProfile?.photoURL || user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          role: role,
          bio: existingProfile?.bio || "Aerospace & Rocket Systems Developer",
          lastLogin: new Date().toISOString()
        };

        this.currentUser = profile;
        localStorage.setItem('roketry-user', JSON.stringify(profile));

        if (db) {
          await update(dbRef(db, `users/${user.uid}`), profile);
        }

        this.updateNavUI();
        return profile;
      } catch (err) {
        console.error("Google Authentication Error:", err);
      }
    }
    return null;
  }

  /**
   * Signs out current user and clears session storage.
   */
  async signOut() {
    return this.logout();
  }

  async logout() {
    try {
      if (auth) {
        await auth.signOut();
      }
    } catch (err) {
      console.warn("Firebase Auth SignOut Warning:", err);
    }
    this.currentUser = null;
    localStorage.removeItem('roketry-user');
    this.updateNavUI();
    window.location.href = (window.resolvePageURL ? window.resolvePageURL('index.html') : '../../index.html');
  }

  /**
   * Updates user profile fields in Firebase Auth & RTDB.
   * @param {Object} data - Profile data updates { name, photoURL, bio }
   */
  async updateProfileData(data) {
    if (!this.currentUser) return false;

    const uid = this.currentUser.uid;
    const updated = {
      ...this.currentUser,
      name: data.name || this.currentUser.name,
      photoURL: data.photoURL || this.currentUser.photoURL,
      bio: data.bio || this.currentUser.bio,
      updatedAt: new Date().toISOString()
    };

    this.currentUser = updated;
    localStorage.setItem('roketry-user', JSON.stringify(updated));

    if (auth && auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, {
          displayName: updated.name,
          photoURL: updated.photoURL
        });
      } catch (err) {
        console.warn("Update Auth Profile Error:", err);
      }
    }

    if (db && uid) {
      try {
        await update(dbRef(db, `users/${uid}`), updated);
      } catch (err) {
        console.warn("Update RTDB User Profile Error:", err);
      }
    }

    this.updateNavUI();
    return true;
  }

  /**
   * Fetches profile node from RTDB (users/{uid}).
   */
  async fetchRTDBProfile(uid) {
    if (db) {
      try {
        const rootRef = dbRef(db);
        const snapshot = await get(child(rootRef, `users/${uid}`));
        if (snapshot.exists()) {
          return snapshot.val();
        }
      } catch (err) {
        console.warn("RTDB Fetch Error:", err);
      }
    }
    return null;
  }

  /**
   * Fetches all registered users from RTDB.
   */
  async fetchAllRTDBUsers() {
    if (db) {
      try {
        const rootRef = dbRef(db);
        const snapshot = await get(child(rootRef, 'users'));
        if (snapshot.exists()) {
          const usersObj = snapshot.val();
          return Object.keys(usersObj).map(uid => ({ uid, ...usersObj[uid] }));
        }
      } catch (err) {
        console.warn("RTDB Fetch All Users Error:", err);
      }
    }
    return [];
  }

  /**
   * Updates user role (Admin / User). Restricted to Super Admin.
   */
  async updateUserRole(targetUid, newRole) {
    if (!this.isSuperAdmin()) {
      alert("Permission Denied: Only Super Admin (mbatwc@gmail.com) can modify user admin privileges.");
      return false;
    }
    if (db && targetUid) {
      try {
        await update(dbRef(db, `users/${targetUid}`), {
          role: newRole,
          updatedAt: new Date().toISOString()
        });
        return true;
      } catch (err) {
        console.error("RTDB Update Role Error:", err);
        return false;
      }
    }
    return false;
  }

  /**
   * Publishes or updates project documentation in RTDB and logs commit entry.
   */
  async publishCustomProjectToRTDB(projectData, commitMessage = 'Published project updates') {
    if (!this.isAdmin()) {
      alert("Permission Denied: Administrative access required to publish projects.");
      return null;
    }
    if (db && projectData && projectData.id) {
      try {
        const projRef = dbRef(db, `projects/${projectData.id}`);
        const snapshot = await get(projRef);
        let versionStr = 'v1.0';

        if (snapshot.exists()) {
          const oldData = snapshot.val();
          const oldV = parseFloat((oldData.version || 'v1.0').replace('v', '')) || 1.0;
          versionStr = `v${(oldV + 0.1).toFixed(1)}`;
        }

        const payload = {
          ...projectData,
          version: versionStr,
          lastCommitMessage: commitMessage,
          updatedAt: new Date().toISOString(),
          updatedBy: this.currentUser ? this.currentUser.email : EXCLUSIVE_ADMIN_EMAIL
        };

        await set(projRef, payload);

        // Append to Audit Log Changelog
        const changelogEntry = {
          projectId: projectData.id,
          projectTitle: projectData.title || projectData.id,
          commitMessage: commitMessage,
          version: versionStr,
          editedBy: this.currentUser ? this.currentUser.email : EXCLUSIVE_ADMIN_EMAIL,
          editorName: this.currentUser ? this.currentUser.name : 'Admin',
          editorPhoto: this.currentUser ? this.currentUser.photoURL : '',
          editedAt: new Date().toISOString(),
          changedFields: ['Full Documentation Update']
        };
        await push(dbRef(db, 'changelog'), changelogEntry);

        return payload;
      } catch (err) {
        console.error("RTDB Publish Project Error:", err);
      }
    }
    return null;
  }

  /**
   * Fetches single project by ID from RTDB.
   */
  async fetchCustomProjectFromRTDB(projectId) {
    if (db && projectId) {
      try {
        const snapshot = await get(dbRef(db, `projects/${projectId}`));
        if (snapshot.exists()) return snapshot.val();
      } catch (err) {
        console.warn("RTDB Fetch Single Project Error:", err);
      }
    }
    return null;
  }

  /**
   * Fetches all custom projects from RTDB.
   */
  async fetchAllCustomProjectsFromRTDB() {
    if (db) {
      try {
        const snapshot = await get(dbRef(db, 'projects'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          return Object.keys(data).map(k => ({ id: k, ...data[k] }));
        }
      } catch (err) {
        console.warn("RTDB Fetch Projects Error:", err);
      }
    }
    return [];
  }

  /**
   * Fetches audit log changelogs from RTDB (newest first).
   */
  async fetchChangelog(limit = 100) {
    if (db) {
      try {
        const snapshot = await get(dbRef(db, 'changelog'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const entries = Object.keys(data).map(key => ({ id: key, ...data[key] }));
          entries.sort((a, b) => new Date(b.editedAt) - new Date(a.editedAt));
          return entries.slice(0, limit);
        }
      } catch (err) {
        console.warn('RTDB Fetch Changelog Error:', err);
      }
    }
    return [];
  }

  /**
   * Updates navbar UI controls & theme state.
   */
  updateNavUI() {
    const authContainer = document.getElementById('auth-nav-widget');
    if (!authContainer) return;

    const user = this.getUser();
    const isAdmin = this.isAdmin();

    let authHTML = '';
    if (user) {
      const adminUrl = (window.resolvePageURL ? window.resolvePageURL('admin.html') : 'admin.html');
      const profileUrl = (window.resolvePageURL ? window.resolvePageURL('profile.html') : 'profile.html');
      authHTML = `
        <div class="d-flex align-items-center gap-2 me-md-2 position-relative">
          ${isAdmin ? `<a href="${adminUrl}" class="nav-auth-btn" style="background: rgba(16, 185, 129, 0.15); color: #10b981 !important; border: 1px solid #10b981; padding: 4px 10px; border-radius: 6px; text-decoration: none; font-size: 0.8rem; font-weight: 700;">⚙️ Admin</a>` : ''}
          <a href="${profileUrl}" class="d-flex align-items-center text-decoration-none">
            <img src="${user.photoURL}" class="avatar-circle" title="${user.name} (${isAdmin ? 'Admin' : 'Member'})" alt="${user.name}">
          </a>
        </div>
      `;
    } else {
      authHTML = `
        <button id="btn-nav-login" class="repo-action-btn primary-btn me-md-2" style="font-size: 0.8rem; padding: 4px 12px;">🔑 Sign In</button>
      `;
    }

    authContainer.innerHTML = authHTML;

    const loginBtn = document.getElementById('btn-nav-login');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.signInWithGoogle());
    }
  }
}

window.authManager = new ActualAuthManager();
export { firebaseConfig, app, auth, db };
