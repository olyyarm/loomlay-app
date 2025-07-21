// Анимационные эффекты
class AnimationManager {
    constructor() {
        this.animations = {
            fadeIn: this.fadeIn,
            fadeOut: this.fadeOut,
            slideInLeft: this.slideInLeft,
            slideInRight: this.slideInRight,
            slideInUp: this.slideInUp,
            slideOutLeft: this.slideOutLeft,
            slideOutRight: this.slideOutRight,
            slideOutDown: this.slideOutDown,
            typewriter: this.typewriter
        };
    }
    
    fadeIn(element, duration = 0.5) {
        return gsap.fromTo(element, 
            { opacity: 0 }, 
            { opacity: 1, duration: duration, ease: 'power2.out' }
        );
    }
    
    fadeOut(element, duration = 0.5) {
        return gsap.to(element, 
            { opacity: 0, duration: duration, ease: 'power2.in' }
        );
    }
    
    slideInLeft(element, duration = 0.5) {
        return gsap.fromTo(element, 
            { opacity: 0, x: -100 }, 
            { opacity: 1, x: 0, duration: duration, ease: 'power2.out' }
        );
    }
    
    slideInRight(element, duration = 0.5) {
        return gsap.fromTo(element, 
            { opacity: 0, x: 100 }, 
            { opacity: 1, x: 0, duration: duration, ease: 'power2.out' }
        );
    }
    
    slideInUp(element, duration = 0.5) {
        return gsap.fromTo(element, 
            { opacity: 0, y: 100 }, 
            { opacity: 1, y: 0, duration: duration, ease: 'power2.out' }
        );
    }
    
    slideOutLeft(element, duration = 0.5) {
        return gsap.to(element, 
            { opacity: 0, x: -100, duration: duration, ease: 'power2.in' }
        );
    }
    
    slideOutRight(element, duration = 0.5) {
        return gsap.to(element, 
            { opacity: 0, x: 100, duration: duration, ease: 'power2.in' }
        );
    }
    
    slideOutDown(element, duration = 0.5) {
        return gsap.to(element, 
            { opacity: 0, y: 100, duration: duration, ease: 'power2.in' }
        );
    }
    
    typewriter(element, text, duration = 1) {
        element.textContent = '';
        element.style.opacity = '1';
        
        return new Promise((resolve) => {
            let i = 0;
            const interval = setInterval(() => {
                element.textContent += text[i];
                i++;
                if (i >= text.length) {
                    clearInterval(interval);
                    resolve();
                }
            }, duration * 1000 / text.length);
        });
    }
}

window.animationManager = new AnimationManager();