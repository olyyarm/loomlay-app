// Менеджер слоев
class LayersManager {
    constructor(app) {
        this.app = app;
        this.layersList = document.getElementById('layers-list');

        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Обработчики будут добавлены при создании слоев
    }

    update(elements, selectedElement) {
        this.layersList.innerHTML = '';

        // Создаем слои в обратном порядке (последний добавленный сверху)
        const sortedElements = [...elements].reverse();

        sortedElements.forEach((element, index) => {
            this.createLayerItem(element, elements.length - 1 - index, selectedElement);
        });
    }

    createLayerItem(element, index, selectedElement) {
        const layerItem = document.createElement('div');
        layerItem.className = 'layer-item';
        layerItem.id = `layer-${element.id}`;

        if (selectedElement && selectedElement.id === element.id) {
            layerItem.classList.add('selected');
        }

        const layerHeader = document.createElement('div');
        layerHeader.className = 'layer-header';

        const layerType = document.createElement('span');
        layerType.className = 'layer-type';
        layerType.textContent = element.type === 'text' ? 'Текст' : 'Изображение';

        const layerControls = document.createElement('div');
        layerControls.className = 'layer-controls';

        // Кнопка видимости
        const visibilityBtn = document.createElement('button');
        visibilityBtn.className = 'layer-control';
        visibilityBtn.innerHTML = '👁';
        visibilityBtn.title = 'Показать/скрыть';
        visibilityBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleVisibility(element);
        });

        // Кнопка блокировки
        const lockBtn = document.createElement('button');
        lockBtn.className = 'layer-control';
        lockBtn.innerHTML = '🔓';
        lockBtn.title = 'Заблокировать/разблокировать';
        lockBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleLock(element);
        });

        // Кнопка удаления
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'layer-control';
        deleteBtn.innerHTML = '🗑';
        deleteBtn.title = 'Удалить слой';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteLayer(element);
        });

        layerControls.appendChild(visibilityBtn);
        layerControls.appendChild(lockBtn);
        layerControls.appendChild(deleteBtn);

        layerHeader.appendChild(layerType);
        layerHeader.appendChild(layerControls);

        const layerName = document.createElement('div');
        layerName.className = 'layer-name';
        layerName.textContent = this.getLayerName(element);

        const layerInfo = document.createElement('div');
        layerInfo.className = 'layer-info';
        layerInfo.textContent = `${this.formatTime(element.startTime)} - ${this.formatTime(element.startTime + (element.duration || 5))}`;

        layerItem.appendChild(layerHeader);
        layerItem.appendChild(layerName);
        layerItem.appendChild(layerInfo);

        // Обработчик клика для выделения слоя
        layerItem.addEventListener('click', () => {
            this.selectLayer(element);
        });

        // Делаем слой перетаскиваемым для изменения порядка
        this.makeLayerDraggable(layerItem, element, index);

        this.layersList.appendChild(layerItem);
    }

    getLayerName(element) {
        if (element.type === 'text') {
            return element.content.length > 20 ?
                element.content.substring(0, 20) + '...' :
                element.content;
        } else if (element.type === 'image') {
            return `Изображение ${element.id}`;
        }
        return 'Неизвестный слой';
    }

    selectLayer(element) {
        // Убираем выделение с других слоев
        const layers = this.layersList.querySelectorAll('.layer-item');
        layers.forEach(layer => layer.classList.remove('selected'));

        // Выделяем текущий слой
        const layerItem = document.getElementById(`layer-${element.id}`);
        if (layerItem) {
            layerItem.classList.add('selected');
        }

        // Выделяем элемент в основном приложении
        if (this.app.elementManager) {
            this.app.elementManager.selectElement(element);
            this.app.updateProperties();
        }
    }

    toggleVisibility(element) {
        element.visible = element.visible !== false ? false : true;

        const el = document.getElementById(`element-${element.id}`);
        if (el) {
            el.style.display = element.visible === false ? 'none' : 'block';
        }

        // Обновляем иконку
        const layerItem = document.getElementById(`layer-${element.id}`);
        const visibilityBtn = layerItem.querySelector('.layer-control');
        visibilityBtn.innerHTML = element.visible === false ? '👁‍🗨' : '👁';

        if (element.visible === false) {
            layerItem.style.opacity = '0.5';
        } else {
            layerItem.style.opacity = '1';
        }
    }

    toggleLock(element) {
        element.locked = !element.locked;

        const el = document.getElementById(`element-${element.id}`);
        if (el) {
            el.style.pointerEvents = element.locked ? 'none' : 'auto';
        }

        // Обновляем иконку
        const layerItem = document.getElementById(`layer-${element.id}`);
        const lockBtn = layerItem.querySelectorAll('.layer-control')[1];
        lockBtn.innerHTML = element.locked ? '🔒' : '🔓';

        if (element.locked) {
            layerItem.style.opacity = '0.7';
        } else {
            layerItem.style.opacity = '1';
        }
    }

    deleteLayer(element) {
        if (confirm('Удалить этот слой?')) {
            // Получаем текущий слайд и удаляем элемент из него
            const slide = this.app.slideManager.getCurrentSlide();
            if (slide && slide.elements) {
                const index = slide.elements.findIndex(el => el.id === element.id);
                if (index !== -1) {
                    slide.elements.splice(index, 1);
                }
            }

            // Удаляем элемент из DOM
            const el = document.getElementById(`element-${element.id}`);
            if (el) {
                el.remove();
            }

            // Если удаляемый элемент был выделен, сбрасываем выделение
            if (this.app.elementManager.getSelectedElement() && this.app.elementManager.getSelectedElement().id === element.id) {
                this.app.elementManager.selectElement(null);
                this.app.updateProperties();
            }

            // Обновляем интерфейс
            const currentSlide = this.app.slideManager.getCurrentSlide();
            const elements = currentSlide ? currentSlide.elements : [];
            this.update(elements, this.app.elementManager.getSelectedElement());
            this.app.updateTimeline();
        }
    }

    makeLayerDraggable(layerItem, element, index) {
        let isDragging = false;
        let dragStartY = 0;
        let dragStartIndex = index;

        layerItem.addEventListener('mousedown', (e) => {
            // Не начинаем перетаскивание, если кликнули по кнопке управления
            if (e.target.classList.contains('layer-control')) {
                return;
            }

            isDragging = true;
            dragStartY = e.clientY;
            dragStartIndex = index;

            layerItem.style.opacity = '0.7';
            layerItem.style.transform = 'scale(1.02)';

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        const onMouseMove = (e) => {
            if (!isDragging) return;

            const deltaY = e.clientY - dragStartY;
            const itemHeight = layerItem.offsetHeight + 8; // высота + gap
            const slide = this.app.slideManager.getCurrentSlide();
            const elements = slide ? slide.elements : [];
            const newIndex = Math.max(0, Math.min(
                elements.length - 1,
                dragStartIndex + Math.round(deltaY / itemHeight)
            ));

            if (newIndex !== index) {
                this.reorderLayer(element, dragStartIndex, newIndex);
                dragStartIndex = newIndex;
                dragStartY = e.clientY;
            }
        };

        const onMouseUp = () => {
            isDragging = false;
            layerItem.style.opacity = '1';
            layerItem.style.transform = 'scale(1)';

            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }

    reorderLayer(element, fromIndex, toIndex) {
        // Получаем текущий слайд
        const slide = this.app.slideManager.getCurrentSlide();
        if (!slide || !slide.elements) return;

        // Перемещаем элемент в массиве
        const actualFromIndex = slide.elements.length - 1 - fromIndex;
        const actualToIndex = slide.elements.length - 1 - toIndex;

        const [movedElement] = slide.elements.splice(actualFromIndex, 1);
        slide.elements.splice(actualToIndex, 0, movedElement);

        // Обновляем z-index элементов
        this.updateZIndices();

        // Обновляем интерфейс
        this.update(slide.elements, this.app.elementManager.getSelectedElement());
    }

    updateZIndices() {
        const slide = this.app.slideManager.getCurrentSlide();
        const elements = slide ? slide.elements : [];
        elements.forEach((element, index) => {
            const el = document.getElementById(`element-${element.id}`);
            if (el) {
                el.style.zIndex = index + 1;
            }
        });
    }

    duplicateLayer(element) {
        const newElement = {
            ...element,
            id: Date.now(),
            x: element.x + 20,
            y: element.y + 20,
            startTime: element.startTime + 0.5
        };

        this.app.elements.push(newElement);
        this.app.renderElement(newElement);
        this.app.selectElement(newElement);
        this.update(this.app.elements, newElement);
        this.app.updateTimeline();
    }

    groupLayers(elements) {
        // Группировка слоев (для будущего развития)
        const group = {
            id: Date.now(),
            type: 'group',
            name: 'Группа',
            elements: elements,
            visible: true,
            locked: false
        };

        // Удаляем элементы из основного массива
        elements.forEach(element => {
            const index = this.app.elements.findIndex(el => el.id === element.id);
            if (index !== -1) {
                this.app.elements.splice(index, 1);
            }
        });

        // Добавляем группу
        this.app.elements.push(group);

        this.update(this.app.elements, this.app.selectedElement);
    }

    ungroupLayers(group) {
        // Разгруппировка слоев
        if (group.type !== 'group') return;

        const index = this.app.elements.findIndex(el => el.id === group.id);
        if (index !== -1) {
            this.app.elements.splice(index, 1);
            this.app.elements.push(...group.elements);
        }

        this.update(this.app.elements, this.app.selectedElement);
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Инициализация менеджера слоев
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.app) {
            window.layersManager = new LayersManager(window.app);
        }
    }, 100);
});