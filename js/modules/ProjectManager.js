// Менеджер проектов
class ProjectManager {
    constructor() {
        this.project = {
            name: 'Новый проект',
            slides: [],
            settings: {
                fps: 30,
                version: '1.0'
            }
        };
    }
    
    createNewProject(name = 'Новый проект') {
        this.project = {
            name: name,
            slides: [],
            settings: {
                fps: 30,
                version: '1.0'
            }
        };
        return this.project;
    }
    
    saveProject(slides) {
        this.project.slides = slides;
        
        const data = JSON.stringify(this.project, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.project.name}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        return true;
    }
    
    loadProject(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('Файл не выбран'));
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const projectData = JSON.parse(e.target.result);
                    
                    // Валидация проекта
                    if (!this.validateProject(projectData)) {
                        reject(new Error('Неверный формат файла проекта'));
                        return;
                    }
                    
                    this.project = projectData;
                    
                    // Восстанавливаем видео из Base64
                    this.project.slides.forEach(slide => {
                        if (slide.videoBase64) {
                            slide.videoSrc = slide.videoBase64;
                        }
                    });
                    
                    resolve(this.project);
                    
                } catch (error) {
                    reject(new Error('Ошибка при чтении файла: ' + error.message));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Ошибка при чтении файла'));
            };
            
            reader.readAsText(file);
        });
    }
    
    validateProject(projectData) {
        return (
            projectData &&
            typeof projectData.name === 'string' &&
            Array.isArray(projectData.slides) &&
            projectData.settings &&
            typeof projectData.settings === 'object'
        );
    }
    
    exportToHTML(slides) {
        const html = this.generateHTML(slides);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.project.name}.html`;
        a.click();
        
        URL.revokeObjectURL(url);
        return true;
    }
    
    generateHTML(slides) {
        return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.project.name}</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <style>
        ${this.generateCSS()}
    </style>
</head>
<body>
    <div class="presentation" id="presentation">
        ${this.generateSlidesHTML(slides)}
    </div>
    <div class="controls">
        <button onclick="prevSlide()">◀ Назад</button>
        <button onclick="togglePlay()" id="playBtn">▶ Играть</button>
        <button onclick="nextSlide()">Вперед ▶</button>
    </div>
    <script>
        ${this.generateScript(slides)}
    </script>
</body>
</html>`;
    }
    
    generateCSS() {
        return `
        body { margin: 0; padding: 0; background: #000; overflow: hidden; font-family: Arial, sans-serif; }
        .presentation { position: relative; width: 100vw; height: 100vh; }
        .slide { position: absolute; width: 100%; height: 100%; opacity: 0; transition: opacity 0.5s; }
        .slide.active { opacity: 1; }
        .background-video { width: 100%; height: 100%; object-fit: cover; }
        .elements-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        .text-element { position: absolute; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); }
        .image-element { position: absolute; }
        .image-element img { width: 100%; height: 100%; object-fit: contain; }
        .controls { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 1000; }
        .controls button { padding: 10px 20px; margin: 0 5px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 5px; cursor: pointer; }
        .controls button:hover { background: rgba(0,0,0,0.9); }
        `;
    }
    
    generateSlidesHTML(slides) {
        return slides.map((slide, index) => `
            <div class="slide ${index === 0 ? 'active' : ''}" id="slide-${index}">
                ${slide.videoSrc ? `<video class="background-video" loop muted autoplay><source src="${slide.videoSrc}" type="video/mp4"></video>` : ''}
                <div class="elements-container">
                    ${slide.elements.map(element => this.generateElementHTML(element)).join('')}
                </div>
            </div>
        `).join('');
    }
    
    generateElementHTML(element) {
        if (element.type === 'text') {
            return `<div class="text-element" 
                style="left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px; 
                       font-size: ${element.fontSize}px; color: ${element.color}; font-family: ${element.fontFamily};">
                ${element.content}
            </div>`;
        } else if (element.type === 'image') {
            return `<div class="image-element" 
                style="left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px;">
                <img src="${element.src}" alt="">
            </div>`;
        }
        return '';
    }
    
    generateScript(slides) {
        return `
        let currentSlide = 0;
        let isPlaying = false;
        let slideInterval;
        
        function showSlide(index) {
            const slides = document.querySelectorAll('.slide');
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
        }
        
        function nextSlide() {
            currentSlide = (currentSlide + 1) % ${slides.length};
            showSlide(currentSlide);
        }
        
        function prevSlide() {
            currentSlide = currentSlide === 0 ? ${slides.length - 1} : currentSlide - 1;
            showSlide(currentSlide);
        }
        
        function togglePlay() {
            const btn = document.getElementById('playBtn');
            if (isPlaying) {
                clearInterval(slideInterval);
                btn.textContent = '▶ Играть';
                isPlaying = false;
            } else {
                slideInterval = setInterval(nextSlide, 5000);
                btn.textContent = '⏸ Пауза';
                isPlaying = true;
            }
        }
        
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft': prevSlide(); break;
                case 'ArrowRight':
                case ' ': nextSlide(); break;
                case 'Escape': togglePlay(); break;
            }
        });
        `;
    }
    
    getProject() {
        return this.project;
    }
    
    updateProjectName(name) {
        this.project.name = name;
    }
    
    updateProjectSettings(settings) {
        Object.assign(this.project.settings, settings);
    }
}

// Делаем ProjectManager доступным глобально
window.ProjectManager = ProjectManager;