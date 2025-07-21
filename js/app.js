// Основной класс приложения
class VideoPresentation {
    constructor() {
        this.slides = [];
        this.currentSlide = 0;
        this.selectedElement = null;
        this.isPlaying = false;
        this.slideStartTime = 0;
        this.animatedElements = new Set();
        this.project = {
            name: 'Новый проект',
            slides: [],
            settings: {
                fps: 30
            }
        };

        // Создаем первый слайд по умолчанию
        this.addSlide();
        this.init();
    }

    updateSlideNavigation() {
        const counter = document.getElementById('slide-counter');
        const prevBtn = document.getElementById('prev-slide');
        const nextBtn = document.getElementById('next-slide');

        if (counter) counter.textContent = `Слайд ${this.currentSlide + 1} из ${this.slides.length}`;
        if (prevBtn) prevBtn.disabled = this.currentSlide === 0;
        if (nextBtn) nextBtn.disabled = this.currentSlide === this.slides.length - 1;
    }

    addSlide() {
        const slide = {
            id: Date.now(),
            name: `Слайд ${this.slides.length + 1}`,
            videoSrc: null,
            elements: [],
            duration: 10
        };

        this.slides.push(slide);
        this.currentSlide = this.slides.length - 1;
        this.updateSlideNavigation();
        return slide;
    }

    getCurrentSlide() {
        return this.slides[this.currentSlide] || null;
    }

    init() {
        this.setupEventListeners();
        this.updateSlideNavigation();
        this.loadSlide(0);
    }

