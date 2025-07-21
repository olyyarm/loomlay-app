// Менеджер элементов
class ElementManager {
    constructor() {
        this.selectedElement = null;
        this.clipboard = null;
    }
    
    createElement(type, options = {}) {
        const baseElement = {
            id: Date.now() + Math.random(),
            type: type,
            x: options.x || 50,
            y: options.y || 50,
            opacity: 1,
            startTime: 1,
            animation: {
                in: 'fadeIn',
                duration: 0.5,
                persistent: true
            },
            animated: false
        };
        
        switch (type) {
            case 'text':
                return {
                    ...baseElement,
                    content: options.content || 'Новый текст',
                    width: options.width || 200,
                    height: options.height || 50,
                    fontSize: options.fontSize || 24,
                    color: options.color || '#ffffff',
                    fontFamily: options.fontFamily || 'Arial'
                };
                
            case 'image':
                return {
                    ...baseElement,
                    src: options.src,
                    width: options.width || 300,
                    height: options.height || 200
                };
                
            default:
                return baseElement;
        }
    }
    
    selectElement(element) {
        // Убираем выделение с предыдущего элемента
        if (this.selectedElement) {
            const prevEl = document.getElementById(`element-${this.selectedElement.id}`);
            if (prevEl) prevEl.classList.remove('selected');
        }
        
        this.selectedElement = element;
        
        // Выделяем новый элемент
        if (element) {
            const el = document.getElementById(`element-${element.id}`);
            if (el) el.classList.add('selected');
        }
        
        return element;
    }
    
    getSelectedElement() {
        return this.selectedElement;
    }
    
    updateElement(element, properties) {
        Object.assign(element, properties);
        this.updateElementDisplay(element);
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
            el.style.fontFamily = element.fontFamily;
        }
    }
    
    copyElement(element) {
        this.clipboard = JSON.parse(JSON.stringify(element));
        return this.clipboard;
    }
    
    pasteElement() {
        if (!this.clipboard) return null;
        
        const newElement = {
            ...this.clipboard,
            id: Date.now() + Math.random(),
            x: this.clipboard.x + 20,
            y: this.clipboard.y + 20
        };
        
        return newElement;
    }
    
    deleteElement(elements, elementId) {
        const index = elements.findIndex(el => el.id === elementId);
        if (index !== -1) {
            const deletedElement = elements.splice(index, 1)[0];
            
            // Удаляем из DOM
            const el = document.getElementById(`element-${elementId}`);
            if (el) el.remove();
            
            // Сбрасываем выделение если удаляемый элемент был выделен
            if (this.selectedElement && this.selectedElement.id === elementId) {
                this.selectedElement = null;
            }
            
            return deletedElement;
        }
        return null;
    }
    
    duplicateElement(element) {
        return {
            ...element,
            id: Date.now() + Math.random(),
            x: element.x + 20,
            y: element.y + 20
        };
    }
    
    moveElement(element, deltaX, deltaY) {
        element.x += deltaX;
        element.y += deltaY;
        this.updateElementDisplay(element);
    }
    
    resizeElement(element, newWidth, newHeight, newX = null, newY = null) {
        element.width = Math.max(element.type === 'text' ? 50 : 20, newWidth);
        element.height = Math.max(element.type === 'text' ? 30 : 20, newHeight);
        
        if (newX !== null) element.x = newX;
        if (newY !== null) element.y = newY;
        
        this.updateElementDisplay(element);
    }
}

// Делаем ElementManager доступным глобально
window.ElementManager = ElementManager;