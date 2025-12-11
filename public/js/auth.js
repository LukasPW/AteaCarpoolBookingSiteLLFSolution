/**
 * ===========================
 * AUTH MODULE - auth.js
 * ===========================
 * 
 * Handles user authentication UI and session management
 * - User menu toggle functionality
 * - Logout handler with API call
 * - SessionStorage user data management
 */

/**
 * Get stored user data from sessionStorage
 * @returns {Object|null} User object with name and email, or null if not logged in
 */
function getStoredUser() {
    const name = sessionStorage.getItem('userName');
    const email = sessionStorage.getItem('userEmail');
    if (!name || !email) return null;
    return { name, email };
}

/**
 * Clear stored user data from sessionStorage
 */
function clearStoredUser() {
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userEmail');
}

/**
 * Initialize authentication UI state
 * Shows/hides login button vs user chip based on session state
 * NOTE: This function is currently unused since PHP handles server-side auth
 * Kept for potential future client-side enhancements
 */
function initAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userChip = document.getElementById('userChip');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userEmailDisplay = document.getElementById('userEmailDisplay');

    if (!loginBtn || !userChip || !userNameDisplay || !userEmailDisplay) return;

    const renderState = () => {
        const user = getStoredUser();
        if (user) {
            loginBtn.style.display = 'none';
            userNameDisplay.textContent = user.name;
            userEmailDisplay.textContent = user.email;
            userChip.style.display = 'flex';
        } else {
            userChip.style.display = 'none';
            loginBtn.style.display = 'inline-flex';
        }
    };

    loginBtn.onclick = () => {
        sessionStorage.setItem('postLoginRedirect', window.location.pathname);
        window.location.href = 'login.html';
    };

    if (logoutBtn) {
        logoutBtn.onclick = () => {
            clearStoredUser();
            renderState();
            window.location.href = 'login.html';
        };
    }

    renderState();
}

/**
 * Initialize user menu dropdown toggle functionality
 * Features:
 *  - Toggle dropdown on user pill click
 *  - Close menu when clicking outside
 *  - Logout button calls backend API and redirects
 */
function initUserMenu() {
    const toggle = document.getElementById('userMenuToggle');
    const menu = document.getElementById('userMenu');
    const logoutBtn = document.getElementById('logoutBtn');
    if (!toggle || !menu || !logoutBtn) return;

    const API_BASE = window.API_BASE || 'http://localhost:5000/api';
    const nameLabel = toggle.querySelector('.user-name');
    const renderUser = () => {
        const user = getStoredUser();
        if (nameLabel) {
            nameLabel.textContent = user?.name || 'User';
        }
    };
    renderUser();

    const closeMenu = () => {
        menu.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = menu.hidden;
        menu.hidden = !willOpen;
        toggle.setAttribute('aria-expanded', String(willOpen));
    });

    logoutBtn.addEventListener('click', async () => {
        try {
            await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
        } catch (_) {
            // ignore network errors on logout
        }
        sessionStorage.removeItem('userEmail');
        sessionStorage.removeItem('userName');
        closeMenu();
        window.location.href = 'login.html';
    });

    document.addEventListener('click', (e) => {
        if (!menu.hidden && !menu.contains(e.target) && !toggle.contains(e.target)) {
            closeMenu();
        }
    });
}
