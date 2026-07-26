/**
 * ============================================================================
 * ROKETRY AEROSPACE PLATFORM - NAVIGATION MODULE (navigation.js)
 * ============================================================================
 * Manages active navbar link indicators, light/dark theme persistence in localStorage,
 * and responsive header states.
 *
 * @module Modules/Navigation
 * @architecture UI Controller Layer
 */

/**
 * Initializes global theme toggle logic (Dark / Light Mode).
 */
export function initThemeToggle() {
  const currentTheme = localStorage.getItem('roketry-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }

  const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
  toggleBtns.forEach(btn => {
    btn.innerHTML = currentTheme === 'dark' ? '<span>☀️</span> Light' : '<span>🌙</span> Dark';
    btn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', newTheme);
      if (newTheme === 'dark') {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }

      localStorage.setItem('roketry-theme', newTheme);
      toggleBtns.forEach(b => {
        b.innerHTML = newTheme === 'dark' ? '<span>☀️</span> Light' : '<span>🌙</span> Dark';
      });
    });
  });
}

/**
 * Highlights active page navigation link based on current window location URL.
 */
export function initActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link-item');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
