/* ==========================================================================
   ROKETRY — THEME, ANIMATION & REAL ROCKET FLEET DOCUMENTATION SCRIPT
   ========================================================================== */

(function () {
  // 1. Immediately apply saved Notion settings (default to dark mode)
  const savedTheme = localStorage.getItem('roketry-theme') || 'dark';
  const savedFont = localStorage.getItem('notion_font') || 'sans';
  const savedSize = localStorage.getItem('notion_size') || 'medium';
  const savedFullPage = localStorage.getItem('notion_fullpage') === 'true';

  document.documentElement.setAttribute('data-theme', savedTheme);
  document.documentElement.setAttribute('data-font', savedFont);
  document.documentElement.setAttribute('data-size', savedSize);
  if (savedFullPage) {
    document.documentElement.setAttribute('data-full-page', 'true');
  } else {
    document.documentElement.removeAttribute('data-full-page');
  }
})();

/**
 * Global Page URL Resolver
 * Resolves relative URLs seamlessly whether executing from root index.html or src/pages/
 */
window.resolvePageURL = function(path) {
  if (!path || typeof path !== 'string') return path;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('#') || path.startsWith('javascript:')) return path;
  
  const isInSrcPages = window.location.pathname.includes('/src/pages/') || window.location.pathname.endsWith('/src/pages');
  
  let cleanPath = path;
  if (cleanPath.startsWith('../../')) cleanPath = cleanPath.substring(6);
  if (cleanPath.startsWith('../')) cleanPath = cleanPath.substring(3);
  if (cleanPath.startsWith('src/pages/')) cleanPath = cleanPath.substring(10);
  
  if (cleanPath === 'index.html' || cleanPath.startsWith('index.html?')) {
    return isInSrcPages ? `../../${cleanPath}` : cleanPath;
  }
  
  return isInSrcPages ? cleanPath : `src/pages/${cleanPath}`;
};

/**
 * Global Aerospace Domain Category Color & Styling System
 */
window.getDomainCategoryStyle = function(category) {
  const cat = (category || 'fleet').toLowerCase().trim();

  if (cat.includes('sim') || cat.includes('bench')) {
    return {
      key: 'simulators',
      label: 'SIMULATORS',
      icon: '⚡',
      bg: 'rgba(59, 130, 246, 0.14)',
      color: '#60a5fa',
      border: 'rgba(59, 130, 246, 0.35)'
    };
  } else if (cat.includes('sub') || cat.includes('recov') || cat.includes('eject') || cat.includes('pyro')) {
    return {
      key: 'subsystems',
      label: 'SUBSYSTEMS',
      icon: '🛠️',
      bg: 'rgba(139, 92, 246, 0.14)',
      color: '#c084fc',
      border: 'rgba(139, 92, 246, 0.35)'
    };
  } else if (cat.includes('avion') || cat.includes('telem') || cat.includes('computer')) {
    return {
      key: 'avionics',
      label: 'AVIONICS',
      icon: '📡',
      bg: 'rgba(6, 182, 212, 0.14)',
      color: '#22d3ee',
      border: 'rgba(6, 182, 212, 0.35)'
    };
  } else if (cat.includes('propul') || cat.includes('motor') || cat.includes('combust') || cat.includes('solid') || cat.includes('liquid')) {
    return {
      key: 'propulsion',
      label: 'PROPULSION',
      icon: '🔥',
      bg: 'rgba(245, 158, 11, 0.14)',
      color: '#fbbf24',
      border: 'rgba(245, 158, 11, 0.35)'
    };
  } else if (cat.includes('payl') || cat.includes('instrument') || cat.includes('satell')) {
    return {
      key: 'payload',
      label: 'PAYLOAD',
      icon: '🧪',
      bg: 'rgba(236, 72, 153, 0.14)',
      color: '#f472b6',
      border: 'rgba(236, 72, 153, 0.35)'
    };
  } else {
    return {
      key: 'fleet',
      label: (cat && cat !== 'fleet') ? cat.toUpperCase() : 'ROCKET FLEET',
      icon: '🚀',
      bg: 'rgba(16, 185, 129, 0.14)',
      color: '#34d399',
      border: 'rgba(16, 185, 129, 0.35)'
    };
  }
};

