/**
 * ============================================================================
 * ROKETRY AEROSPACE PLATFORM - DOCUMENTATION & AUDIT RENDERER (doc-renderer.js)
 * ============================================================================
 * Handles dynamic technical documentation page rendering, specs tables, LaTeX math,
 * and RTDB commit history changelog table rendering with project filters.
 *
 * @module Modules/DocRenderer
 * @architecture Presentation Layer Architecture
 */

import { getValidImageURL } from './admin-builder.js';

let allChangelogsList = [];

/**
 * Fetches and renders commit changelog audit logs from RTDB into table.
 * @param {string} filterProjId - Selected project ID filter
 */
export async function renderChangelogTable(filterProjId = 'ALL') {
  const tbody = document.getElementById('dash-changelog-tbody');
  const filterSelect = document.getElementById('filter-changelog-project');
  if (!tbody || !window.authManager) return;

  allChangelogsList = await window.authManager.fetchChangelog(100);

  if (filterSelect) {
    const currentSelected = filterSelect.value || filterProjId;
    const projectMap = new Map();

    const dbProjects = await window.authManager.fetchAllCustomProjectsFromRTDB();
    if (dbProjects && Array.isArray(dbProjects)) {
      dbProjects.forEach(p => {
        if (p.id) projectMap.set(p.id, p.title || p.id);
      });
    }

    allChangelogsList.forEach(c => {
      if (c.projectId && !projectMap.has(c.projectId)) {
        projectMap.set(c.projectId, c.projectTitle || c.projectId);
      }
    });

    filterSelect.innerHTML = '<option value="ALL">🌐 View All Projects</option>';
    projectMap.forEach((title, id) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = `🚀 ${title} (${id})`;
      filterSelect.appendChild(opt);
    });

    filterSelect.value = currentSelected;
  }

  const filterVal = (filterSelect ? filterSelect.value : filterProjId) || 'ALL';
  const target = filterVal.trim().toLowerCase();

  const filteredLogs = (target === 'all')
    ? allChangelogsList
    : allChangelogsList.filter(c => {
        const pid = (c.projectId || c.id || '').trim().toLowerCase();
        const ptitle = (c.projectTitle || '').trim().toLowerCase();
        return pid === target || ptitle === target || pid.includes(target);
      });

  if (filteredLogs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center subtle-text p-4" style="font-size: 0.85rem;">
          No commit logs found ${target !== 'all' ? `for selected project` : 'in database'}.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredLogs.map(c => {
    const dt = c.editedAt ? new Date(c.editedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Live';
    const fields = Array.isArray(c.changedFields) ? c.changedFields.join(', ') : (c.changedFields || 'Metadata');
    const editorPhoto = getValidImageURL(c.editorPhoto, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');

    return `
      <tr>
        <td class="mono-text" style="font-size: 0.78rem;">${dt}</td>
        <td><span class="changelog-field-badge field-title">${c.version || 'v1.0'}</span></td>
        <td><strong>${c.projectTitle || c.projectId || 'Rocket System'}</strong></td>
        <td style="font-size: 0.85rem;">${c.commitMessage || 'Published project update'}</td>
        <td><span class="badge bg-secondary" style="font-size: 0.7rem;">${fields}</span></td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <img src="${editorPhoto}" class="avatar-circle" style="width: 24px; height: 24px; object-fit: cover;" alt="${c.editorName || 'Editor'}">
            <span style="font-size: 0.8rem; font-weight: 600;">${c.editorName || c.editedBy || 'Admin'}</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}
