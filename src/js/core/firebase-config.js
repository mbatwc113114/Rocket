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
  remove,
  onValue
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

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
let app, auth, db, storage, googleProvider;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getDatabase(app, firebaseConfig.databaseURL);
  storage = getStorage(app);
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

        let existingHistory = [];
        if (snapshot.exists()) {
          const oldData = snapshot.val();
          const oldV = parseFloat((oldData.version || 'v1.0').replace('v', '')) || 1.0;
          versionStr = `v${(oldV + 0.1).toFixed(1)}`;
          if (oldData.history) {
            existingHistory = Array.isArray(oldData.history) ? oldData.history : Object.values(oldData.history);
          }
        }

        const historySnapshot = {
          version: versionStr,
          commitMessage: commitMessage,
          editedAt: new Date().toISOString(),
          editedBy: this.currentUser ? this.currentUser.email : EXCLUSIVE_ADMIN_EMAIL,
          editorName: this.currentUser ? this.currentUser.name : 'Admin',
          editorPhoto: this.currentUser ? this.currentUser.photoURL : '',
          snapshotData: projectData
        };

        existingHistory.push(historySnapshot);

        const payload = {
          ...projectData,
          version: versionStr,
          lastCommitMessage: commitMessage,
          history: existingHistory,
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
   * Submits notification (Join application, contact form) to RTDB.
   */
  async submitNotification(notifData) {
    const payload = {
      ...notifData,
      read: false,
      timestamp: notifData.timestamp || new Date().toISOString()
    };

    if (db) {
      try {
        await push(dbRef(db, 'notifications'), payload);
        return true;
      } catch (err) {
        console.warn("RTDB Submit Notification Error:", err);
      }
    }
    return false;
  }

  /**
   * Fetches admin notifications from RTDB.
   */
  async fetchNotifications() {
    if (db) {
      try {
        const snapshot = await get(dbRef(db, 'notifications'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
          list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          return list;
        }
      } catch (err) {
        console.warn("RTDB Fetch Notifications Error:", err);
      }
    }
    return [];
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
   * Saves published site page content (about, join, project, roadmap) to RTDB (site_content/{pageKey}).
   */
  async saveSitePageContent(pageKey, contentData) {
    if (db && pageKey && contentData) {
      try {
        const payload = {
          ...contentData,
          updatedAt: new Date().toISOString(),
          updatedBy: (this.currentUser ? this.currentUser.email : 'admin')
        };
        await set(dbRef(db, `site_content/${pageKey}`), payload);
        return true;
      } catch (err) {
        console.error("Error saving site page content to RTDB:", err);
      }
    }
    return false;
  }

  /**
   * Fetches published site page content (about or join) from RTDB (site_content/{pageKey}).
   */
  async fetchSitePageContent(pageKey) {
    if (db && pageKey) {
      try {
        const snapshot = await get(dbRef(db, `site_content/${pageKey}`));
        if (snapshot.exists()) return snapshot.val();
      } catch (err) {
        console.warn("RTDB Fetch Site Content Error:", err);
      }
    }
    return null;
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
  async updateNavUI() {
    const authContainer = document.getElementById('auth-nav-widget');
    if (!authContainer) return;

    const user = this.getUser();
    const isAdmin = this.isAdmin();

    let authHTML = '';
    if (user) {
      const adminUrl = (window.resolvePageURL ? window.resolvePageURL('admin.html') : 'admin.html');
      const profileUrl = (window.resolvePageURL ? window.resolvePageURL('profile.html') : 'profile.html');
      
      const notifs = await this.fetchNotifications();
      const unreadCount = notifs.filter(n => !n.read).length;

      const notifBellHTML = `
        <div class="dropdown notif-nav-dropdown me-1 position-relative">
          <button class="btn btn-sm btn-outline-secondary position-relative d-flex align-items-center justify-content-center" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false" title="Notification Center" style="border-radius: 8px; border-color: var(--border-color); font-size: 0.9rem; background: var(--bg-card); color: var(--text-dark); padding: 0.35rem 0.55rem;">
            🔔
            ${unreadCount > 0 ? `<span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.62rem; padding: 0.2rem 0.4rem;">${unreadCount}</span>` : ''}
          </button>
          <div class="dropdown-menu dropdown-menu-end p-0 shadow-lg style-box" style="width: 320px; max-height: 440px; overflow-y: auto; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; font-size: 0.85rem;">
            <div class="p-2.5 px-3 border-bottom d-flex justify-content-between align-items-center" style="background: var(--bg-tree-bg);">
              <span class="fw-bold mono-text" style="color: var(--text-dark); font-size: 0.85rem;">🔔 Notifications</span>
              ${notifs.length > 0 ? `<span class="badge mono-text" style="background: rgba(59, 130, 246, 0.18); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.35); font-size: 0.72rem; border-radius: 12px; padding: 3px 8px;">${notifs.length} Total</span>` : ''}
            </div>
            <div class="notif-list-container p-2.5">
              ${notifs.length === 0 ? `
                <div class="text-center p-4 subtle-text">
                  <span style="font-size: 1.4rem;">🔕</span>
                  <p class="m-0 mt-1 mono-text" style="font-size: 0.78rem;">No notifications yet</p>
                </div>
              ` : notifs.slice(0, 10).map(n => `
                <div class="p-2.5 mb-2 rounded style-box" style="background: ${n.read ? 'rgba(0,0,0,0.15)' : 'rgba(59, 130, 246, 0.12)'}; border: 1px solid ${n.read ? 'var(--border-color)' : 'rgba(59, 130, 246, 0.35)'}; border-radius: 10px;">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold mono-text" style="color: #60a5fa; font-size: 0.8rem;">${n.title || 'Live Notification'}</span>
                    <span class="mono-text" style="color: var(--text-muted); font-size: 0.68rem;">${n.timestamp ? new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                  </div>
                  <p class="m-0" style="color: var(--text-dark); font-size: 0.8rem; line-height: 1.4;">${n.message || n.senderName || ''}</p>
                  ${n.senderEmail ? `<span class="mono-text d-block mt-1.5" style="font-size: 0.72rem; color: #38bdf8;">✉️ ${n.senderEmail}</span>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      authHTML = `
        <div class="d-flex align-items-center gap-2 me-md-2 position-relative">
          ${notifBellHTML}
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

  /**
   * Fetches all core team members from RTDB.
   * Defaults to pre-configured aerospace leads if RTDB is empty.
   */
  async fetchTeamMembers() {
    if (db) {
      try {
        const rootRef = dbRef(db);
        const snapshot = await get(child(rootRef, 'team'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          return Object.keys(data).map(key => ({ id: key, ...data[key] }));
        } else {
          // Default initial team members if node empty
          const defaultTeam = [
            {
              id: "lead-1",
              name: "Dr. Alex Vance",
              email: "mbatwc@gmail.com",
              role: "LEAD PROPULSION ENGINEER & FOUNDER",
              bio: "Pioneering liquid bi-propellant combustion chamber optimization and computational fluid dynamic simulations.",
              photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            },
            {
              id: "lead-2",
              name: "Sarah Lin",
              email: "sarah.lin@roketry.org",
              role: "AVIONICS & FLIGHT SOFTWARE LEAD",
              bio: "Architecting real-time telemetry processing pipelines, sensor fusion algorithms, and low-latency flight controls.",
              photoURL: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
            },
            {
              id: "lead-3",
              name: "Marcus Thorne",
              email: "marcus.t@roketry.org",
              role: "STRUCTURES & COMPOSITES LEAD",
              bio: "Specialized in carbon fiber composite motor casings, aerodynamic fairings, and high-G structural analysis.",
              photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
            }
          ];
          for (const member of defaultTeam) {
            await set(dbRef(db, `team/${member.id}`), member);
          }
          return defaultTeam;
        }
      } catch (err) {
        console.warn("RTDB Fetch Team Members Error:", err);
      }
    }
    return [];
  }

  /**
   * Saves or updates a team member in RTDB.
   */
  async saveTeamMember(payload) {
    if (!this.isAdmin()) {
      alert("Permission Denied: Admin rights required to modify team members.");
      return false;
    }
    if (db && payload) {
      try {
        let memberId = payload.id;
        if (!memberId) {
          const newRef = push(dbRef(db, 'team'));
          memberId = newRef.key;
        }

        const dataToSave = {
          id: memberId,
          uid: payload.uid || '',
          name: payload.name || '',
          email: payload.email || '',
          role: payload.role || 'CORE MEMBER',
          bio: payload.bio || '',
          photoURL: payload.photoURL || '',
          updatedAt: new Date().toISOString()
        };

        await set(dbRef(db, `team/${memberId}`), dataToSave);

        if (payload.makeAdmin && payload.uid) {
          await this.updateUserRole(payload.uid, 'admin');
        }

        return true;
      } catch (err) {
        console.error("RTDB Save Team Member Error:", err);
        return false;
      }
    }
    return false;
  }

  /**
   * Removes a team member node from RTDB.
   */
  async deleteTeamMember(memberId) {
    if (!this.isAdmin()) {
      alert("Permission Denied: Admin rights required to delete team members.");
      return false;
    }
    if (db && memberId) {
      try {
        await remove(dbRef(db, `team/${memberId}`));
        return true;
      } catch (err) {
        console.error("RTDB Delete Team Member Error:", err);
        return false;
      }
    }
    return false;
  }

  /**
   * Removes a custom project from RTDB.
   */
  async deleteProjectFromRTDB(projectId, projectTitle) {
    if (!this.isAdmin()) {
      alert("Permission Denied: Admin privileges required to delete projects.");
      return false;
    }
    if (db && projectId) {
      try {
        await remove(dbRef(db, `projects/${projectId}`));
        
        const changelogEntry = {
          projectId: projectId,
          projectTitle: projectTitle || projectId,
          commitMessage: `Deleted project: ${projectTitle || projectId}`,
          version: 'REMOVED',
          editedBy: this.currentUser ? this.currentUser.email : EXCLUSIVE_ADMIN_EMAIL,
          editorName: this.currentUser ? this.currentUser.name : 'Admin',
          editorPhoto: this.currentUser ? this.currentUser.photoURL : '',
          editedAt: new Date().toISOString(),
          changedFields: ['Project Deletion']
        };
        await push(dbRef(db, 'changelog'), changelogEntry);

        return true;
      } catch (err) {
        console.error("RTDB Delete Project Error:", err);
        return false;
      }
    }
    return false;
  }

  /**
   * Uploads an image file to Firebase Storage and returns its download URL.
   */
  async uploadImageToFirebaseStorage(file) {
    if (!storage) {
      alert("Firebase Storage is not initialized.");
      return null;
    }
    try {
      const fileName = `uploads/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const sRef = storageRef(storage, fileName);
      const snapshot = await uploadBytes(sRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (err) {
      console.error("Firebase Storage Upload Error:", err);
      alert("Upload failed: " + err.message);
      return null;
    }
  }

  /**
   * Converts Google Drive view/share URLs to direct image URLs.
   */
  convertGoogleDriveUrl(url) {
    if (!url || typeof url !== 'string') return url;
    let fileId = null;

    const matchFileD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (matchFileD && matchFileD[1]) {
      fileId = matchFileD[1];
    } else {
      const matchQueryId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (matchQueryId && matchQueryId[1]) {
        fileId = matchQueryId[1];
      }
    }

    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
    return url;
  }
}

window.authManager = new ActualAuthManager();
export { firebaseConfig, app, auth, db, storage };