    setupEventListeners() {
        // Управление слайдами
        document.getElementById('add-slide').addEventListener('click', () => {
            this.addSlide();
            this.switchToSlide(this.slides.length - 1);
        });

        document.getElementById('prev-slide').addEventListener('click', () => {
            if (this.currentSlide > 0) {
                this.switchToSlide(this.currentSlide - 1);
            }
        });

        document.getElementById('next-slide').addEventListener('click', () => {
            if (this.currentSlide < this.slides.length - 1) {
                this.switchToSlide(this.currentSlide + 1);
            }
        });

        // Загрузка видео
        document.getElementById('load-video').addEventListener('click', () => {
            document.getElementById('video-input').click();
        });

        document.getElementById('video-input').addEventListener('change', (e) => {
            this.loadVideo(e.target.files[0]);
        });

        // Добавление элементов
        document.getElementById('add-text').addEventListener('click', () => {
            this.addTextElement();
        });

        document.getElementById('add-image').addEventListener('click', () => {
            document.getElementById('image-input').click();
        });

        document.getElementById('image-input').addEventListener('change', (e) => {
            this.addImageElement(e.target.files[0]);
        });

        // Предпросмотр и экспорт
        document.getElementById('preview').addEventListener('click', () => {
            this.showPreview();
        });

        document.getElementById('fullscreen-present').addEventListener('click', () => {
            this.startFullscreenPresentation();
        });

        document.getElementById('export').addEventListener('click', () => {
            this.exportProject();
        });

        document.getElementById('save-project').addEventListener('click', () => {
            this.saveProject();
        });

        document.getElementById('load-project').addEventListener('click', () => {
            document.getElementById('project-input').click();
        });

        document.getElementById('project-input').addEventListener('change', (e) => {
            this.loadProject(e.target.files[0]);
        });

        // Закрытие модального окна
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('preview-modal').style.display = 'none';
        });

        // Клик вне модального окна
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('preview-modal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Клавиатурные сокращения
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        if (this.currentSlide > 0) {
                            this.switchToSlide(this.currentSlide - 1);
                        }
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        if (this.currentSlide < this.slides.length - 1) {
                            this.switchToSlide(this.currentSlide + 1);
                        }
                        break;
                }
            }
        });
    }

    switchToSlide(slideIndex) {
        if (slideIndex < 0 || slideIndex >= this.slides.length) return;

        this.saveCurrentSlide();
        this.currentSlide = slideIndex;
        this.loadSlide(slideIndex);
        this.updateSlideNavigation();
        this.animatedElements.clear();
        this.slideStartTime = Date.now();
    }

    saveCurrentSlide() {
        const slide = this.getCurrentSlide();
        if (!slide) return;
        slide.elements = [...this.getCurrentElements()];
    }

    loadSlide(slideIndex) {
        const slide = this.slides[slideIndex];
        if (!slide) return;

        const container = document.getElementById('elements-container');
        container.innerHTML = '';

        if (slide.videoSrc) {
            const video = document.getElementById('background-video');
            video.src = slide.videoSrc;
            video.load();
        }

        slide.elements.forEach(element => {
            this.renderElement(element);
        });

        this.selectedElement = null;
        this.updateProperties();
        this.updateLayers();
        this.updateTimeline();
    }

    getCurrentElements() {
        const slide = this.getCurrentSlide();
        return slide ? slide.elements : [];
    }

    loadVideo(file) {
        if (!file) return;

        const slide = this.getCurrentSlide();
        if (!slide) return;

        const video = document.getElementById('background-video');
        const url = URL.createObjectURL(file);

        slide.videoFile = {
            name: file.name,
            size: file.size,
            type: file.type
        };

        this.convertVideoToBase64(file, (base64) => {
            slide.videoBase64 = base64;
        });

        slide.videoSrc = url;
        video.src = url;
        video.load();

        video.addEventListener('loadedmetadata', () => {
            slide.duration = Math.max(video.duration, 10);
            console.log('Видео загружено для слайда:', slide.name);
        });

        video.addEventListener('canplay', () => {
            video.play();
        });
    }

    convertVideoToBase64(file, callback) {
        const reader = new FileReader();
        reader.onload = function (e) {
            callback(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    addTextElement() {
        const slide = this.getCurrentSlide();
        if (!slide) return;

        const element = {
            id: Date.now(),
            type: 'text',
            content: 'Новый текст',
            x: 50,
            y: 50,
            width: 200,
            height: 50,
            fontSize: 24,
            color: '#ffffff',
            fontFamily: 'Arial',
            opacity: 1,
            startTime: 1,
            animation: {
                in: 'fadeIn',
                duration: 0.5,
                persistent: true
            },
            animated: false
        };

        slide.elements.push(element);
        this.renderElement(element);
        this.selectElement(element);
        this.updateLayers();
        this.updateTimeline();
    }

    addImageElement(file) {
        if (!file) return;

        const slide = this.getCurrentSlide();
        if (!slide) return;

        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            const element = {
                id: Date.now(),
                type: 'image',
                src: url,
                x: 100,
                y: 100,
                width: Math.min(img.width, 300),
                height: Math.min(img.height, 200),
                opacity: 1,
                startTime: 1,
                animation: {
                    in: 'fadeIn',
                    duration: 0.5,
                    persistent: true
                },
                animated: false
            };

            slide.elements.push(element);
            this.renderElement(element);
            this.selectElement(element);
            this.updateLayers();
            this.updateTimeline();
        };

        img.src = url;
    }

    renderElement(element) {
        const container = document.getElementById('elements-container');
        const div = document.createElement('div');

        div.className = `${element.type}-element`;
        div.id = `element-${element.id}`;
        div.style.left = element.x + 'px';
        div.style.top = element.y + 'px';
        div.style.width = element.width + 'px';
        div.style.height = element.height + 'px';

        // В режиме редактирования элементы всегда видимы
        div.style.opacity = 1;
        div.style.display = 'block';

        if (element.type === 'text') {
            div.textContent = element.content;
            div.style.fontSize = element.fontSize + 'px';
            div.style.color = element.color;
            div.style.fontFamily = element.fontFamily;
            div.style.whiteSpace = 'pre-wrap'; // Позволяет переносы строк
            div.style.wordWrap = 'break-word'; // Переносит длинные слова

            // Добавляем ручки для изменения размера
            this.addResizeHandles(div, element);
        } else if (element.type === 'image') {
            const img = document.createElement('img');
            img.src = element.src;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            div.appendChild(img);
        }

        div.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElement(element);
        });

        this.makeDraggable(div, element);
        container.appendChild(div);

        // Анимация только для предпросмотра, в редакторе элементы всегда видны
        // this.scheduleElementAnimation(element);
    }

    scheduleElementAnimation(element) {
        if (element.animated) return;

        // Сразу показываем элемент, а потом анимируем
        const el = document.getElementById(`element-${element.id}`);
        if (el) {
            el.style.display = 'block';
            el.style.opacity = '1'; // Показываем сразу, чтобы текст не исчезал
        }

        setTimeout(() => {
            if (!element.animated) {
                this.animateElementIn(element);
                element.animated = true;
            }
        }, element.startTime * 1000);
    }

    animateElementIn(element) {
        const el = document.getElementById(`element-${element.id}`);
        if (!el) return;

        el.style.display = 'block';

        switch (element.animation.in) {
            case 'fadeIn':
                gsap.fromTo(el,
                    { opacity: 0 },
                    { opacity: element.opacity || 1, duration: element.animation.duration, ease: 'power2.out' }
                );
                break;
            case 'slideInLeft':
                gsap.fromTo(el,
                    { opacity: 0, x: -100 },
                    { opacity: element.opacity || 1, x: 0, duration: element.animation.duration, ease: 'power2.out' }
                );
                break;
            case 'slideInRight':
                gsap.fromTo(el,
                    { opacity: 0, x: 100 },
                    { opacity: element.opacity || 1, x: 0, duration: element.animation.duration, ease: 'power2.out' }
                );
                break;
            case 'slideInUp':
                gsap.fromTo(el,
                    { opacity: 0, y: 100 },
                    { opacity: element.opacity || 1, y: 0, duration: element.animation.duration, ease: 'power2.out' }
                );
                break;
            case 'typewriter':
                if (element.type === 'text') {
                    this.typewriterAnimation(el, element);
                }
                break;
            default:
                el.style.opacity = element.opacity || 1;
        }
    }

    typewriterAnimation(el, element) {
        const text = element.content;
        el.textContent = '';
        el.style.opacity = 1;

        let i = 0;
        const interval = setInterval(() => {
            el.textContent += text[i];
            i++;
            if (i >= text.length) {
                clearInterval(interval);
            }
        }, element.animation.duration * 1000 / text.length);
    }

    makeDraggable(element, data) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = data.x;
            startTop = data.y;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        function onMouseMove(e) {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            data.x = startLeft + deltaX;
            data.y = startTop + deltaY;

            element.style.left = data.x + 'px';
            element.style.top = data.y + 'px';
        }

        function onMouseUp() {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }

    selectElement(element) {
        const slide = this.getCurrentSlide();
        if (!slide) return;

        if (this.selectedElement) {
            const prevEl = document.getElementById(`element-${this.selectedElement.id}`);
            if (prevEl) prevEl.classList.remove('selected');
        }

        this.selectedElement = element;

        const el = document.getElementById(`element-${element.id}`);
        if (el) el.classList.add('selected');

        this.updateProperties();
        this.updateLayers();
    }

    updateProperties() {
        const content = document.getElementById('properties-content');

        if (!this.selectedElement) {
            content.innerHTML = '<p>Выберите элемент для редактирования</p>';
            return;
        }

        const element = this.selectedElement;

        if (element.type === 'text') {
            content.innerHTML = `
                <div class="property-group">
                    <h4>Текст</h4>
                    <div class="property-row">
                        <span class="property-label">Содержание:</span>
                        <div class="property-input">
                            <textarea id="text-content">${element.content}</textarea>
                        </div>
                    </div>
                    <div class="property-row">
                        <span class="property-label">Размер:</span>
                        <div class="property-input">
                            <input type="number" id="font-size" value="${element.fontSize}" min="8" max="200">
                        </div>
                    </div>
                    <div class="property-row">
                        <span class="property-label">Цвет:</span>
                        <div class="property-input">
                            <div class="color-picker">
                                <div class="color-preview" style="background: ${element.color}"></div>
                                <input type="color" id="text-color" value="${element.color}">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="property-group">
                    <h4>Позиция и размер</h4>
                    <div class="property-row">
                        <span class="property-label">X:</span>
                        <div class="property-input">
                            <input type="number" id="pos-x" value="${element.x}">
                        </div>
                    </div>
                    <div class="property-row">
                        <span class="property-label">Y:</span>
                        <div class="property-input">
                            <input type="number" id="pos-y" value="${element.y}">
                        </div>
                    </div>
                    <div class="property-row">
                        <span class="property-label">Ширина:</span>
                        <div class="property-input">
                            <input type="number" id="text-width" value="${element.width}" min="50">
                        </div>
                    </div>
                    <div class="property-row">
                        <span class="property-label">Высота:</span>
                        <div class="property-input">
                            <input type="number" id="text-height" value="${element.height}" min="30">
                        </div>
                    </div>
                </div>
                <div class="property-group">
                    <h4>Анимация</h4>
                    <div class="property-row">
                        <span class="property-label">Задержка (сек):</span>
                        <div class="property-input">
                            <input type="number" id="start-time" value="${element.startTime}" min="0" max="60" step="0.1">
                        </div>
                    </div>
                    <div class="property-row">
                        <span class="property-label">Появление:</span>
                        <div class="property-input">
                            <select id="anim-in">
                                <option value="fadeIn" ${element.animation.in === 'fadeIn' ? 'selected' : ''}>Появление</option>
                                <option value="slideInLeft" ${element.animation.in === 'slideInLeft' ? 'selected' : ''}>Слева</option>
                                <option value="slideInRight" ${element.animation.in === 'slideInRight' ? 'selected' : ''}>Справа</option>
                                <option value="slideInUp" ${element.animation.in === 'slideInUp' ? 'selected' : ''}>Снизу</option>
                                <option value="typewriter" ${element.animation.in === 'typewriter' ? 'selected' : ''}>Печатная машинка</option>
                            </select>
                        </div>
                    </div>
                    <div class="property-row">
                        <span class="property-label">Длительность:</span>
                        <div class="property-input">
                            <input type="number" id="anim-duration" value="${element.animation.duration}" min="0.1" max="5" step="0.1">
                        </div>
                    </div>
                </div>
            `;
        }

        this.bindPropertyEvents();
    }

    bindPropertyEvents() {
        const element = this.selectedElement;
        if (!element) return;

        const textContent = document.getElementById('text-content');
        if (textContent) {
            textContent.addEventListener('input', (e) => {
                element.content = e.target.value;
                this.updateElementDisplay(element);
            });
        }

        const fontSize = document.getElementById('font-size');
        if (fontSize) {
            fontSize.addEventListener('input', (e) => {
                element.fontSize = parseInt(e.target.value);
                this.updateElementDisplay(element);
            });
        }

        const textColor = document.getElementById('text-color');
        if (textColor) {
            textColor.addEventListener('input', (e) => {
                element.color = e.target.value;
                this.updateElementDisplay(element);
                const preview = document.querySelector('.color-preview');
                if (preview) preview.style.background = e.target.value;
            });
        }

        const posX = document.getElementById('pos-x');
        if (posX) {
            posX.addEventListener('input', (e) => {
                element.x = parseInt(e.target.value);
                this.updateElementDisplay(element);
            });
        }

        const posY = document.getElementById('pos-y');
        if (posY) {
            posY.addEventListener('input', (e) => {
                element.y = parseInt(e.target.value);
                this.updateElementDisplay(element);
            });
        }

        // Обработчики для размера текста
        const textWidth = document.getElementById('text-width');
        if (textWidth) {
            textWidth.addEventListener('input', (e) => {
                element.width = Math.max(50, parseInt(e.target.value));
                this.updateElementDisplay(element);
            });
        }

        const textHeight = document.getElementById('text-height');
        if (textHeight) {
            textHeight.addEventListener('input', (e) => {
                element.height = Math.max(30, parseInt(e.target.value));
                this.updateElementDisplay(element);
            });
        }

        const startTime = document.getElementById('start-time');
        if (startTime) {
            startTime.addEventListener('input', (e) => {
                element.startTime = parseFloat(e.target.value);
                element.animated = false;
                this.scheduleElementAnimation(element);
            });
        }

        const animDuration = document.getElementById('anim-duration');
        if (animDuration) {
            animDuration.addEventListener('input', (e) => {
                element.animation.duration = parseFloat(e.target.value);
            });
        }

        const animIn = document.getElementById('anim-in');
        if (animIn) {
            animIn.addEventListener('change', (e) => {
                element.animation.in = e.target.value;
            });
        }
    }

    updateElementDisplay(element) {
        const el = document.getElementById(`element-${element.id}`);
        if (!el) return;

        el.style.left = element.x + 'px';
        el.style.top = element.y + 'px';
        el.style.width = element.width + 'px';
        el.style.height = element.height + 'px';

        if (element.type === 'text') {
            el.textContent = element.content;
            el.style.fontSize = element.fontSize + 'px';
            el.style.color = element.color;
        }
    }

    showPreview() {
        const modal = document.getElementById('preview-modal');
        modal.style.display = 'block';
        this.startFullPreview();
    }

    startFullPreview() {
        const container = document.getElementById('preview-container');
        container.innerHTML = '';

        const previewWrapper = document.createElement('div');
        previewWrapper.style.width = '100%';
        previewWrapper.style.height = '100%';
        previewWrapper.style.position = 'relative';

        container.appendChild(previewWrapper);

        this.playSlideshow(previewWrapper, 0);
    }

    playSlideshow(container, slideIndex) {
        if (slideIndex >= this.slides.length) {
            slideIndex = 0;
        }

        const slide = this.slides[slideIndex];
        if (!slide) return;

        container.innerHTML = '';

        if (slide.videoSrc) {
            const video = document.createElement('video');
            video.src = slide.videoSrc;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            video.loop = true;
            video.muted = true;
            video.autoplay = true;
            container.appendChild(video);
        }

        const elementsContainer = document.createElement('div');
        elementsContainer.style.position = 'absolute';
        elementsContainer.style.top = '0';
        elementsContainer.style.left = '0';
        elementsContainer.style.width = '100%';
        elementsContainer.style.height = '100%';
        container.appendChild(elementsContainer);

        slide.elements.forEach(element => {
            const el = this.createPreviewElement(element);
            elementsContainer.appendChild(el);

            setTimeout(() => {
                this.animatePreviewElement(el, element);
            }, element.startTime * 1000);
        });

        setTimeout(() => {
            this.playSlideshow(container, slideIndex + 1);
        }, slide.duration * 1000);
    }

    createPreviewElement(element) {
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = element.x + 'px';
        div.style.top = element.y + 'px';
        div.style.width = element.width + 'px';
        div.style.height = element.height + 'px';
        div.style.opacity = '0';
        div.style.display = 'none';

        if (element.type === 'text') {
            div.textContent = element.content;
            div.style.fontSize = element.fontSize + 'px';
            div.style.color = element.color;
            div.style.fontFamily = element.fontFamily;
            div.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        } else if (element.type === 'image') {
            const img = document.createElement('img');
            img.src = element.src;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            div.appendChild(img);
        }

        return div;
    }

    animatePreviewElement(el, element) {
        el.style.display = 'block';

        switch (element.animation.in) {
            case 'fadeIn':
                gsap.fromTo(el,
                    { opacity: 0 },
                    { opacity: 1, duration: element.animation.duration, ease: 'power2.out' }
                );
                break;
            case 'slideInLeft':
                gsap.fromTo(el,
                    { opacity: 0, x: -100 },
                    { opacity: 1, x: 0, duration: element.animation.duration, ease: 'power2.out' }
                );
                break;
            case 'slideInRight':
                gsap.fromTo(el,
                    { opacity: 0, x: 100 },
                    { opacity: 1, x: 0, duration: element.animation.duration, ease: 'power2.out' }
                );
                break;
            case 'slideInUp':
                gsap.fromTo(el,
                    { opacity: 0, y: 100 },
                    { opacity: 1, y: 0, duration: element.animation.duration, ease: 'power2.out' }
                );
                break;
            case 'typewriter':
                if (element.type === 'text') {
                    const text = element.content;
                    el.textContent = '';
                    el.style.opacity = '1';

                    let i = 0;
                    const interval = setInterval(() => {
                        el.textContent += text[i];
                        i++;
                        if (i >= text.length) {
                            clearInterval(interval);
                        }
                    }, element.animation.duration * 1000 / text.length);
                }
                break;
            default:
                el.style.opacity = '1';
        }
    }

    saveProject() {
        this.saveCurrentSlide();
        this.project.slides = this.slides;

        const data = JSON.stringify(this.project, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'presentation.json';
        a.click();

        URL.revokeObjectURL(url);
        console.log('Проект сохранен');
    }

    loadProject(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const projectData = JSON.parse(e.target.result);

                this.project = projectData;
                this.slides = projectData.slides || [];

                this.slides.forEach(slide => {
                    if (slide.videoBase64) {
                        slide.videoSrc = slide.videoBase64;
                    }
                });

                if (this.slides.length === 0) {
                    this.addSlide();
                } else {
                    this.currentSlide = 0;
                }

                this.loadSlide(this.currentSlide);
                this.updateSlideNavigation();

                console.log('Проект загружен:', projectData.name);
                alert(`Проект "${projectData.name}" успешно загружен!\nСлайдов: ${this.slides.length}`);

            } catch (error) {
                console.error('Ошибка при загрузке проекта:', error);
                alert('Ошибка при загрузке проекта. Проверьте формат файла.');
            }
        };

        reader.readAsText(file);
    }

    exportProject() {
        console.log('Экспорт презентации...');
    }

    addResizeHandles(element, data) {
        // Создаем ручки для изменения размера
        const handles = ['se', 'sw', 'ne', 'nw']; // southeast, southwest, northeast, northwest

        handles.forEach(position => {
            const handle = document.createElement('div');
            handle.className = `resize-handle resize-${position}`;
            handle.style.position = 'absolute';
            handle.style.width = '8px';
            handle.style.height = '8px';
            handle.style.background = '#007acc';
            handle.style.border = '1px solid white';
            handle.style.borderRadius = '50%';
            handle.style.cursor = this.getResizeCursor(position);
            handle.style.zIndex = '10';

            // Позиционируем ручки
            switch (position) {
                case 'se': // правый нижний
                    handle.style.bottom = '-4px';
                    handle.style.right = '-4px';
                    break;
                case 'sw': // левый нижний
                    handle.style.bottom = '-4px';
                    handle.style.left = '-4px';
                    break;
                case 'ne': // правый верхний
                    handle.style.top = '-4px';
                    handle.style.right = '-4px';
                    break;
                case 'nw': // левый верхний
                    handle.style.top = '-4px';
                    handle.style.left = '-4px';
                    break;
            }

            // Добавляем обработчик изменения размера
            this.makeResizable(handle, element, data, position);

            element.appendChild(handle);
        });
    }

    getResizeCursor(position) {
        const cursors = {
            'se': 'nw-resize',
            'sw': 'ne-resize',
            'ne': 'ne-resize',
            'nw': 'nw-resize'
        };
        return cursors[position] || 'default';
    }

    makeResizable(handle, element, data, position) {
        let isResizing = false;
        let startX, startY, startWidth, startHeight, startLeft, startTop;

        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation(); // Предотвращаем перетаскивание элемента
            isResizing = true;

            startX = e.clientX;
            startY = e.clientY;
            startWidth = data.width;
            startHeight = data.height;
            startLeft = data.x;
            startTop = data.y;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        const onMouseMove = (e) => {
            if (!isResizing) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            let newWidth = startWidth;
            let newHeight = startHeight;
            let newX = startLeft;
            let newY = startTop;

            switch (position) {
                case 'se': // правый нижний - увеличиваем ширину и высоту
                    newWidth = Math.max(50, startWidth + deltaX);
                    newHeight = Math.max(30, startHeight + deltaY);
                    break;
                case 'sw': // левый нижний - изменяем ширину влево и высоту вниз
                    newWidth = Math.max(50, startWidth - deltaX);
                    newHeight = Math.max(30, startHeight + deltaY);
                    newX = startLeft + (startWidth - newWidth);
                    break;
                case 'ne': // правый верхний - ширина вправо, высота вверх
                    newWidth = Math.max(50, startWidth + deltaX);
                    newHeight = Math.max(30, startHeight - deltaY);
                    newY = startTop + (startHeight - newHeight);
                    break;
                case 'nw': // левый верхний - ширина и высота влево-вверх
                    newWidth = Math.max(50, startWidth - deltaX);
                    newHeight = Math.max(30, startHeight - deltaY);
                    newX = startLeft + (startWidth - newWidth);
                    newY = startTop + (startHeight - newHeight);
                    break;
            }

            // Обновляем данные элемента
            data.width = newWidth;
            data.height = newHeight;
            data.x = newX;
            data.y = newY;

            // Обновляем визуальное отображение
            element.style.width = newWidth + 'px';
            element.style.height = newHeight + 'px';
            element.style.left = newX + 'px';
            element.style.top = newY + 'px';

            // Обновляем панель свойств если элемент выбран
            if (this.selectedElement && this.selectedElement.id === data.id) {
                this.updatePropertiesValues();
            }
        };

        const onMouseUp = () => {
            isResizing = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }

    updatePropertiesValues() {
        const element = this.selectedElement;
        if (!element) return;

        // Обновляем значения в панели свойств
        const posX = document.getElementById('pos-x');
        const posY = document.getElementById('pos-y');
        const textWidth = document.getElementById('text-width');
        const textHeight = document.getElementById('text-height');

        if (posX) posX.value = element.x;
        if (posY) posY.value = element.y;
        if (textWidth) textWidth.value = element.width;
        if (textHeight) textHeight.value = element.height;
    }

    // Полноэкранная презентация
    startFullscreenPresentation() {
        this.saveCurrentSlide();

        const fullscreenDiv = document.getElementById('fullscreen-presentation');
        if (!fullscreenDiv) return;

        fullscreenDiv.classList.add('active');

        this.currentFullscreenSlide = 0;
        this.isFullscreenPlaying = true;
        this.fullscreenInterval = null;

        this.setupFullscreenControls();
        this.showFullscreenSlide(0);

        if (fullscreenDiv.requestFullscreen) {
            fullscreenDiv.requestFullscreen();
        }
    }

    setupFullscreenControls() {
        const prevBtn = document.getElementById('prev-fullscreen');
        const nextBtn = document.getElementById('next-fullscreen');
        const playPauseBtn = document.getElementById('play-pause-fullscreen');
        const exitBtn = document.getElementById('exit-fullscreen');

        if (prevBtn) {
            prevBtn.onclick = () => this.previousFullscreenSlide();
        }

        if (nextBtn) {
            nextBtn.onclick = () => this.nextFullscreenSlide();
        }

        if (playPauseBtn) {
            playPauseBtn.onclick = () => this.toggleFullscreenPlayback();
        }

        if (exitBtn) {
            exitBtn.onclick = () => this.exitFullscreenPresentation();
        }

        this.fullscreenKeyHandler = (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousFullscreenSlide();
                    break;
                case 'ArrowRight':
                case ' ':
                    e.preventDefault();
                    this.nextFullscreenSlide();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.exitFullscreenPresentation();
                    break;
            }
        };

        document.addEventListener('keydown', this.fullscreenKeyHandler);
    }

    showFullscreenSlide(slideIndex) {
        if (slideIndex < 0 || slideIndex >= this.slides.length) return;

        this.currentFullscreenSlide = slideIndex;
        const slide = this.slides[slideIndex];

        const container = document.getElementById('fullscreen-slides');
        if (!container) return;

        container.innerHTML = '';

        const slideDiv = document.createElement('div');
        slideDiv.className = 'fullscreen-slide active';

        if (slide.videoSrc) {
            const video = document.createElement('video');
            video.className = 'fullscreen-video';
            video.src = slide.videoSrc;
            video.loop = true;
            video.muted = true;
            video.autoplay = true;
            slideDiv.appendChild(video);
        }

        const elementsContainer = document.createElement('div');
        elementsContainer.className = 'fullscreen-elements';

        // Добавляем слайд в DOM сначала, чтобы получить правильные размеры
        slideDiv.appendChild(elementsContainer);
        container.appendChild(slideDiv);

        // Теперь вычисляем масштаб после добавления в DOM
        setTimeout(() => {
            // Базовые размеры редактора (16:9 пропорции)
            const baseWidth = 1200;
            const baseHeight = 675;

            // Получаем реальные размеры полноэкранного слайда
            const slideRect = slideDiv.getBoundingClientRect();
            const scaleX = slideRect.width / baseWidth;
            const scaleY = slideRect.height / baseHeight;
            const scale = Math.min(scaleX, scaleY);

            // Создаем элементы с правильным масштабом
            slide.elements.forEach(element => {
                const el = this.createFullscreenElement(element, scale);
                elementsContainer.appendChild(el);

                // Показываем элемент сразу, а потом анимируем
                el.style.display = 'block';
                el.style.opacity = '1';

                setTimeout(() => {
                    this.animateFullscreenElement(el, element);
                }, element.startTime * 1000);
            });
        }, 50); // Небольшая задержка для корректного вычисления размеров

        const indicator = document.getElementById('slide-indicator');
        if (indicator) {
            indicator.textContent = `Слайд ${slideIndex + 1} из ${this.slides.length}`;
        }

        if (this.isFullscreenPlaying) {
            this.scheduleNextFullscreenSlide();
        }
    }

    createFullscreenElement(element, scale = 1) {
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = (element.x * scale) + 'px';
        div.style.top = (element.y * scale) + 'px';
        div.style.width = (element.width * scale) + 'px';
        div.style.height = (element.height * scale) + 'px';
        div.style.opacity = '0';
        div.style.display = 'none';

        if (element.type === 'text') {
            div.textContent = element.content;
            div.style.fontSize = (element.fontSize * scale) + 'px';
            div.style.color = element.color;
            div.style.fontFamily = element.fontFamily;
            div.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        } else if (element.type === 'image') {
            const img = document.createElement('img');
            img.src = element.src;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            div.appendChild(img);
        }

        return div;
    }

    animateFullscreenElement(el, element) {
        el.style.display = 'block';

        switch (element.animation.in) {
            case 'fadeIn':
                gsap.fromTo(el,
                    { opacity: 0 },
                    { opacity: 1, duration: element.animation.duration, ease: 'power2.out' }
                );
                break;
            case 'slideInLeft':
                gsap.fromTo(el,
                    { opacity: 0, x: -100 },
                    { opacity: 1, x: 0, duration: element.animation.duration, ease: 'power2.out' }
                );
                break;
            case 'slideInRight':
                gsap.fromTo(el,
                    { opacity: 0, x: 100 },
                    { opacity: 1, x: 0, duration: element.animation.duration, ease: 'power2.out' }
                );
                break;
            case 'slideInUp':
                gsap.fromTo(el,
                    { opacity: 0, y: 100 },
                    { opacity: 1, y: 0, duration: element.animation.duration, ease: 'power2.out' }
                );
                break;
            default:
                el.style.opacity = '1';
        }
    }

    scheduleNextFullscreenSlide() {
        if (this.fullscreenInterval) {
            clearTimeout(this.fullscreenInterval);
        }

        const currentSlide = this.slides[this.currentFullscreenSlide];
        if (currentSlide) {
            this.fullscreenInterval = setTimeout(() => {
                this.nextFullscreenSlide();
            }, currentSlide.duration * 1000);
        }
    }

    nextFullscreenSlide() {
        const nextIndex = (this.currentFullscreenSlide + 1) % this.slides.length;
        this.showFullscreenSlide(nextIndex);
    }

    previousFullscreenSlide() {
        const prevIndex = this.currentFullscreenSlide === 0 ?
            this.slides.length - 1 : this.currentFullscreenSlide - 1;
        this.showFullscreenSlide(prevIndex);
    }

    toggleFullscreenPlayback() {
        this.isFullscreenPlaying = !this.isFullscreenPlaying;
        const btn = document.getElementById('play-pause-fullscreen');

        if (this.isFullscreenPlaying) {
            if (btn) btn.textContent = '⏸ Пауза';
            this.scheduleNextFullscreenSlide();
        } else {
            if (btn) btn.textContent = '▶ Играть';
            if (this.fullscreenInterval) {
                clearTimeout(this.fullscreenInterval);
            }
        }
    }

    exitFullscreenPresentation() {
        const fullscreenDiv = document.getElementById('fullscreen-presentation');
        if (fullscreenDiv) {
            fullscreenDiv.classList.remove('active');
        }

        if (this.fullscreenInterval) {
            clearTimeout(this.fullscreenInterval);
        }

        if (this.fullscreenKeyHandler) {
            document.removeEventListener('keydown', this.fullscreenKeyHandler);
        }

        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }

    // Методы для совместимости с timeline.js и layers.js
    updateTimeline() {
        if (window.timelineManager) {
            window.timelineManager.update(this.getCurrentElements());
        }
    }

    updateLayers() {
        if (window.layersManager) {
            window.layersManager.update(this.getCurrentElements(), this.selectedElement);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    addResizeHandles(element, data) {
        // Создаем ручки для изменения размера
        const handles = ['se', 'sw', 'ne', 'nw']; // southeast, southwest, northeast, northwest

        handles.forEach(position => {
            const handle = document.createElement('div');
            handle.className = `resize-handle resize-${position}`;
            handle.style.position = 'absolute';
            handle.style.width = '8px';
            handle.style.height = '8px';
            handle.style.background = '#007acc';
            handle.style.border = '1px solid white';
            handle.style.borderRadius = '50%';
            handle.style.cursor = this.getResizeCursor(position);
            handle.style.zIndex = '10';

            // Позиционируем ручки
            switch (position) {
                case 'se': // правый нижний
                    handle.style.bottom = '-4px';
                    handle.style.right = '-4px';
                    break;
                case 'sw': // левый нижний
                    handle.style.bottom = '-4px';
                    handle.style.left = '-4px';
                    break;
                case 'ne': // правый верхний
                    handle.style.top = '-4px';
                    handle.style.right = '-4px';
                    break;
                case 'nw': // левый верхний
                    handle.style.top = '-4px';
                    handle.style.left = '-4px';
                    break;
            }

            // Добавляем обработчик изменения размера
            this.makeResizable(handle, element, data, position);

            element.appendChild(handle);
        });
    }

    getResizeCursor(position) {
        const cursors = {
            'se': 'nw-resize',
            'sw': 'ne-resize',
            'ne': 'ne-resize',
            'nw': 'nw-resize'
        };
        return cursors[position] || 'default';
    }

    makeResizable(handle, element, data, position) {
        let isResizing = false;
        let startX, startY, startWidth, startHeight, startLeft, startTop;

        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation(); // Предотвращаем перетаскивание элемента
            isResizing = true;

            startX = e.clientX;
            startY = e.clientY;
            startWidth = data.width;
            startHeight = data.height;
            startLeft = data.x;
            startTop = data.y;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        const onMouseMove = (e) => {
            if (!isResizing) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            let newWidth = startWidth;
            let newHeight = startHeight;
            let newX = startLeft;
            let newY = startTop;

            switch (position) {
                case 'se': // правый нижний - увеличиваем ширину и высоту
                    newWidth = Math.max(50, startWidth + deltaX);
                    newHeight = Math.max(30, startHeight + deltaY);
                    break;
                case 'sw': // левый нижний - изменяем ширину влево и высоту вниз
                    newWidth = Math.max(50, startWidth - deltaX);
                    newHeight = Math.max(30, startHeight + deltaY);
                    newX = startLeft + (startWidth - newWidth);
                    break;
                case 'ne': // правый верхний - ширина вправо, высота вверх
                    newWidth = Math.max(50, startWidth + deltaX);
                    newHeight = Math.max(30, startHeight - deltaY);
                    newY = startTop + (startHeight - newHeight);
                    break;
                case 'nw': // левый верхний - ширина и высота влево-вверх
                    newWidth = Math.max(50, startWidth - deltaX);
                    newHeight = Math.max(30, startHeight - deltaY);
                    newX = startLeft + (startWidth - newWidth);
                    newY = startTop + (startHeight - newHeight);
                    break;
            }

            // Обновляем данные элемента
            data.width = newWidth;
            data.height = newHeight;
            data.x = newX;
            data.y = newY;

            // Обновляем визуальное отображение
            element.style.width = newWidth + 'px';
            element.style.height = newHeight + 'px';
            element.style.left = newX + 'px';
            element.style.top = newY + 'px';

            // Обновляем панель свойств если элемент выбран
            if (this.selectedElement && this.selectedElement.id === data.id) {
                this.updatePropertiesValues();
            }
        };

        const onMouseUp = () => {
            isResizing = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }

    updatePropertiesValues() {
        const element = this.selectedElement;
        if (!element) return;

        // Обновляем значения в панели свойств
        const posX = document.getElementById('pos-x');
        const posY = document.getElementById('pos-y');
        const textWidth = document.getElementById('text-width');
        const textHeight = document.getElementById('text-height');

        if (posX) posX.value = element.x;
        if (posY) posY.value = element.y;
        if (textWidth) textWidth.value = element.width;
        if (textHeight) textHeight.value = element.height;
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.app = new VideoPresentation();
});