/* ==========================================================================
   ROKETRY — FIREBASE AUTHENTICATION, REALTIME DATABASE & STORAGE SDK (v10)
   ========================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getDatabase, 
  ref as dbRef, 
  set, 
  get, 
  child, 
  update,
  push 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// STRICT DESIGNATED ADMIN EMAIL
const EXCLUSIVE_ADMIN_EMAIL = "mbatwc@gmail.com";

// DEFAULT ROCKET PROJECTS PAYLOAD FOR INITIAL RTDB SEEDING
const DEFAULT_ROCKET_PROJECTS = {
  model1: {
    id: "model1",
    title: "Rocket Model-I (Solid Stability Vehicle)",
    subtitle: "SINGLE-STAGE SOLID FUEL ROCKET FOR FLIGHT STABILITY & LOW-ALTITUDE TEST VALIDATION",
    badge: "ROCKET FLEET",
    docId: "DOC-FLEET-01",
    category: "fleet",
    sketchImg: "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800&auto=format&fit=crop&q=80",
    p1: "Rocket Model-I is a single-stage solid-propelled sounding vehicle built to validate high-speed flight aerodynamic stability, fin center-of-pressure alignment, and low-altitude flight computer trajectory tracking.",
    p2: "It serves as the baseline flight platform for all subsequent multistage aerodynamic and recovery hardware testing.",
    verification: "Flight Validated (6 Flights)",
    related: [
      { title: "Rocket Model-II (Multistage Payload)", url: "model2" },
      { title: "Ground Electric Mission Simulator", url: "simulator" },
      { title: "Dual Pyro Recovery System", url: "recovery" }
    ],
    authors: [
      { name: "Dr. Alex Vance", role: "Lead Aerodynamicist", photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
      { name: "MBAT Rocket Lead", role: "Propulsion Lead", photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" }
    ],
    sections: [
      {
        title: "1. Flight Aerodynamics & Stability",
        layout: "stack",
        components: [
          { type: "text", content: "Passive fin stabilization tuned for sub-mach flight profile. CNC machined fins maintain flight stability across high angle of attack maneuvers." }
        ]
      }
    ],
    specs: [
      ["Propulsion Type", "Solid Fuel Motor (K-Class)", "Composite propellant"],
      ["Target Altitude", "3,500 Feet APOGEE", "Low-altitude test vehicle"],
      ["Stabilization", "Passive Fin Stabilization", "CNC 6061-T6 Aluminum fins"],
      ["Telemetry Link", "915 MHz LoRa Telemetry", "Real-time altitude & acceleration"],
      ["Flight Status", "Flight Validated (6 Test Flights)", "Active Standard Vehicle"]
    ]
  },
  model2: {
    id: "model2",
    title: "Rocket Model-II (Multistage Payload)",
    subtitle: "DUAL-STAGE SOLID PROPELLED SOUNDING ROCKET WITH PNEUMATIC STAGING & CUBESAT BAY",
    badge: "ROCKET FLEET",
    docId: "DOC-FLEET-02",
    category: "fleet",
    sketchImg: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=800&auto=format&fit=crop&q=80",
    p1: "Rocket Model-II is a high-altitude dual-stage rocket system equipped with pneumatic stage separation mechanisms and a standardized 1U CubeSat payload ejection bay.",
    p2: "Designed to reach 15,000 feet APOGEE while logging 9-DOF IMU dynamics during high-g staging separation events.",
    verification: "Pre-Flight Separation Verified",
    related: [
      { title: "Rocket Model-I (Solid Stability)", url: "model1" },
      { title: "Rocket Model-III (Liquid Lander)", url: "model3" },
      { title: "Dual Pyro Recovery System", url: "recovery" }
    ],
    authors: [
      { name: "Aman Choudhary", role: "Avionics Engineer", photoURL: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80" }
    ],
    sections: [
      {
        title: "1. Stage Separation System",
        layout: "stack",
        components: [
          { type: "text", content: "Pneumatic separation powered by high-pressure CO2 canister release. Activated upon detected burn-out of Stage-1 motor." }
        ]
      }
    ],
    specs: [
      ["Propulsion", "Dual-Stage Solid Motors (N-Class Booster)", "Pneumatic stage release"],
      ["Target Altitude", "15,000 Feet APOGEE", "High-altitude payload platform"],
      ["Payload Capacity", "1U CubeSat (1.33 kg)", "Spring ejector deployment"],
      ["Stage Release", "Optocoupled CO2 Pneumatic Separation", "Burnout detection logic"],
      ["System Status", "Separation Stage Ready", "Pre-flight Verification"]
    ]
  },
  model3: {
    id: "model3",
    title: "Rocket Model-III (Liquid Lander VTVL)",
    subtitle: "DUAL-STAGE METHALOX LIQUID PROPULSION & PROPULSIVE VERTICAL LANDING TESTBED",
    badge: "ROCKET FLEET",
    docId: "DOC-FLEET-03",
    category: "fleet",
    sketchImg: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800&auto=format&fit=crop&q=80",
    p1: "Rocket Model-III is a liquid-propelled experimental lander designed to test propulsive touchdown, active thrust vector control (TVC), and cold-gas reaction thrusters (RCS).",
    p2: "Serves as the primary platform for validating throttleable liquid engines during low-altitude hover firings.",
    verification: "Hot-Fire Static Firing Verified",
    related: [
      { title: "Solid Motor Static Test Stand", url: "teststand" },
      { title: "Ground Electric Mission Simulator", url: "simulator" }
    ],
    authors: [
      { name: "MBAT Rocket Lead", role: "Propulsion Lead", photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" }
    ],
    sections: [
      {
        title: "1. Throttlable Liquid Engine & TVC Gimbal",
        layout: "stack",
        components: [
          { type: "text", content: "Regeneratively cooled ethanol/LOX chamber featuring dual-axis electromechanical TVC actuators." }
        ]
      }
    ],
    specs: [
      ["Propulsion Type", "Ethanol / Liquid Oxygen (LOX)", "Regeneratively cooled chamber"],
      ["Peak Thrust", "2,450 N (Throttlable to 40%)", "Proportional solenoid control"],
      ["Target Apogee", "10,000 Feet VTVL Landing", "Autonomous propulsive descent"],
      ["Gimbal Vectoring", "Dual-Axis Servo TVC (±8° Vectoring)", "Fast-response closed-loop"],
      ["Development Phase", "Static Test Firing Phase", "Hot-fire Ground Testing"]
    ]
  },
  simulator: {
    id: "simulator",
    title: "Ground Electric Mission Simulator",
    subtitle: "HARDWARE-IN-THE-LOOP (HIL) ROCKET LAUNCH & AVIONICS TEST BENCH",
    badge: "SIMULATORS",
    docId: "DOC-SUBS-01",
    category: "simulators",
    sketchImg: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    p1: "The Ground Electric Rocket Simulator is a benchtop hardware-in-the-loop (HIL) test facility that electrically simulates every phase of a rocket launch.",
    p2: "Allows software engineers to stress-test flight algorithms and pyrotechnic trigger safety loops prior to real flights.",
    verification: "Daily Active CI/CD Bench",
    related: [
      { title: "Rocket Model-I (Solid Vehicle)", url: "model1" },
      { title: "Dual Pyro Recovery System", url: "recovery" }
    ],
    authors: [{ name: "Avionics Team", role: "Hardware Bench Developers", photoURL: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80" }],
    sections: [],
    specs: [
      ["Simulation Modes", "Full Flight Profile (Launch to Touchdown)", "Real-time hardware-in-the-loop"],
      ["Sensor Emulation", "Barometric, IMU, GPS Data", "I2C / SPI / Serial Injection"],
      ["System Status", "Deployed & In Active Daily Use", "Continuous Integration Bench"]
    ]
  },
  teststand: {
    id: "teststand",
    title: "Solid Motor Static Test Stand",
    subtitle: "INSTRUMENTED STATIC FIRING TEST STAND FOR THRUST & PRESSURE TELEMETRY DATA",
    badge: "SIMULATORS",
    docId: "DOC-SUBS-02",
    category: "simulators",
    sketchImg: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
    p1: "The Solid Motor Static Test Stand captures high-frequency load-cell thrust curves, chamber pressure profiles, and nozzle thermal telemetry.",
    p2: "Features an S-type 1000kg load cell, high-speed HX711 amplifier, and automated remote safety key ignition interlocks.",
    verification: "4 Firings Verified",
    related: [
      { title: "Rocket Model-III (Liquid Lander)", url: "model3" },
      { title: "Ground Electric Mission Simulator", url: "simulator" }
    ],
    authors: [{ name: "Testing Team", role: "Ground Test Engineers", photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" }],
    sections: [],
    specs: [
      ["Load Cell Rating", "1,000 kg S-Type Strain Gauge", "80Hz High-Speed Sampling"],
      ["Pressure Sensing", "1,000 PSI Stainless Transducer", "Chamber pressure profiling"],
      ["Facility Status", "Operational (4 Static Firings Passed)", "Available for Open Data"]
    ]
  },
  recovery: {
    id: "recovery",
    title: "Dual Pyro Recovery & Ejection System",
    subtitle: "REDUNDANT DUAL-STAGE PYROTECHNIC EJECTION & PARACHUTE DEPLOYMENT STACK",
    badge: "SUBSYSTEMS",
    docId: "DOC-SUBS-03",
    category: "subsystems",
    sketchImg: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    p1: "The Dual Pyro Recovery System controls drogue and main parachute deployment using redundant MOSFET firing switches.",
    p2: "Triggers drogue chute ejection at apogee, followed by main chute release at 1,000 ft altitude.",
    verification: "Flight Tested",
    related: [
      { title: "Rocket Model-I (Solid Vehicle)", url: "model1" },
      { title: "Rocket Model-II (Multistage)", url: "model2" }
    ],
    authors: [{ name: "Recovery Team", role: "Parachute & Pyro Engineers", photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" }],
    sections: [],
    specs: [
      ["Deployment Stages", "Dual-Stage (Drogue @ Apogee, Main @ 1000ft)", "Redundant altimeters"],
      ["Firing Current", "12A Peak MOSFET Discharge", "Capacitor charge storage"],
      ["System Status", "Flight Validated", "Standard Stack across Fleet"]
    ]
  }
};

// 1. LIVE FIREBASE PROJECT CONFIGURATION KEYS
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

// 2. Initialize Firebase Services
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
  console.warn("Firebase Init Warning:", err);
}

class ActualAuthManager {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('roketry-user')) || null;
    
    if (this.currentUser) {
      if (this.isSuperAdmin()) {
        this.currentUser.role = "admin";
      }
      localStorage.setItem('roketry-user', JSON.stringify(this.currentUser));
    }
    
    setTimeout(() => this.updateNavUI(), 50);
    this.initAuthStateListener();
  }

  isSuperAdmin() {
    return !!(this.currentUser && this.currentUser.email && this.currentUser.email.toLowerCase().trim() === EXCLUSIVE_ADMIN_EMAIL);
  }

  isAdmin() {
    if (!this.currentUser) return false;
    return this.isSuperAdmin() || this.currentUser.role === 'admin';
  }

  getUser() {
    return this.currentUser;
  }

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
          await this.saveToRTDB(profile);
        } else {
          this.currentUser = null;
          localStorage.removeItem('roketry-user');
        }
        this.updateNavUI();
      });
    }
  }

  // SUBMIT NOTIFICATION (Targeted Recipient & Admin Notifications)
  async submitNotification(payload) {
    const notifData = {
      type: payload.type || 'CONTACT',
      title: payload.title || '📩 New Notification',
      senderName: payload.senderName || 'Community Member',
      senderEmail: payload.senderEmail || 'user@roketry.org',
      recipientUid: payload.recipientUid || '',
      recipientEmail: payload.recipientEmail ? payload.recipientEmail.toLowerCase().trim() : '',
      message: payload.message || '',
      interest: payload.interest || '',
      timestamp: payload.timestamp || new Date().toISOString(),
      read: false
    };

    if (db) {
      try {
        const notifRef = push(dbRef(db, 'notifications'));
        const newNotif = { id: notifRef.key, ...notifData };
        await set(notifRef, newNotif);
        return newNotif;
      } catch (err) {
        console.warn("RTDB Submit Notification Error:", err);
      }
    }

    const localNotifs = JSON.parse(localStorage.getItem('roketry-local-notifications')) || [];
    const newNotif = { id: `local_notif_${Date.now()}`, ...notifData };
    localNotifs.unshift(newNotif);
    localStorage.setItem('roketry-local-notifications', JSON.stringify(localNotifs));
    return newNotif;
  }

  // FETCH NOTIFICATIONS FROM FIREBASE RTDB (FILTERED BY LOGGED-IN RECIPIENT)
  async fetchNotifications(limitCount = 30) {
    const user = this.getUser();
    const userUid = user ? user.uid : null;
    const userEmail = user && user.email ? user.email.toLowerCase().trim() : null;
    const isSuper = this.isSuperAdmin();

    let allNotifs = [];

    if (db) {
      try {
        const rootRef = dbRef(db);
        const snapshot = await get(child(rootRef, 'notifications'));
        if (snapshot.exists()) {
          const obj = snapshot.val();
          allNotifs = Object.keys(obj).map(k => ({ id: k, ...obj[k] }));
        }
      } catch (err) {
        console.warn("RTDB Fetch Notifications Error:", err);
      }
    } else {
      allNotifs = JSON.parse(localStorage.getItem('roketry-local-notifications')) || [];
    }

    // STRICT RECIPIENT FILTERING:
    // 1. Super Admin (mbatwc@gmail.com): Sees contact forms, join submissions, and admin logs
    // 2. Targeted User: Sees ONLY notifications addressed directly to their UID or Email
    const filtered = allNotifs.filter(n => {
      if (isSuper) return true; // Super Admin sees system management notifications

      const notifTargetUid = n.recipientUid;
      const notifTargetEmail = n.recipientEmail ? n.recipientEmail.toLowerCase().trim() : null;

      if (notifTargetUid || notifTargetEmail) {
        if (userUid && notifTargetUid === userUid) return true;
        if (userEmail && notifTargetEmail === userEmail) return true;
        return false; // Block broadcast to unrelated users!
      }

      return false;
    });

    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limitCount);
  }

  // MARK NOTIFICATION AS READ
  async markNotificationAsRead(notifId) {
    if (db && notifId) {
      try {
        await update(dbRef(db, `notifications/${notifId}`), { read: true });
      } catch (err) {
        console.warn("RTDB Mark Read Error:", err);
      }
    }
    const localNotifs = JSON.parse(localStorage.getItem('roketry-local-notifications')) || [];
    const idx = localNotifs.findIndex(n => n.id === notifId);
    if (idx !== -1) {
      localNotifs[idx].read = true;
      localStorage.setItem('roketry-local-notifications', JSON.stringify(localNotifs));
    }
    return true;
  }

  // MARK ALL NOTIFICATIONS AS READ
  async markAllNotificationsAsRead() {
    const notifs = await this.fetchNotifications();
    for (const n of notifs) {
      if (!n.read) {
        await this.markNotificationAsRead(n.id);
      }
    }
    return true;
  }

  // UPDATE USER ROLE (SUPER ADMIN: mbatwc@gmail.com)
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
        
        await this.submitNotification({
          type: 'ADMIN_PRIVILEGE_CHANGE',
          title: `👑 Admin Access ${newRole === 'admin' ? 'Granted' : 'Revoked'}`,
          senderName: this.currentUser?.name || 'Super Admin',
          senderEmail: EXCLUSIVE_ADMIN_EMAIL,
          message: `Admin rights ${newRole === 'admin' ? 'granted to' : 'revoked from'} user UID: ${targetUid}`,
          timestamp: new Date().toISOString()
        });
        return true;
      } catch (err) {
        console.error("RTDB Update Role Error:", err);
        return false;
      }
    }
    return false;
  }

  // FETCH PROFILE FROM FIREBASE REALTIME DATABASE (users/{uid})
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

  // FETCH ALL REGISTERED USERS FROM FIREBASE REALTIME DATABASE (users/)
  async fetchAllRTDBUsers() {
    if (db) {
      try {
        const rootRef = dbRef(db);
        const snapshot = await get(child(rootRef, 'users'));
        if (snapshot.exists()) {
          const usersObj = snapshot.val();
          return Object.keys(usersObj).map(uid => ({
            uid,
            ...usersObj[uid]
          }));
        }
      } catch (err) {
        console.warn("RTDB Fetch All Users Error:", err);
      }
    }
    return [
      { uid: 'usr_mbat', name: 'MBAT Rocket Lead', email: 'mbatwc@gmail.com', photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', role: 'admin', bio: 'Propulsion Lead' },
      { uid: 'usr_aman', name: 'Aman Choudhary', email: 'aman.choudhary_btech23@gsv.ac.in', photoURL: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80', role: 'user', bio: 'Avionics Engineer' },
      { uid: 'usr_vance', name: 'Dr. Alex Vance', email: 'alex.vance@roketry.org', photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', role: 'user', bio: 'Aerodynamics Lead' }
    ];
  }

  // SAVE USER PROFILE TO FIREBASE REALTIME DATABASE
  async saveToRTDB(profile) {
    if (db && profile.uid) {
      try {
        const isSuper = (profile.email && profile.email.toLowerCase().trim() === EXCLUSIVE_ADMIN_EMAIL);
        await set(dbRef(db, `users/${profile.uid}`), {
          name: profile.name,
          email: profile.email,
          photoURL: profile.photoURL,
          role: isSuper ? 'admin' : (profile.role || 'user'),
          bio: profile.bio,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("RTDB Save Error:", err);
      }
    }
  }

  // CONVERT GOOGLE DRIVE SHARE LINK TO DIRECT IMAGE URL
  convertGoogleDriveUrl(url) {
    if (!url || typeof url !== 'string') return url;
    const trimmed = url.trim();
    if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
      const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
      }
    }
    return trimmed;
  }

  // UPLOAD RAW BINARY IMAGE DIRECTLY TO GOOGLE DRIVE VIA REST API
  async uploadImageToGoogleDrive(file) {
    if (!file) return null;
    let token = localStorage.getItem('roketry-gdrive-token');

    // Prompt OAuth popup if token is missing
    if (!token && auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential && credential.accessToken) {
          token = credential.accessToken;
          localStorage.setItem('roketry-gdrive-token', token);
        }
      } catch (authErr) {
        console.warn("Google Drive OAuth Prompt Warning:", authErr);
      }
    }

    if (token) {
      try {
        const metadata = {
          name: `Roketry_${Date.now()}_${file.name}`,
          mimeType: file.type
        };

        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', file); // Raw Binary File Blob

        const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          if (data.id) {
            // Set public read permission so anyone with link can view
            await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ role: 'reader', type: 'anyone' })
            });

            const directUrl = `https://lh3.googleusercontent.com/d/${data.id}`;
            console.log("Successfully uploaded raw binary image to Google Drive API:", directUrl);
            return directUrl;
          }
        }
      } catch (err) {
        console.warn("Google Drive API Upload Error:", err);
      }
    }

    return null;
  }

  // UPLOAD RAW BINARY IMAGE TO GOOGLE DRIVE API / FIREBASE STORAGE / RAW BINARY ARRAY BUFFER
  async uploadImageToFirebaseStorage(file) {
    if (!file) return null;

    // First Priority: Upload raw binary file to Google Drive via API (mbatwc@gmail.com)
    const gdriveUrl = await this.uploadImageToGoogleDrive(file);
    if (gdriveUrl) return gdriveUrl;
    
    if (storage) {
      try {
        const fileRef = storageRef(storage, `project-images/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      } catch (err) {
        console.warn("Firebase Storage Upload Warning:", err);
      }
    }

    // Binary ArrayBuffer Fallback (No Base64 String)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const byteArray = Array.from(new Uint8Array(e.target.result));
        const blob = new Blob([new Uint8Array(byteArray)], { type: file.type });
        resolve(URL.createObjectURL(blob));
      };
      reader.readAsArrayBuffer(file);
    });
  }

  // PUBLISH CUSTOM PROJECT TO FIREBASE REALTIME DATABASE (projects/{id}) WITH VERSIONING & CHANGELOG
  async publishCustomProjectToRTDB(projectData, commitMessage = 'Published project updates') {
    if (db && projectData.id) {
      try {
        // Fetch existing project to determine version increment
        const existingSnap = await get(child(dbRef(db), `projects/${projectData.id}`));
        let currentVersionNum = 1.0;
        let existingHistory = [];

        if (existingSnap.exists()) {
          const oldData = existingSnap.val();
          if (oldData.versionNum) {
            currentVersionNum = Math.round((oldData.versionNum + 0.1) * 10) / 10;
          } else if (oldData.version && oldData.version.startsWith('v')) {
            const parsed = parseFloat(oldData.version.substring(1));
            if (!isNaN(parsed)) currentVersionNum = Math.round((parsed + 0.1) * 10) / 10;
          }
          if (oldData.history && Array.isArray(oldData.history)) {
            existingHistory = oldData.history;
          } else if (oldData.history && typeof oldData.history === 'object') {
            existingHistory = Object.values(oldData.history);
          }
        }

        const newVersionTag = `v${currentVersionNum.toFixed(1)}`;
        const timestamp = new Date().toISOString();
        const editorEmail = this.currentUser ? this.currentUser.email : EXCLUSIVE_ADMIN_EMAIL;
        const editorName = this.currentUser ? this.currentUser.name : 'Admin';
        const editorPhoto = this.currentUser ? this.currentUser.photoURL : '';

        const newHistoryEntry = {
          version: newVersionTag,
          commitMessage: commitMessage || 'Updated project documentation',
          editedBy: editorEmail,
          editorName: editorName,
          editorPhoto: editorPhoto,
          editedAt: timestamp
        };

        const updatedProject = {
          ...projectData,
          version: newVersionTag,
          versionNum: currentVersionNum,
          lastCommitMessage: commitMessage,
          publishedBy: editorEmail,
          publishedAt: timestamp,
          history: [...existingHistory, newHistoryEntry]
        };

        // 1. Write updated project to RTDB
        await set(dbRef(db, `projects/${projectData.id}`), updatedProject);

        // 2. Push to global audit changelog
        const changelogEntry = {
          projectId: projectData.id,
          projectTitle: projectData.title || projectData.id,
          version: newVersionTag,
          commitMessage: commitMessage || 'Updated project documentation',
          editedBy: editorEmail,
          editorName: editorName,
          editorPhoto: editorPhoto,
          editedAt: timestamp,
          changedFields: ['CATALOG UPDATE', newVersionTag]
        };
        await push(dbRef(db, 'changelog'), changelogEntry);

        return updatedProject;
      } catch (err) {
        console.error("RTDB Publish Project Error:", err);
      }
    }
    const localProjects = JSON.parse(localStorage.getItem('roketry-custom-projects')) || {};
    localProjects[projectData.id] = projectData;
    localStorage.setItem('roketry-custom-projects', JSON.stringify(localProjects));
    return projectData;
  }

  // FETCH CUSTOM PROJECT FROM FIREBASE REALTIME DATABASE (projects/{id})
  async fetchCustomProjectFromRTDB(id) {
    if (db) {
      try {
        const rootRef = dbRef(db);
        const snapshot = await get(child(rootRef, `projects/${id}`));
        if (snapshot.exists()) {
          return snapshot.val();
        }
      } catch (err) {
        console.warn("RTDB Fetch Project Error:", err);
      }
    }
    const localProjects = JSON.parse(localStorage.getItem('roketry-custom-projects')) || {};
    return localProjects[id] || DEFAULT_ROCKET_PROJECTS[id] || null;
  }

  // FETCH ALL CUSTOM PROJECTS FROM FIREBASE REALTIME DATABASE (projects/)
  async fetchAllCustomProjectsFromRTDB() {
    if (db) {
      try {
        const rootRef = dbRef(db);
        const snapshot = await get(child(rootRef, 'projects'));
        let projObj = snapshot.exists() ? snapshot.val() : {};
        
        // AUTO-SEED ALL MISSING DEFAULT ROCKET PROJECTS DIRECTLY INTO RTDB
        let missingSeed = false;
        const seedsToUpload = {};
        
        for (const [key, val] of Object.entries(DEFAULT_ROCKET_PROJECTS)) {
          if (!projObj[key] || !projObj[key].sketchImg || projObj[key].sketchImg.endsWith('.png')) {
            projObj[key] = { ...val, ...projObj[key], sketchImg: val.sketchImg };
            seedsToUpload[key] = projObj[key];
            missingSeed = true;
          }
        }

        if (missingSeed) {
          try {
            await update(child(rootRef, 'projects'), seedsToUpload);
            console.log("Uploaded missing default projects to Firebase Realtime Database!");
          } catch (seedErr) {
            console.warn("RTDB Auto-Seed Error:", seedErr);
          }
        }

        return Object.keys(projObj).map(id => ({
          id,
          ...projObj[id]
        }));
      } catch (err) {
        console.warn("RTDB Fetch All Projects Error:", err);
      }
    }
    const localProjects = JSON.parse(localStorage.getItem('roketry-custom-projects')) || {};
    const merged = { ...DEFAULT_ROCKET_PROJECTS, ...localProjects };
    return Object.keys(merged).map(id => ({ id, ...merged[id] }));
  }

  getUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  isAdmin() {
    if (!this.currentUser) return false;
    return this.isSuperAdmin() || this.currentUser.role === 'admin';
  }

  // UPDATE PROJECT IN RTDB AND LOG COMMIT TO CHANGELOG
  async updateProjectInRTDB(projectId, updatedData, commitMessage, changedFields) {
    if (db && projectId) {
      try {
        // 1. Merge updated fields into existing project
        await update(dbRef(db, `projects/${projectId}`), {
          ...updatedData,
          lastEditedBy: this.currentUser ? this.currentUser.email : EXCLUSIVE_ADMIN_EMAIL,
          lastEditedAt: new Date().toISOString()
        });

        // 2. Push a changelog entry
        const changelogEntry = {
          projectId: projectId,
          projectTitle: updatedData.title || projectId,
          commitMessage: commitMessage || 'Updated project',
          editedBy: this.currentUser ? this.currentUser.email : EXCLUSIVE_ADMIN_EMAIL,
          editorName: this.currentUser ? this.currentUser.name : 'Admin',
          editorPhoto: this.currentUser ? this.currentUser.photoURL : '',
          editedAt: new Date().toISOString(),
          changedFields: changedFields || []
        };
        await push(dbRef(db, 'changelog'), changelogEntry);

        return true;
      } catch (err) {
        console.error('RTDB Update Project Error:', err);
        return false;
      }
    }
    return false;
  }

  // FETCH COMMIT CHANGELOG FROM RTDB (newest first)
  async fetchChangelog(limit = 50) {
    if (db) {
      try {
        const snapshot = await get(dbRef(db, 'changelog'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const entries = Object.keys(data).map(key => ({ id: key, ...data[key] }));
          // Sort newest first
          entries.sort((a, b) => new Date(b.editedAt) - new Date(a.editedAt));
          return entries.slice(0, limit);
        }
      } catch (err) {
        console.warn('RTDB Fetch Changelog Error:', err);
      }
    }
    return [];
  }

  // DELETE PROJECT FROM RTDB AND LOG TO CHANGELOG
  async deleteProjectFromRTDB(projectId, projectTitle) {
    if (db && projectId) {
      try {
        // Remove project node
        await set(dbRef(db, `projects/${projectId}`), null);

        // Log deletion to changelog
        const changelogEntry = {
          projectId: projectId,
          projectTitle: projectTitle || projectId,
          commitMessage: `🗑️ Deleted project "${projectTitle || projectId}"`,
          editedBy: this.currentUser ? this.currentUser.email : EXCLUSIVE_ADMIN_EMAIL,
          editorName: this.currentUser ? this.currentUser.name : 'Admin',
          editorPhoto: this.currentUser ? this.currentUser.photoURL : '',
          editedAt: new Date().toISOString(),
          changedFields: ['DELETED']
        };
        await push(dbRef(db, 'changelog'), changelogEntry);

        return true;
      } catch (err) {
        console.error('RTDB Delete Project Error:', err);
        return false;
      }
    }
    // Also remove from localStorage
    const localProjects = JSON.parse(localStorage.getItem('roketry-custom-projects')) || {};
    delete localProjects[projectId];
    localStorage.setItem('roketry-custom-projects', JSON.stringify(localProjects));
    return true;
  }

  // FETCH ALL TEAM MEMBERS FROM RTDB
  async fetchTeamMembers() {
    if (db) {
      try {
        const rootRef = dbRef(db);
        const snapshot = await get(child(rootRef, 'teamMembers'));
        if (snapshot.exists()) {
          const obj = snapshot.val();
          return Object.keys(obj).map(k => ({ id: k, ...obj[k] }));
        }
      } catch (err) {
        console.warn("RTDB Fetch Team Members Error:", err);
      }
    }
    const localTeam = JSON.parse(localStorage.getItem('roketry-local-team')) || [];
    if (localTeam.length > 0) return localTeam;

    return [
      { id: 'team_vance', uid: 'usr_vance', name: 'Dr. Alex Vance', role: 'FOUNDER & LEAD ENGINEER', bio: 'Aerospace engineer specializing in solid propellant formulations and computational fluid dynamics.', photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', email: 'alex.vance@roketry.org' },
      { id: 'team_marcus', uid: 'usr_marcus', name: 'Marcus Chen', role: 'AVIONICS & SOFTWARE LEAD', bio: 'Embedded systems designer crafting dual-deployment flight computers and telemetry stacks.', photoURL: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80', email: 'marcus.chen@roketry.org' },
      { id: 'team_elena', uid: 'usr_elena', name: 'Elena Rostova', role: 'PROPULSION SYSTEMS LEAD', bio: 'Mechanical engineer leading static thrust test stand instrumentation and nozzle geometry optimization.', photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', email: 'elena.rostova@roketry.org' },
      { id: 'team_david', uid: 'usr_david', name: 'David K.', role: 'STRUCTURES & RECOVERY LEAD', bio: 'Composite materials specialist focusing on carbon-fiber airframes and parachute deployment systems.', photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', email: 'david.k@roketry.org' }
    ];
  }

  // SAVE OR UPDATE TEAM MEMBER & ASSIGN ROLE (ADMIN ONLY)
  async saveTeamMember(memberData) {
    if (!this.isAdmin()) {
      alert("Permission Denied: Only Admins can manage team members and assign roles.");
      return false;
    }

    // Strict Super Admin Check for granting Admin Role
    if (memberData.makeAdmin && !this.isSuperAdmin()) {
      alert("Permission Denied: Only Super Admin (mbatwc@gmail.com) can grant or revoke Admin privileges.");
      return false;
    }

    const memberId = memberData.id || `team_${Date.now()}`;
    const payload = {
      id: memberId,
      uid: memberData.uid || '',
      name: memberData.name || 'Team Member',
      email: memberData.email || '',
      role: memberData.role || 'CORE CONTRIBUTOR',
      isAdmin: !!memberData.makeAdmin,
      bio: memberData.bio || '',
      photoURL: memberData.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      updatedAt: new Date().toISOString()
    };

    if (db) {
      try {
        await set(dbRef(db, `teamMembers/${memberId}`), payload);

        if (memberData.uid) {
          const userUpdates = {
            teamRole: memberData.role,
            updatedAt: new Date().toISOString()
          };

          // Only Super Admin can change users/{uid}/role
          if (this.isSuperAdmin() && memberData.makeAdmin !== undefined) {
            userUpdates.role = memberData.makeAdmin ? 'admin' : 'user';
          }

          await update(dbRef(db, `users/${memberData.uid}`), userUpdates);
        }

        const notifTitle = memberData.makeAdmin 
          ? `👑 Admin Access Granted: ${memberData.role}`
          : `🎉 Team Role Assigned: ${memberData.role}`;

        const notifMsg = memberData.makeAdmin
          ? `Congratulations! ${memberData.name} has been promoted to ADMIN with full editing access by Super Admin.`
          : `Congratulations! ${memberData.name} has been assigned the team role "${memberData.role}" by Admin.`;

        await this.submitNotification({
          type: memberData.makeAdmin ? 'ADMIN_PROMOTION' : 'ROLE_ASSIGNMENT',
          title: notifTitle,
          senderName: this.currentUser?.name || 'Super Admin',
          senderEmail: EXCLUSIVE_ADMIN_EMAIL,
          recipientUid: memberData.uid || '',
          recipientEmail: memberData.email || '',
          message: notifMsg,
          timestamp: new Date().toISOString()
        });

        return payload;
      } catch (err) {
        console.error("RTDB Save Team Member Error:", err);
      }
    }

    const localTeam = JSON.parse(localStorage.getItem('roketry-local-team')) || [];
    const idx = localTeam.findIndex(t => t.id === memberId);
    if (idx !== -1) localTeam[idx] = payload;
    else localTeam.push(payload);
    localStorage.setItem('roketry-local-team', JSON.stringify(localTeam));

    return payload;
  }

  // DELETE TEAM MEMBER (ADMIN ONLY)
  async deleteTeamMember(memberId) {
    if (!this.isAdmin()) {
      alert("Permission Denied: Only Admins can remove team members.");
      return false;
    }
    if (db && memberId) {
      try {
        await set(dbRef(db, `teamMembers/${memberId}`), null);
        return true;
      } catch (err) {
        console.error("RTDB Delete Team Member Error:", err);
      }
    }
    const localTeam = JSON.parse(localStorage.getItem('roketry-local-team')) || [];
    const filtered = localTeam.filter(t => t.id !== memberId);
    localStorage.setItem('roketry-local-team', JSON.stringify(filtered));
    return true;
  }

  // ACTUAL GOOGLE SIGN-IN
  async signInWithGoogle() {
    if (auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential && credential.accessToken) {
          localStorage.setItem('roketry-gdrive-token', credential.accessToken);
        }

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
          bio: existingProfile?.bio || "Aerospace & Rocket Systems Developer"
        };

        this.currentUser = profile;
        localStorage.setItem('roketry-user', JSON.stringify(profile));
        await this.saveToRTDB(profile);
        this.updateNavUI();
        return profile;
      } catch (error) {
        console.error("Firebase Google Auth Error:", error);
        if (error && error.code === 'auth/unauthorized-domain') {
          const currentHost = window.location.hostname;
          const currentPort = window.location.port ? `:${window.location.port}` : '';
          
          if (currentHost === '127.0.0.1') {
            const redirectUrl = window.location.href.replace('127.0.0.1', 'localhost');
            if (confirm("🚨 Firebase Google Login Warning:\n\nThe domain '127.0.0.1' is not authorized in your Firebase Console.\n\nWould you like to automatically redirect to:\n" + redirectUrl + "\nwhere Google Sign-In is authorized?")) {
              window.location.href = redirectUrl;
              return null;
            }
          }
          alert("❌ Firebase Authorization Error (auth/unauthorized-domain):\n\nDomain '" + currentHost + "' is not authorized for Google Sign-In.\n\n2 Easy Fix Options:\n1. Open your site at: http://localhost" + currentPort + window.location.pathname + "\n2. Add '127.0.0.1' to Firebase Console -> Authentication -> Settings -> Authorized domains.");
        }
        return null;
      }
    }
  }

  // ACTUAL FIREBASE LOGOUT
  async logout() {
    if (auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn("Signout error", err);
      }
    }
    this.currentUser = null;
    localStorage.removeItem('roketry-user');
    window.location.reload();
  }

  // UPDATE PROFILE DATA & SYNC TO REALTIME DATABASE
  async updateProfileData(data) {
    if (this.currentUser) {
      const email = (this.currentUser.email || "").toLowerCase().trim();
      const role = (email === EXCLUSIVE_ADMIN_EMAIL) ? "admin" : "user";

      this.currentUser = { ...this.currentUser, name: data.name, photoURL: data.photoURL, bio: data.bio, role: role };
      localStorage.setItem('roketry-user', JSON.stringify(this.currentUser));

      if (db && this.currentUser.uid) {
        try {
          await update(dbRef(db, `users/${this.currentUser.uid}`), {
            name: data.name,
            photoURL: data.photoURL,
            bio: data.bio,
            role: role,
            updatedAt: new Date().toISOString()
          });
        } catch (err) {
          console.warn("RTDB Update Error:", err);
        }
      }

      if (auth && auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, {
            displayName: data.name,
            photoURL: data.photoURL
          });
        } catch (err) {
          console.warn("Firebase Auth Profile Sync Error:", err);
        }
      }
    }
    this.updateNavUI();
    return this.currentUser;
  }

  renderNotificationListHTML(notifications) {
    if (!notifications || notifications.length === 0) {
      return '<div class="p-3 text-center subtle-text" style="font-size: 0.8rem;">No notifications recorded yet.</div>';
    }

    return notifications.map(n => {
      const d = n.timestamp ? new Date(n.timestamp) : new Date();
      const timeAgo = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const icon = n.type === 'JOIN' ? '🚀' : (n.type === 'ADMIN_PRIVILEGE_CHANGE' ? '👑' : '📩');
      const unreadClass = !n.read ? 'unread-item' : '';
      
      const title = (n.title && n.title !== 'undefined') ? n.title : (n.type === 'JOIN' ? '🚀 New Join Application' : (n.type === 'ADMIN_PRIVILEGE_CHANGE' ? '👑 Admin Privilege Change' : '📩 New Contact Message'));
      const sender = (n.senderName && n.senderName !== 'undefined') ? n.senderName : ((n.senderEmail && n.senderEmail !== 'undefined') ? n.senderEmail : 'Community Member');
      const msg = (n.message && n.message !== 'undefined') ? n.message : (n.interest ? `Interest: ${n.interest}` : 'New submission received');

      return `
        <div class="notif-item ${unreadClass}">
          <div class="d-flex align-items-start gap-2">
            <span style="font-size: 1.1rem;">${icon}</span>
            <div style="flex: 1; min-width: 0;">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <strong style="font-size: 0.82rem; font-family: var(--font-display); color: var(--text-dark);">${title}</strong>
                <span class="mono-text subtle-text" style="font-size: 0.7rem;">${timeAgo}</span>
              </div>
              <p class="mono-text m-0 mb-1" style="font-size: 0.78rem; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden;">${msg}</p>
              ${n.interest ? `<span class="badge bg-secondary mb-1" style="font-size: 0.65rem;">${n.interest}</span>` : ''}
              <div class="d-flex justify-content-between align-items-center">
                <span class="subtle-text" style="font-size: 0.72rem;">From: <strong>${sender}</strong></span>
                ${!n.read ? `<button type="button" class="btn-mark-read-item" data-id="${n.id}" style="font-size: 0.7rem; border: none; background: none; color: #2563eb; cursor: pointer; font-weight: 700;">Mark Read</button>` : '<span class="subtle-text" style="font-size: 0.7rem;">✓ Read</span>'}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // UPDATE NAVBAR UI ACROSS ALL PAGES (NOTIFICATION BELL RESTRICTED ONLY TO ADMINS)
  async updateNavUI() {
    const authContainer = document.getElementById('auth-nav-widget');
    if (!authContainer) return;

    const user = this.getUser();
    const isAdmin = this.isAdmin();
    const isSuper = this.isSuperAdmin();

    let notifHTML = '';

    // ONLY FOR ADMIN USERS: Render Notification Bell Widget & Popover!
    if (isAdmin) {
      const notifications = await this.fetchNotifications();
      const unreadCount = notifications.filter(n => !n.read).length;

      notifHTML = `
        <div class="nav-notif-wrapper me-md-2">
          <button type="button" id="btn-nav-notif" class="nav-notif-bell-btn" title="Live Admin Notifications Center">
            🔔 ${unreadCount > 0 ? `<span class="notif-badge-pill">${unreadCount}</span>` : ''}
          </button>
          <div id="nav-notif-popover" class="nav-notif-popover d-none">
            <div class="notif-popover-header">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <strong style="font-family: var(--font-display); font-size: 0.88rem;">🔔 Admin Notifications</strong>
                <span class="badge bg-primary rounded-pill">${unreadCount} Unread</span>
              </div>
              <button type="button" id="btn-mark-all-read-popover" class="btn btn-sm btn-link p-0 text-decoration-none" style="font-size: 0.75rem; color: #2563eb; font-weight: 700;">Mark all read</button>
            </div>
            <div id="notif-popover-list" class="notif-popover-body">
              ${this.renderNotificationListHTML(notifications)}
            </div>
          </div>
        </div>
      `;
    }

    let authHTML = '';
    if (user) {
      authHTML = `
        <div class="d-flex align-items-center gap-2 me-md-2 position-relative">
          ${isAdmin ? '<a href="admin.html" class="nav-auth-btn" style="background: rgba(16, 185, 129, 0.15); color: #10b981 !important; border: 1px solid #10b981;">⚙️ Admin</a>' : ''}
          <a href="profile.html" class="d-flex align-items-center text-decoration-none">
            <img src="${user.photoURL}" class="nav-user-avatar" title="${user.name} (${isSuper ? 'Super Admin' : (isAdmin ? 'Admin' : 'Member')})" alt="${user.name}">
          </a>
        </div>
      `;
    } else {
      authHTML = `
        <button id="btn-nav-login" class="nav-auth-btn me-md-2">🔑 Sign In</button>
      `;
    }

    authContainer.innerHTML = notifHTML + authHTML;

    // Attach Login Event
    const loginBtn = document.getElementById('btn-nav-login');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.signInWithGoogle());
    }

    // Attach Notification Popover Toggle (ONLY if admin)
    if (isAdmin) {
      const notifBtn = document.getElementById('btn-nav-notif');
      const popover = document.getElementById('nav-notif-popover');
      if (notifBtn && popover) {
        notifBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          popover.classList.toggle('d-none');
        });
        document.addEventListener('click', (e) => {
          if (!popover.contains(e.target) && !notifBtn.contains(e.target)) {
            popover.classList.add('d-none');
          }
        });
      }

      const markAllBtn = document.getElementById('btn-mark-all-read-popover');
      if (markAllBtn) {
        markAllBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await this.markAllNotificationsAsRead();
          this.updateNavUI();
        });
      }

      // Individual mark read buttons
      const popoverList = document.getElementById('notif-popover-list');
      if (popoverList) {
        popoverList.querySelectorAll('.btn-mark-read-item').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            await this.markNotificationAsRead(id);
            this.updateNavUI();
          });
        });
      }
    }
  }
}

window.authManager = new ActualAuthManager();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.authManager) window.authManager.updateNavUI();
  });
} else {
  if (window.authManager) window.authManager.updateNavUI();
}
