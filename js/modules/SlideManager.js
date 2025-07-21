// Менеджер слайдов
class SlideManager {
    constructor() {
        this.slides = [];
        this.currentSlide = 0;
    }
    
    addSlide() {
        const slide = {
            id: Date.now(),
            name: `Слайд ${this.slides.length + 1}`,
            videoSrc: null,
            videoBase64: null,
            elements: [],
            duration: 10
        };
        
        this.slides.push(slide);
        this.currentSlide = this.slides.length - 1;
        return slide;
    }
    
    getCurrentSlide() {
        return this.slides[this.currentSlide] || null;
    }
    
    switchToSlide(slideIndex) {
        if (slideIndex < 0 || slideIndex >= this.slides.length) return false;
        
        this.currentSlide = slideIndex;
        return true;
    }
    
    deleteSlide(slideIndex) {
        if (this.slides.length <= 1) return false; // Минимум один слайд
        
        this.slides.splice(slideIndex, 1);
        
        // Корректируем текущий слайд
        if (this.currentSlide >= this.slides.length) {
            this.currentSlide = this.slides.length - 1;
        }
        
        return true;
    }
    
    duplicateSlide(slideIndex) {
        const slide = this.slides[slideIndex];
        if (!slide) return null;
        
        const newSlide = {
            ...slide,
            id: Date.now(),
            name: slide.name + ' (копия)',
            elements: slide.elements.map(el => ({
                ...el,
                id: Date.now() + Math.random()
            }))
        };
        
        this.slides.splice(slideIndex + 1, 0, newSlide);
        return newSlide;
    }
    
    getSlideCount() {
        return this.slides.length;
    }
    
    getAllSlides() {
        return this.slides;
    }
    
    updateSlideName(slideIndex, name) {
        const slide = this.slides[slideIndex];
        if (slide) {
            slide.name = name;
            return true;
        }
        return false;
    }
}

// Делаем SlideManager доступным глобально
window.SlideManager = SlideManager;