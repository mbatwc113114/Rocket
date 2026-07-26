/**
 * ============================================================================
 * ROKETRY AEROSPACE PLATFORM - MAIN BOOTSTRAP ENTRY (main.js)
 * ============================================================================
 * Application initialization bootstrap entry point. Initializes global navigation,
 * theme management, and module routing.
 *
 * @module Main
 * @architecture Application Bootstrap Entry
 */

import { initThemeToggle, initActiveNavLink } from './modules/navigation.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Theme Engine
  initThemeToggle();

  // Highlight Active Navbar Links
  initActiveNavLink();
});