document.addEventListener('DOMContentLoaded', () => {
    // 2. Notion-Style Page Settings UI Handler
    function syncNotionUI() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const isFullPage = document.documentElement.getAttribute('data-full-page') === 'true';
      const currentFont = document.documentElement.getAttribute('data-font') || 'sans';
      const currentSize = document.documentElement.getAttribute('data-size') || 'medium';

      document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        btn.innerHTML = isDark ? '<span>☀️</span> Light' : '<span>🌙</span> Dark';
      });

      document.querySelectorAll('.notion-dark-switch').forEach(sw => {
        sw.checked = isDark;
      });

      document.querySelectorAll('.notion-fullpage-switch').forEach(sw => {
        sw.checked = isFullPage;
      });

      document.querySelectorAll('.notion-font-btn').forEach(btn => {
        const fontVal = btn.getAttribute('data-font');
        if (fontVal === currentFont) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      document.querySelectorAll('.notion-size-btn').forEach(btn => {
        const sizeVal = btn.getAttribute('data-size');
        if (sizeVal === currentSize) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    syncNotionUI();

    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('notion-dark-switch')) {
        const newTheme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('roketry-theme', newTheme);
        syncNotionUI();
      } else if (e.target.classList.contains('notion-fullpage-switch')) {
        const isFull = e.target.checked;
        if (isFull) {
          document.documentElement.setAttribute('data-full-page', 'true');
          localStorage.setItem('notion_fullpage', 'true');
        } else {
          document.documentElement.removeAttribute('data-full-page');
          localStorage.setItem('notion_fullpage', 'false');
        }
        syncNotionUI();
      }
    });

    document.addEventListener('click', (e) => {
      const insideNotionMenu = e.target.closest('.notion-settings-dropdown .dropdown-menu');
      if (insideNotionMenu) {
        e.stopPropagation();
      }

      const fontBtn = e.target.closest('.notion-font-btn');
      if (fontBtn) {
        const fontVal = fontBtn.getAttribute('data-font');
        document.documentElement.setAttribute('data-font', fontVal);
        localStorage.setItem('notion_font', fontVal);
        syncNotionUI();
      }

      const sizeBtn = e.target.closest('.notion-size-btn');
      if (sizeBtn) {
        const sizeVal = sizeBtn.getAttribute('data-size');
        document.documentElement.setAttribute('data-size', sizeVal);
        localStorage.setItem('notion_size', sizeVal);
        syncNotionUI();
      }

      const legacyThemeBtn = e.target.closest('.theme-toggle-btn');
      if (legacyThemeBtn) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('roketry-theme', newTheme);
        syncNotionUI();
      }
    });

    // 3. Scroll Reveal Observer for Entrance Motion
    if ('IntersectionObserver' in window) {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      };

      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('active');
            }, (index % 4) * 40);
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      const targets = document.querySelectorAll('.project-card, .stat, .tree-node, .hero-text, .title-centered, .text-center-wrapper, .doc-section-card');
      targets.forEach(target => {
        target.classList.add('reveal-snap');
        revealObserver.observe(target);
      });
    }

    // 4. Advanced Project Category Filter & Keyword Search Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('project-search');
    const treeNodes = document.querySelectorAll('[data-filter-node]');

    let activeFilter = 'all';
    let searchQuery = '';

    function filterProjects() {
      // Re-query the live DOM each time — cards are dynamically replaced after Firebase fetch
      const liveCards = document.querySelectorAll('#projects-container .project-card');
      liveCards.forEach(card => {
        // Skip skeleton placeholder cards
        if (card.classList.contains('skeleton-card')) return;

        const category = (card.getAttribute('data-category') || '').toLowerCase();
        const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
        const textContent = card.textContent.toLowerCase();

        const matchesCategory = activeFilter === 'all' || category === activeFilter || category.includes(activeFilter);
        const matchesSearch = !searchQuery || keywords.includes(searchQuery) || textContent.includes(searchQuery);

        if (matchesCategory && matchesSearch) {
          card.classList.remove('hidden');
          card.style.display = '';
        } else {
          card.classList.add('hidden');
          card.style.display = 'none';
        }
      });
    }

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter');
        filterProjects();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        filterProjects();
      });
    }

    // DYNAMICALLY FETCH & RENDER ALL PROJECTS FROM FIREBASE REALTIME DATABASE WITH YOUTUBE-STYLE SKELETON SHIMMER BUFFER
    const projectsContainer = document.getElementById('projects-container');
    if (projectsContainer) {
      // 1. Render 6 YouTube-Style Skeleton Shimmer Buffer Cards
      const skeletonCardHTML = `
        <div class="project-card skeleton-card">
          <div class="skeleton-box mb-3" style="height: 170px; width: 100%;"></div>
          <div class="skeleton-box mb-2" style="height: 18px; width: 35%;"></div>
          <div class="skeleton-box mb-2" style="height: 24px; width: 85%;"></div>
          <div class="skeleton-box mb-3" style="height: 16px; width: 95%;"></div>
          <div class="skeleton-box" style="height: 32px; width: 110px;"></div>
        </div>
      `;
      projectsContainer.innerHTML = Array(6).fill(skeletonCardHTML).join('');

      // Robust: wait for authManager to be available (up to 5s), then fetch
      async function loadProjectCards() {
        let retries = 0;
        while (!window.authManager && retries < 50) {
          await new Promise(r => setTimeout(r, 100));
          retries++;
        }
        if (!window.authManager) {
          console.warn('authManager not available after 5s');
          return;
        }

        try {
          const allDbProjects = await window.authManager.fetchAllCustomProjectsFromRTDB();
          if (allDbProjects && allDbProjects.length > 0) {
            projectsContainer.innerHTML = ''; // Clear skeleton buffer once fetched!
            
            allDbProjects.forEach(cp => {
              const domStyle = window.getDomainCategoryStyle(cp.category || cp.badge);
              const card = document.createElement('div');
              card.className = 'project-card';
              card.setAttribute('data-id', cp.id);
              card.setAttribute('data-category', cp.category || 'fleet');
              card.setAttribute('data-keywords', `${cp.title} ${cp.subtitle} ${cp.badge} ${cp.id}`.toLowerCase());
              card.style.cursor = 'pointer';

              card.innerHTML = `
                <div>
                  <div class="card-sketch-wrap">
                    <img src="${cp.sketchImg || 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800&auto=format&fit=crop&q=80'}" alt="${cp.title}">
                  </div>
                  <span class="project-badge" style="background: ${domStyle.bg}; color: ${domStyle.color}; border: 1px solid ${domStyle.border}; font-size: 0.68rem; font-weight: 700; padding: 0.2rem 0.65rem; border-radius: 20px; display: inline-flex; align-items: center; gap: 0.3rem;">
                    <span>${domStyle.icon}</span> ${domStyle.label}
                  </span>
                  <h3>${cp.title}</h3>
                  <p>${cp.subtitle || 'Technical rocket documentation page.'}</p>
                </div>
                <div class="status-pill"><span class="status-dot green"></span> ${cp.verification || 'Live Published'}</div>
              `;

              card.addEventListener('click', () => {
                window.location.href = window.resolvePageURL(`project-detail.html?id=${cp.id}`);
              });

              projectsContainer.appendChild(card);
            });

            // Apply any active filter/search after cards are rendered
            filterProjects();
          }
        } catch (err) {
          console.error('Error loading project cards:', err);
        }
      }
      loadProjectCards();
    }

    // HOMEPAGE FEATURED PROJECTS SLIDER (index.html) WITH YOUTUBE-STYLE SKELETON BUFFER
    const sliderContainer = document.querySelector('.projects-slider');
    if (sliderContainer && !projectsContainer) {
      const skeletonCardHTML = `
        <div class="project-card skeleton-card">
          <div class="skeleton-box mb-3" style="height: 150px; width: 100%;"></div>
          <div class="skeleton-box mb-2" style="height: 16px; width: 40%;"></div>
          <div class="skeleton-box mb-2" style="height: 22px; width: 80%;"></div>
          <div class="skeleton-box mb-3" style="height: 14px; width: 90%;"></div>
          <div class="skeleton-box" style="height: 28px; width: 100px;"></div>
        </div>
      `;
      sliderContainer.innerHTML = Array(4).fill(skeletonCardHTML).join('') + `
        <div class="project-card more-card">
          <span><a href="${window.resolvePageURL('project.html')}">View Full Fleet →</a></span>
        </div>
      `;

      async function loadSliderCards() {
        let retries = 0;
        while (!window.authManager && retries < 50) {
          await new Promise(r => setTimeout(r, 100));
          retries++;
        }
        if (!window.authManager) return;

        try {
          const allDbProjects = await window.authManager.fetchAllCustomProjectsFromRTDB();
          if (allDbProjects && allDbProjects.length > 0) {
            sliderContainer.innerHTML = '';
            allDbProjects.slice(0, 5).forEach(cp => {
              const card = document.createElement('div');
              card.className = 'project-card';
              card.setAttribute('data-id', cp.id);
              card.style.cursor = 'pointer';

              card.innerHTML = `
                <div>
                  <div class="card-sketch-wrap">
                    <img src="${cp.sketchImg || 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800&auto=format&fit=crop&q=80'}" alt="${cp.title}">
                  </div>
                  <span class="project-badge">${(cp.badge || 'ROCKET FLEET').toUpperCase()}</span>
                  <h3>${cp.title}</h3>
                  <p>${cp.subtitle || 'Technical rocket documentation page.'}</p>
                </div>
                <div class="status-pill"><span class="status-dot green"></span> ${cp.verification || 'Live Published'}</div>
              `;

              card.addEventListener('click', () => {
                window.location.href = window.resolvePageURL(`project-detail.html?id=${cp.id}`);
              });

              sliderContainer.appendChild(card);
            });

            const moreCard = document.createElement('div');
            moreCard.className = 'project-card more-card';
            moreCard.innerHTML = `<span><a href="${window.resolvePageURL('project.html')}">View Full Fleet →</a></span>`;
            sliderContainer.appendChild(moreCard);
          }
        } catch (err) {
          console.error('Error loading slider cards:', err);
        }
      }
      loadSliderCards();
    }

    treeNodes.forEach(node => {
      node.addEventListener('click', () => {
        const nodeCategory = node.getAttribute('data-filter-node');
        const targetBtn = document.querySelector(`.filter-btn[data-filter="${nodeCategory}"]`);
        if (targetBtn) {
          targetBtn.click();
          const projectsSection = document.getElementById('projects-container');
          if (projectsSection) {
            projectsSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // 5. Dynamic Technical Documentation & Real Rocket Lineup Data
    const docDatabase = {
      model1: {
        title: "Rocket Model-I (Solid Stability Vehicle)",
        subtitle: "SINGLE-STAGE SOLID FUEL ROCKET FOR FLIGHT STABILITY & LOW-ALTITUDE TEST VALIDATION",
        badge: "ROCKET FLEET",
        docId: "DOC-FLEET-01",
        sketchImg: "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800&auto=format&fit=crop&q=80",
        p1: "Rocket Model-I is a single-stage solid-propelled sounding vehicle built to validate high-speed flight aerodynamic stability, fin center-of-pressure alignment, and low-altitude flight computer trajectory tracking.",
        p2: "It serves as the baseline flight platform for all subsequent multistage aerodynamic and recovery hardware testing.",
        specs: [
          ["Propulsion Type", "Solid Fuel Motor (K-Class)", "Composite propellant"],
          ["Target Altitude", "3,500 Feet APOGEE", "Low-altitude test vehicle"],
          ["Stabilization", "Passive Passive Fin Stabilization", "CNC 6061-T6 Aluminum fins"],
          ["Recovery Method", "Single-Stage Parachute Ejection", "Barometric apogee trigger"],
          ["Flight Status", "Field Flight Tested", "100% Mission Success"]
        ]
      },
      model2: {
        title: "Rocket Model-II (Multistage Payload Launcher)",
        subtitle: "LONG-RANGE MULTISTAGE SOLID ROCKET FOR HIGH-ALTITUDE PAYLOAD DEPLOYMENT",
        badge: "ROCKET FLEET",
        docId: "DOC-FLEET-02",
        sketchImg: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=800&auto=format&fit=crop&q=80",
        p1: "Rocket Model-II is a dual-stage solid-fueled vehicle designed for extended range, high-velocity atmospheric flight, and payload deployment.",
        p2: "Equipped with a pneumatic stage separation interlock, dual-deployment telemetry stack, and an active payload bay for scientific atmospheric data collection.",
        specs: [
          ["Stage Architecture", "2-Stage Solid Propulsion", "Inter-stage pneumatic separation"],
          ["Target Altitude", "15,000 Feet APOGEE", "High-altitude payload vehicle"],
          ["Payload Capacity", "1.5 kg Atmospheric CubeSat", "Ejection bay module"],
          ["Telemetry Range", "915MHz LoRa 15km Link", "Real-time ground station"],
          ["Flight Status", "Static Test & Stage Separation Passed", "Flight Launch Ready"]
        ]
      },
      model3: {
        title: "Rocket Model-III (Liquid Engine Lander VTVL)",
        subtitle: "REUSABLE LIQUID-PROPELLED ROCKET WITH PROPULSIVE VERTICAL LANDING TARGET",
        badge: "ROCKET FLEET",
        docId: "DOC-FLEET-03",
        sketchImg: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800&auto=format&fit=crop&q=80",
        p1: "Rocket Model-III represents the pinnacle of our open aerospace program: a liquid-propelled rocket vehicle targeting vertical takeoff and propulsive vertical landing (VTVL).",
        p2: "Utilizes ethanol/LOX liquid propellants, TVC gimballed thrust chamber, and active landing leg deployment for autonomous precision touchdown.",
        specs: [
          ["Propellant System", "Ethanol / Liquid Oxygen (LOX)", "Pressurized feed system"],
          ["Thrust Rating", "250 lbf Variable Thrust", "Regeneratively cooled nozzle"],
          ["Guidance & Control", "TVC Gimbal + Reaction Control", "6-DOF IMU Kalman Fusion"],
          ["Landing Mechanism", "4-Leg Pneumatic Deployment", "Impact shock absorption"],
          ["Development Phase", "Engine Static Testing & TVC Bench Sim", "Sub-Scale Hop Goal"]
        ]
      },
      simulator: {
        title: "Ground Electric Mission Simulator",
        subtitle: "HARDWARE-IN-THE-LOOP GROUND ELECTRIC SIMULATOR FOR ALL ROCKET LAUNCH PHASES",
        badge: "SIMULATOR & HARDWARE",
        docId: "DOC-SUBS-01",
        sketchImg: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
        p1: "The Ground Electric Rocket Simulator is a benchtop hardware-in-the-loop (HIL) test facility that electrically simulates every phase of a rocket launch: ignition, pitch-over, staging, apogee detection, and landing burn.",
        p2: "It allows software engineers to stress-test flight algorithms, sensor failure fallbacks, and pyrotechnic trigger safety loops prior to real flight tests.",
        specs: [
          ["Simulation Modes", "Full Flight Profile (Launch to Touchdown)", "Real-time hardware-in-the-loop"],
          ["Sensor Emulation", "Barometric, IMU, GPS, Voltage Data", "I2C / SPI / Serial Injection"],
          ["Actuator Testing", "Pyro Channel Firing & TVC Servos", "Hardware continuity feedback"],
          ["Telemetry Bridge", "USB / Serial Ground Station Link", "Live graphing & abort injection"],
          ["System Status", "Deployed & In Active Daily Use", "Continuous Integration Bench"]
        ]
      },
      teststand: {
        title: "Solid Motor Static Test Stand",
        subtitle: "INSTRUMENTED STATIC FIRING TEST STAND FOR THRUST & PRESSURE TELEMETRY DATA",
        badge: "TEST FACILITIES",
        docId: "DOC-SUBS-02",
        sketchImg: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
        p1: "The Solid Motor Static Test Stand is a heavy-duty ground facility engineered to capture high-frequency load-cell thrust curves, chamber pressure profiles, and nozzle thermal telemetry during solid motor test firings.",
        p2: "Features an S-type 1000kg load cell, high-speed HX711 sampling amplifier, and automated remote safety key ignition interlocks.",
        specs: [
          ["Load Cell Rating", "1,000 kg S-Type Strain Gauge", "80Hz High-Speed Sampling"],
          ["Pressure Sensing", "1,000 PSI Stainless Transducer", "Chamber pressure profiling"],
          ["Ignition System", "Dual Safety Key Remote Relay", "Optocoupled arming circuit"],
          ["Data Logging", "MicroSD Binary + Serial Telemetry", "Instant CSV CFD comparison"],
          ["Facility Status", "Operational (4 Static Firings Passed)", "Available for Open Data"]
        ]
      },
      recovery: {
        title: "Dual Pyro Recovery & Ejection System",
        subtitle: "REDUNDANT DUAL-STAGE PYROTECHNIC EJECTION & PARACHUTE DEPLOYMENT STACK",
        badge: "SUBSYSTEMS",
        docId: "DOC-SUBS-03",
        sketchImg: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
        p1: "The Dual Pyro Recovery System controls drogue and main parachute deployment for sounding rockets. It uses redundant MOSFET firing switches and optocoupled hardware safety locks.",
        p2: "Triggers drogue chute ejection at detected barometric apogee, followed by main chute release at a pre-programmed 1,000 ft AGL altitude.",
        specs: [
          ["Deployment Stages", "Dual-Stage (Drogue @ Apogee, Main @ 1000ft)", "Redundant altimeters"],
          ["Safety Circuit", "Hardware Safety Key Interlock", "Visual & audio continuity check"],
          ["Firing Current", "12A Peak MOSFET Discharge", "Capacitor charge storage"],
          ["Chute Sizes", "18-inch Drogue & 60-inch Main Chute", "Ripstop Nylon + Kevlar cords"],
          ["System Status", "Flight Validated", "Standard Stack across Fleet"]
        ]
      }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id') || 'model1';

    if (document.getElementById('doc-title')) {
      let data = docDatabase[projectId];

      const renderDocData = (dataToRender) => {
        if (!dataToRender) return;

        if (dataToRender.isHistoricalPreview) {
          const targetVersion = dataToRender.version || 'v1.0';
          const adminUrl = window.resolvePageURL ? window.resolvePageURL(`admin.html?openLogs=${projectId}`) : `admin.html?openLogs=${projectId}`;

          let heroBanner = document.getElementById('historical-preview-banner');
          if (!heroBanner) {
            heroBanner = document.createElement('div');
            heroBanner.id = 'historical-preview-banner';
            heroBanner.className = 'alert alert-warning text-center mono-text fw-bold mb-4 shadow-sm style-box d-flex align-items-center justify-content-between flex-wrap gap-2';
            heroBanner.style.background = 'rgba(245, 158, 11, 0.18)';
            heroBanner.style.borderColor = 'rgba(245, 158, 11, 0.45)';
            heroBanner.style.color = '#fbbf24';
            heroBanner.style.fontSize = '0.85rem';
            heroBanner.style.borderRadius = '12px';
            heroBanner.style.padding = '0.75rem 1.25rem';

            heroBanner.innerHTML = `
              <div class="d-flex align-items-center gap-2">
                <span style="font-size: 1.1rem;">📜</span>
                <span>Previewing Historical Version <strong>${targetVersion}</strong> (Read-Only Snapshot)</span>
              </div>
              <div class="d-flex align-items-center gap-2 flex-wrap ms-auto">
                <a href="${adminUrl}" class="btn btn-sm btn-outline-light" style="font-size: 0.75rem; padding: 4px 12px; border-radius: 6px;">📜 Back to Version Logs</a>
                <button type="button" id="btn-restore-preview-version" class="btn btn-sm btn-warning fw-bold text-dark" style="font-size: 0.75rem; padding: 4px 12px; border-radius: 6px;">🔄 Restore Version ${targetVersion}</button>
                <a href="${window.resolvePageURL ? window.resolvePageURL(`project-detail.html?id=${projectId}`) : `project-detail.html?id=${projectId}`}" class="btn btn-sm btn-outline-warning" style="font-size: 0.75rem; padding: 4px 12px; border-radius: 6px;">Latest Version →</a>
              </div>
            `;

            const docContainer = document.querySelector('.doc-container') || document.querySelector('.container-centered') || document.querySelector('.doc-header');
            if (docContainer && docContainer.parentNode) {
              docContainer.parentNode.insertBefore(heroBanner, docContainer);
            }

            setTimeout(() => {
              const restoreBtn = document.getElementById('btn-restore-preview-version');
              if (restoreBtn) {
                restoreBtn.addEventListener('click', async () => {
                  if (confirm(`🔄 Are you sure you want to restore "${dataToRender.title || projectId}" to version ${targetVersion}? Current project data will be updated to this snapshot.`)) {
                    restoreBtn.disabled = true;
                    restoreBtn.textContent = 'Restoring...';

                    if (window.authManager) {
                      const restoredMsg = `Restored system snapshot to version ${targetVersion}`;
                      const result = await window.authManager.saveCustomProjectToRTDB(restoredMsg, {
                        ...dataToRender,
                        id: projectId
                      });
                      if (result) {
                        alert(`🎉 Successfully restored "${dataToRender.title || projectId}" to version ${targetVersion}!`);
                        window.location.href = window.resolvePageURL ? window.resolvePageURL(`project-detail.html?id=${projectId}`) : `project-detail.html?id=${projectId}`;
                      } else {
                        alert('Failed to restore version snapshot.');
                        restoreBtn.disabled = false;
                      }
                    }
                  }
                });
              }
            }, 100);
          }
        }

        document.getElementById('doc-title').textContent = dataToRender.title;
        document.getElementById('doc-subtitle').textContent = dataToRender.subtitle;
        document.getElementById('doc-badge').textContent = dataToRender.badge || 'PROJECT';
        document.getElementById('doc-id').textContent = dataToRender.docId || 'DOC-CUSTOM-01';
        document.getElementById('doc-overview-p1').textContent = dataToRender.p1;
        document.getElementById('doc-overview-p2').textContent = dataToRender.p2 || '';
        const domStyle = window.getDomainCategoryStyle(dataToRender.category || dataToRender.badge);
        const docCategory = document.getElementById('doc-category');

        if (docCategory) {
          docCategory.innerHTML = `<span>${domStyle.icon}</span> ${domStyle.label}`;
          docCategory.style.background = domStyle.bg;
          docCategory.style.color = domStyle.color;
          docCategory.style.border = `1px solid ${domStyle.border}`;
          docCategory.style.padding = '0.2rem 0.75rem';
          docCategory.style.borderRadius = '20px';
        }

        const sketchImg = document.getElementById('doc-sketch-img');
        if (sketchImg && dataToRender.sketchImg) {
          sketchImg.src = dataToRender.sketchImg;
        }

        const metaVersion = document.getElementById('doc-meta-version');
        if (metaVersion) {
          metaVersion.textContent = dataToRender.version || 'v1.0';
        }

        const metaAuthor = document.getElementById('doc-meta-author');
        if (metaAuthor) {
          metaAuthor.textContent = (dataToRender.authors && dataToRender.authors.length > 0) ? dataToRender.authors[0].name : (dataToRender.author || 'Rocket Lead');
        }

        const metaDomain = document.getElementById('doc-meta-domain');
        if (metaDomain) {
          metaDomain.innerHTML = `<span class="badge" style="background: ${domStyle.bg}; color: ${domStyle.color}; border: 1px solid ${domStyle.border}; font-size: 0.72rem; font-weight: 700;">${domStyle.icon} ${domStyle.label}</span>`;
        }

        const metaVerification = document.getElementById('doc-meta-verification');
        if (metaVerification) {
          metaVerification.textContent = dataToRender.verification || 'Field Verified';
        }

        // Render Authors & Team Members Widget in Sidebar
        const teamListContainer = document.getElementById('doc-team-members-list');
        if (teamListContainer) {
          let teamHTML = '';
          const authorName = (dataToRender.authors && dataToRender.authors.length > 0 && dataToRender.authors[0].name) ? dataToRender.authors[0].name : (dataToRender.author || 'Aman Choudhary');
          const authorEmail = (dataToRender.authors && dataToRender.authors.length > 0 && dataToRender.authors[0].email) ? dataToRender.authors[0].email : (dataToRender.authorEmail || 'mbatwc@gmail.com');
          const authorPhoto = (dataToRender.authors && dataToRender.authors.length > 0 && dataToRender.authors[0].photoURL) ? dataToRender.authors[0].photoURL : (dataToRender.authorPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');

          teamHTML += `
            <div class="d-flex align-items-center gap-2 p-2 rounded style-box" style="background: var(--bg-tree-bg); border: 1px solid var(--border-color);">
              <img src="${authorPhoto}" class="avatar-circle" style="width: 36px; height: 36px; object-fit: cover;" alt="${authorName}">
              <div style="overflow: hidden; flex: 1;">
                <div class="d-flex align-items-center gap-1 flex-wrap mb-0.5">
                  <span class="fw-bold text-truncate" style="font-size: 0.82rem; color: var(--text-dark);">${authorName}</span>
                  <span class="notion-role-pill" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35); font-size: 0.62rem; padding: 0.1rem 0.45rem;">👑 LEAD AUTHOR</span>
                </div>
                ${authorEmail ? `<span class="subtle-text mono-text d-block text-truncate" style="font-size: 0.7rem;">✉️ ${authorEmail}</span>` : ''}
              </div>
            </div>
          `;

          let contribList = [];
          if (Array.isArray(dataToRender.contributors)) {
            contribList = dataToRender.contributors;
          } else if (dataToRender.contributors && typeof dataToRender.contributors === 'object') {
            contribList = Object.values(dataToRender.contributors);
          }

          if (contribList.length > 0) {
            contribList.forEach(c => {
              const cName = c.name || c.email || 'Contributor';
              const cRole = (c.role || 'MEMBER').toUpperCase();
              const cPhoto = c.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

              teamHTML += `
                <div class="d-flex align-items-center gap-2 p-2 rounded style-box" style="background: var(--bg-tree-bg); border: 1px solid var(--border-color);">
                  <img src="${cPhoto}" class="avatar-circle" style="width: 32px; height: 32px; object-fit: cover;" alt="${cName}">
                  <div style="overflow: hidden; flex: 1;">
                    <div class="d-flex align-items-center gap-1 flex-wrap mb-0.5">
                      <span class="fw-bold text-truncate" style="font-size: 0.8rem; color: var(--text-dark);">${cName}</span>
                      <span class="notion-role-pill" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.35); font-size: 0.62rem; padding: 0.1rem 0.45rem;">⚡ ${cRole}</span>
                    </div>
                    ${c.email ? `<span class="subtle-text mono-text d-block text-truncate" style="font-size: 0.68rem;">✉️ ${c.email}</span>` : ''}
                  </div>
                </div>
              `;
            });
          }

          teamListContainer.innerHTML = teamHTML;
        }

        // Render Revision History in Sidebar
        const historyBox = document.getElementById('doc-history-box');
        const historyList = document.getElementById('doc-history-list');
        if (historyBox && historyList) {
          let histArray = [];
          if (Array.isArray(dataToRender.history)) {
            histArray = dataToRender.history;
          } else if (dataToRender.history && typeof dataToRender.history === 'object') {
            histArray = Object.values(dataToRender.history);
          }

          if (histArray.length > 0) {
            historyBox.style.display = 'block';
            historyList.innerHTML = histArray.slice().reverse().map(h => {
              const d = h.editedAt ? new Date(h.editedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Live';
              return `
                <li class="mb-2" style="border-bottom: 1px dashed var(--border-color); padding-bottom: 4px;">
                  <div class="d-flex align-items-center justify-content-between">
                    <span class="changelog-field-badge field-title" style="font-size: 0.68rem;">${h.version || 'v1.0'}</span>
                    <span class="subtle-text" style="font-size: 0.72rem;">${d}</span>
                  </div>
                  <div style="font-size: 0.78rem; font-weight: 600; margin-top: 2px;">${h.commitMessage || 'Documentation update'}</div>
                  <span class="subtle-text" style="font-size: 0.7rem;">by ${h.editorName || h.editedBy || 'Admin'}</span>
                </li>
              `;
            }).join('');
          } else {
            historyBox.style.display = 'none';
          }
        }

        const subContainer = document.getElementById('doc-subsystem-tags');
        if (subContainer) {
          subContainer.className = 'd-flex flex-column gap-2 mt-2';
          let subList = [];
          if (Array.isArray(dataToRender.subsystems)) {
            subList = dataToRender.subsystems;
          } else if (dataToRender.subsystems && typeof dataToRender.subsystems === 'object') {
            subList = Object.values(dataToRender.subsystems);
          } else if (Array.isArray(dataToRender.related)) {
            subList = dataToRender.related.map(r => ({ name: r.title, slug: r.url, color: 'blue' }));
          } else if (dataToRender.related && typeof dataToRender.related === 'object') {
            subList = Object.values(dataToRender.related).map(r => ({ name: r.title, slug: r.url, color: 'blue' }));
          }

          // Fallback if no subsystem tags linked to this project
          if (subList.length === 0) {
            const defaultPool = [
              { name: "Solid Motor Propulsion", slug: "teststand", color: "orange" },
              { name: "Dual Pyro Recovery Stack", slug: "recovery", color: "green" },
              { name: "Hardware Mission Simulator", slug: "simulator", color: "purple" }
            ];
            subList = defaultPool.filter(s => s.slug !== projectId);
          }

          const colors = ['green', 'orange', 'purple', 'blue', 'pink'];
          subContainer.innerHTML = subList.map((s, idx) => {
            const tagColor = s.color || colors[idx % colors.length];
            const targetUrl = window.resolvePageURL(s.slug ? `project-detail.html?id=${s.slug}` : `project.html`);
            return `
              <a href="${targetUrl}" class="text-decoration-none w-100">
                <span class="notion-tag notion-tag-${tagColor} w-100 p-2 justify-content-start" style="border-radius: 8px; font-size: 0.82rem; font-weight: 700;">🧩 ${s.name || s.title}</span>
              </a>
            `;
          }).join('');
        }

        const tbody = document.getElementById('doc-specs-body');
        if (tbody && dataToRender.specs) {
          tbody.innerHTML = dataToRender.specs.map(row => `
            <tr>
              <td>${row[0]}</td>
              <td>${row[1]}</td>
              <td>${row[2]}</td>
            </tr>
          `).join('');
        }

        // Render Authors & Contributors with registered avatar photos
        if (dataToRender.authors && dataToRender.authors.length > 0) {
          const contribList = document.querySelector('.contributor-list');
          if (contribList) {
            contribList.innerHTML = dataToRender.authors.map(a => {
              const avatarHTML = a.photoURL 
                ? `<img src="${a.photoURL}" class="avatar-circle" style="object-fit: cover;" alt="${a.name}">` 
                : `<span class="avatar-circle">${a.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}</span>`;
              return `
                <div class="contributor-item">
                  ${avatarHTML}
                  <div>
                    <div style="font-size: 0.85rem; font-weight: 700;">${a.name}</div>
                    <span class="subtle-text">${a.role}</span>
                  </div>
                </div>
              `;
            }).join('');
          }
        }

        // Render Hierarchical Sections & Components (Notion 2-Column Grid or Stack Layout)
        if (dataToRender.sections && dataToRender.sections.length > 0) {
          const mainArticle = document.querySelector('.doc-main-article');
          if (mainArticle) {
            // Clear static template sections to render only custom added sections!
            mainArticle.innerHTML = '';

            dataToRender.sections.forEach((sec, idx) => {
              const secCard = document.createElement('div');
              secCard.className = 'doc-section-card';
              secCard.id = `sec-${idx + 1}`;

              let componentsHTML = '';
              if (sec.components && sec.components.length > 0) {
                const gridClass = sec.layout === 'grid-2col' ? 'section-components-grid grid-2col' : 'section-components-grid';
                
                componentsHTML = `<div class="${gridClass}">` + sec.components.map(b => {
                  if (b.type === 'image') {
                    return `
                      <div class="p-3 text-center style-box" style="background: var(--bg-tree-bg); border-radius: 8px;">
                        <img src="${b.imgUrl}" alt="Illustration" style="max-width: 100%; max-height: 380px; border-radius: 6px;" class="mb-2">
                        ${b.caption ? `<p class="mono-text subtle-text m-0" style="font-size: 0.82rem;">${b.caption}</p>` : ''}
                      </div>
                    `;
                  } else if (b.type === 'latex') {
                    return `
                      <div class="p-3 text-center style-box" style="background: var(--bg-tree-bg); border-radius: 8px;">
                        <span style="font-size: 1.2rem;">\\( ${b.formula} \\)</span>
                      </div>
                    `;
                  } else if (b.type === 'code') {
                    return `
                      <div class="code-editor-box">
                        <div class="code-header"><span>📄 ${b.filename}</span><span>C++</span></div>
                        <pre class="code-block"><code>${b.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
                      </div>
                    `;
                  } else if (b.type === 'diagram') {
                    return `
                      <div class="diagram-box">
                        <div class="diagram-title">FLOW DIAGRAM</div>
                        <pre class="code-block"><code>${b.diagramText}</code></pre>
                      </div>
                    `;
                  } else if (b.type === 'graph') {
                    const graphId = `chart_pub_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
                    setTimeout(() => {
                      const canvas = document.getElementById(graphId);
                      if (!canvas || !window.Chart) return;
                      const isArea = b.chartType === 'area';
                      const realType = isArea ? 'line' : (b.chartType || 'line');

                      let rawDs = b.datasets;
                      if (!rawDs || !Array.isArray(rawDs) || rawDs.length === 0) {
                        rawDs = [{ label: b.legendTitle || 'Dataset', data: b.values || [0, 3.2, 8.5, 10.2, 10.4, 9.8, 4.1, 0], color: b.lineColor || '#10b981' }];
                      }

                      const chartDatasets = rawDs.map(ds => {
                        const color = ds.color || '#10b981';
                        return {
                          label: ds.label || 'Dataset',
                          data: ds.data || [],
                          borderColor: color,
                          backgroundColor: isArea ? `${color}33` : (realType === 'bar' ? `${color}aa` : 'transparent'),
                          fill: isArea,
                          borderWidth: 2.5,
                          tension: 0.35,
                          pointBackgroundColor: color,
                          pointRadius: 4
                        };
                      });

                      new window.Chart(canvas.getContext('2d'), {
                        type: realType,
                        data: {
                          labels: b.labels || [0, 1, 2, 3, 4, 5, 6, 7],
                          datasets: chartDatasets
                        },
                        options: {
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { labels: { color: '#e2e8f0', font: { family: 'Space Mono', size: 12 } } }
                          },
                          scales: {
                            x: {
                              title: { display: !!b.xLabel, text: b.xLabel, color: '#94a3b8', font: { family: 'Space Mono' } },
                              grid: { color: 'rgba(255, 255, 255, 0.08)' },
                              ticks: { color: '#94a3b8' }
                            },
                            y: {
                              title: { display: !!b.yLabel, text: b.yLabel, color: '#94a3b8', font: { family: 'Space Mono' } },
                              grid: { color: 'rgba(255, 255, 255, 0.08)' },
                              ticks: { color: '#94a3b8' }
                            }
                          }
                        }
                      });
                    }, 150);

                    return `
                      <div class="p-3 style-box mb-3 w-100" style="background: var(--bg-card); border-radius: 12px;">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                          <span class="mono-text fw-bold text-success" style="font-size: 0.85rem;">📊 ${b.legendTitle || 'Interactive Multi-Series Data Chart'}</span>
                          <span class="subtle-text mono-text" style="font-size: 0.75rem;">Multi-Column Plot</span>
                        </div>
                        <div style="position: relative; height: 320px; width: 100%;">
                          <canvas id="${graphId}"></canvas>
                        </div>
                      </div>
                    `;
                  } else if (b.type === 'roadmap') {
                    const rData = b.roadmapData || { title: 'System Architecture Roadmap', branches: [] };
                    const mapId = `roadmap_pub_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

                    setTimeout(() => {
                      const wrap = document.getElementById(mapId);
                      if (!wrap) return;
                      const svg = wrap.querySelector('.roadmap-cmp-svg');
                      const rootNode = wrap.querySelector('.mindmap-root-node');
                      if (!svg || !rootNode) return;

                      function renderConnectorLines() {
                        svg.innerHTML = `
                          <defs>
                            <marker id="cmp-pub-arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                              <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6"/>
                            </marker>
                            <marker id="cmp-pub-arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                              <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981"/>
                            </marker>
                            <marker id="cmp-pub-arrow-orange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b"/>
                            </marker>
                            <marker id="cmp-pub-arrow-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                              <path d="M 0 0 L 10 5 L 0 10 z" fill="#8b5cf6"/>
                            </marker>
                          </defs>
                        `;

                        const rx = rootNode.offsetLeft + rootNode.offsetWidth / 2;
                        const ry = rootNode.offsetTop + rootNode.offsetHeight;

                        const getBoxSnapPoint = (fromPt, boxEl) => {
                          const bX = boxEl.offsetLeft;
                          const bY = boxEl.offsetTop;
                          const bW = boxEl.offsetWidth;
                          const bH = boxEl.offsetHeight;

                          const sides = [
                            { side: 'top', x: bX + bW / 2, y: bY, cX: bX + bW / 2, cY: bY - 40 },
                            { side: 'bottom', x: bX + bW / 2, y: bY + bH, cX: bX + bW / 2, cY: bY + bH + 40 },
                            { side: 'left', x: bX, y: bY + bH / 2, cX: bX - 40, cY: bY + bH / 2 },
                            { side: 'right', x: bX + bW, y: bY + bH / 2, cX: bX + bW + 40, cY: bY + bH / 2 }
                          ];

                          let minDst = Infinity;
                          let bestSide = sides[0];
                          sides.forEach(s => {
                            const dst = Math.hypot(fromPt.x - s.x, fromPt.y - s.y);
                            if (dst < minDst) {
                              minDst = dst;
                              bestSide = s;
                            }
                          });
                          return bestSide;
                        };

                        wrap.querySelectorAll('.mindmap-main-branch-box').forEach(box => {
                          const color = box.getAttribute('data-color') || '#3b82f6';
                          const endSnap = getBoxSnapPoint({ x: rx, y: ry }, box);
                          const bx = endSnap.x, by = endSnap.y;

                          let markerId = 'cmp-pub-arrow-blue';
                          if (color.includes('10b981') || color.includes('green')) markerId = 'cmp-pub-arrow-green';
                          else if (color.includes('f59e0b') || color.includes('orange')) markerId = 'cmp-pub-arrow-orange';
                          else if (color.includes('8b5cf6') || color.includes('purple')) markerId = 'cmp-pub-arrow-purple';

                          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                          const cX1 = rx, cY1 = ry + 45;
                          const cX2 = endSnap.cX, cY2 = endSnap.cY;
                          const d = `M ${rx},${ry} C ${cX1},${cY1} ${cX2},${cY2} ${bx},${by}`;
                          path.setAttribute('d', d);
                          path.setAttribute('stroke', color);
                          path.setAttribute('stroke-width', '3');
                          path.setAttribute('fill', 'none');
                          path.setAttribute('stroke-linecap', 'round');
                          path.setAttribute('marker-end', `url(#${markerId})`);
                          svg.appendChild(path);

                          // Subnodes Lines
                          const parentId = box.getAttribute('data-id');
                          if (parentId) {
                            wrap.querySelectorAll(`.mindmap-subnode-wrapper[data-parentid="${parentId}"]`).forEach(subBox => {
                              const sbX = subBox.offsetLeft + subBox.offsetWidth / 2;
                              const sbY = subBox.offsetTop;
                              const pBx = box.offsetLeft + box.offsetWidth / 2;
                              const pBy = box.offsetTop + box.offsetHeight;

                              const subPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                              const sd = `M ${pBx},${pBy} C ${pBx},${pBy + 25} ${sbX},${sbY - 25} ${sbX},${sbY}`;
                              subPath.setAttribute('d', sd);
                              subPath.setAttribute('stroke', color);
                              subPath.setAttribute('stroke-width', '2');
                              subPath.setAttribute('stroke-dasharray', '4 3');
                              subPath.setAttribute('fill', 'none');
                              subPath.setAttribute('marker-end', `url(#${markerId})`);
                              svg.appendChild(subPath);
                            });
                          }
                        });
                      }

                      setTimeout(renderConnectorLines, 100);
                      window.addEventListener('resize', renderConnectorLines);
                    }, 150);

                    const rootX = rData.rootX !== undefined ? rData.rootX : 340;
                    const rootY = rData.rootY !== undefined ? rData.rootY : 20;

                    const branchesHTML = (rData.branches || []).map((br, idx) => {
                      const color = br.color || '#3b82f6';
                      const isLink = br.type === 'link' || !!br.slug;
                      const linkUrl = br.slug ? window.resolvePageURL(`project-detail.html?id=${br.slug}`) : '#';
                      const defaultX = (idx % 2 === 0 ? 120 : 520);
                      const defaultY = 130 + Math.floor(idx / 2) * 140;
                      const bx = br.x !== undefined ? br.x : defaultX;
                      const by = br.y !== undefined ? br.y : defaultY;
                      const brId = br.id || `br_${idx}`;

                      const subsHTML = (br.subnodes || []).map((s, sIdx) => {
                        const sx = s.x !== undefined ? s.x : (bx + 20);
                        const sy = s.y !== undefined ? s.y : (by + 110 + sIdx * 45);
                        return `
                          <div class="mindmap-subnode-wrapper d-flex align-items-center gap-1 p-2 style-box" data-subid="${s.id || sIdx}" data-parentid="${brId}" style="position: absolute; left: ${sx}px; top: ${sy}px; z-index: 4; background: var(--bg-card); border-radius: 14px; border: 1px solid ${color}; font-size: 0.76rem; font-weight: 700; min-width: 150px;">
                            <span>🚀</span> ${s.title}
                          </div>
                        `;
                      }).join('');

                      let boxBodyHTML = '';
                      if (isLink) {
                        boxBodyHTML = `
                          <div class="mindmap-main-branch-box style-box p-3" data-id="${brId}" data-color="${color}" style="position: absolute; left: ${bx}px; top: ${by}px; z-index: 5; width: 260px; background: var(--bg-card); border: 2px solid ${color}; border-radius: 12px; cursor: pointer;" ondblclick="window.location.href='${linkUrl}'">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                              <span class="badge" style="background: ${color}; color: #fff; font-size: 0.65rem;">${br.tag || 'LINKED PROJECT'}</span>
                            </div>
                            <h4 style="font-size: 0.95rem; font-weight: 800; margin: 0.2rem 0;"><a href="${linkUrl}" class="text-decoration-none text-reset">🚀 ${br.title}</a></h4>
                            <a href="${linkUrl}" class="repo-action-btn primary-btn mt-2 d-inline-block" style="font-size: 0.72rem; padding: 0.25rem 0.6rem;">Explore Project →</a>
                          </div>
                          ${subsHTML}
                        `;
                      } else {
                        boxBodyHTML = `
                          <div class="mindmap-main-branch-box style-box p-3" data-id="${brId}" data-color="${color}" style="position: absolute; left: ${bx}px; top: ${by}px; z-index: 5; width: 260px; background: var(--bg-card); border: 2px solid ${color}; border-radius: 12px;">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                              <span class="badge" style="background: ${color}; color: #fff; font-size: 0.65rem;">${br.tag || 'TEXT FIELD'}</span>
                            </div>
                            <h4 style="font-size: 0.95rem; font-weight: 800; margin: 0.2rem 0; color: var(--text-dark);">📝 ${br.title}</h4>
                          </div>
                          ${subsHTML}
                        `;
                      }
                      return boxBodyHTML;
                    }).join('');

                    return `
                      <div class="p-3 style-box mb-3 w-100" style="background: var(--bg-card); border-radius: 12px;">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                          <span class="mono-text fw-bold text-primary" style="font-size: 0.85rem;">🗺️ ${rData.title || 'System Architecture Roadmap'}</span>
                          <span class="subtle-text mono-text" style="font-size: 0.75rem;">Interactive System Map (Double-click link to open)</span>
                        </div>
                        <div id="${mapId}" class="mindmap-viewport style-box position-relative overflow-auto" style="min-height: 440px; background: var(--bg-tree-bg); border-radius: 8px;">
                          <div class="mindmap-canvas-inner position-relative" style="width: 950px; min-height: 480px;">
                            <svg class="roadmap-cmp-svg position-absolute top-0 start-0 w-100 h-100" style="pointer-events: none; z-index: 1;"></svg>
                            <div class="mindmap-root-node style-box p-2 px-4 text-center fw-bold" style="position: absolute; left: ${rootX}px; top: ${rootY}px; font-size: 1.1rem; background: var(--bg-card); border: 2px solid var(--primary-color); border-radius: 12px; z-index: 6;">
                              ${rData.title || 'Development Tree'}
                            </div>
                            <div class="roadmap-cmp-branches-list" style="position: relative; width: 100%; height: 100%;">
                              ${branchesHTML}
                            </div>
                          </div>
                        </div>
                      </div>
                    `;
                   } else if (b.type === 'text') {
                    const txt = (b.content && b.content !== 'undefined' && b.content !== 'null') ? b.content : (b.text && b.text !== 'undefined' ? b.text : '');
                    return txt ? `<div class="p-3 style-box mb-3 w-100" style="background: var(--bg-card); border-radius: 8px;"><p class="m-0" style="font-size: 0.92rem; line-height: 1.6; color: var(--text-dark);">${txt}</p></div>` : '';
                  } else {
                    const txt = (b.content && b.content !== 'undefined' && b.content !== 'null') ? b.content : (b.text && b.text !== 'undefined' ? b.text : '');
                    return txt ? `<div class="p-3 style-box mb-3 w-100" style="background: var(--bg-card); border-radius: 8px;"><p class="m-0" style="font-size: 0.92rem; line-height: 1.6; color: var(--text-dark);">${txt}</p></div>` : '';
                  }
                }).join('') + `</div>`;
              }

              secCard.innerHTML = `
                <h2 class="doc-section-heading">${sec.title}</h2>
                ${componentsHTML}
              `;

              mainArticle.appendChild(secCard);
            });

            if (window.MathJax) {
              window.MathJax.typesetPromise();
            }
          }
        }

        // Auto Generate Table of Contents in Sidebar for Custom Projects
        const tocUl = document.querySelector('.sidebar-nav-links');
        if (tocUl) {
          const headings = document.querySelectorAll('.doc-main-article .doc-section-card h2');
          if (headings.length > 0) {
            tocUl.innerHTML = Array.from(headings).map((h2, idx) => {
              const card = h2.closest('.doc-section-card');
              const secId = card.id || `sec-${idx + 1}`;
              card.id = secId;
              return `<li><a href="#${secId}">📌 ${h2.textContent.trim()}</a></li>`;
            }).join('') + '<li style="margin-top: 0.5rem;"><a href="project.html">← All Projects Catalog</a></li>';
          }
        }
      };

      // 1. Render YouTube-Style Skeleton Shimmer placeholders on fetch start
      const docTitle = document.getElementById('doc-title');
      const docSubtitle = document.getElementById('doc-subtitle');
      const overviewP = document.getElementById('doc-overview-p1');
      if (docTitle) docTitle.innerHTML = '<span class="skeleton-box" style="height: 36px; width: 70%; display: block; margin-bottom: 8px;"></span>';
      if (docSubtitle) docSubtitle.innerHTML = '<span class="skeleton-box" style="height: 18px; width: 90%; display: block;"></span>';
      if (overviewP) overviewP.innerHTML = '<span class="skeleton-box mb-2" style="height: 16px; width: 100%; display: block;"></span><span class="skeleton-box mb-2" style="height: 16px; width: 95%; display: block;"></span><span class="skeleton-box" style="height: 16px; width: 80%; display: block;"></span>';

      // 2. Fetch live project data from Firebase Realtime Database with smooth shimmer transition
      (async () => {
        let retries = 0;
        while (!window.authManager && retries < 50) {
          await new Promise(r => setTimeout(r, 100));
          retries++;
        }

        let customData = null;
        if (window.authManager) {
          try {
            customData = await window.authManager.fetchCustomProjectFromRTDB(projectId);
          } catch (err) {
            console.warn('Error loading live project detail:', err);
          }
        }

        let finalData = customData || docDatabase[projectId] || docDatabase['model1'];

        // Version Preview Handler: Intercept URL parameter 'v' to render historical snapshot data
        const targetVersion = urlParams.get('v');
        if (targetVersion && finalData) {
          let matchedHistoryItem = null;
          if (Array.isArray(finalData.history)) {
            matchedHistoryItem = finalData.history.find(h => h.version === targetVersion);
          } else if (finalData.history && typeof finalData.history === 'object') {
            matchedHistoryItem = Object.values(finalData.history).find(h => h.version === targetVersion);
          }

          if (matchedHistoryItem && matchedHistoryItem.snapshotData) {
            finalData = {
              ...matchedHistoryItem.snapshotData,
              version: targetVersion,
              isHistoricalPreview: true
            };
          } else {
            finalData.version = targetVersion;
            finalData.isHistoricalPreview = true;
          }
        }

        setTimeout(() => {
          renderDocData(finalData);
        }, 300);
      })();
    }

    // Make project cards clickable across project.html & index.html to navigate to project technical documentation
    document.querySelectorAll('.project-card').forEach(card => {
      if (!card.classList.contains('more-card')) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
          if (e.target.tagName !== 'A') {
            const id = card.getAttribute('data-id') || 'model1';
            window.location.href = window.resolvePageURL(`project-detail.html?id=${id}`);
          }
        });
      }
    });

    // 6. Table of Contents Active Link Scroll Observer
    const tocLinks = document.querySelectorAll('.sidebar-nav-links a[href^="#"]');
    if (tocLinks.length > 0) {
      const docSections = document.querySelectorAll('.doc-section-card[id]');
      const tocObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            tocLinks.forEach(link => {
              if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active-toc');
              } else {
                link.classList.remove('active-toc');
              }
            });
          }
        });
      }, { threshold: 0.35 });

      docSections.forEach(sec => tocObserver.observe(sec));
    }

    // 7. Navbar Authentication Widget Renderer
    const authContainer = document.getElementById('auth-nav-widget');
    if (authContainer && window.authManager) {
      const auth = window.authManager;
      const user = auth.getUser();

      if (user) {
        authContainer.innerHTML = `
          <div class="d-flex align-items-center gap-2 me-md-3">
            ${user.role === 'admin' ? '<a href="admin.html" class="nav-auth-btn" style="background: rgba(16, 185, 129, 0.15); color: #10b981 !important; border: 1px solid #10b981;">⚙️ Admin</a>' : ''}
            <a href="profile.html" class="d-flex align-items-center text-decoration-none">
              <img src="${user.photoURL}" class="nav-user-avatar" title="${user.name}" alt="${user.name}">
            </a>
          </div>
        `;
      } else {
        authContainer.innerHTML = `
          <button id="btn-nav-login" class="nav-auth-btn me-md-3">🔑 Google Login</button>
        `;
        const loginBtn = document.getElementById('btn-nav-login');
        if (loginBtn) {
          loginBtn.addEventListener('click', async () => {
            await auth.signInWithGoogle();
            window.location.href = 'profile.html';
          });
        }
      }
    }

    // GLOBAL CONTACT & JOIN FORM SUBMISSION NOTIFICATION HANDLER
    document.querySelectorAll('.contact-form').forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = form.querySelector('input[type="text"]');
        const emailInput = form.querySelector('input[type="email"]');
        const messageInput = form.querySelector('textarea');
        const selectInput = form.querySelector('select');
        const submitBtn = form.querySelector('button[type="submit"]');

        const senderName = nameInput ? nameInput.value.trim() : 'Community Member';
        const senderEmail = emailInput ? emailInput.value.trim() : 'member@roketry.org';
        const message = messageInput ? messageInput.value.trim() : '';
        const interest = selectInput ? selectInput.value : '';

        const isJoinForm = window.location.pathname.includes('join.html') || !!selectInput;

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = '⏳ Sending Notification...';
        }

        if (window.authManager) {
          await window.authManager.submitNotification({
            type: isJoinForm ? 'JOIN' : 'CONTACT',
            title: isJoinForm ? '🚀 New Join Application' : '📩 New Contact Message',
            senderName: senderName,
            senderEmail: senderEmail,
            message: message || `Application interest: ${interest || 'General'}`,
            interest: interest,
            timestamp: new Date().toISOString()
          });

          await window.authManager.updateNavUI();
        }

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = isJoinForm ? '✓ Application Submitted!' : '✓ Message Sent!';
        }

        alert(`🎉 ${isJoinForm ? 'Application' : 'Message'} Sent!\n\nNotification dispatched live to Admin & Notification Center.`);
        form.reset();

        setTimeout(() => {
          if (submitBtn) submitBtn.textContent = isJoinForm ? 'Join Community' : 'Send Message';
        }, 3000);
      });
    });

    /* ==========================================================================
       UNIVERSAL IN-CONTEXT EDITING, NOTION-STYLE BLOCK BUILDER & AUTO-SAVE SYNC
       ========================================================================== */
    let pageKey = 'home';
    if (window.location.pathname.includes('about.html')) pageKey = 'about';
    else if (window.location.pathname.includes('join.html')) pageKey = 'join';
    else if (window.location.pathname.includes('project.html') && !window.location.pathname.includes('project-detail.html')) pageKey = 'project';
    else if (window.location.pathname.includes('roadmap.html')) pageKey = 'roadmap';

    let autoSaveTimeout = null;

    // 1. Auto-Save Page Updates Live to Firebase RTDB
    const autoSaveSitePage = async () => {
      if (!window.authManager || !window.authManager.isAdmin()) return;
      
      clearTimeout(autoSaveTimeout);
      autoSaveTimeout = setTimeout(async () => {
        const heroT = document.querySelector('.title-centered') || document.querySelector('.title');
        const heroSub = document.querySelector('.subtitle');

        const payload = {
          heroTitle: heroT ? heroT.textContent.trim() : '',
          heroSubtitle: heroSub ? heroSub.textContent.trim() : '',
          snapSections: []
        };

        // Collect custom snap sections & internal components
        document.querySelectorAll('.custom-snap-section').forEach(sec => {
          const titleEl = sec.querySelector('.custom-section-heading');
          const subEl = sec.querySelector('.custom-section-text');

          const comps = [];
          sec.querySelectorAll('.custom-block-wrapper').forEach(block => {
            const headingEl = block.querySelector('.custom-section-heading');
            const paraEl = block.querySelector('.custom-section-text');
            const listEl = block.querySelector('.custom-bullet-list');
            const toggleEl = block.querySelector('.custom-toggle-box');
            const cardEl = block.querySelector('.project-card');

            if (headingEl) comps.push({ type: 'heading', content: headingEl.textContent.trim() });
            else if (paraEl && !cardEl) comps.push({ type: 'paragraph', content: paraEl.textContent.trim() });
            else if (listEl) {
              const items = [];
              listEl.querySelectorAll('.custom-list-item').forEach(li => items.push(li.textContent.trim()));
              comps.push({ type: 'list', items });
            } else if (toggleEl) {
              const tTitle = toggleEl.querySelector('.custom-toggle-title');
              const tContent = toggleEl.querySelector('.custom-toggle-content');
              comps.push({
                type: 'toggle',
                title: tTitle ? tTitle.textContent.trim().replace(/^▶\s*/, '') : '',
                content: tContent ? tContent.textContent.trim() : ''
              });
            } else if (cardEl) {
              const cTitle = cardEl.querySelector('h4');
              const cDesc = cardEl.querySelector('p');
              comps.push({
                type: 'card',
                title: cTitle ? cTitle.textContent.trim() : 'Technical Module',
                desc: cDesc ? cDesc.textContent.trim() : ''
              });
            }
          });

          payload.snapSections.push({
            title: titleEl ? titleEl.textContent.trim() : '🚀 New Aerospace System Section',
            subtitle: subEl ? subEl.textContent.trim() : '',
            components: comps
          });
        });

        const indicator = document.getElementById('auto-save-status');
        if (indicator) {
          indicator.textContent = '☁️ Auto-Saving Live...';
          indicator.style.color = '#fbbf24';
        }

        const success = await window.authManager.saveSitePageContent(pageKey, payload);
        if (indicator) {
          if (success) {
            indicator.textContent = '✓ Live Auto-Saved for All Users';
            indicator.style.color = '#34d399';
          } else {
            indicator.textContent = '⚠️ Auto-Save Failed';
            indicator.style.color = '#ef4444';
          }
        }
      }, 500);
    };

    // 2. Direct In-Place ContentEditable Double-Click Handler (No Alert Prompts!)
    const makeElementEditable = (el) => {
      if (!el || el.dataset.editableBound) return;
      el.dataset.editableBound = 'true';
      el.style.cursor = 'pointer';
      el.title = 'Double-click to type & edit in-place';
      el.addEventListener('dblclick', (e) => {
        if (!window.authManager || !window.authManager.isAdmin()) return;
        e.stopPropagation();
        el.contentEditable = 'true';
        el.focus();
        el.style.outline = '2px dashed #60a5fa';
        el.style.borderRadius = '4px';
        el.style.padding = '2px 4px';
        el.style.background = 'rgba(59, 130, 246, 0.12)';

        try {
          const range = document.createRange();
          range.selectNodeContents(el);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        } catch (err) {}
      });

      el.addEventListener('blur', () => {
        el.contentEditable = 'false';
        el.style.outline = 'none';
        el.style.padding = '';
        el.style.background = '';
        autoSaveSitePage();
      });

      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          el.blur();
        }
      });
    };

    // 3. Dynamic Page Data Sync from Firebase RTDB & Glowing Text Unblur
    const initSiteContentSync = async () => {
      const heroT = document.querySelector('.title-centered') || document.querySelector('.title');
      const heroSub = document.querySelector('.subtitle');

      // Inject Aerospace Glowing Blur Orb spinner during RTDB fetch
      let orbLoader = document.getElementById('aerospace-blur-orb-loader');
      if (!orbLoader && heroT) {
        orbLoader = document.createElement('div');
        orbLoader.id = 'aerospace-blur-orb-loader';
        orbLoader.className = 'aerospace-blur-orb my-3 mx-auto';
        heroT.parentNode.insertBefore(orbLoader, heroT);
      }

      const pageData = await window.authManager.fetchSitePageContent(pageKey);

      // Remove orb loader after fetch completes
      if (orbLoader) orbLoader.remove();

      if (pageData) {
        if (pageData.heroTitle && heroT) {
          heroT.innerHTML = pageData.heroTitle.replace(/\n/g, '<br>');
        }
        if (pageData.heroSubtitle && heroSub) {
          heroSub.textContent = pageData.heroSubtitle;
        }

        // Render Published Custom Snap Sections & Internal Components
        if (pageData.snapSections && Array.isArray(pageData.snapSections) && pageData.snapSections.length > 0) {
          const snapContainer = document.querySelector('.snap-container') || document.body;
          pageData.snapSections.forEach(secData => {
            const sec = document.createElement('section');
            sec.className = 'snap page-section custom-snap-section d-flex flex-column align-items-center justify-content-center p-4 min-vh-100 position-relative';
            sec.style.background = 'radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.5) 0%, rgba(11, 15, 25, 0.98) 100%)';

            let compsHTML = '';
            if (secData.components && Array.isArray(secData.components)) {
              compsHTML = secData.components.map(b => {
                let inner = '';
                if (b.type === 'heading') inner = `<h3 class="doc-section-heading custom-block custom-section-heading m-0" style="font-size: 1.35rem; font-weight: 800;">${b.content}</h3>`;
                else if (b.type === 'paragraph') inner = `<p class="subtle-text custom-block custom-section-text m-0" style="font-size: 0.92rem; line-height: 1.6;">${b.content}</p>`;
                else if (b.type === 'list') {
                  const items = Array.isArray(b.items) ? b.items : [b.content];
                  inner = `<ul class="custom-block custom-bullet-list style-box p-3 m-0 w-100" style="list-style-type: square; background: var(--bg-card); border-radius: 10px;">${items.map(it => `<li class="custom-list-item mb-1" style="font-size: 0.88rem;">${it}</li>`).join('')}</ul>`;
                } else if (b.type === 'toggle') {
                  inner = `<details class="custom-block custom-toggle-box style-box p-3 m-0 w-100" style="background: var(--bg-card); border-radius: 10px; border: 1px solid var(--border-color);"><summary class="fw-bold mono-text custom-toggle-title" style="cursor: pointer; color: #60a5fa; font-size: 0.9rem;">▶ ${b.title || 'Click to Toggle Details'}</summary><p class="mt-2 subtle-text custom-toggle-content m-0" style="font-size: 0.88rem;">${b.content || ''}</p></details>`;
                } else if (b.type === 'card') {
                  inner = `<div class="project-card style-box p-3.5 w-100" style="border-radius: 12px; background: var(--bg-card);"><div style="font-size: 1.8rem; margin-bottom: 0.5rem;">📡</div><h4 class="custom-block custom-section-heading" style="font-size: 1.1rem; font-weight: 700;">${b.title}</h4><p class="subtle-text custom-block custom-section-text m-0" style="font-size: 0.85rem;">${b.desc}</p></div>`;
                }

                return `
                  <div class="custom-block-wrapper style-box p-3 mb-2 position-relative d-flex align-items-center gap-2" draggable="true" style="border-radius: 10px; border: 1px dashed rgba(59, 130, 246, 0.35);">
                    <span class="drag-handle mono-text" style="cursor: grab; color: #60a5fa; font-size: 1.1rem; padding: 0 4px;" title="Drag up/down to reorder block">⋮⋮</span>
                    <div class="flex-grow-1 custom-block-inner">${inner}</div>
                    <button type="button" class="btn btn-sm btn-outline-danger btn-delete-block" title="Delete Block" style="font-size: 0.72rem; padding: 2px 8px; border-radius: 6px;">🗑️</button>
                  </div>
                `;
              }).join('');
            }

            sec.innerHTML = `
              <div class="container-centered text-center">
                <h2 class="title-centered custom-section-heading text-evolved-visible" style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-display);">${secData.title || '🚀 New Aerospace System Section'}</h2>
                <p class="subtitle custom-section-text text-evolved-visible" style="font-size: 0.95rem; margin-top: 0.5rem;">${secData.subtitle || ''}</p>
                <div class="in-section-components-container container-centered d-flex flex-column gap-3 my-3 w-100">${compsHTML}</div>
              </div>
            `;

            snapContainer.appendChild(sec);
          });
        }
      } else {
        // Upload initial default page content to Firebase RTDB for all users
        autoSaveSitePage();
      }

      // Smoothly evolve text from blurred orb state into crisp visible text
      setTimeout(() => {
        document.querySelectorAll('.title, .title-centered, .subtitle, .about-title, .about-desc, .projects-title, .projects-desc, .doc-section-heading, .stat-box').forEach(el => {
          el.classList.remove('text-fetching-hidden');
          el.classList.add('text-evolved-visible');
        });
      }, 50);

      // Re-bind editable handlers for loaded content
      document.querySelectorAll('.title, .title-centered, .subtitle, .about-title, .about-desc, .projects-title, .projects-desc, .doc-section-heading, .project-card h3, .project-card p, .custom-section-heading, .custom-section-text, .custom-list-item, .custom-toggle-title, .custom-toggle-content').forEach(makeElementEditable);
    };

    // Execute immediately without flash delay
    if (document.readyState === 'complete') {
      initSiteContentSync();
    } else {
      window.addEventListener('DOMContentLoaded', initSiteContentSync);
    }

    // 4. Admin Page & Snap Section Builder Engine Initialization
    const initPageBuilderEngine = () => {
      const snapContainer = document.querySelector('.snap-container') || document.body;

      // Bottom-of-Page Admin Toolbar Section (Snaps cleanly at page end)
      let bottomAdminBar = document.getElementById('site-content-bottom-bar');
      if (!bottomAdminBar) {
        bottomAdminBar = document.createElement('div');
        bottomAdminBar.id = 'site-content-bottom-bar';
        bottomAdminBar.className = 'snap section-builder-bar-wrap d-flex justify-content-center align-items-center p-4 position-relative w-100';
        bottomAdminBar.style.minHeight = '140px';

        bottomAdminBar.innerHTML = `
          <div class="alert alert-info d-flex justify-content-between align-items-center flex-wrap gap-3 shadow-lg mono-text style-box p-3.5 w-100 position-relative" style="max-width: 1000px; background: rgba(15, 23, 42, 0.94); border: 1.5px solid #3b82f6; border-radius: 16px; box-shadow: 0 0 25px rgba(59, 130, 246, 0.25);">
            <div class="d-flex align-items-center gap-2">
              <span style="font-size: 1.3rem;">✨</span>
              <span style="color: #60a5fa; font-size: 0.88rem;"><strong>Page Builder (${pageKey.toUpperCase()}):</strong> Click button to add a new snap section to the bottom of this page.</span>
            </div>
            <div class="d-flex align-items-center gap-3 ms-auto flex-wrap">
              <span id="auto-save-status" class="fw-bold" style="color: #34d399; font-size: 0.78rem;">✓ Live Auto-Save Active</span>
              <button type="button" id="btn-add-new-snap-section" class="btn btn-primary fw-bold px-4 py-2.5" style="border-radius: 10px; font-size: 0.88rem; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border: none; box-shadow: 0 0 15px rgba(59, 130, 246, 0.5); cursor: pointer;">
                🚀 ➕ Add New Section
              </button>
            </div>
          </div>
        `;

        snapContainer.appendChild(bottomAdminBar);

        // Directly attach click handler for adding full snap sections
        const addSnapBtn = bottomAdminBar.querySelector('#btn-add-new-snap-section');
        if (addSnapBtn) {
          addSnapBtn.addEventListener('click', () => {
            const newSnapSec = document.createElement('section');
            newSnapSec.className = 'snap page-section custom-snap-section d-flex flex-column align-items-center justify-content-center p-4 min-vh-100 position-relative';
            newSnapSec.style.background = 'radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.5) 0%, rgba(11, 15, 25, 0.98) 100%)';

            newSnapSec.innerHTML = `
              <div class="container-centered text-center">
                <h2 class="title-centered custom-section-heading text-evolved-visible" style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-display);">🚀 New Aerospace System Section</h2>
                <p class="subtitle custom-section-text text-evolved-visible" style="font-size: 0.95rem; margin-top: 0.5rem;">Double-click text to edit in-place. Click button below to add section components.</p>
              </div>
            `;

            bottomAdminBar.parentNode.insertBefore(newSnapSec, bottomAdminBar);
            attachInSectionToolbars();
            newSnapSec.querySelectorAll('.custom-section-heading, .custom-section-text').forEach(makeElementEditable);
            autoSaveSitePage();

            newSnapSec.scrollIntoView({ behavior: 'smooth' });
          });
        }
      }

      // Attach In-Section Component Toolbar to Every Section
      const attachInSectionToolbars = () => {
        document.querySelectorAll('section.snap, .page-section').forEach((section) => {
          if (section.querySelector('.in-section-admin-bar')) return;

          let compWrap = section.querySelector('.in-section-components-container');
          if (!compWrap) {
            compWrap = document.createElement('div');
            compWrap.className = 'in-section-components-container container-centered d-flex flex-column gap-3 my-3 w-100';
            section.appendChild(compWrap);
          }

          const isCustomSec = section.classList.contains('custom-snap-section');
          const deleteBtnHTML = isCustomSec ? `
            <button type="button" class="btn btn-sm btn-outline-danger btn-delete-custom-section fw-bold" title="Delete This Entire Snap Section" style="font-size: 0.8rem; padding: 6px 14px; border-radius: 8px; background: rgba(239,68,68,0.15); border-color: #ef4444; color: #fca5a5;">
              🗑️ Delete Section
            </button>
          ` : '';

          const inSecBar = document.createElement('div');
          inSecBar.className = 'in-section-admin-bar d-flex justify-content-center align-items-center gap-2 mt-3 mb-2 mono-text position-relative';
          inSecBar.style.zIndex = '100';
          inSecBar.innerHTML = `
            <div class="position-relative d-flex align-items-center gap-2">
              <button type="button" class="btn btn-sm btn-outline-primary btn-add-component-to-sec fw-bold" style="font-size: 0.8rem; padding: 6px 14px; border-radius: 8px; background: rgba(59,130,246,0.18); border-color: #60a5fa; color: #60a5fa;">
                ➕ Add Component to Section
              </button>
              ${deleteBtnHTML}
              <div class="comp-picker-menu shadow-lg p-2 style-box border-theme position-absolute" style="display: none; bottom: 42px; left: 50%; transform: translateX(-50%); z-index: 9999; background: #141c2e; border: 1px solid #38bdf8; border-radius: 12px; min-width: 250px;">
                <div class="px-2 py-1 subtle-text mono-text fw-bold border-bottom mb-1" style="font-size: 0.72rem; color: #94a3b8;">SELECT COMPONENT TYPE</div>
                <button type="button" class="dropdown-item btn-add-comp d-flex align-items-center gap-2 p-2 rounded" data-type="heading" style="color: #f8fafc; font-size: 0.85rem; cursor: pointer; background: transparent; border: none; width: 100%; text-align: left;">
                  <span>📝</span> <span>Section Heading (H3)</span>
                </button>
                <button type="button" class="dropdown-item btn-add-comp d-flex align-items-center gap-2 p-2 rounded" data-type="paragraph" style="color: #f8fafc; font-size: 0.85rem; cursor: pointer; background: transparent; border: none; width: 100%; text-align: left;">
                  <span>📄</span> <span>Text Paragraph</span>
                </button>
                <button type="button" class="dropdown-item btn-add-comp d-flex align-items-center gap-2 p-2 rounded" data-type="list" style="color: #f8fafc; font-size: 0.85rem; cursor: pointer; background: transparent; border: none; width: 100%; text-align: left;">
                  <span>▪️</span> <span>Bullet List</span>
                </button>
                <button type="button" class="dropdown-item btn-add-comp d-flex align-items-center gap-2 p-2 rounded" data-type="toggle" style="color: #f8fafc; font-size: 0.85rem; cursor: pointer; background: transparent; border: none; width: 100%; text-align: left;">
                  <span>▶</span> <span>Toggle Accordion (Collapsible)</span>
                </button>
                <button type="button" class="dropdown-item btn-add-comp d-flex align-items-center gap-2 p-2 rounded" data-type="card" style="color: #f8fafc; font-size: 0.85rem; cursor: pointer; background: transparent; border: none; width: 100%; text-align: left;">
                  <span>🎯</span> <span>Feature Card Box</span>
                </button>
              </div>
            </div>
          `;

          section.appendChild(inSecBar);

          // Delete Section Click Handler
          const delSecBtn = inSecBar.querySelector('.btn-delete-custom-section');
          if (delSecBtn) {
            delSecBtn.addEventListener('click', () => {
              section.remove();
              autoSaveSitePage();
            });
          }

          // Component Menu Direct Display Toggle
          const addCompBtn = inSecBar.querySelector('.btn-add-component-to-sec');
          const compMenu = inSecBar.querySelector('.comp-picker-menu');

          if (addCompBtn && compMenu) {
            addCompBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              const isShown = compMenu.style.display === 'block';
              document.querySelectorAll('.comp-picker-menu').forEach(m => m.style.display = 'none');
              compMenu.style.display = isShown ? 'none' : 'block';
            });

            document.addEventListener('click', (e) => {
              if (compMenu && !compMenu.contains(e.target) && e.target !== addCompBtn) {
                compMenu.style.display = 'none';
              }
            });

            compMenu.querySelectorAll('.btn-add-comp').forEach(btn => {
              btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const compType = btn.getAttribute('data-type');
                compMenu.style.display = 'none';

                const blockWrap = document.createElement('div');
                blockWrap.className = 'custom-block-wrapper style-box p-3 mb-2 position-relative d-flex align-items-center gap-2';
                blockWrap.draggable = true;
                blockWrap.style.borderRadius = '10px';
                blockWrap.style.border = '1px dashed rgba(59, 130, 246, 0.45)';
                blockWrap.style.background = 'rgba(20, 28, 46, 0.75)';

                let innerHTML = '';
                if (compType === 'heading') {
                  innerHTML = `<h3 class="doc-section-heading custom-block custom-section-heading m-0" style="font-size: 1.35rem; font-weight: 800; color: var(--text-dark);">🚀 New System Section Heading</h3>`;
                } else if (compType === 'paragraph') {
                  innerHTML = `<p class="subtle-text custom-block custom-section-text m-0" style="font-size: 0.92rem; line-height: 1.6;">Double-click to edit this technical description paragraph block...</p>`;
                } else if (compType === 'list') {
                  innerHTML = `
                    <ul class="custom-block custom-bullet-list style-box p-3 m-0 w-100" style="list-style-type: square; background: var(--bg-card); border-radius: 10px;">
                      <li class="custom-list-item mb-1" style="font-size: 0.88rem;">Bullet item 1 - Double click to edit</li>
                      <li class="custom-list-item mb-1" style="font-size: 0.88rem;">Bullet item 2 - Double click to edit</li>
                    </ul>
                  `;
                } else if (compType === 'toggle') {
                  innerHTML = `
                    <details class="custom-block custom-toggle-box style-box p-3 m-0 w-100" style="background: var(--bg-card); border-radius: 10px; border: 1px solid var(--border-color);">
                      <summary class="fw-bold mono-text custom-toggle-title" style="cursor: pointer; color: #60a5fa; font-size: 0.9rem;">▶ Double click to edit toggle header</summary>
                      <p class="mt-2 subtle-text custom-toggle-content m-0" style="font-size: 0.88rem; line-height: 1.5;">Double click to edit collapsible detail text...</p>
                    </details>
                  `;
                } else if (compType === 'card') {
                  innerHTML = `
                    <div class="project-card style-box p-3.5 w-100" style="border-radius: 12px; background: var(--bg-card);">
                      <div style="font-size: 1.8rem; margin-bottom: 0.5rem;">📡</div>
                      <h4 class="custom-block custom-section-heading" style="font-size: 1.1rem; font-weight: 700; color: var(--text-dark);">New Technical Module</h4>
                      <p class="subtle-text custom-block custom-section-text m-0" style="font-size: 0.85rem;">Double-click to edit feature card details...</p>
                    </div>
                  `;
                }

                blockWrap.innerHTML = `
                  <span class="drag-handle mono-text" style="cursor: grab; color: #60a5fa; font-size: 1.1rem; padding: 0 4px;" title="Drag up/down to reorder block">⋮⋮</span>
                  <div class="flex-grow-1 custom-block-inner">${innerHTML}</div>
                  <button type="button" class="btn btn-sm btn-outline-danger btn-delete-block" title="Delete Block" style="font-size: 0.72rem; padding: 2px 8px; border-radius: 6px;">🗑️</button>
                `;

                compWrap.appendChild(blockWrap);

                // Delete button handler
                const delBtn = blockWrap.querySelector('.btn-delete-block');
                if (delBtn) {
                  delBtn.addEventListener('click', () => {
                    blockWrap.remove();
                    autoSaveSitePage();
                  });
                }

                // Drag and Drop Notion Reordering
                blockWrap.addEventListener('dragstart', (evt) => {
                  blockWrap.classList.add('dragging');
                  evt.dataTransfer.effectAllowed = 'move';
                });

                blockWrap.addEventListener('dragend', () => {
                  blockWrap.classList.remove('dragging');
                  autoSaveSitePage();
                });

                compWrap.addEventListener('dragover', (evt) => {
                  evt.preventDefault();
                  const draggingItem = compWrap.querySelector('.dragging');
                  const siblings = [...compWrap.querySelectorAll('.custom-block-wrapper:not(.dragging)')];
                  const nextSibling = siblings.find(sibling => {
                    return evt.clientY <= sibling.getBoundingClientRect().top + sibling.offsetHeight / 2;
                  });
                  compWrap.insertBefore(draggingItem, nextSibling);
                });

                blockWrap.querySelectorAll('.custom-section-heading, .custom-section-text, .custom-list-item, .custom-toggle-title, .custom-toggle-content, h4, p').forEach(makeElementEditable);

                autoSaveSitePage();
              });
            });
          }
        });
      };

      attachInSectionToolbars();

      // Bind in-place double click editing for all current text elements
      document.querySelectorAll('.title-centered, .subtitle, .about-title, .about-desc, .projects-title, .projects-desc, .doc-section-heading, .project-card h3, .project-card p, .custom-section-heading, .custom-section-text, .custom-list-item, .custom-toggle-title, .custom-toggle-content').forEach(makeElementEditable);
    };

    setTimeout(initPageBuilderEngine, 250);

  });

