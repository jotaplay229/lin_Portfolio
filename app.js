/**
 * Lin Portfolio - Core Application Logic
 * Integrates GSAP Animations, Language Switcher, Custom Cursor, and 3D UI Tilting.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // 2. Custom Cursor Logic (Only for Desktop / Fine pointer)
    const cursor = document.getElementById('custom-cursor');
    const cursorGlow = document.getElementById('custom-cursor-glow');
    
    if (cursor && cursorGlow && window.matchMedia('(pointer: fine)').matches) {
        // Show cursor elements
        cursor.style.display = 'block';
        cursorGlow.style.display = 'block';

        // GSAP initialization for smooth tracking
        gsap.set(cursor, { xPercent: -50, yPercent: -50 });
        gsap.set(cursorGlow, { xPercent: -50, yPercent: -50 });

        window.addEventListener('mousemove', (e) => {
            gsap.to(cursor, { duration: 0.05, x: e.clientX, y: e.clientY });
            gsap.to(cursorGlow, { duration: 0.25, x: e.clientX, y: e.clientY });
        });

        // Hover expansions
        const addCursorHover = (elements) => {
            elements.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    gsap.to(cursor, { scale: 2.2, backgroundColor: 'var(--primary-light)', duration: 0.2 });
                    gsap.to(cursorGlow, { scale: 1.4, borderColor: 'var(--primary-light)', backgroundColor: 'rgba(157, 78, 221, 0.15)', duration: 0.2 });
                });
                el.addEventListener('mouseleave', () => {
                    gsap.to(cursor, { scale: 1, backgroundColor: '#ffffff', duration: 0.2 });
                    gsap.to(cursorGlow, { scale: 1, borderColor: 'rgba(157, 78, 221, 0.3)', backgroundColor: 'rgba(157, 78, 221, 0.08)', duration: 0.2 });
                });
            });
        };

        // Query all interactive nodes
        const interactives = document.querySelectorAll('a, button, .video-card, .timeline-item, .tool-badge, .lang-toggle-btn');
        addCursorHover(interactives);

        // Dynamically monitor updates to DOM
        const observer = new MutationObserver(() => {
            const currentInteractives = document.querySelectorAll('a, button, .video-card, .timeline-item, .tool-badge, .lang-toggle-btn');
            addCursorHover(currentInteractives);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // 3. Language Selector Logic (Bilingual PT/EN)
    const langBtn = document.getElementById('lang-toggle-btn');
    const body = document.body;

    const setLanguage = (lang) => {
        if (lang === 'pt') {
            body.classList.remove('lang-en');
            body.classList.add('lang-pt');
            document.documentElement.lang = 'pt';
        } else {
            body.classList.remove('lang-pt');
            body.classList.add('lang-en');
            document.documentElement.lang = 'en';
        }

        // Update button visual state
        const options = langBtn.querySelectorAll('.lang-option');
        options.forEach(opt => {
            if (opt.getAttribute('data-lang') === lang) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });

        // Save preferences
        localStorage.setItem('lin-portfolio-lang', lang);
    };

    // Load saved language or default strictly to English (PT is optional via manual selector)
    const savedLang = localStorage.getItem('lin-portfolio-lang');
    if (savedLang) {
        setLanguage(savedLang);
    } else {
        setLanguage('en');
    }

    langBtn.addEventListener('click', () => {
        const currentLang = body.classList.contains('lang-pt') ? 'en' : 'pt';
        setLanguage(currentLang);
    });

    // 4. Bento Grid - Floating Light Glow follows Cursor
    const bentoCards = document.querySelectorAll('.bento-card');
    bentoCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });
    });

    // 5. Interactive 3D Visual Card Hologram Tilt (About Section)
    const visualContainer = document.querySelector('.about-visual');
    const visualCard = document.querySelector('.visual-card-3d');
    
    if (visualContainer && visualCard) {
        visualContainer.addEventListener('mousemove', (e) => {
            const rect = visualContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate tilt angle (-15 to 15 degrees)
            const rotateX = ((y / rect.height) - 0.5) * -20; 
            const rotateY = ((x / rect.width) - 0.5) * 20;
            
            gsap.to(visualCard, {
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                ease: 'power2.out',
                duration: 0.4
            });
        });

        visualContainer.addEventListener('mouseleave', () => {
            gsap.to(visualCard, {
                rotateX: 0,
                rotateY: 0,
                ease: 'power2.out',
                duration: 0.8
            });
        });
    }

    // 6. YouTube Video Modal Controller
    const videoModal = document.getElementById('video-modal');
    const modalClose = document.getElementById('video-modal-close');
    const modalOverlay = document.getElementById('video-modal-overlay');
    const ytIframe = document.getElementById('youtube-iframe');
    const videoCards = document.querySelectorAll('.video-card');

    const openVideo = (videoId) => {
        if (!videoId) return;
        ytIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
        videoModal.classList.add('active');
        
        // Hide custom cursor to not conflict with video playback
        if (cursor) {
            cursor.style.opacity = '0';
            cursorGlow.style.opacity = '0';
        }
    };

    const closeVideo = () => {
        videoModal.classList.remove('active');
        // Delay clearing the src to allow transition to fade out
        setTimeout(() => {
            ytIframe.src = '';
        }, 400);

        // Show custom cursor again
        if (cursor) {
            cursor.style.opacity = '1';
            cursorGlow.style.opacity = '1';
        }
    };

    videoCards.forEach(card => {
        card.addEventListener('click', () => {
            const videoId = card.getAttribute('data-video-id');
            openVideo(videoId);
        });
    });

    modalClose.addEventListener('click', closeVideo);
    modalOverlay.addEventListener('click', closeVideo);

    // Close on Escape key press
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal.classList.contains('active')) {
            closeVideo();
        }
    });

    // 7. Scroll Reveal using Intersection Observer (highly robust, runs on file://)
    const revealElements = document.querySelectorAll('.reveal-in');
    
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    observer.unobserve(entry.target); // Animates once
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    } else {
        // Fallback for extremely old browsers
        revealElements.forEach(el => el.classList.add('reveal-visible'));
    }

    // 8. GSAP Entrance Animations (Only runs on page load, completely safe)
    if (window.gsap) {
        // Header fade down on load
        gsap.from('.header', {
            y: -80,
            opacity: 0,
            duration: 1.2,
            ease: 'power3.out'
        });

        // Hero content entrance timeline
        const heroTimeline = gsap.timeline();
        heroTimeline.from('.hero-eyebrow', {
            y: 30,
            opacity: 0,
            duration: 0.8,
            delay: 0.4,
            ease: 'power3.out'
        })
        .from('.hero-title', {
            y: 40,
            opacity: 0,
            duration: 1.0,
            ease: 'power3.out'
        }, '-=0.6')
        .from('.hero-subtitle', {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.7')
        .from('.hero-ctas', {
            y: 20,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.6')
        .from('.hero-scroll-hint', {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, '-=0.2');
    }
});
