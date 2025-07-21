// Основной класс приложения (рефакторенная версия)
class VideoPresentation {
    constructor() {
        // Инициализация менеджеров
        this.slideManager = new SlideManager();
        this.elementManager = new ElementManager();
        this.animationManager = new AnimationManager();
        this.renderManager = new RenderManager(this.elementManager, this.animationManager);
        this.projectManager = new ProjectManager();

        // Состояние приложения
        this.isPlaying = false;
        this.fullscreenMode = false;
        this.currentTime = 0;

        // Инициализация
        this.init();
    }

    init() {
        this.setupDOM();
        this.setupEventListeners();
        this.createInitialSlide();
        this.updateUI();
    }

    setupDOM() {
        this.renderManager.setContainer('elements-container');

        // Добавляем обработчик клика по холсту для сброса выделения
        const canvas = document.getElementById('canvas');
        if (canvas) {
            canvas.addEventListener('click', (e) => {
                if (e.target === canvas || e.target.id === 'elements-container') {
                    this.elementManager.selectElement(null);
                    this.updateProperties();
                    this.updateLayers();
                }
            });
        }
    }

    setupEventListeners() {
        // Управление слайдами
        this.bindSlideControls();

        // Управление элементами
        this.bindElementControls();

        // Управление проектом
        this.bindProjectControls();

        // Управление презентацией
        this.bindPresentationControls();

        // Клавиатурные сокращения
        this.bindKeyboardShortcuts();
    }

    bindSlideControls() {
        const addSlideBtn = document.getElementById('add-slide');
        if (addSlideBtn) {
            console.log('Привязываем обработчик для кнопки "Добавить слайд"');
            addSlideBtn.addEventListener('click', () => {
                console.log('Кнопка "Добавить слайд" нажата');
                this.addSlide();
            });
        } else {
            console.error('Кнопка "add-slide" не найдена!');
        }

        const prevSlideBtn = document.getElementById('prev-slide');
        if (prevSlideBtn) {
            console.log('Привязываем обработчик для кнопки "Предыдущий слайд"');
            prevSlideBtn.addEventListener('click', () => {
                console.log('Кнопка "Предыдущий слайд" нажата');
                this.previousSlide();
            });
        } else {
            console.error('Кнопка "prev-slide" не найдена!');
        }

        const nextSlideBtn = document.getElementById('next-slide');
        if (nextSlideBtn) {
            console.log('Привязываем обработчик для кнопки "Следующий слайд"');
            nextSlideBtn.addEventListener('click', () => {
                console.log('Кнопка "Следующий слайд" нажата');
                this.nextSlide();
            });
        } else {
            console.error('Кнопка "next-slide" не найдена!');
        }

        const loadVideoBtn = document.getElementById('load-video');
        if (loadVideoBtn) {
            console.log('Привязываем обработчик для кнопки "Загрузить видео"');
            loadVideoBtn.addEventListener('click', () => {
                console.log('Кнопка "Загрузить видео" нажата');
                document.getElementById('video-input')?.click();
            });
        } else {
            console.error('Кнопка "load-video" не найдена!');
        }

        const videoInput = document.getElementById('video-input');
        if (videoInput) {
            videoInput.addEventListener('change', (e) => {
                console.log('Файл видео выбран:', e.target.files[0]);
                this.loadVideo(e.target.files[0]);
            });
        }
    }

