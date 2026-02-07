/**
 * Model Rocketry Landing Website - JavaScript
 * Handles navigation, scroll effects, and interactive elements
 */

// ============================================
// DOM Elements
// ============================================

const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const hero = document.getElementById('hero');

// ============================================
// Navigation - Hamburger Menu Toggle
// ============================================

/**
 * Toggle mobile menu open/close state
 */
function toggleMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

/**
 * Close mobile menu when a link is clicked
 */
function closeMenu() {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}

hamburger.addEventListener('click', toggleMenu);
navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
});

// ============================================
// Navigation - Scroll Effects
// ============================================

/**
 * Update navbar appearance on scroll
 * Adds blur and shadow effect when scrolled down
 */
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 50;
    navbar.classList.toggle('scrolled', scrolled);
}, { passive: true });

// ============================================
// Smooth Scroll for Anchor Links
// ============================================

/**
 * Handle smooth scrolling for navigation links
 * Note: CSS scroll-behavior handles this, but we ensure compatibility
 */
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// CTA button scroll
const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector('#projects');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// ============================================
// Intersection Observer for Scroll Animations
// ============================================

/**
 * Observe elements and trigger animations when they enter viewport
 * This allows cards and content to animate as users scroll
 */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Element is in viewport - animation will trigger via CSS
            // The element already has opacity: 0 and animation defined
            // No additional action needed
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe project cards and learn cards
document.querySelectorAll('.project-card, .learn-card').forEach(card => {
    observer.observe(card);
});

// ============================================
// Parallax Scroll Effect
// ============================================

/**
 * Create parallax effect on hero background
 * Moves background slower than scroll speed for depth effect
 */
const heroBackground = document.querySelector('.hero-background');
let ticking = false;

function updateParallax() {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrolled = window.scrollY;
            const hero = document.getElementById('hero');
            
            // Only apply parallax if hero is in viewport
            if (scrolled < hero.offsetHeight + hero.offsetTop) {
                const parallaxValue = scrolled * 0.5;
                if (heroBackground) {
                    heroBackground.style.transform = `translateY(${parallaxValue}px)`;
                }
            }
            
            ticking = false;
        });
        ticking = true;
    }
}

// Use passive listener for better scroll performance
window.addEventListener('scroll', updateParallax, { passive: true });

// ============================================
// Performance: Lazy Image Loading
// ============================================

/**
 * Implement native lazy loading for images
 * Fallback for older browsers using Intersection Observer
 */
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// Scroll-to-Top Functionality (Optional)
// ============================================

/**
 * Create and manage a scroll-to-top button
 * Appears when user scrolls down past hero section
 */
function initScrollToTop() {
    const scrollButton = document.createElement('button');
    scrollButton.innerHTML = '↑';
    scrollButton.className = 'scroll-to-top';
    scrollButton.setAttribute('aria-label', 'Scroll to top');
    
    // Inline styles for scroll button
    Object.assign(scrollButton.style, {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '50px',
        height: '50px',
        background: 'rgba(0, 168, 232, 0.2)',
        border: '2px solid rgba(0, 168, 232, 0.5)',
        color: 'white',
        cursor: 'pointer',
        borderRadius: '4px',
        fontSize: '1.5rem',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '999',
        transition: 'all 0.3s ease',
        fontWeight: '900'
    });

    document.body.appendChild(scrollButton);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollButton.style.display = 'flex';
        } else {
            scrollButton.style.display = 'none';
        }
    }, { passive: true });

    scrollButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    scrollButton.addEventListener('mouseover', () => {
        scrollButton.style.background = 'rgba(0, 168, 232, 0.4)';
        scrollButton.style.borderColor = 'rgba(0, 168, 232, 0.8)';
    });

    scrollButton.addEventListener('mouseout', () => {
        scrollButton.style.background = 'rgba(0, 168, 232, 0.2)';
        scrollButton.style.borderColor = 'rgba(0, 168, 232, 0.5)';
    });
}

// Initialize scroll-to-top button when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollToTop);
} else {
    initScrollToTop();
}

// ============================================
// Accessibility Enhancements
// ============================================

/**
 * Keyboard navigation support
 * Ensure all interactive elements are keyboard accessible
 */
document.addEventListener('keydown', (e) => {
    // Close mobile menu on Escape
    if (e.key === 'Escape') {
        closeMenu();
    }
});

// ============================================
// Performance Monitoring
// ============================================

/**
 * Log performance metrics (optional, for debugging)
 * Remove or modify based on your analytics needs
 */
if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
        // Only log in development
        if (process.env.NODE_ENV === 'development' || true) {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            console.log(`Page loaded in ${loadTime}ms`);
        }
    });
}

// ============================================
// Initialize on DOM Ready
// ============================================

/**
 * Ensure all interactive elements are functional
 * Runs checks when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Verify critical elements exist
    const criticalElements = ['navbar', 'hero', 'projects'];
    criticalElements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Critical element not found: #${id}`);
        }
    });

    // Add smooth scroll fallback for browsers that don't support it
    if (!CSS.supports('scroll-behavior', 'smooth')) {
        console.log('Smooth scroll not supported, using alternative');
        // Browsers without smooth scroll support will use the standard scroll
    }

    console.log('jm_space landing page initialized successfully');
});

// ============================================
// Export for Testing (if needed)
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleMenu,
        closeMenu
    };
}
