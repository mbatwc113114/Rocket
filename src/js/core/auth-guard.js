/**
 * ============================================================================
 * ROKETRY AEROSPACE PLATFORM - ADMIN ACCESS GUARD (auth-guard.js)
 * ============================================================================
 * Enforces strict administrative route access protection on admin pages.
 * Shows the Access Denied screen for non-admin users and displays the main
 * workspace for verified administrators.
 *
 * @module Core/AuthGuard
 * @architecture Security & Route Protection Layer
 */

/**
 * Validates current user administrative permissions and toggles page visibility.
 * @returns {boolean} True if administrative access granted
 */
export function checkAdminGuard() {
  const accessDenied = document.getElementById('admin-access-denied');
  const adminWorkspace = document.getElementById('admin-workspace');
  const isAdmin = window.authManager && window.authManager.isAdmin();

  if (!isAdmin) {
    if (adminWorkspace) adminWorkspace.classList.add('d-none');
    if (accessDenied) accessDenied.classList.remove('d-none');
    return false;
  } else {
    if (adminWorkspace) adminWorkspace.classList.remove('d-none');
    if (accessDenied) accessDenied.classList.add('d-none');
    return true;
  }
}

/**
 * Initializes automatic auth protection state checking.
 */
export function initAuthGuard() {
  checkAdminGuard();
  setTimeout(checkAdminGuard, 300);
  setTimeout(checkAdminGuard, 1000);

  const btnAdminLoginNow = document.getElementById('btn-admin-login-now');
  if (btnAdminLoginNow) {
    btnAdminLoginNow.addEventListener('click', async () => {
      if (window.authManager) {
        await window.authManager.signInWithGoogle();
        checkAdminGuard();
      }
    });
  }
}
