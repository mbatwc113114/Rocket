/* ==========================================================================
   ROKETRY — THEME, ANIMATION & REAL ROCKET FLEET DOCUMENTATION SCRIPT
   ========================================================================== */

(function () {
  // 1. Determine & apply theme immediately to avoid unstyled flash
  const savedTheme = localStorage.getItem('roketry-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', initialTheme);

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
    return isInSrcPages ? `../${cleanPath}` : cleanPath;
  }
  
  return isInSrcPages ? cleanPath : `src/pages/${cleanPath}`;
};

document.addEventListener('DOMContentLoaded', () => {
    // 2. Theme Toggle Buttons
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');

    function updateBtnUI(isDark) {
      document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        btn.innerHTML = isDark ? '<span>☀️</span> Light' : '<span>🌙</span> Dark';
        btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      });
    }

    const currentTheme = document.documentElement.getAttribute('data-theme');
    updateBtnUI(currentTheme === 'dark');

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.theme-toggle-btn');
      if (btn) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('roketry-theme', newTheme);
        updateBtnUI(newTheme === 'dark');
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

        const matchesCategory = activeFilter === 'all' || category === activeFilter;
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
                  <span class="project-badge">${(cp.badge || 'ROCKET FLEET').toUpperCase()}</span>
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
        document.getElementById('doc-title').textContent = dataToRender.title;
        document.getElementById('doc-subtitle').textContent = dataToRender.subtitle;
        document.getElementById('doc-badge').textContent = dataToRender.badge || 'PROJECT';
        document.getElementById('doc-id').textContent = dataToRender.docId || 'DOC-CUSTOM-01';
        document.getElementById('doc-overview-p1').textContent = dataToRender.p1;
        document.getElementById('doc-overview-p2').textContent = dataToRender.p2 || '';

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
          metaDomain.textContent = dataToRender.category ? dataToRender.category.toUpperCase() : (dataToRender.badge || 'AEROSPACE');
        }

        const metaVerification = document.getElementById('doc-meta-verification');
        if (metaVerification) {
          metaVerification.textContent = dataToRender.verification || 'Field Verified';
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

          const colors = ['blue', 'green', 'purple', 'orange', 'pink'];
          subContainer.innerHTML = subList.map((s, idx) => {
            const tagColor = s.color || colors[idx % colors.length];
            const targetUrl = window.resolvePageURL(s.slug ? `project-detail.html?id=${s.slug}` : `project.html`);
            return `
              <a href="${targetUrl}" class="text-decoration-none">
                <span class="notion-tag notion-tag-${tagColor}">🧩 ${s.name || s.title}</span>
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
                  } else {
                    return `<p>${b.content}</p>`;
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

        const finalData = customData || docDatabase[projectId] || docDatabase['model1'];
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

  });
})();

