// Менеджер таймлайна
class TimelineManager {
    constructor(app) {
        this.app = app;
        this.timeline = document.getElementById('timeline');
        this.pixelsPerSecond = 50;
        this.tracks = [];
        
        this.init();
    }
    
    init() {
        this.createRuler();
        this.setupEventListeners();
    }
    
    createRuler() {
        const ruler = document.createElement('div');
        ruler.className = 'timeline-ruler';
        
        // Создаем временные маркеры
        const duration = 30; // Фиксированная длительность для таймлайна
        for (let i = 0; i <= duration; i++) {
            const marker = document.createElement('div');
            marker.className = 'time-marker';
            marker.style.left = (i * this.pixelsPerSecond) + 'px';
            marker.textContent = this.formatTime(i);
            ruler.appendChild(marker);
        }
        
        this.timeline.appendChild(ruler);
    }
    
    setupEventListeners() {
        // Скроллинг таймлайна
        this.timeline.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.timeline.scrollLeft += e.deltaY;
        });
        
        // Клик по таймлайну для перемещения плейхеда
        this.timeline.addEventListener('click', (e) => {
            const rect = this.timeline.getBoundingClientRect();
            const x = e.clientX - rect.left + this.timeline.scrollLeft;
            const time = x / this.pixelsPerSecond;
            
            this.app.currentTime = Math.max(0, Math.min(time, 30)); // Фиксированная длительность
            this.updatePlayhead();
        });
    }
    
    update(elements) {
        // Очищаем существующие треки
        const existingTracks = this.timeline.querySelectorAll('.timeline-track');
        existingTracks.forEach(track => track.remove());
        
        // Создаем треки для каждого элемента
        elements.forEach((element, index) => {
            this.createTrack(element, index);
        });
        
        this.updatePlayhead();
    }
    
    createTrack(element, index) {
        const track = document.createElement('div');
        track.className = 'timeline-track';
        track.id = `track-${element.id}`;
        
        const label = document.createElement('div');
        label.className = 'track-label';
        label.textContent = element.type === 'text' ? 
            `Текст: ${element.content.substring(0, 15)}...` : 
            `Изображение ${element.id}`;
        
        const content = document.createElement('div');
        content.className = 'track-content';
        
        // Создаем элемент таймлайна
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.id = `timeline-item-${element.id}`;
        item.style.left = (element.startTime * this.pixelsPerSecond) + 'px';
        item.style.width = (element.duration * this.pixelsPerSecond) + 'px';
        item.textContent = element.type === 'text' ? 'T' : 'I';
        
        // Добавляем ручку для изменения размера
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        item.appendChild(resizeHandle);
        
        content.appendChild(item);
        track.appendChild(label);
        track.appendChild(content);
        this.timeline.appendChild(track);
        
        // Делаем элемент перетаскиваемым
        this.makeTimelineItemDraggable(item, element);
        this.makeTimelineItemResizable(item, element, resizeHandle);
        
        // Обработчик клика для выделения
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectTimelineItem(element);
        });
    }
    
    makeTimelineItemDraggable(item, element) {
        let isDragging = false;
        let startX, startTime;
        
        item.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('resize-handle')) return;
            
            isDragging = true;
            startX = e.clientX;
            startTime = element.startTime;
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
        
        const onMouseMove = (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaTime = deltaX / this.pixelsPerSecond;
            const duration = element.duration || 5;
            const newTime = Math.max(0, Math.min(startTime + deltaTime, 30 - duration));
            
            element.startTime = newTime;
            item.style.left = (newTime * this.pixelsPerSecond) + 'px';
        };
        
        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }
    
    makeTimelineItemResizable(item, element, handle) {
        let isResizing = false;
        let startX, startDuration;
        
        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isResizing = true;
            startX = e.clientX;
            startDuration = element.duration;
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
        
        const onMouseMove = (e) => {
            if (!isResizing) return;
            
            const deltaX = e.clientX - startX;
            const deltaTime = deltaX / this.pixelsPerSecond;
            const newDuration = Math.max(0.5, Math.min(startDuration + deltaTime, 30 - element.startTime));
            
            element.duration = newDuration;
            item.style.width = (newDuration * this.pixelsPerSecond) + 'px';
        };
        
        const onMouseUp = () => {
            isResizing = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }
    
    selectTimelineItem(element) {
        // Убираем выделение с других элементов
        const items = this.timeline.querySelectorAll('.timeline-item');
        items.forEach(item => item.classList.remove('selected'));
        
        // Выделяем текущий элемент
        const item = document.getElementById(`timeline-item-${element.id}`);
        if (item) {
            item.classList.add('selected');
        }
        
        // Выделяем элемент в основном приложении
        if (this.app.elementManager) {
            this.app.elementManager.selectElement(element);
            this.app.updateProperties();
        }
    }
    
    updatePlayhead() {
        let playhead = this.timeline.querySelector('.playhead');
        
        if (!playhead) {
            playhead = document.createElement('div');
            playhead.className = 'playhead';
            this.timeline.appendChild(playhead);
        }
        
        const currentTime = this.app.currentTime || 0;
        const position = currentTime * this.pixelsPerSecond;
        playhead.style.left = position + 'px';
        
        // Автоскролл таймлайна
        const timelineRect = this.timeline.getBoundingClientRect();
        const playheadRect = playhead.getBoundingClientRect();
        
        if (playheadRect.left < timelineRect.left || playheadRect.right > timelineRect.right) {
            this.timeline.scrollLeft = position - timelineRect.width / 2;
        }
    }
    
    setPixelsPerSecond(value) {
        this.pixelsPerSecond = value;
        const slide = this.app.slideManager.getCurrentSlide();
        const elements = slide ? slide.elements : [];
        this.update(elements);
    }
    
    addKeyframe(element, time, property, value) {
        // Добавление ключевых кадров для более сложной анимации
        if (!element.keyframes) {
            element.keyframes = {};
        }
        
        if (!element.keyframes[property]) {
            element.keyframes[property] = [];
        }
        
        element.keyframes[property].push({ time, value });
        element.keyframes[property].sort((a, b) => a.time - b.time);
    }
    
    removeKeyframe(element, time, property) {
        if (!element.keyframes || !element.keyframes[property]) return;
        
        element.keyframes[property] = element.keyframes[property].filter(
            keyframe => keyframe.time !== time
        );
    }
    
    getValueAtTime(element, property, time) {
        if (!element.keyframes || !element.keyframes[property]) {
            return element[property];
        }
        
        const keyframes = element.keyframes[property];
        
        // Если время до первого ключевого кадра
        if (time <= keyframes[0].time) {
            return keyframes[0].value;
        }
        
        // Если время после последнего ключевого кадра
        if (time >= keyframes[keyframes.length - 1].time) {
            return keyframes[keyframes.length - 1].value;
        }
        
        // Интерполяция между ключевыми кадрами
        for (let i = 0; i < keyframes.length - 1; i++) {
            const current = keyframes[i];
            const next = keyframes[i + 1];
            
            if (time >= current.time && time <= next.time) {
                const progress = (time - current.time) / (next.time - current.time);
                
                if (typeof current.value === 'number') {
                    return current.value + (next.value - current.value) * progress;
                } else {
                    return progress < 0.5 ? current.value : next.value;
                }
            }
        }
        
        return element[property];
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Инициализация менеджера таймлайна
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.app) {
            window.timelineManager = new TimelineManager(window.app);
        }
    }, 100);
});