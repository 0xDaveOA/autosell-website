// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const body = document.body;

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        });

        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                body.style.overflow = '';
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                body.style.overflow = '';
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                body.style.overflow = '';
            }
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = 70; // Height of fixed header
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Populate car listings
    populateCarListings();

    // Initialize mobile-specific features
    initializeMobileFeatures();
    
    // Initialize hero stats animation on ALL devices
    initializeHeroStatsAnimation();
});

// Initialize mobile-specific features
function initializeMobileFeatures() {
    // Add touch-friendly interactions
    addTouchInteractions();
    
    // Handle orientation changes
    handleOrientationChange();
    
    // Add scroll-based animations
    addScrollAnimations();
}

// Add touch-friendly interactions for mobile
function addTouchInteractions() {
    // Add touch feedback to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Add touch feedback to cards
    const cards = document.querySelectorAll('.feature-card, .car-card, .partner-card, .contact-card');
    cards.forEach(card => {
        card.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        card.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Handle device orientation changes
function handleOrientationChange() {
    window.addEventListener('orientationchange', function() {
        // Wait for orientation change to complete
        setTimeout(function() {
            // Recalculate any layout-dependent elements
            window.dispatchEvent(new Event('resize'));
        }, 100);
    });
}

// Add scroll-based animations
function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .car-card, .partner-card, .contact-card, .stat');
    animateElements.forEach(el => observer.observe(el));
}

// Sample car data - Updated with correct image paths
const sampleCars = [
    {
        id: 1,
        title: "Acura MDX A-Spec",
        price: "₵1,200,000",
        year: "2022",
        mileage: "45,760 km",
        location: "Ashongman Estate",
        images: [
            "Acura MDX/1.jpg",
            "Acura MDX/2.jpg",
            "Acura MDX/3.jpg",
            "Acura MDX/4.jpg"
        ],
        status: "Available"
    },
    {
        id: 2,
        title: "Benz C250",
        price: "₵195,000",
        year: "2018",
        mileage: "93,750 km",
        location: "East Legon",
        images: [
            "Benz C250/1.jpg",
            "Benz C250/2.jpg",
            "Benz C250/3.jpg",
            "Benz C250/4.jpg"
        ],
        status: "Available"
    },
    {
        id: 3,
        title: "Chevy Suburban",
        price: "₵1,600,000",
        year: "2016",
        mileage: "28,000 km",
        location: "Accra",
        images: [
            "Chevy Suburban/1.jpg",
            "Chevy Suburban/2.jpg",
            "Chevy Suburban/3.jpg",
            "Chevy Suburban/4.jpg"
        ],
        status: "Available"
    },
    {
        id: 4,
        title: "Elantra 2014",
        price: "₵132,000",
        year: "2014",
        mileage: "138,000 km",
        location: "Dansoman",
        images: [
            "Elantra 2014/1.jpg",
            "Elantra 2014/2.jpg",
            "Elantra 2014/3.jpg",
            "Elantra 2014/4.jpg"
        ],
        status: "Available"
    },
    {
        id: 5,
        title: "Ford Escape",
        price: "₵162,000",
        year: "2014",
        mileage: "89,980 km",
        location: "Dome",
        images: [
            "Ford Escape/1.jpg",
            "Ford Escape/2.jpg",
            "Ford Escape/3.jpg",
            "Ford Escape/4.jpg"
        ],
        status: "Available"
    },
    {
        id: 6,
        title: "Toyota Corolla LE",
        price: "₵150,000",
        year: "2015",
        mileage: "98,589 km",
        location: "Dansoman",
        images: [
            "Toyota Corolla LE/1.jpg",
            "Toyota Corolla LE/2.jpg",
            "Toyota Corolla LE/3.jpg",
            "Toyota Corolla LE/4.jpg"
        ],
        status: "Available"
    }
];


function populateCarListings() {
    const carsGrid = document.getElementById('carsGrid');
    if (!carsGrid) return;

    carsGrid.innerHTML = '';

    sampleCars.forEach(car => {
        const carCard = createCarCard(car);
        carsGrid.appendChild(carCard);
    });
}

// Create responsive car card
function createCarCard(car) {
    const card = document.createElement('div');
    card.className = 'car-card fade-in';
    card.setAttribute('data-car-id', car.id);
    
    card.innerHTML = `
        <div class="car-image">
            <img src="${car.images[0]}" alt="${car.title}" onerror="this.src='placeholder.jpg'">
            <span class="car-badge">${car.status}</span>
            
            <!-- Navigation Arrows -->
            <button class="car-nav-btn car-nav-prev" onclick="changeCarImage(${car.id}, 'prev')">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="car-nav-btn car-nav-next" onclick="changeCarImage(${car.id}, 'next')">
                <i class="fas fa-chevron-right"></i>
            </button>
            
            <!-- Pagination Dots -->
            <div class="car-pagination">
                ${car.images.map((_, index) => `
                    <span class="car-dot ${index === 0 ? 'active' : ''}" onclick="goToCarImage(${car.id}, ${index})"></span>
                `).join('')}
            </div>
        </div>
        
        <div class="car-details">
            <h3 class="car-title">${car.title}</h3>
            <div class="car-specs">
                <span><i class="fas fa-calendar"></i> ${car.year}</span>
                <span><i class="fas fa-tachometer-alt"></i> ${car.mileage}</span>
            </div>
            <div class="car-price">${car.price}</div>
            <div class="car-location">
                <i class="fas fa-map-marker-alt"></i> ${car.location}
            </div>
            <div class="car-actions">
                <button class="btn btn-contact" onclick="contactSeller('${car.title}')">
                    <i class="fas fa-comments"></i> Contact Seller
                </button>
                <button class="btn btn-details" onclick="viewDetails(${car.id})">
                    <i class="fas fa-info-circle"></i> Get Details
                </button>
            </div>
        </div>
    `;

    return card;
}

// Contact seller function
function contactSeller(carTitle) {
    const message = `Hi! I'm interested in the ${carTitle}.\n\nCan you provide more details about this vehicle?`;
    const whatsappUrl = `https://wa.me/233505677556?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// View car details function
function viewDetails(carId) {
    const car = sampleCars.find(c => c.id === carId);
    if (car) {
        // Create detailed message for WhatsApp
        const message = `Hi! I'm interested in learning more about the ${car.title}.\n\nCar Details:\n• Model: ${car.title}\n• Year: ${car.year}\n• Mileage: ${car.mileage}\n• Location: ${car.location}\n• Price: ${car.price}\n\nCan you provide more detailed information about this vehicle?`;
        const whatsappUrl = `https://wa.me/233505677556?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }
}

// Car image navigation functions
function changeCarImage(carId, direction) {
    const car = sampleCars.find(c => c.id === carId);
    if (!car) return;
    
    const card = document.querySelector(`[data-car-id="${carId}"]`);
    if (!card) return;
    
    const img = card.querySelector('.car-image img');
    const dots = card.querySelectorAll('.car-dot');
    const currentIndex = parseInt(img.dataset.currentIndex || 0);
    
    let newIndex;
    if (direction === 'next') {
        newIndex = (currentIndex + 1) % car.images.length;
    } else {
        newIndex = (currentIndex - 1 + car.images.length) % car.images.length;
    }
    
    // Update image
    img.src = car.images[newIndex];
    img.dataset.currentIndex = newIndex;
    
    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === newIndex);
    });
}

function goToCarImage(carId, imageIndex) {
    const car = sampleCars.find(c => c.id === carId);
    if (!car || imageIndex >= car.images.length) return;
    
    const card = document.querySelector(`[data-car-id="${carId}"]`);
    if (!card) return;
    
    const img = card.querySelector('.car-image img');
    const dots = card.querySelectorAll('.car-dot');
    
    // Update image
    img.src = car.images[imageIndex];
    img.dataset.currentIndex = imageIndex;
    
    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === imageIndex);
    });
}

// Enhanced mobile navigation with smooth animations
function enhanceMobileNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        // Add smooth slide animation
        navMenu.style.transition = 'all 0.3s ease-in-out';
        
        // Enhanced touch interactions
        navToggle.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.style.transform = 'scale(0.9)';
        });
        
        navToggle.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.style.transform = 'scale(1)';
        });
    }
}

// Initialize enhanced mobile features
document.addEventListener('DOMContentLoaded', function() {
    enhanceMobileNavigation();
    
    // Add responsive table handling
    handleResponsiveTables();
    
    // Add mobile-specific event listeners
    addMobileEventListeners();
});

// Handle responsive tables for mobile
function handleResponsiveTables() {
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        if (table.offsetWidth > window.innerWidth) {
            table.style.fontSize = '0.875rem';
            table.style.minWidth = '100%';
        }
    });
}

// Add mobile-specific event listeners
function addMobileEventListeners() {
    // Handle mobile-specific interactions
    const mobileBreakpoint = 768;
    
    function handleMobileLayout() {
        if (window.innerWidth <= mobileBreakpoint) {
            // Mobile-specific adjustments
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    }
    
    // Initial check
    handleMobileLayout();
    
    // Handle resize events
    window.addEventListener('resize', handleMobileLayout);
    
    // Handle scroll events for mobile performance
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                handleScrollEffects();
                ticking = false;
            });
            ticking = true;
        }
    });
}

// Handle scroll effects for mobile
function handleScrollEffects() {
    const scrolled = window.pageYOffset;
    const header = document.querySelector('.header');
    
    if (header) {
        if (scrolled > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
}

// Utility function to check if device is mobile
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
}

// Add mobile-specific CSS classes
if (isMobileDevice()) {
    document.body.classList.add('mobile-device');
}

// Handle mobile-specific interactions
document.addEventListener('DOMContentLoaded', function() {
    if (isMobileDevice()) {
        // Add mobile-specific touch handlers
        addMobileTouchHandlers();
        
        // Optimize images for mobile
        optimizeImagesForMobile();
        
        // Add mobile-specific animations
        addMobileAnimations();
    }
});

// Add mobile touch handlers
function addMobileTouchHandlers() {
    // Prevent double-tap zoom on buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.click();
        });
    });
    
    // Add swipe gestures for mobile navigation
    let startX = 0;
    let startY = 0;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', function(e) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Swipe left to open menu, swipe right to close
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            const navMenu = document.getElementById('navMenu');
            if (diffX > 0 && navMenu) {
                navMenu.classList.add('active');
            } else if (diffX < 0 && navMenu) {
                navMenu.classList.remove('active');
            }
        }
    });
}

// Optimize images for mobile
function optimizeImagesForMobile() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // Add loading="lazy" for better mobile performance
        img.loading = 'lazy';
        
        // Add error handling
        img.onerror = function() {
            this.src = 'placeholder.jpg';
            this.alt = 'Image not available';
        };
    });
}

// Add mobile-specific animations
function addMobileAnimations() {
    // Add mobile-friendly animations
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .fade-in {
                animation: mobileFadeIn 0.4s ease-out;
            }
            
            @keyframes mobileFadeIn {
                from { opacity: 0; transform: translateY(15px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .car-card, .feature-card, .partner-card, .contact-card {
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            
            .car-card:active, .feature-card:active, .partner-card:active, .contact-card:active {
                transform: scale(0.98);
            }
        }
    `;
    document.head.appendChild(style);
}

// Hero Stats Animation - Works on ALL devices
function initializeHeroStatsAnimation() {
    const stats = document.querySelectorAll('.stat');

    const animateCounter = (el) => {
        const target = parseInt(el.dataset.target);
        let count = 0;
        const increment = target / 50; // Adjust for speed
        
        const update = () => {
            count += increment;
            if (count < target) {
                el.textContent = Math.floor(count) + '+';
                requestAnimationFrame(update);
            } else {
                el.textContent = target + '+';
            }
        };
        update();
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const statEl = entry.target;
            const counterEl = statEl.querySelector('.stat-number');

            if (entry.isIntersecting) {
                statEl.classList.add('animate');
                if (counterEl) animateCounter(counterEl);
            } else {
                // Reset so animation + count replay if you scroll back
                statEl.classList.remove('animate');
                if (counterEl) counterEl.textContent = '0+';
            }
        });
    }, { threshold: 0.3 });

    stats.forEach(stat => observer.observe(stat));
}

document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".scroll-fade").forEach(el => {
    observer.observe(el);
  });
});
