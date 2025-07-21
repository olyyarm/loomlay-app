// Экспорт презентации
class ExportManager {
    constructor(app) {
        this.app = app;
    }
    
    exportToHTML() {
        const html = this.generateHTML();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'presentation.html';
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    generateHTML() {
        return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Видео Презентация</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <style>
        body { margin: 0; padding: 0; background: #000; overflow: hidden; font-family: Arial, sans-serif; }
        .presentation { position: relative; width: 100vw; height: 100vh; }
        .slide { position: absolute; width: 100%; height: 100%; opacity: 0; }
        .slide.active { opacity: 1; }
        .background-video { width: 100%; height: 100%; object-fit: cover; }
        .elements-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        .text-element { position: absolute; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); opacity: 0; }
        .image-element { position: absolute; opacity: 0; }
        .image-element img { width: 100%; height: 100%; object-fit: contain; }
        .controls { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 1000; }
        .controls button { padding: 10px 20px; margin: 0 5px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 5px; cursor: pointer; }
        .controls button:hover { background: rgba(0,0,0,0.9); }
    </style>
</head>
<body>
    <div class="presentation" id="presentation">
        ${this.generateSlidesHTML()}
    </div>
    <div class="controls">
        <button onclick="prevSlide()">◀ Назад</button>
        <button onclick="togglePlay()" id="playBtn">▶ Играть</button>
        <button onclick="nextSlide()">Вперед ▶</button>
    </div>
    <script>
        ${this.generateScript()}
    </script>
</body>
</html>`;
    }
    
    generateSlidesHTML() {
        return this.app.slides.map((slide, index) => `
            <div class="slide ${index === 0 ? 'active' : ''}" id="slide-${index}">
                ${slide.videoSrc ? `<video class="background-video" loop muted autoplay><source src="video-${index}.mp4" type="video/mp4"></video>` : ''}
                <div class="elements-container">
                    ${slide.elements.map(element => this.generateElementHTML(element)).join('')}
                </div>
            </div>
        `).join('');
    }
    
    generateElementHTML(element) {
        if (element.type === 'text') {
            return `<div class="text-element" data-start="${element.startTime}" data-animation="${element.animation.in}" data-duration="${element.animation.duration}"
                style="left: ${element.x}px; top: ${element.y}px; font-size: ${element.fontSize}px; color: ${element.color};">
                ${element.content}
            </div>`;
        } else if (element.type === 'image') {
            return `<div class="image-element" data-start="${element.startTime}" data-animation="${element.animation.in}" data-duration="${element.animation.duration}"
                style="left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px;">
                <img src="image-${element.id}.png" alt="">
            </div>`;
        }
        return '';
    }
    
    generateScript() {
        return `
        let currentSlide = 0;
        let isPlaying = false;
        let slideInterval;
        
        function showSlide(index) {
            const slides = document.querySelectorAll('.slide');
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
            
            // Анимируем элементы текущего слайда
            const activeSlide = slides[index];
            if (activeSlide) {
                animateSlideElements(activeSlide);
            }
        }
        
        function animateSlideElements(slide) {
            const elements = slide.querySelectorAll('.text-element, .image-element');
            elements.forEach(element => {
                const startTime = parseFloat(element.dataset.start) * 1000;
                const animation = element.dataset.animation;
                const duration = parseFloat(element.dataset.duration);
                
                // Сбрасываем элемент
                gsap.set(element, { opacity: 0, x: 0, y: 0 });
                
                setTimeout(() => {
                    switch(animation) {
                        case 'fadeIn':
                            gsap.to(element, { opacity: 1, duration: duration });
                            break;
                        case 'slideInLeft':
                            gsap.fromTo(element, { x: -100 }, { opacity: 1, x: 0, duration: duration });
                            break;
                        case 'slideInRight':
                            gsap.fromTo(element, { x: 100 }, { opacity: 1, x: 0, duration: duration });
                            break;
                        case 'slideInUp':
                            gsap.fromTo(element, { y: 100 }, { opacity: 1, y: 0, duration: duration });
                            break;
                        default:
                            gsap.to(element, { opacity: 1, duration: duration });
                    }
                }, startTime);
            });
        }
        
        function nextSlide() {
            currentSlide = (currentSlide + 1) % ${this.app.slides.length};
            showSlide(currentSlide);
        }
        
        function prevSlide() {
            currentSlide = currentSlide === 0 ? ${this.app.slides.length - 1} : currentSlide - 1;
            showSlide(currentSlide);
        }
        
        function togglePlay() {
            const btn = document.getElementById('playBtn');
            if (isPlaying) {
                clearInterval(slideInterval);
                btn.textContent = '▶ Играть';
                isPlaying = false;
            } else {
                slideInterval = setInterval(nextSlide, 10000); // 10 секунд на слайд
                btn.textContent = '⏸ Пауза';
                isPlaying = true;
            }
        }
        
        // Инициализация
        showSlide(0);
        
        // Клавиатурное управление
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    prevSlide();
                    break;
                case 'ArrowRight':
                case ' ':
                    nextSlide();
                    break;
                case 'Escape':
                    togglePlay();
                    break;
            }
        });
        `;
    }
}

// Экспорт будет доступен через window.exportManager