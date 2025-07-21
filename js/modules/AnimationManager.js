// Менеджер анимации
class AnimationManager {
    constructor() {
        this.animationTypes = {
            fadeIn: 'Появление',
            slideInLeft: 'Слева',
            slideInRight: 'Справа', 
            slideInUp: 'Снизу',
            typewriter: 'Печатная машинка'
        };
    }
    
    getAnimationTypes() {
        return this.animationTypes;
    }
    
    animateElement(element, animationType = null) {
        const el = document.getElementById(`element-${element.id}`);
        if (!el) return;
        
        const animation = animationType || element.animation.in;
        const duration = element.animation.duration || 0.5;
        
        el.style.display = 'block';
        
        switch (animation) {
            case 'fadeIn':
                this.fadeIn(el, duration);
                break;
            case 'slideInLeft':
                this.slideInLeft(el, duration);
                break;
            case 'slideInRight':
                this.slideInRight(el, duration);
                break;
            case 'slideInUp':
                this.slideInUp(el, duration);
                break;
            case 'typewriter':
                if (element.type === 'text') {
                    this.typewriter(el, element.content, duration);
                }
                break;
            default:
                el.style.opacity = '1';
        }
    }
    
    fadeIn(element, duration) {
        gsap.fromTo(element,
            { opacity: 0 },
            { opacity: 1, duration: duration, ease: 'power2.out' }
        );
    }
    
    slideInLeft(element, duration) {
        gsap.fromTo(element,
            { opacity: 0, x: -100 },
            { opacity: 1, x: 0, duration: duration, ease: 'power2.out' }
        );
    }
    
    slideInRight(element, duration) {
        gsap.fromTo(element,
            { opacity: 0, x: 100 },
            { opacity: 1, x: 0, duration: duration, ease: 'power2.out' }
        );
    }
    
    slideInUp(element, duration) {
        gsap.fromTo(element,
            { opacity: 0, y: 100 },
            { opacity: 1, y: 0, duration: duration, ease: 'power2.out' }
        );
    }
    
    typewriter(element, text, duration) {
        element.textContent = '';
        element.style.opacity = '1';
        
        let i = 0;
        const interval = setInterval(() => {
            element.textContent += text[i];
            i++;
            if (i >= text.length) {
                clearInterval(interval);
            }
        }, duration * 1000 / text.length);
    }
    
    scheduleAnimation(element, delay = 0) {
        if (element.animated) return;
        
        setTimeout(() => {
            if (!element.animated) {
                this.animateElement(element);
                element.animated = true;
            }
        }, delay * 1000);
    }
    
    resetAnimation(element) {
        element.animated = false;
        const el = document.getElementById(`element-${element.id}`);
        if (el) {
            el.style.opacity = '0';
            el.style.display = 'none';
        }
    }
    
    createTimeline(elements) {
        const timeline = gsap.timeline({ repeat: -1 });
        
        elements.forEach(element => {
            const el = document.getElementById(`element-${element.id}`);
            if (!el) return;
            
            // Начальное состояние
            timeline.set(el, { opacity: 0, display: 'none' }, 0);
            
            // Показать элемент
            timeline.to(el, { display: 'block', duration: 0 }, element.startTime);
            
            // Анимация появления
            timeline.to(el, {
                opacity: 1,
                duration: element.animation.duration,
                ease: 'power2.out'
            }, element.startTime);
        });
        
        return timeline;
    }
}

// Делаем AnimationManager доступным глобально
window.AnimationManager = AnimationManager;