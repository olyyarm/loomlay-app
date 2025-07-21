// Менеджер рендеринга
class RenderManager {
    constructor(elementManager, animationManager) {
        this.elementManager = elementManager;
        this.animationManager = animationManager;
        this.container = null;
    }
    
    setContainer(containerId) {
        this.container = document.getElementById(containerId);
        return this.container;
    }
    
    renderElement(element) {
        if (!this.container) return null;
        
        const div = document.createElement('div');
        div.className = `${element.type}-element`;
        div.id = `element-${element.id}`;
        div.style.left = element.x + 'px';
        div.style.top = element.y + 'px';
        div.style.width = element.width + 'px';
        div.style.height = element.height + 'px';
        div.style.opacity = 1;
        div.style.display = 'block';
        div.style.position = 'absolute';
        
        if (element.type === 'text') {
            this.renderTextElement(div, element);
        } else if (element.type === 'image') {
            this.renderImageElement(div, element);
        }
        
        // Добавляем обработчики событий
        this.addElementEventListeners(div, element);
        
        this.container.appendChild(div);
        return div;
    }
    
    renderTextElement(div, element) {
        div.textContent = element.content;
        div.style.fontSize = element.fontSize + 'px';
        div.style.color = element.color;
        div.style.fontFamily = element.fontFamily;
        div.style.whiteSpace = 'pre-wrap';
        div.style.wordWrap = 'break-word';
        div.style.cursor = 'move';
        
        // Добавляем ручки изменения размера
        this.addResizeHandles(div, element);
    }
    
    renderImageElement(div, element) {
        const img = document.createElement('img');
        img.src = element.src;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        img.style.pointerEvents = 'none';
        div.appendChild(img);
        div.style.cursor = 'move';
    }
    
    addElementEventListeners(div, element) {
        // Клик для выделения
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            this.elementManager.selectElement(element);
        });
        
        // Перетаскивание
        this.makeDraggable(div, element);
    }
    
    makeDraggable(element, data) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        element.addEventListener('mousedown', (e) => {
            // Не начинаем перетаскивание если кликнули по ручке изменения размера
            if (e.target.classList.contains('resize-handle')) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = data.x;
            startTop = data.y;
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
        
        const onMouseMove = (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            data.x = startLeft + deltaX;
            data.y = startTop + deltaY;
            
            element.style.left = data.x + 'px';
            element.style.top = data.y + 'px';
        };
        
        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }
    
    addResizeHandles(element, data) {
        if (data.type !== 'text') return;
        
        const handles = ['se', 'sw', 'ne', 'nw'];
        
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
            this.positionHandle(handle, position);
            
            // Добавляем обработчик изменения размера
            this.makeResizable(handle, element, data, position);
            
            element.appendChild(handle);
        });
    }
    
    positionHandle(handle, position) {
        switch (position) {
            case 'se':
                handle.style.bottom = '-4px';
                handle.style.right = '-4px';
                break;
            case 'sw':
                handle.style.bottom = '-4px';
                handle.style.left = '-4px';
                break;
            case 'ne':
                handle.style.top = '-4px';
                handle.style.right = '-4px';
                break;
            case 'nw':
                handle.style.top = '-4px';
                handle.style.left = '-4px';
                break;
        }
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
            e.stopPropagation();
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
            
            const newDimensions = this.calculateNewDimensions(
                position, startWidth, startHeight, startLeft, startTop, deltaX, deltaY
            );
            
            // Обновляем данные элемента
            Object.assign(data, newDimensions);
            
            // Обновляем визуальное отображение
            element.style.width = data.width + 'px';
            element.style.height = data.height + 'px';
            element.style.left = data.x + 'px';
            element.style.top = data.y + 'px';
        };
        
        const onMouseUp = () => {
            isResizing = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }
    
    calculateNewDimensions(position, startWidth, startHeight, startLeft, startTop, deltaX, deltaY) {
        let newWidth = startWidth;
        let newHeight = startHeight;
        let newX = startLeft;
        let newY = startTop;
        
        switch (position) {
            case 'se':
                newWidth = Math.max(50, startWidth + deltaX);
                newHeight = Math.max(30, startHeight + deltaY);
                break;
            case 'sw':
                newWidth = Math.max(50, startWidth - deltaX);
                newHeight = Math.max(30, startHeight + deltaY);
                newX = startLeft + (startWidth - newWidth);
                break;
            case 'ne':
                newWidth = Math.max(50, startWidth + deltaX);
                newHeight = Math.max(30, startHeight - deltaY);
                newY = startTop + (startHeight - newHeight);
                break;
            case 'nw':
                newWidth = Math.max(50, startWidth - deltaX);
                newHeight = Math.max(30, startHeight - deltaY);
                newX = startLeft + (startWidth - newWidth);
                newY = startTop + (startHeight - newHeight);
                break;
        }
        
        return { width: newWidth, height: newHeight, x: newX, y: newY };
    }
    
    clearContainer() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
    
    renderSlide(slide) {
        this.clearContainer();
        
        if (slide && slide.elements) {
            slide.elements.forEach(element => {
                this.renderElement(element);
            });
        }
    }
}

// Делаем RenderManager доступным глобально
window.RenderManager = RenderManager;