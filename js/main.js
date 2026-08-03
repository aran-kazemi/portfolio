// File Version: 5.3.0 - JS Logic for Chart Animation
// /js/main.js

const CONFIG = {
    navbarScrollThreshold: 10,
    animation: {
        particleColor1: '#26d7bd',
        particleColor2: '#c72a83',
        particleCount: 150,
        connectionDistance: 140,
        particleSpeed: 0.5,
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 1000,
        easing: 'ease-out-cubic',
        once: false,
        mirror: true,
        offset: 50
    });

    handleNavbarScroll();
    setupContactForm();
    initNetworkAnimation();
    initChartAnimation();
    initCounterAnimation(); // Trigger numerical counters
});

function handleNavbarScroll() {
    const navbar = document.getElementById('mainNav');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > CONFIG.navbarScrollThreshold) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
}

// NEW: Chart Animation Logic
function initChartAnimation() {
    const chartWrapper = document.getElementById('performance-chart-wrapper');
    if (!chartWrapper) return;

    const chartObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // When chart is visible, start animation
                entry.target.classList.add('start-animation');
            } else {
                // When chart leaves view, reset animation for re-triggering on scroll
                entry.target.classList.remove('start-animation');
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.3 // Trigger when 30% of the chart is visible
    });

    chartObserver.observe(chartWrapper);
}

// Numerical Counter Animation Logic
function initCounterAnimation() {
    const counters = document.querySelectorAll('.counter');
    if (counters.length === 0) return;

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const targetValue = parseInt(target.getAttribute('data-target'));
                animateValue(target, 0, targetValue, 2000);
                counterObserver.unobserve(target); // Only animate once
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = form.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Processing...';
        btn.disabled = true;

        setTimeout(() => {
            Swal.fire({
                title: 'Message Sent!',
                text: 'Thank you for your message. We will get back to you shortly.',
                icon: 'success',
                confirmButtonColor: '#26d7bd',
                confirmButtonText: 'Got it!'
            });
            form.reset();
            btn.innerText = originalText;
            btn.disabled = false;
        }, 1500);
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


function initNetworkAnimation() {
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animationFrameId = null;

    const resize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particles = [];
        createParticles();
    };

    const debouncedResize = debounce(resize, 250);
    window.addEventListener('resize', debouncedResize, false);

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * CONFIG.animation.particleSpeed;
            this.vy = (Math.random() - 0.5) * CONFIG.animation.particleSpeed;
            this.size = Math.random() * 2 + 1;
            this.color = Math.random() > 0.5 ? CONFIG.animation.particleColor1 : CONFIG.animation.particleColor2;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function createParticles() {
        for (let i = 0; i < CONFIG.animation.particleCount; i++) {
            particles.push(new Particle());
        }
    }

    const animate = () => {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const p1 = particles[i];
                const p2 = particles[j];
                const distance = Math.hypot(p1.x - p2.x, p1.y - p2.y);

                if (distance < CONFIG.animation.connectionDistance) {
                    const opacity = 1 - (distance / CONFIG.animation.connectionDistance);
                    ctx.strokeStyle = `rgba(199, 42, 131, ${opacity * 0.5})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        animationFrameId = requestAnimationFrame(animate);
    };

    const startAnimation = () => {
        if (!animationFrameId) {
            animate();
        }
    };

    const stopAnimation = () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startAnimation();
            } else {
                stopAnimation();
            }
        });
    }, { threshold: 0.01 });

    observer.observe(canvas);
    resize();
}
