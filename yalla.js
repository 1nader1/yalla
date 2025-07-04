// Mobile menu toggle
const menuBtn = document.getElementById('menu-btn');
const menu = document.getElementById('menu');

menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('open');
    menu.classList.toggle('hidden');
    menu.classList.toggle('flex');
});

// Scroll animations
const fadeElements = document.querySelectorAll('.fade-in');

const fadeInOnScroll = () => {
    fadeElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
            element.classList.add('visible');
        }
    });
};

// Check on initial load
fadeInOnScroll();

// Check on scroll
window.addEventListener('scroll', fadeInOnScroll);

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (menuBtn.classList.contains('open')) {
                menuBtn.classList.remove('open');
                menu.classList.add('hidden');
                menu.classList.remove('flex');
            }
        }
    });
});

// Language switcher functionality
const languageBtn = document.getElementById('language-btn');
const languageDropdown = document.getElementById('language-dropdown');
const languageOptions = document.querySelectorAll('.language-option');

// Helper: Set language and direction, update UI, and save to localStorage
function setLanguage(lang, dir) {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;

    // Update all translatable elements
    document.querySelectorAll('[data-en], [data-ar]').forEach(element => {
        if (element.hasAttribute(`data-${lang}`)) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = element.getAttribute(`data-${lang}`);
            } else {
                element.textContent = element.getAttribute(`data-${lang}`);
            }
        }
    });

    // Update buttons with dynamic text
    const getAppBtn = document.getElementById('get-app-btn');
    const mobileGetAppBtn = document.getElementById('mobile-get-app-btn');
    if (getAppBtn && mobileGetAppBtn) {
        if (lang === 'ar') {
            getAppBtn.textContent = 'سجل اهتمامك';
            mobileGetAppBtn.textContent = 'سجل اهتمامك';
            document.body.style.fontFamily = "'Tajawal', sans-serif";
        } else {
            getAppBtn.textContent = 'register your interest';
            mobileGetAppBtn.textContent = 'register your interest';
            document.body.style.fontFamily = "'Poppins', sans-serif";
        }
    }

    // Save language to localStorage
    localStorage.setItem('yalla-lang', lang);
    localStorage.setItem('yalla-dir', dir);
}

// Toggle dropdown
languageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    languageDropdown.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', () => {
    languageDropdown.classList.remove('show');
});

// Change language on option click
languageOptions.forEach(option => {
    option.addEventListener('click', () => {
        const lang = option.getAttribute('data-lang');
        const dir = option.getAttribute('data-dir');
        setLanguage(lang, dir);

        // Update button text
        const text = option.querySelector('.language-text').textContent;
        languageBtn.innerHTML = `
            <span class="language-text">${text}</span>
            <i class="fas fa-chevron-down text-xs"></i>
        `;

        languageDropdown.classList.remove('show');
    });
});

