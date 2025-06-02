/**
 * Scripts principales para la inicialización y funcionalidad de la página
 */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    initPage();
});

// Inicializar todos los componentes y funcionalidades de la página
function initPage() {
    // Inicializar secciones colapsables
    initCollapsibleSections();
    
    // Inicializar carrusel de equipos
    initTeamCarousel();
    
    // Añadir funcionalidad táctil para dispositivos móviles
    initTouchSupport();
    
    // Añadir detección de visibilidad para efectos de animación
    initScrollAnimations();
}

// Inicializar todas las secciones colapsables
function initCollapsibleSections() {
    // Inicializar sección de biografía
    new Components.CollapsibleSection('bio-header', 'bio-content');
    
    // Inicializar sección de trivia
    new Components.CollapsibleSection('trivia-header', 'trivia-content');
    
    // Inicializar sección de logros
    new Components.CollapsibleSection('logros-header', 'logros-content');
    
    // Abrir la sección de biografía por defecto
    const bioSection = new Components.CollapsibleSection('bio-header', 'bio-content');
    setTimeout(() => {
        bioSection.open();
    }, 500);
}

// Inicializar el carrusel de equipos
function initTeamCarousel() {
    // Inicializar el carrusel principal
    const teamCarousel = new Components.TeamCarousel('teams-container');
    
    // Opcional: Añadir botones de navegación para el carrusel
    addCarouselControls(teamCarousel);
}

// Añadir botones de navegación para el carrusel
function addCarouselControls(carousel) {
    // Solo añadir controles si hay suficientes equipos para desplazarse
    const teamsContainer = document.querySelector('.teams-container');
    const teamsSection = document.querySelector('.teams-section');
    
    if (teamsContainer && teamsSection && teamsContainer.scrollWidth > teamsContainer.clientWidth) {
        // Crear contenedor para botones
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'carousel-controls';
        controlsContainer.style.display = 'flex';
        controlsContainer.style.justifyContent = 'center';
        controlsContainer.style.gap = '10px';
        controlsContainer.style.marginTop = '15px';
        
        // Botón izquierdo
        const leftBtn = document.createElement('button');
        leftBtn.innerHTML = '&larr;';
        leftBtn.style.padding = '5px 15px';
        leftBtn.style.backgroundColor = '#303f9f';
        leftBtn.style.border = 'none';
        leftBtn.style.borderRadius = '4px';
        leftBtn.style.color = 'white';
        leftBtn.style.cursor = 'pointer';
        leftBtn.addEventListener('click', () => carousel.scrollLeft());
        
        // Botón derecho
        const rightBtn = document.createElement('button');
        rightBtn.innerHTML = '&rarr;';
        rightBtn.style.padding = '5px 15px';
        rightBtn.style.backgroundColor = '#303f9f';
        rightBtn.style.border = 'none';
        rightBtn.style.borderRadius = '4px';
        rightBtn.style.color = 'white';
        rightBtn.style.cursor = 'pointer';
        rightBtn.addEventListener('click', () => carousel.scrollRight());
        
        // Añadir botones al contenedor
        controlsContainer.appendChild(leftBtn);
        controlsContainer.appendChild(rightBtn);
        
        // Añadir contenedor después del carrusel
        teamsSection.appendChild(controlsContainer);
    }
}

// Inicializar soporte táctil para dispositivos móviles
function initTouchSupport() {
    const teamsContainer = document.querySelector('.teams-container');
    
    if (!teamsContainer) return;
    
    let startX;
    let scrollLeft;
    
    teamsContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX - teamsContainer.offsetLeft;
        scrollLeft = teamsContainer.scrollLeft;
    });
    
    teamsContainer.addEventListener('touchmove', (e) => {
        if (!startX) return;
        
        const x = e.touches[0].pageX - teamsContainer.offsetLeft;
        const walk = (x - startX) * 2; // Multiplicador para ajustar sensibilidad
        teamsContainer.scrollLeft = scrollLeft - walk;
    });
    
    teamsContainer.addEventListener('touchend', () => {
        startX = null;
    });
}

// Inicializar animaciones basadas en scroll
function initScrollAnimations() {
    // Obtener todos los elementos que queremos animar
    const elements = document.querySelectorAll('.section, .team-card, .achievement-card');
    
    // Configurar el observador de intersección
    const options = {
        root: null, // Viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% visible
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Añadir clase para animar la entrada
                entry.target.classList.add('fade-in');
                // Dejar de observar después de la animación
                observer.unobserve(entry.target);
            }
        });
    }, options);
    
    // Observar cada elemento
    elements.forEach(element => {
        // Añadir estilo base para la animación
        element.style.opacity = '0';
        element.style.transition = 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out';
        element.style.transform = 'translateY(20px)';
        
        // Añadir clase para la animación
        element.addEventListener('animationend', () => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }   );
        observer.observe(element);
    });
}