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
  update 
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
      this.currentUser.role = (this.currentUser.email && this.currentUser.email.toLowerCase().trim() === EXCLUSIVE_ADMIN_EMAIL) ? "admin" : "user";
      localStorage.setItem('roketry-user', JSON.stringify(this.currentUser));
    }
    
    setTimeout(() => this.updateNavUI(), 50);
    this.initAuthStateListener();
  }

  initAuthStateListener() {
    if (auth) {
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          let rtdbProfile = await this.fetchRTDBProfile(firebaseUser.uid);
          const email = (firebaseUser.email || "").toLowerCase().trim();
          const role = (email === EXCLUSIVE_ADMIN_EMAIL) ? "admin" : "user";

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
        await set(dbRef(db, `users/${profile.uid}`), {
          name: profile.name,
          email: profile.email,
          photoURL: profile.photoURL,
          role: profile.role,
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

  // PUBLISH CUSTOM PROJECT TO FIREBASE REALTIME DATABASE (projects/{id})
  async publishCustomProjectToRTDB(projectData) {
    if (db && projectData.id) {
      try {
        await set(dbRef(db, `projects/${projectData.id}`), {
          ...projectData,
          publishedBy: this.currentUser ? this.currentUser.email : EXCLUSIVE_ADMIN_EMAIL,
          publishedAt: new Date().toISOString()
        });
        return true;
      } catch (err) {
        console.error("RTDB Publish Project Error:", err);
      }
    }
    const localProjects = JSON.parse(localStorage.getItem('roketry-custom-projects')) || {};
    localProjects[projectData.id] = projectData;
    localStorage.setItem('roketry-custom-projects', JSON.stringify(localProjects));
    return true;
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
    return this.currentUser && this.currentUser.email && this.currentUser.email.toLowerCase().trim() === EXCLUSIVE_ADMIN_EMAIL;
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

  // UPDATE NAVBAR UI ACROSS ALL PAGES
  updateNavUI() {
    const authContainer = document.getElementById('auth-nav-widget');
    if (authContainer) {
      const user = this.getUser();
      if (user) {
        const isAdmin = user.email && user.email.toLowerCase().trim() === EXCLUSIVE_ADMIN_EMAIL;
        authContainer.innerHTML = `
          <div class="d-flex align-items-center gap-2 me-md-3">
            ${isAdmin ? '<a href="admin.html" class="nav-auth-btn" style="background: rgba(16, 185, 129, 0.15); color: #10b981 !important; border: 1px solid #10b981;">⚙️ Admin</a>' : ''}
            <a href="profile.html" class="d-flex align-items-center text-decoration-none">
              <img src="${user.photoURL}" class="nav-user-avatar" title="${user.name} (${isAdmin ? 'Admin' : 'Member'})" alt="${user.name}">
            </a>
          </div>
        `;
      } else {
        authContainer.innerHTML = `
          <button id="btn-nav-login" class="nav-auth-btn me-md-3">🔑 Google Sign-In</button>
        `;
        const loginBtn = document.getElementById('btn-nav-login');
        if (loginBtn) {
          loginBtn.addEventListener('click', () => this.signInWithGoogle());
        }
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