    bindElementControls() {
        const addTextBtn = document.getElementById('add-text');
        if (addTextBtn) {
            console.log('Привязываем обработчик для кнопки "Добавить текст"');
            addTextBtn.addEventListener('click', () => {
                console.log('Кнопка "Добавить текст" нажата');
                this.addTextElement();
            });
        } else {
            console.error('Кнопка "add-text" не найдена!');
        }

        const addImageBtn = document.getElementById('add-image');
        if (addImageBtn) {
            console.log('Привязываем обработчик для кнопки "Добавить изображение"');
            addImageBtn.addEventListener('click', () => {
                console.log('Кнопка "Добавить изображение" нажата');
                document.getElementById('image-input')?.click();
            });
        } else {
            console.error('Кнопка "add-image" не найдена!');
        }

        const imageInput = document.getElementById('image-input');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                console.log('Файл изображения выбран:', e.target.files[0]);
                this.addImageElement(e.target.files[0]);
            });
        }
    }

    bindProjectControls() {
        document.getElementById('save-project')?.addEventListener('click', () => {
            this.saveProject();
        });

        document.getElementById('load-project')?.addEventListener('click', () => {
            document.getElementById('project-input')?.click();
        });

        document.getElementById('project-input')?.addEventListener('change', (e) => {
            this.loadProject(e.target.files[0]);
        });

        document.getElementById('export')?.addEventListener('click', () => {
            this.exportProject();
        });
    }

    bindPresentationControls() {
        document.getElementById('preview')?.addEventListener('click', () => {
            this.showPreview();
        });

        document.getElementById('fullscreen-present')?.addEventListener('click', () => {
            this.startFullscreenPresentation();
        });

        // Закрытие модальных окон
        document.querySelector('.close')?.addEventListener('click', () => {
            this.closeModal();
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
    }

    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.previousSlide();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.nextSlide();
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveProject();
                        break;
                    case 'o':
                        e.preventDefault();
                        document.getElementById('project-input')?.click();
                        break;
                }
            }
        });
    }

    // Методы управления слайдами
    createInitialSlide() {
        this.slideManager.addSlide();
        this.updateUI();
    }

    addSlide() {
        const slide = this.slideManager.addSlide();
        this.switchToSlide(this.slideManager.getSlideCount() - 1);
        return slide;
    }

    switchToSlide(slideIndex) {
        if (this.slideManager.switchToSlide(slideIndex)) {
            this.saveCurrentSlideElements();
            this.loadSlide(slideIndex);
            this.updateUI();
        }
    }

    nextSlide() {
        const currentIndex = this.slideManager.currentSlide;
        if (currentIndex < this.slideManager.getSlideCount() - 1) {
            this.switchToSlide(currentIndex + 1);
        }
    }

    previousSlide() {
        const currentIndex = this.slideManager.currentSlide;
        if (currentIndex > 0) {
            this.switchToSlide(currentIndex - 1);
        }
    }

    loadSlide(slideIndex) {
        const slide = this.slideManager.slides[slideIndex];
        if (!slide) return;

        // Загружаем видео
        if (slide.videoSrc) {
            const video = document.getElementById('background-video');
            if (video) {
                video.src = slide.videoSrc;
                video.load();
            }
        }

        // Рендерим элементы слайда
        this.renderManager.renderSlide(slide);

        // Сбрасываем выделение
        this.elementManager.selectElement(null);

        // Обновляем интерфейс
        this.updateProperties();
        this.updateLayers();
        this.updateTimeline();
    }

    saveCurrentSlideElements() {
        const currentSlide = this.slideManager.getCurrentSlide();
        if (currentSlide) {
            // Элементы уже сохранены в слайде, так как мы работаем с ссылками
        }
    }

    // Методы управления элементами
    addTextElement() {
        const slide = this.slideManager.getCurrentSlide();
        if (!slide) return;

        const element = this.elementManager.createElement('text');
        slide.elements.push(element);

        this.renderManager.renderElement(element);
        this.elementManager.selectElement(element);

        this.updateUI();
        return element;
    }

    addImageElement(file) {
        if (!file) return;

        const slide = this.slideManager.getCurrentSlide();
        if (!slide) return;

        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            const element = this.elementManager.createElement('image', {
                src: url,
                width: Math.min(img.width, 300),
                height: Math.min(img.height, 200)
            });

            slide.elements.push(element);
            this.renderManager.renderElement(element);
            this.elementManager.selectElement(element);
            this.updateUI();
        };

        img.src = url;
    }

    // Методы управления видео
    loadVideo(file) {
        if (!file) return;

        const slide = this.slideManager.getCurrentSlide();
        if (!slide) return;

        const video = document.getElementById('background-video');
        const url = URL.createObjectURL(file);

        // Сохраняем информацию о файле
        slide.videoFile = {
            name: file.name,
            size: file.size,
            type: file.type
        };

        // Конвертируем в Base64 для сохранения
        this.convertVideoToBase64(file, (base64) => {
            slide.videoBase64 = base64;
        });

        slide.videoSrc = url;
        if (video) {
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
    }

    convertVideoToBase64(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => callback(e.target.result);
        reader.readAsDataURL(file);
    }

    // Методы управления проектом
    saveProject() {
        this.saveCurrentSlideElements();
        const success = this.projectManager.saveProject(this.slideManager.getAllSlides());

        if (success) {
            console.log('Проект сохранен');
            this.showNotification('Проект успешно сохранен');
        }
    }

    async loadProject(file) {
        try {
            const project = await this.projectManager.loadProject(file);

            // Загружаем слайды
            this.slideManager.slides = project.slides || [];

            if (this.slideManager.slides.length === 0) {
                this.createInitialSlide();
            } else {
                this.slideManager.currentSlide = 0;
                this.loadSlide(0);
            }

            this.updateUI();

            console.log('Проект загружен:', project.name);
            this.showNotification(`Проект "${project.name}" успешно загружен!`);

        } catch (error) {
            console.error('Ошибка при загрузке проекта:', error);
            this.showNotification('Ошибка при загрузке проекта: ' + error.message, 'error');
        }
    }

    exportProject() {
        this.saveCurrentSlideElements();
        const success = this.projectManager.exportToHTML(this.slideManager.getAllSlides());

        if (success) {
            console.log('Проект экспортирован');
            this.showNotification('Презентация экспортирована в HTML');
        }
    }

    // Методы управления презентацией
    showPreview() {
        const modal = document.getElementById('preview-modal');
        if (modal) {
            modal.style.display = 'block';
            this.startPreview();
        }
    }

    startPreview() {
        // Реализация предпросмотра
        console.log('Запуск предпросмотра');
    }

    startFullscreenPresentation() {
        this.fullscreenMode = true;
        const fullscreenDiv = document.getElementById('fullscreen-presentation');
        const slidesContainer = document.getElementById('fullscreen-slides');

        console.log('Запуск полноэкранной презентации...');

        // Запрашиваем настоящий полноэкранный режим
        if (fullscreenDiv.requestFullscreen) {
            fullscreenDiv.requestFullscreen();
        } else if (fullscreenDiv.webkitRequestFullscreen) {
            fullscreenDiv.webkitRequestFullscreen();
        } else if (fullscreenDiv.msRequestFullscreen) {
            fullscreenDiv.msRequestFullscreen();
        }

        if (!fullscreenDiv || !slidesContainer) {
            console.error('Элементы полноэкранной презентации не найдены');
            console.error('fullscreenDiv:', fullscreenDiv);
            console.error('slidesContainer:', slidesContainer);
            return;
        }

        // Очищаем контейнер слайдов
        slidesContainer.innerHTML = '';

        // Создаем слайды для полноэкранного режима
        this.slideManager.slides.forEach((slide, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'fullscreen-slide';
            slideDiv.id = `fullscreen-slide-${index}`;
            slideDiv.style.position = 'absolute';
            slideDiv.style.top = '0';
            slideDiv.style.left = '0';
            slideDiv.style.width = '100%';
            slideDiv.style.height = '100%';
            slideDiv.style.opacity = '1'; // Принудительно делаем видимым
            // Добавляем класс active для текущего слайда
            if (index === this.slideManager.currentSlide) {
                slideDiv.classList.add('active');
            }

            // Черный фон для презентации
            slideDiv.style.background = '#000';

            // Добавляем видео если есть
            if (slide.videoSrc) {
                console.log(`Добавляем видео для слайда ${index}:`, slide.videoSrc);

                // Создаем контейнер для видео с правильным масштабированием
                const { scale, offsetX, offsetY, canvasWidth, canvasHeight } = this.calculateFullscreenScale();

                const videoContainer = document.createElement('div');
                videoContainer.style.position = 'absolute';
                videoContainer.style.left = offsetX + 'px';
                videoContainer.style.top = offsetY + 'px';
                videoContainer.style.width = (canvasWidth * scale) + 'px';
                videoContainer.style.height = (canvasHeight * scale) + 'px';
                videoContainer.style.overflow = 'hidden';
                videoContainer.style.borderRadius = '8px';

                const video = document.createElement('video');
                video.src = slide.videoSrc;
                video.loop = true;
                video.muted = true;
                video.autoplay = true;
                video.style.width = '100%';
                video.style.height = '100%';
                video.style.objectFit = 'cover';
                video.style.position = 'absolute';
                video.style.top = '0';
                video.style.left = '0';

                videoContainer.appendChild(video);
                slideDiv.appendChild(videoContainer);
            } else {
                console.log(`Слайд ${index} не имеет видео`);
                // Добавляем заглушку для слайдов без видео
                const placeholder = document.createElement('div');
                placeholder.style.width = '100%';
                placeholder.style.height = '100%';
                placeholder.style.background = '#1a1a1a';
                placeholder.style.display = 'flex';
                placeholder.style.alignItems = 'center';
                placeholder.style.justifyContent = 'center';
                placeholder.style.color = 'white';
                placeholder.style.fontSize = '24px';
                placeholder.textContent = `Слайд ${index + 1}`;
                slideDiv.appendChild(placeholder);
            }

            // Добавляем элементы слайда
            const elementsContainer = document.createElement('div');
            elementsContainer.className = 'fullscreen-elements';
            elementsContainer.style.position = 'absolute';
            elementsContainer.style.top = '0';
            elementsContainer.style.left = '0';
            elementsContainer.style.width = '100%';
            elementsContainer.style.height = '100%';
            elementsContainer.style.pointerEvents = 'none';

            console.log(`Добавляем ${slide.elements.length} элементов для слайда ${index}`);
            slide.elements.forEach((element, elementIndex) => {
                console.log(`Создаем элемент ${elementIndex}:`, element);
                const elementDiv = this.createFullscreenElement(element);
                elementsContainer.appendChild(elementDiv);
            });

            slideDiv.appendChild(elementsContainer);
            slidesContainer.appendChild(slideDiv);

            console.log(`Слайд ${index} создан и добавлен в контейнер`);
        });

        // Показываем полноэкранный режим
        fullscreenDiv.classList.add('active');

        // Включаем настоящий полноэкранный режим браузера
        if (fullscreenDiv.requestFullscreen) {
            fullscreenDiv.requestFullscreen();
        } else if (fullscreenDiv.webkitRequestFullscreen) {
            fullscreenDiv.webkitRequestFullscreen();
        } else if (fullscreenDiv.msRequestFullscreen) {
            fullscreenDiv.msRequestFullscreen();
        }

        // Добавляем обработчик для выхода из полноэкранного режима
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                // Пользователь вышел из полноэкранного режима
                this.exitFullscreen();
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);

        console.log('Полноэкранный режим активирован');



        // Дополнительная отладочная информация
        console.log('Полноэкранный контейнер после добавления класса active:');
        console.log('Display:', window.getComputedStyle(fullscreenDiv).display);
        console.log('Position:', window.getComputedStyle(fullscreenDiv).position);
        console.log('Z-index:', window.getComputedStyle(fullscreenDiv).zIndex);
        console.log('Width:', window.getComputedStyle(fullscreenDiv).width);
        console.log('Height:', window.getComputedStyle(fullscreenDiv).height);

        // Проверяем первый слайд
        const firstSlide = slidesContainer.children[0];
        if (firstSlide) {
            console.log('Первый слайд:');
            console.log('Display:', window.getComputedStyle(firstSlide).display);
            console.log('Position:', window.getComputedStyle(firstSlide).position);
            console.log('Width:', window.getComputedStyle(firstSlide).width);
            console.log('Height:', window.getComputedStyle(firstSlide).height);
            console.log('Background:', window.getComputedStyle(firstSlide).background);
        }

        // Обновляем индикатор слайдов
        this.updateFullscreenIndicator();

        // Добавляем обработчики для полноэкранных кнопок
        this.bindFullscreenControls();

        console.log('Полноэкранная презентация запущена');
        console.log('Контейнер слайдов:', slidesContainer);
        console.log('Дочерние элементы контейнера:', slidesContainer.children);
    }

    calculateFullscreenScale() {
        // Получаем реальный размер холста из редактора
        const canvas = document.getElementById('canvas');
        let canvasWidth = 1200; // Значение по умолчанию
        let canvasHeight = 675;  // Значение по умолчанию

        if (canvas) {
            const canvasRect = canvas.getBoundingClientRect();
            canvasWidth = canvasRect.width;
            canvasHeight = canvasRect.height;
            console.log('Размер холста в редакторе:', canvasWidth, 'x', canvasHeight);
        }

        // Размер экрана с отступами
        const padding = 20; // Отступы сверху и снизу
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight - (padding * 2); // Убираем отступы из высоты

        console.log('Размер экрана:', screenWidth, 'x', screenHeight + (padding * 2));
        console.log('Размер с отступами:', screenWidth, 'x', screenHeight);

        // Вычисляем масштаб, сохраняя пропорции
        const scaleX = screenWidth / canvasWidth;
        const scaleY = screenHeight / canvasHeight;
        const scale = Math.min(scaleX, scaleY);

        // Вычисляем смещение для центрирования
        const offsetX = (screenWidth - canvasWidth * scale) / 2;
        const offsetY = (screenHeight - canvasHeight * scale) / 2 + padding; // Добавляем отступ сверху

        console.log('Масштаб:', scale);
        console.log('Смещение:', offsetX, offsetY);

        return { scale, offsetX, offsetY, canvasWidth, canvasHeight };
    }

    createFullscreenElement(element) {
        const { scale, offsetX, offsetY } = this.calculateFullscreenScale();

        const div = document.createElement('div');
        div.className = `fullscreen-${element.type}-element`;
        div.style.position = 'absolute';
        div.style.left = (element.x * scale + offsetX) + 'px';
        div.style.top = (element.y * scale + offsetY) + 'px';
        div.style.width = (element.width * scale) + 'px';
        div.style.height = (element.height * scale) + 'px';

        if (element.type === 'text') {
            div.textContent = element.content;
            div.style.fontSize = (element.fontSize * scale) + 'px';
            div.style.color = element.color;
            div.style.fontFamily = element.fontFamily;
            div.style.whiteSpace = 'pre-wrap';
            div.style.wordWrap = 'break-word';
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

    updateFullscreenIndicator() {
        const indicator = document.getElementById('slide-indicator');
        if (indicator) {
            const current = this.slideManager.currentSlide + 1;
            const total = this.slideManager.getSlideCount();
            indicator.textContent = `Слайд ${current} из ${total}`;
        }
    }

    bindFullscreenControls() {
        // Удаляем старые обработчики если есть
        const prevBtn = document.getElementById('prev-fullscreen');
        const nextBtn = document.getElementById('next-fullscreen');
        const playBtn = document.getElementById('play-pause-fullscreen');
        const exitBtn = document.getElementById('exit-fullscreen');

        if (prevBtn) {
            prevBtn.onclick = () => this.previousFullscreenSlide();
        }

        if (nextBtn) {
            nextBtn.onclick = () => this.nextFullscreenSlide();
        }

        if (playBtn) {
            playBtn.onclick = () => this.toggleFullscreenPlay();
        }

        if (exitBtn) {
            exitBtn.onclick = () => this.exitFullscreen();
        }

        // Клавиатурные сокращения для полноэкранного режима
        document.addEventListener('keydown', this.handleFullscreenKeydown.bind(this));
    }

    previousFullscreenSlide() {
        if (this.slideManager.currentSlide > 0) {
            this.slideManager.currentSlide--;
            this.updateFullscreenSlide();
        }
    }

    nextFullscreenSlide() {
        if (this.slideManager.currentSlide < this.slideManager.getSlideCount() - 1) {
            this.slideManager.currentSlide++;
            this.updateFullscreenSlide();
        }
    }

    updateFullscreenSlide() {
        console.log('Обновляем отображение полноэкранного слайда:', this.slideManager.currentSlide);
        const slides = document.querySelectorAll('.fullscreen-slide');
        console.log('Найдено слайдов:', slides.length);

        slides.forEach((slide, index) => {
            const isActive = index === this.slideManager.currentSlide;
            slide.style.display = isActive ? 'block' : 'none';
            slide.style.opacity = '1'; // Принудительно делаем видимым

            // Добавляем/убираем класс active
            if (isActive) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }

            console.log(`Слайд ${index}: ${isActive ? 'показан' : 'скрыт'}`);
        });

        this.updateFullscreenIndicator();
    }

    toggleFullscreenPlay() {
        const playBtn = document.getElementById('play-pause-fullscreen');
        if (this.isPlaying) {
            this.isPlaying = false;
            if (playBtn) playBtn.textContent = '▶ Играть';
            if (this.slideInterval) {
                clearInterval(this.slideInterval);
            }
        } else {
            this.isPlaying = true;
            if (playBtn) playBtn.textContent = '⏸ Пауза';
            this.slideInterval = setInterval(() => {
                if (this.slideManager.currentSlide < this.slideManager.getSlideCount() - 1) {
                    this.nextFullscreenSlide();
                } else {
                    this.slideManager.currentSlide = 0;
                    this.updateFullscreenSlide();
                }
            }, 5000);
        }
    }

    exitFullscreen() {
        this.fullscreenMode = false;
        this.isPlaying = false;

        if (this.slideInterval) {
            clearInterval(this.slideInterval);
        }

        // Выходим из полноэкранного режима браузера
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }

        const fullscreenDiv = document.getElementById('fullscreen-presentation');
        if (fullscreenDiv) {
            fullscreenDiv.style.display = 'none';
            fullscreenDiv.classList.remove('active');
        }

        // Удаляем обработчик клавиатуры
        document.removeEventListener('keydown', this.handleFullscreenKeydown);

        console.log('Полноэкранный режим закрыт');
    }

    handleFullscreenKeydown(e) {
        if (!this.fullscreenMode) return;

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
                this.exitFullscreen();
                break;
            case 'p':
            case 'P':
                e.preventDefault();
                this.toggleFullscreenPlay();
                break;
        }
    }

    closeModal() {
        const modal = document.getElementById('preview-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Методы обновления интерфейса
    updateUI() {
        this.updateSlideNavigation();
        this.updateProperties();
        this.updateLayers();
        this.updateTimeline();
    }

    updateSlideNavigation() {
        const counter = document.getElementById('slide-counter');
        const prevBtn = document.getElementById('prev-slide');
        const nextBtn = document.getElementById('next-slide');

        const currentIndex = this.slideManager.currentSlide;
        const totalSlides = this.slideManager.getSlideCount();

        if (counter) {
            counter.textContent = `Слайд ${currentIndex + 1} из ${totalSlides}`;
        }

        if (prevBtn) {
            prevBtn.disabled = currentIndex === 0;
        }

        if (nextBtn) {
            nextBtn.disabled = currentIndex === totalSlides - 1;
        }
    }

    updateProperties() {
        const content = document.getElementById('properties-content');
        if (!content) return;

        const selectedElement = this.elementManager.getSelectedElement();

        if (!selectedElement) {
            content.innerHTML = '<p>Выберите элемент для редактирования</p>';
            return;
        }

        // Генерируем интерфейс свойств
        content.innerHTML = this.generatePropertiesHTML(selectedElement);
        this.bindPropertyEvents(selectedElement);
    }

    generatePropertiesHTML(element) {
        if (element.type === 'text') {
            return `
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
                                ${this.generateAnimationOptions(element.animation.in)}
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

        return '<p>Свойства для данного типа элемента не поддерживаются</p>';
    }

    generateAnimationOptions(selectedAnimation) {
        const animations = this.animationManager.getAnimationTypes();
        return Object.entries(animations)
            .map(([key, label]) =>
                `<option value="${key}" ${selectedAnimation === key ? 'selected' : ''}>${label}</option>`
            )
            .join('');
    }

    bindPropertyEvents(element) {
        // Обработчики для текстовых свойств
        const textContent = document.getElementById('text-content');
        if (textContent) {
            textContent.addEventListener('input', (e) => {
                this.elementManager.updateElement(element, { content: e.target.value });
            });
        }

        const fontSize = document.getElementById('font-size');
        if (fontSize) {
            fontSize.addEventListener('input', (e) => {
                this.elementManager.updateElement(element, { fontSize: parseInt(e.target.value) });
            });
        }

        const textColor = document.getElementById('text-color');
        if (textColor) {
            textColor.addEventListener('input', (e) => {
                this.elementManager.updateElement(element, { color: e.target.value });
                const preview = document.querySelector('.color-preview');
                if (preview) preview.style.background = e.target.value;
            });
        }

        // Обработчики для позиции и размера
        const posX = document.getElementById('pos-x');
        if (posX) {
            posX.addEventListener('input', (e) => {
                this.elementManager.updateElement(element, { x: parseInt(e.target.value) });
            });
        }

        const posY = document.getElementById('pos-y');
        if (posY) {
            posY.addEventListener('input', (e) => {
                this.elementManager.updateElement(element, { y: parseInt(e.target.value) });
            });
        }

        const textWidth = document.getElementById('text-width');
        if (textWidth) {
            textWidth.addEventListener('input', (e) => {
                this.elementManager.updateElement(element, { width: Math.max(50, parseInt(e.target.value)) });
            });
        }

        const textHeight = document.getElementById('text-height');
        if (textHeight) {
            textHeight.addEventListener('input', (e) => {
                this.elementManager.updateElement(element, { height: Math.max(30, parseInt(e.target.value)) });
            });
        }

        // Обработчики для анимации
        const startTime = document.getElementById('start-time');
        if (startTime) {
            startTime.addEventListener('input', (e) => {
                element.startTime = parseFloat(e.target.value);
                element.animated = false;
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

    updateLayers() {
        if (window.layersManager) {
            const currentSlide = this.slideManager.getCurrentSlide();
            const elements = currentSlide ? currentSlide.elements : [];
            window.layersManager.update(elements, this.elementManager.getSelectedElement());
        }
    }

    updateTimeline() {
        if (window.timelineManager) {
            const currentSlide = this.slideManager.getCurrentSlide();
            const elements = currentSlide ? currentSlide.elements : [];
            window.timelineManager.update(elements);
        }
    }

    // Утилиты
    showNotification(message, type = 'success') {
        // Простая реализация уведомлений
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'error' ? '#ff4444' : '#28a745'};
            color: white;
            border-radius: 5px;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, начинаем инициализацию...');

    // Проверяем доступность модулей
    if (typeof SlideManager === 'undefined') {
        console.error('SlideManager не загружен!');
        return;
    }
    if (typeof ElementManager === 'undefined') {
        console.error('ElementManager не загружен!');
        return;
    }
    if (typeof AnimationManager === 'undefined') {
        console.error('AnimationManager не загружен!');
        return;
    }
    if (typeof RenderManager === 'undefined') {
        console.error('RenderManager не загружен!');
        return;
    }
    if (typeof ProjectManager === 'undefined') {
        console.error('ProjectManager не загружен!');
        return;
    }

    console.log('Все модули загружены успешно');

    // Тестируем доступность кнопок
    const testButtons = ['add-slide', 'add-text', 'load-video', 'prev-slide', 'next-slide'];
    testButtons.forEach(buttonId => {
        const btn = document.getElementById(buttonId);
        if (btn) {
            console.log(`✓ Кнопка ${buttonId} найдена`);
        } else {
            console.error(`✗ Кнопка ${buttonId} НЕ найдена!`);
        }
    });

    // Добавляем стили для уведомлений
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .notification {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
    `;
    document.head.appendChild(style);

    // Инициализируем приложение
    try {
        window.app = new VideoPresentation();
        console.log('Приложение инициализировано успешно');
    } catch (error) {
        console.error('Ошибка при инициализации приложения:', error);
    }
});