// On page load: detect browser language or use saved language
document.addEventListener('DOMContentLoaded', () => {
    let lang = localStorage.getItem('yalla-lang');
    let dir = localStorage.getItem('yalla-dir');

    if (!lang) {
        // Detect browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang && browserLang.startsWith('ar')) {
            lang = 'ar';
            dir = 'rtl';
        } else {
            lang = 'en';
            dir = 'ltr';
        }
    }

    setLanguage(lang, dir);

    // Update language button text
    const selectedOption = Array.from(languageOptions).find(opt => opt.getAttribute('data-lang') === lang);
    if (selectedOption) {
        const text = selectedOption.querySelector('.language-text').textContent;
        languageBtn.innerHTML = `
            <span class="language-text">${text}</span>
            <i class="fas fa-chevron-down text-xs"></i>
        `;
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const logo = document.getElementById('yalla-logo');
    const container = document.getElementById('logo-container');
    
    // Animation state
    let isDragging = false;
    let baseX = 0, baseY = 0; // Stores the dragged position
    let floatOffsetX = 0, floatOffsetY = 0; // For floating animation
    let animationId = null;
    
    // Mouse/touch events
    container.addEventListener('mousedown', startDrag);
    container.addEventListener('touchstart', startDrag, { passive: false });
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    
    function startDrag(e) {
        isDragging = true;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        // Get initial position
        const rect = logo.getBoundingClientRect();
        const startX = clientX - rect.left;
        const startY = clientY - rect.top;
        
        // Store current base position (including any previous float offset)
        baseX = parseFloat(logo.style.getPropertyValue('--translate-x')) || 0;
        baseY = parseFloat(logo.style.getPropertyValue('--translate-y')) || 0;
        
        // Reset float offsets
        floatOffsetX = 0;
        floatOffsetY = 0;
        
        container.style.cursor = 'grabbing';
        cancelAnimationFrame(animationId); // Stop floating animation
        
        e.preventDefault();
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        // Calculate new base position
        const containerRect = container.getBoundingClientRect();
        baseX = (clientX - containerRect.left - (containerRect.width / 2));
        baseY = (clientY - containerRect.top - (containerRect.height / 2));
        
        applyTransform();
        e.preventDefault();
    }
    
    function endDrag() {
        if (!isDragging) return;
        
        isDragging = false;
        container.style.cursor = 'grab';
        
        // Restart floating animation from new position
        startFloatingAnimation();
    }
    
    function applyTransform() {
        const totalX = baseX + floatOffsetX;
        const totalY = baseY + floatOffsetY;
        
        // Calculate rotation based on position
        const rotateY = totalX / 20;
        const rotateX = -totalY / 20;
        
        logo.style.transform = `
            translate3d(${totalX}px, ${totalY}px, 0)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            scale(${isDragging ? 1.1 : 1})
        `;
        
        // Store base position in CSS variables
        logo.style.setProperty('--translate-x', baseX);
        logo.style.setProperty('--translate-y', baseY);
    }
    
    function startFloatingAnimation() {
        const floatAmplitude = 15;
        const floatSpeed = 0.002;
        let lastTime = performance.now();
        
        function floatAnimation(time) {
            if (!isDragging) {
                const delta = time - lastTime;
                lastTime = time;
                
                // Calculate floating offsets
                floatOffsetX = Math.sin(time * floatSpeed * 0.7) * floatAmplitude * 0.5;
                floatOffsetY = Math.sin(time * floatSpeed) * floatAmplitude;
                
                applyTransform();
            }
            
            animationId = requestAnimationFrame(floatAnimation);
        }
        
        animationId = requestAnimationFrame(floatAnimation);
    }
    
    // Initialize floating animation
    startFloatingAnimation();
    
    // Cleanup on page hide
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            startFloatingAnimation();
        }
    });
    
    // Add slight hover effect
    container.addEventListener('mouseenter', () => {
        if (!isDragging) {
            logo.style.transition = 'transform 0.3s ease';
            logo.style.transform = 'scale(1.05)';
        }
    });
    
    container.addEventListener('mouseleave', () => {
        if (!isDragging) {
            logo.style.transition = 'transform 0.3s ease';
            logo.style.transform = '';
        }
    });
});

// Scroll to form and show it when "Register your interest" button is clicked
function showInterestForm() {
    document.getElementById('interest-form-section').classList.remove('hidden');
    document.getElementById('interest-form-section').scrollIntoView({ behavior: 'smooth' });
}

// Make all buttons with id "get-app-btn" or "mobile-get-app-btn" or with data-action="show-interest-form" work
['get-app-btn', 'mobile-get-app-btn'].forEach(id => {
    document.querySelectorAll(`#${id}`).forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            showInterestForm();
        });
    });
});

// Optional: Update form language on language switch
function updateInterestFormLang(lang) {
    document.querySelectorAll('#interest-form-section [data-en], #interest-form-section [data-ar]').forEach(el => {
        if (el.hasAttribute(`data-${lang}`)) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = el.getAttribute(`data-${lang}`);
            } else {
                el.textContent = el.getAttribute(`data-${lang}`);
            }
        }
    });
}
window.addEventListener('yallaLangChange', function(e) {
    updateInterestFormLang(e.detail.lang);
});

