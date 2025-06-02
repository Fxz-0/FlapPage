/**
 * Componentes reutilizables para la página web
 */

// Componente para crear secciones colapsables
class CollapsibleSection {
    constructor(headerId, contentId) {
        this.header = document.getElementById(headerId);
        this.content = document.getElementById(contentId);
        this.isOpen = false;
        this.init();
    }

    init() {
        if (!this.header || !this.content) return;
        
        this.header.addEventListener('click', () => {
            this.toggle();
        });
    }

    toggle() {
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            this.header.classList.add('active');
            this.content.classList.add('active');
        } else {
            this.header.classList.remove('active');
            this.content.classList.remove('active');
        }
    }

    open() {
        if (!this.isOpen) {
            this.toggle();
        }
    }

    close() {
        if (this.isOpen) {
            this.toggle();
        }
    }
}

// Componente para tarjetas de equipos interactivas
class TeamCard {
    constructor(element) {
        this.card = element;
        this.overlay = element.querySelector('.team-overlay');
        this.init();
    }

    init() {
        if (!this.card || !this.overlay) return;
        
        // Para dispositivos móviles
        this.card.addEventListener('touchstart', () => {
            this.toggleOverlay();
        });
        
        // Para escritorio
        this.card.addEventListener('mouseenter', () => {
            this.showOverlay();
        });
        
        this.card.addEventListener('mouseleave', () => {
            this.hideOverlay();
        });
    }

    toggleOverlay() {
        if (this.overlay.style.opacity === '1') {
            this.hideOverlay();
        } else {
            this.showOverlay();
        }
    }

    showOverlay() {
        this.overlay.style.opacity = '1';
    }

    hideOverlay() {
        this.overlay.style.opacity = '0';
    }
}

// Componente para el carrusel de equipos
class TeamCarousel {
    constructor(containerId) {
        this.container = document.getElementById(containerId) || document.querySelector('.teams-container');
        this.scrollAmount = 250;
        this.init();
    }

    init() {
        if (!this.container) return;
        
        // Inicializar el desplazamiento horizontal con la rueda del ratón
        this.container.addEventListener('wheel', (event) => {
            event.preventDefault();
            
            // Determinar la dirección del scroll
            const direction = event.deltaY > 0 ? 1 : -1;
            
            // Realizar el scroll horizontal
            this.container.scrollLeft += (direction * this.scrollAmount);
        });
        
        // Inicializar las tarjetas de equipo
        const teamCards = this.container.querySelectorAll('.team-card');
        teamCards.forEach(card => {
            new TeamCard(card);
        });
    }

    scrollLeft() {
        this.container.scrollLeft -= this.scrollAmount;
    }

    scrollRight() {
        this.container.scrollLeft += this.scrollAmount;
    }
}

// Exportar componentes para uso externo
window.Components = {
    CollapsibleSection,
    TeamCard,
    TeamCarousel
};