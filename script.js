// Section Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active-section');
    });

    // Show selected section
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active-section');
    }

    // Toggle KIIT logo visibility
    const kiitLogo = document.getElementById('kiitLogoLink');
    if (kiitLogo) {
        if (sectionId === 'home') {
            kiitLogo.style.display = 'block';
        } else {
            kiitLogo.style.display = 'none';
        }
    }
}

// Modal Logic
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
    const kiitLogo = document.getElementById('kiitLogoLink');
    if (kiitLogo) kiitLogo.style.display = 'none';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
    const kiitLogo = document.getElementById('kiitLogoLink');
    const homeSection = document.getElementById('home');
    if (kiitLogo && homeSection && homeSection.classList.contains('active-section')) {
        kiitLogo.style.display = 'block';
    }
}

// Close modals when clicking outside the content
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            const kiitLogo = document.getElementById('kiitLogoLink');
            const homeSection = document.getElementById('home');
            if (kiitLogo && homeSection && homeSection.classList.contains('active-section')) {
                kiitLogo.style.display = 'block';
            }
        }
    });
});

// Projects Tabs Logic
function switchProjectTab(tab) {
    // Update buttons
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    
    // Update views
    const webView = document.getElementById('webProjectsView');
    const threedView = document.getElementById('3dModelsView');
    if (webView) webView.classList.remove('active-view');
    if (threedView) threedView.classList.remove('active-view');

    if (tab === 'web') {
        if (btns[0]) btns[0].classList.add('active');
        if (webView) webView.classList.add('active-view');
    } else {
        if (btns[1]) btns[1].classList.add('active');
        if (threedView) threedView.classList.add('active-view');
    }
}

// 3D Models Carousel Logic
let currentModelIndex = 0;
const models = document.querySelectorAll('.carousel-item');
const indicator = document.getElementById('modelIndicator');

function updateCarousel() {
    models.forEach((model, index) => {
        if (index === currentModelIndex) {
            model.classList.add('active');
        } else {
            model.classList.remove('active');
        }
    });
    if (indicator) {
        indicator.textContent = `${currentModelIndex + 1} / ${models.length}`;
    }
}

function nextModel() {
    if (models.length === 0) return;
    currentModelIndex = (currentModelIndex + 1) % models.length;
    updateCarousel();
}

function prevModel() {
    if (models.length === 0) return;
    currentModelIndex = (currentModelIndex - 1 + models.length) % models.length;
    updateCarousel();
}

// Initialize carousel indicator on load
document.addEventListener('DOMContentLoaded', () => {
    if(models.length > 0) {
        updateCarousel();
    }
});
