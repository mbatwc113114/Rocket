/**
 * ============================================================================
 * ROKETRY AEROSPACE PLATFORM - ADMIN BUILDER & CATALOG MANAGER (admin-builder.js)
 * ============================================================================
 * Controls Notion-style modular page builder, section creation, component blocks,
 * Sub Systems project relation dropdowns, registered member profile selector,
 * and RTDB catalog management.
 *
 * @module Modules/AdminBuilder
 * @architecture Page Builder Controller Layer
 */

/**
 * Sanitizes image URL to prevent browser 404 console errors.
 * @param {string} url - Target URL
 * @param {string} fallbackURL - Default fallback URL
 * @returns {string} Clean valid image URL
 */
export function getValidImageURL(url, fallbackURL) {
  if (!url || typeof url !== 'string') return fallbackURL;
  const trimmed = url.trim();
  if (trimmed.length <= 5 || trimmed.includes('${') || trimmed === 'undefined' || trimmed === 'null') {
    return fallbackURL;
  }
  return trimmed;
}

/**
 * Creates Sub System tag element with removal handler.
 */
export function createSubsystemTagElement(name, slug, color = 'blue') {
  const item = document.createElement('div');
  item.className = 'subsystem-item d-flex justify-content-between align-items-center mb-1 p-1 style-box';
  item.style.fontSize = '0.8rem';
  item.dataset.title = name;
  item.dataset.url = slug;
  item.dataset.color = color;
  item.innerHTML = `
    <span>🚀 ${name} (${slug})</span>
    <button type="button" class="btn-del-icon btn-del-subsystem" aria-label="Remove" title="Remove Link"><span class="trash-icon">🗑️</span></button>
  `;
  item.querySelector('.btn-del-subsystem').addEventListener('click', () => item.remove());
  return item;
}

/**
 * Renders all published projects in the Admin Catalog grid.
 */
export async function renderAdminCatalog() {
  const grid = document.getElementById('admin-catalog-grid');
  if (!grid) return;

  let customProjects = [];
  if (window.authManager) {
    customProjects = await window.authManager.fetchAllCustomProjectsFromRTDB();
  }

  const defaultProjects = [
    { id: 'model1', title: 'Rocket Model-I', category: 'fleet', badge: 'ROCKET FLEET', version: 'v1.0', sketchImg: 'sketch_srm.png' },
    { id: 'model2', title: 'Rocket Model-II', category: 'fleet', badge: 'ROCKET FLEET', version: 'v1.0', sketchImg: 'sketch_airframe.png' },
    { id: 'model3', title: 'Rocket Model-III', category: 'fleet', badge: 'ROCKET FLEET', version: 'v1.0', sketchImg: 'sketch_liquid.png' },
    { id: 'simulator', title: 'Ground Electric Simulator', category: 'simulators', badge: 'SIMULATORS', version: 'v1.0', sketchImg: 'sketch_avionics.png' },
    { id: 'teststand', title: 'Solid Motor Test Stand', category: 'subsystems', badge: 'FACILITIES', version: 'v1.0', sketchImg: 'sketch_srm.png' },
    { id: 'recovery', title: 'Dual Pyro Recovery Stack', category: 'subsystems', badge: 'SUBSYSTEMS', version: 'v1.0', sketchImg: 'sketch_airframe.png' }
  ];

  const projectMap = new Map();
  defaultProjects.forEach(p => projectMap.set(p.id, p));
  customProjects.forEach(cp => {
    projectMap.set(cp.id, {
      id: cp.id,
      title: cp.title,
      category: cp.category || 'fleet',
      badge: cp.badge || 'PROJECT',
      version: cp.version || 'v1.0',
      sketchImg: getValidImageURL(cp.sketchImg, 'sketch_srm.png')
    });
  });

  const allProjects = Array.from(projectMap.values());

  grid.innerHTML = allProjects.map(p => `
    <div class="project-card style-box">
      <div class="card-sketch-wrap">
        <img src="${getValidImageURL(p.sketchImg, 'sketch_srm.png')}" alt="${p.title}">
      </div>
      <div class="d-flex align-items-center justify-content-between mt-2">
        <span class="profile-role-badge" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6;">${p.badge}</span>
        <span class="changelog-field-badge field-title">${p.version}</span>
      </div>
      <h4 style="font-size: 1.1rem; font-weight: 700; margin: 0.5rem 0 0.25rem 0;">${p.title}</h4>
      <div class="d-flex gap-2 mt-2">
        <a href="${(window.resolvePageURL ? window.resolvePageURL(`project-detail.html?id=${p.id}`) : `project-detail.html?id=${p.id}`)}" class="repo-action-btn primary-btn" style="font-size: 0.75rem; flex: 1;">View Page</a>
      </div>
    </div>
  `).join('');
}
