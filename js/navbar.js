// Navbar functionality with video background
class Navbar {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.video = document.querySelector('.video-background video');
        
        this.init();
    }

    init() {
        // Scroll effect
        window.addEventListener('scroll', () => this.toggleNavbarBackground());
        
        // Mobile menu toggle
        this.hamburger.addEventListener('click', () => this.toggleMobileMenu());
        
        // Close mobile menu when clicking on links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMobileMenu());
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => this.handleClickOutside(e));
        
        // Video fallback and error handling
        this.setupVideo();
    }

    toggleNavbarBackground() {
        if (window.scrollY > 100) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }

    toggleMobileMenu() {
        this.hamburger.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        
        // Prevent background scroll when menu is open
        if (this.navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }

    closeMobileMenu() {
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    handleClickOutside(e) {
        if (!this.navbar.contains(e.target) && this.navMenu.classList.contains('active')) {
            this.closeMobileMenu();
        }
    }

    setupVideo() {
        if (this.video) {
            this.video.addEventListener('error', () => {
                console.log('Error loading video, using fallback background');
                // Aquí podrías cambiar a una imagen de fondo si el video falla
            });
        }
    }
}

// Initialize navbar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Navbar();
});