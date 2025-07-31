import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus, Settings, Search, Calendar, Clock, CloudSun, Code, Music, FileText, Calculator, MessageSquare, ExternalLink, X,
  Maximize, Minimize, Minus, Check, ChevronLeft, ChevronRight, Wind, Droplet, ThermometerSun, CloudSnow, Heart, Star, Bookmark, Camera,
  Palette, Edit, Trash2, Save, Play, Pause, RotateCcw, MessageSquareText, Send, User, Bot, Info, AlignLeft, Lightbulb, Sun, Image,
  Sparkles, PenLine, Gauge, MapPin, ListChecks, CalendarDays, Book, Globe, Film, Headphones, Terminal, MessageCircle
} from 'lucide-react';

// --- Global Constants & Theming ---
const ICON_COMPONENTS = {
  Plus, Settings, Search, Calendar, Clock, CloudSun, Code, Music, FileText, Calculator, MessageSquare, ExternalLink, X,
  Maximize, Minimize, Minus, Check, ChevronLeft, ChevronRight, Wind, Droplet, ThermometerSun, CloudSnow, Heart, Star, Bookmark, Camera,
  Palette, Edit, Trash2, Save, Play, Pause, RotateCcw, MessageSquareText, Send, User, Bot, Info, AlignLeft, Lightbulb, Sun, Image,
  Sparkles, PenLine, Gauge, MapPin, ListChecks, CalendarDays, Book, Globe, Film, Headphones, Terminal, MessageCircle
};
const COLORS = {
  primary: '#274f8b',
  secondary: '#e9b0c8',
  accent: '#d76a4c',
  success: '#25533f',
  danger: '#6e1e3a',
  info: '#a4bde0',
  warning: '#fadd8b',
  tertiary: '#74b72e',
  quad: 'rgba(255, 175, 89, 1)'
};


const WIDGET_MIN_WIDTH = 250;
const WIDGET_MIN_HEIGHT = 200;

// --- Custom Hook for Local Storage ---
const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
};
/**
 * @typedef {Object} AlertDialogProps
 * @property {string} [message]
 * @property {() => void} onConfirm
 * @property {() => void} [onCancel]
 * @property {boolean} [showCancel]
 * @property {React.ReactNode} [children]
 * @property {'info' | 'warning' | 'error' | 'success'} [type]
 */
// --- Reusable Alert/Confirm Dialog Component ---
const AlertDialog = ({
  message,
  onConfirm,
  onCancel,
  showCancel = false,
  children,
  type = 'info',
}) => {
  if (!message && !children) return null;

  let IconComponent;
  let borderColor;
  let iconColor;


  switch (type) {
    case 'success':
      IconComponent = Check;
      borderColor = COLORS.success;
      iconColor = COLORS.success;
      break;
    case 'warning':
      IconComponent = Info; // Using Info for warning as well, could be AlertTriangle
      borderColor = COLORS.warning;
      iconColor = COLORS.warning;
      break;
    case 'error':
      IconComponent = X; // Or AlertCircle
      borderColor = COLORS.danger;
      iconColor = COLORS.danger;
      break;
    case 'info':
    default:
      IconComponent = Info;
      borderColor = COLORS.tertiary;
      iconColor = COLORS.info;
      break;
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[1000] animate-fade-in" style={{ fontFamily: 'Lora, serif' }}>
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center transition-transform duration-300 scale-95 opacity-0 animate-scale-in" style={{ borderTop: `4px solid ${borderColor}` }}>
        {IconComponent && <IconComponent size={40} className={`mx-auto mb-4`} style={{ color: iconColor }} />}
        {message && <p className="text-lg font-semibold text-gray-800 mb-4">{message}</p>}
        {children}
        <div className="flex justify-center space-x-4 mt-4">
          <button
            onClick={onConfirm}
            className="px-5 py-2 text-white rounded-md hover:opacity-90 transition-colors shadow-sm"
            style={{ backgroundColor: borderColor }}
          >
            OK
          </button>
          {showCancel && (
            <button
              onClick={onCancel}
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
/**
 * @typedef {Object} ScrapbookWidgetProps
 * @property {string} id - or number, whatever fits your use case
 * @property {string} type
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {string} color
 * @property {string} name
 * @property {React.ReactNode} icon - or string if it's an icon name
 * @property {(id: string) => void} removeWidget
 * @property {React.ReactNode} [children]
 * @property {(newWidth: number, newHeight: number) => void} [onResize]
 * @property {(newX: number, newY: number) => void} [onDrag]
 * @property {() => void} [onMinimize]
 * @property {() => void} [onMaximize]
 */

/**
 * @param {ScrapbookWidgetProps} props
 */



const ScrapbookWidget = ({
  id,
  type,
  x,
  y,
  width,
  height,
  color,
  name,
  icon,
  removeWidget,
  children,
  onResize,
  onDrag,
  onMinimize,
  onMaximize,
}) => {
const widgetRef = useRef(null);
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const [isResizing, setIsResizing] = useState(null);
  const [isActuallyDragging, setIsActuallyDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

const handleDragMouseDown = useCallback((e) => {
  if (
    e.target instanceof HTMLElement &&
    (
      e.target.closest('.widget-control-button') ||
      e.target.closest('.resize-handle') ||
      e.target.closest('button') ||
      e.target.closest('input') ||
      e.target.closest('textarea') ||
      e.target.tagName === 'SELECT'
    )
  ) {
    return;
  }
const rect = widgetRef.current?.getBoundingClientRect();
if (!rect) return; // if current is null, exit early

dragOffset.current = {
  x: e.clientX - rect.left,
  y: e.clientY - rect.top,
};
  setIsActuallyDragging(false);
  e.stopPropagation();
}, []);

const handleResizeMouseDown = useCallback(
  (e, direction) => {
    e.stopPropagation();
    setIsResizing(direction);
    const rect = widgetRef.current.getBoundingClientRect();
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height,
    };
  },
  []
);
  const handleMouseMove = useCallback((e) => {
    if (isResizing) {
      let newWidth = resizeStart.current.width;
      let newHeight = resizeStart.current.height;

      if (isResizing.includes('right')) {
        newWidth = Math.max(WIDGET_MIN_WIDTH, resizeStart.current.width + (e.clientX - resizeStart.current.x));
      }
      if (isResizing.includes('bottom')) {
        newHeight = Math.max(WIDGET_MIN_HEIGHT, resizeStart.current.height + (e.clientY - resizeStart.current.y));
      }
      if (onResize) {
        onResize(id, newWidth, newHeight);
      }
    } else if (dragOffset.current.x !== 0 || dragOffset.current.y !== 0) {
      const parentRect = widgetRef.current.parentElement.getBoundingClientRect();
      const newX = e.clientX - dragOffset.current.x - parentRect.left;
      const newY = e.clientY - dragOffset.current.y - parentRect.top;

      const dragThreshold = 5;
      const dx = Math.abs(newX - x);
      const dy = Math.abs(newY - y);

      if (!isActuallyDragging && (dx > dragThreshold || dy > dragThreshold)) {
        setIsActuallyDragging(true);
      }

      if (isActuallyDragging && onDrag) {
        onDrag(id, newX, newY);
      }
    }
  }, [isResizing, isActuallyDragging, id, onDrag, onResize, x, y]);

  const handleMouseUp = useCallback(() => {
    setIsActuallyDragging(false);
    setIsResizing(null);
    dragOffset.current = { x: 0, y: 0 };
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const IconComponent = icon ? ICON_COMPONENTS[icon] : null;

  const handleMinimizeToggle = () => {
    setIsMinimized(prev => !prev);
    if (onMinimize) onMinimize(id, !isMinimized);
  };

  const handleMaximizeToggle = () => {
    setIsMaximized(prev => !prev);
    if (onMaximize) onMaximize(id, !isMaximized);
  };

  return (
    <div
      ref={widgetRef}
      className={`group absolute transition-all duration-200 bg-white rounded-xl border border-[${COLORS.info}] ${
        isActuallyDragging ? 'shadow-xl z-50 cursor-grabbing' : 'hover:shadow-lg'
      } flex flex-col ${isMaximized ? 'w-full h-full top-0 left-0 !z-[999]' : ''}`}
      style={{
        left: isMaximized ? 0 : x,
        top: isMaximized ? 0 : y,
        width: isMaximized ? '100%' : width,
        height: isMaximized ? '100%' : (isMinimized ? '48px' : height),
        fontFamily: 'Lora, serif',
      }}
    >
      {/* Widget Header */}
      <div
        className="flex items-center justify-between p-3 rounded-t-xl text-white shrink-0 cursor-grab border-b"
        style={{ backgroundColor: color, borderColor: COLORS.accent }}
        onMouseDown={isMaximized || isMinimized ? null : handleDragMouseDown} // Disable drag when maximized/minimized
      >
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent size={18} className="text-white" />}
          <span className="font-medium text-base">{name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleMinimizeToggle}
            className="widget-control-button text-white hover:text-gray-200 p-1 rounded-md hover:bg-white/20 transition-colors"
            title={isMinimized ? "Restore" : "Minimize widget"}
          >
            {isMinimized ? <Maximize size={16} /> : <Minus size={16} />}
          </button>
          <button
            onClick={handleMaximizeToggle}
            className="widget-control-button text-white hover:text-gray-200 p-1 rounded-md hover:bg-white/20 transition-colors"
            title={isMaximized ? "Restore" : "Maximize widget"}
          >
            {isMaximized ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
          <button
            onClick={() => removeWidget(id)}
            className="widget-control-button text-white hover:text-[COLORS.danger] p-1 rounded-md hover:bg-white/20 transition-colors"
            title="Remove widget"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    

      {/* Widget Content Area */}
      {!isMinimized && (
        <div className="p-4 flex-grow overflow-auto">
          {children}
        </div>
      )}

      {/* Resize Handles (Hidden when minimized/maximized) */}
      {!isMinimized && !isMaximized && (
        <>
          <div
            className="resize-handle absolute top-0 bottom-0 right-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeMouseDown(e, 'right')}
            style={{ right: '-4px' }}
          ></div>
          <div
            className="resize-handle absolute left-0 right-0 bottom-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')}
            style={{ bottom: '-4px' }}
          ></div>
          <div
            className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')}
            style={{ bottom: '-8px', right: '-8px', zIndex: 10 }}
          ></div>
        </>
      )}
    </div>
  );
};
const TimerWidget = () => {
  const [inputMinutes, setInputMinutes] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setSecondsLeft(Math.round(inputMinutes * 60));
  }, [inputMinutes]);

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
      clearInterval(intervalRef.current);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, secondsLeft]);

  const handleStart = () => {
    if (secondsLeft > 0) setIsRunning(true);
  };
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(inputMinutes * 60);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4" style={{ fontFamily: 'Lora, serif' }}>
      <div className="mb-4 flex items-center gap-2">
        <input
          type="number"
          min={0.1}
          step={0.01}
          max={120}
          value={inputMinutes}
          onChange={e => setInputMinutes(Number(e.target.value))}
          disabled={isRunning}
          className="w-16 p-2 border rounded text-center"
        />
        <span className="text-gray-700">minutes</span>
      </div>
      <div className="text-4xl font-bold mb-4">{formatTime(secondsLeft)}</div>
      <div className="flex gap-2">
        <button onClick={handleStart} disabled={isRunning || secondsLeft === 0} className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm">Start</button>
        <button onClick={handlePause} disabled={!isRunning} className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-sm">Pause</button>
        <button onClick={handleReset} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg shadow-sm">Reset</button>
      </div>
      {secondsLeft === 0 && (
        <div className="mt-4 text-lg text-red-500 font-semibold">Time's up!</div>
      )}
    </div>
  );
};
// --- Enhanced Notes Widget ---
const NotesWidget = () => {
  const [notesContent, setNotesContent] = useLocalStorage('notesContent', '');
  const [checklistItems, setChecklistItems] = useLocalStorage('checklistItems', []);
  const [newItemText, setNewItemText] = useState('');
  const [view, setView] = useState('checklist');
  const notesTextareaRef = useRef(null);

  // Auto-resize notes textarea
  useEffect(() => {
    if (view === 'notes' && notesTextareaRef.current) {
      notesTextareaRef.current.style.height = 'auto';
      notesTextareaRef.current.style.height = notesTextareaRef.current.scrollHeight + 'px';
    }
  }, [notesContent, view]);

  const addChecklistItem = () => {
    if (newItemText.trim()) {
      setChecklistItems([...checklistItems, {
        id: Date.now(),
        text: newItemText.trim(),
        completed: false
      }]);
      setNewItemText('');
    }
  };

  const toggleChecklistItem = (id) => {
    setChecklistItems(checklistItems.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteChecklistItem = (id) => {
    setChecklistItems(checklistItems.filter(item => item.id !== id));
  };

  const clearCompletedTasks = () => {
    setChecklistItems(checklistItems.filter(item => !item.completed));
  };

  return (
    <div className="h-full flex flex-col p-2" style={{ fontFamily: 'Lora, serif' }}>
      <div className="flex justify-center mb-4">
        <div className={`bg-[${COLORS.secondary}] bg-opacity-20 rounded-lg p-1 flex border border-[${COLORS.secondary}]`}>
          <button
            onClick={() => setView('checklist')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              view === 'checklist'
                ? `bg-[${COLORS.secondary}] text-white shadow-sm`
                : `text-gray-600 hover:bg-white/50`
            }`}
          >
            <Check size={16} className={`inline-block mr-1 ${view === 'checklist' ? 'text-white' : 'text-gray-600'}`} /> Tasks
          </button>
          <button
            onClick={() => setView('notes')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              view === 'notes'
                ? `bg-[${COLORS.secondary}] text-white shadow-sm`
                : `text-gray-600 hover:bg-white/50`
            }`}
          >
            <FileText size={16} className={`inline-block mr-1 ${view === 'notes' ? 'text-white' : 'text-gray-600'}`} /> Notes
          </button>
        </div>
      </div>

      {view === 'checklist' ? (
        <div className="flex-grow flex flex-col">
          <div className="flex-grow overflow-auto mb-4 space-y-2 pr-1">
            {checklistItems.map(item => (
              <div key={item.id} className={`flex items-center group bg-white rounded-lg p-3 border border-[${COLORS.info}] shadow-sm transition-all duration-200 hover:shadow-md`}>
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleChecklistItem(item.id)}
                  className={`mr-3 form-checkbox h-4 w-4 text-[${COLORS.success}] rounded focus:ring-[${COLORS.success}]`}
                />
                <span className={`flex-grow ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                  {item.text}
                </span>
                <button
                  onClick={() => deleteChecklistItem(item.id)}
                  className={`ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[${COLORS.danger}] p-1 rounded`}
                  title="Delete item"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            {checklistItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Lightbulb size={32} className={`text-[${COLORS.warning}] mx-auto mb-3`} />
                <p>No tasks yet! Add one below to get started.</p>
              </div>
            )}
          </div>

          <div className="flex shrink-0 gap-2 mt-auto">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
              placeholder="Add a new task..."
              className={`flex-grow p-3 rounded-lg border border-[${COLORS.secondary}] focus:border-[${COLORS.accent}] focus:outline-none bg-white text-gray-800 text-sm`}
            />
            <button
              onClick={addChecklistItem}
              className={`p-3 rounded-lg bg-[${COLORS.secondary}] text-white hover:opacity-90 shadow-sm`}
              title="Add task"
            >
              <Plus size={20} />
            </button>
          </div>
          {checklistItems.some(item => item.completed) && (
            <button
              onClick={clearCompletedTasks}
              className={`mt-2 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium shadow-sm`}
              title="Clear all completed tasks"
            >
              Clear Completed
            </button>
          )}
        </div>
      ) : (
        <div className="flex-grow flex flex-col">
          <textarea
            ref={notesTextareaRef}
            className={`w-full flex-grow p-4 border border-[${COLORS.accent}] rounded-lg resize-none focus:border-[${COLORS.danger}] focus:outline-none bg-white text-gray-800 text-sm overflow-hidden`}
            placeholder="Write your notes here... What's on your mind today?"
            value={notesContent}
            onChange={(e) => setNotesContent(e.target.value)}
            rows={5} // Initial rows, will adjust
          />
        </div>
      )}
    </div>
  );
};

// --- Calendar Widget with Hourly Blocks ---
const CalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useLocalStorage('calendarEvents', {});
  const [showHourly, setShowHourly] = useState(false);
  const [showAddEventPrompt, setShowAddEventPrompt] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [eventHour, setEventHour] = useState(0);
  const [editingEventId, setEditingEventId] = useState(null);
  const [editingEventTitle, setEditingEventTitle] = useState('');
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [modalEvent, setModalEvent] = useState(null);
  const hourlyViewRef = useRef(null);

  const EVENT_COLORS = [COLORS.primary, COLORS.accent, COLORS.success, COLORS.secondary, COLORS.info];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateKey = formatDateKey(date);
    return events[dateKey] || [];
  };

  const addEvent = (date, hour, title) => {
    const dateKey = formatDateKey(date);
    const newEvent = {
      id: Date.now(),
      hour,
      title: title || `Event at ${hour}:00`,
      color: EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)]
    };

    setEvents(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newEvent]
    }));
    setShowAddEventPrompt(false);
    setNewEventTitle('');
  };

  const updateEvent = (eventId, newTitle) => {
    const dateKey = formatDateKey(selectedDate);
    setEvents(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].map(event =>
        event.id === eventId ? { ...event, title: newTitle } : event
      )
    }));
    setEditingEventId(null);
    setEditingEventTitle('');
    if (modalEvent && modalEvent.id === eventId) {
      setModalEvent(prev => ({ ...prev, title: newTitle }));
    }
  };

  const deleteEvent = (eventId) => {
    const dateKey = formatDateKey(selectedDate);
    setEvents(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter(event => event.id !== eventId)
    }));
    setShowEventDetailsModal(false);
    setModalEvent(null);
  };

  const daysInMonthGrid = getDaysInMonth(currentDate);
  const today = new Date();
  const hours = Array.from({length: 24}, (_, i) => i);

  // Auto-scroll hourly view to current time
  useEffect(() => {
    if (showHourly && hourlyViewRef.current) {
      const currentHour = new Date().getHours();
      const hourElement = hourlyViewRef.current.querySelector(`#hour-${currentHour}`);
      if (hourElement) {
        hourElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [showHourly, selectedDate]); // Re-scroll if date changes in hourly view

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setShowHourly(true);
  };

  const handleEventClick = (event) => {
    setModalEvent(event);
    setShowEventDetailsModal(true);
  };

  if (showHourly) {
    return (
      <div className="h-full flex flex-col p-2" style={{ fontFamily: 'Lora, serif' }}>
        {showAddEventPrompt && (
          <AlertDialog
            message={`Add event for ${eventHour.toString().padStart(2, '0')}:00 on ${selectedDate.toLocaleDateString()}?`}
            onConfirm={() => addEvent(selectedDate, eventHour, newEventTitle)}
            onCancel={() => { setShowAddEventPrompt(false); setNewEventTitle(''); }}
            showCancel={true}
            type="info"
          >
            <input
              type="text"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="Event title"
              className={`mt-2 p-2 border rounded-md w-full border-gray-300 focus:border-[${COLORS.warning}] focus:outline-none text-sm`}
            />
          </AlertDialog>
        )}

        {showEventDetailsModal && modalEvent && (
          <AlertDialog
            message={`Event Details: ${modalEvent.title}`}
            onConfirm={() => setShowEventDetailsModal(false)}
            showCancel={true}
            onCancel={() => {
              if (editingEventId === modalEvent.id) { // If currently editing, cancel edit
                setEditingEventId(null);
                setEditingEventTitle('');
              }
              setShowEventDetailsModal(false);
            }}
            type="info"
          >
            <div className="text-left text-gray-700">
              <p className="mb-2"><strong>Time:</strong> {modalEvent.hour.toString().padStart(2, '0')}:00</p>
              <p className="mb-2"><strong>Date:</strong> {selectedDate.toLocaleDateString()}</p>
              <div className="flex items-center gap-2 mb-4">
                <strong>Title:</strong>
                {editingEventId === modalEvent.id ? (
                  <>
                    <input
                      type="text"
                      value={editingEventTitle}
                      onChange={(e) => setEditingEventTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && updateEvent(modalEvent.id, editingEventTitle)}
                      className={`flex-grow p-1 border rounded-md border-gray-300 focus:border-[${COLORS.primary}] focus:outline-none text-sm`}
                    />
                    <button onClick={() => updateEvent(modalEvent.id, editingEventTitle)} className={`p-1 rounded-md bg-[${COLORS.success}] text-white hover:opacity-90`}><Save size={16} /></button>
                    <button onClick={() => { setEditingEventId(null); setEditingEventTitle(''); }} className={`p-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300`}><X size={16} /></button>
                  </>
                ) : (
                  <>
                    <span className="flex-grow">{modalEvent.title}</span>
                    <button onClick={() => { setEditingEventId(modalEvent.id); setEditingEventTitle(modalEvent.title); }} className={`p-1 rounded-md bg-[${COLORS.primary}] text-white hover:opacity-90`}><Edit size={16} /></button>
                  </>
                )}
              </div>
              <button
                onClick={() => deleteEvent(modalEvent.id)}
                className={`w-full px-4 py-2 bg-[${COLORS.danger}] text-white rounded-md hover:opacity-90 transition-colors shadow-sm`}
              >
                <Trash2 size={16} className="inline-block mr-1" /> Delete Event
              </button>
            </div>
          </AlertDialog>
        )}

        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[${COLORS.info}]">
          <button
            onClick={() => setShowHourly(false)}
            className={`text-[${COLORS.primary}] hover:opacity-80 font-medium p-2 rounded-lg hover:bg-[${COLORS.info}]/30 transition-colors`}
            title="Back to monthly view"
          >
            <ChevronLeft size={16} className="inline-block mr-1" /> Back
          </button>
          <h3 className="font-semibold text-lg text-gray-800">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          <button
            onClick={() => {
              setSelectedDate(new Date());
              setCurrentDate(new Date());
            }}
            className={`text-[${COLORS.primary}] hover:opacity-80 font-medium p-2 rounded-lg hover:bg-[${COLORS.info}]/30 transition-colors`}
            title="Go to Today"
          >
            Today <CalendarDays size={16} className="inline-block ml-1" />
          </button>
        </div>

        <div ref={hourlyViewRef} className="flex-grow overflow-auto pr-1">
          <div className="space-y-1">
            {hours.map(hour => {
              const hourEvents = getEventsForDate(selectedDate).filter(e => e.hour === hour);
              const isCurrentHour = selectedDate.toDateString() === today.toDateString() && hour === today.getHours();
              return (
                <div key={hour} id={`hour-${hour}`} className={`flex border-l border-[${COLORS.info}] hover:border-[${COLORS.primary}] transition-colors group ${isCurrentHour ? 'bg-blue-50 bg-opacity-50' : ''}`}>
                  <div className="w-16 text-right pr-2 py-2 text-xs font-medium text-gray-500">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  <div className="flex-grow border-l pl-3 py-2 min-h-[40px] relative">
                    {hourEvents.map(event => (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="inline-flex items-center px-2 py-1 rounded text-white text-xs mr-2 mb-1 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: event.color }}
                      >
                        {event.title}
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setEventHour(hour);
                        setShowAddEventPrompt(true);
                      }}
                      className={`absolute right-2 top-2 w-6 h-6 bg-[${COLORS.primary}] bg-opacity-10 hover:bg-opacity-20 rounded-md flex items-center justify-center text-[${COLORS.primary}] opacity-0 group-hover:opacity-100 transition-opacity`}
                      title={`Add event at ${hour}:00`}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Floating Add Event Button */}
        <button
          onClick={() => {
            setEventHour(new Date().getHours()); // Default to current hour
            setShowAddEventPrompt(true);
          }}
          className={`fixed bottom-4 right-4 p-4 rounded-full bg-[${COLORS.primary}] text-white shadow-lg hover:shadow-xl transition-shadow duration-300 z-10`}
          title="Add new event"
        >
          <Plus size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-2" style={{ fontFamily: 'Lora, serif' }}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigateMonth(-1)} className={`p-2 hover:bg-[${COLORS.info}]/30 rounded-lg text-gray-600`} title="Previous month">
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-semibold text-xl text-gray-800">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={() => navigateMonth(1)} className={`p-2 hover:bg-[${COLORS.info}]/30 rounded-lg text-gray-600`} title="Next month">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 flex-grow overflow-auto pr-1">
        {daysInMonthGrid.map((date, index) => {
          if (!date) {
            return <div key={index} className="p-2"></div>;
          }

          const isToday = date.toDateString() === today.toDateString();
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const dayEvents = getEventsForDate(date);

          return (
            <div
              key={index}
              onClick={() => handleDayClick(date)}
              className={`
                p-2 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm
                ${isToday ? `bg-[${COLORS.primary}] bg-opacity-10 border-[${COLORS.primary}] border-opacity-30` : `border-[${COLORS.info}] hover:border-[${COLORS.primary}]`}
                ${isSelected ? `ring-2 ring-[${COLORS.primary}] ring-opacity-50` : ''}
                flex flex-col items-center justify-start min-h-[80px]
              `}
            >
              <div className={`text-sm font-medium ${isToday ? `text-[${COLORS.primary}]` : 'text-gray-700'}`}>
                {date.getDate()}
              </div>
              <div className="mt-1 space-y-1 w-full flex-grow">
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    className="w-full h-1 rounded-sm"
                    style={{ backgroundColor: event.color }}
                    title={event.title}
                  ></div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">+{dayEvents.length - 2}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Enhanced Diary Widget ---
const DiaryWidget = () => {
  const [entries, setEntries] = useLocalStorage('diaryEntries', {});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentEntry, setCurrentEntry] = useState({ title: '', content: '', tags: [] });
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const contentTextareaRef = useRef(null);

  useEffect(() => {
    const dateStr = currentDate.toISOString().slice(0, 10);
    const entry = entries[dateStr] || { title: '', content: '', tags: [] };
    setCurrentEntry(entry);
    setIsEditing(false); // Reset editing state when date changes
  }, [currentDate, entries]);

  // Auto-resize textarea and update character/word count
  useEffect(() => {
    if (contentTextareaRef.current) {
      contentTextareaRef.current.style.height = 'auto';
      contentTextareaRef.current.style.height = contentTextareaRef.current.scrollHeight + 'px';
    }
  }, [currentEntry.content, isEditing]);

  const handleSave = () => {
    const dateStr = currentDate.toISOString().slice(0, 10);
    setEntries(prev => ({
      ...prev,
      [dateStr]: { ...currentEntry, lastEdited: new Date().toISOString() }
    }));
    setIsEditing(false);
  };

  const navigateDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const hasEntry = entries[currentDate.toISOString().slice(0, 10)];

  const wordCount = currentEntry.content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = currentEntry.content.length;

  return (
    <div className="h-full flex flex-col p-2" style={{ fontFamily: 'Lora, serif' }}>
      {showDeleteConfirm && (
        <AlertDialog
          message="Are you sure you want to delete this entry?"
          onConfirm={() => {
            const dateStr = currentDate.toISOString().slice(0, 10);
            const newEntries = { ...entries };
            delete newEntries[dateStr];
            setEntries(newEntries);
            setShowDeleteConfirm(false);
          }}
          onCancel={() => setShowDeleteConfirm(false)}
          showCancel={true}
          type="warning"
        />
      )}

      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg border border-[${COLORS.info}]">
        <button
          onClick={() => navigateDate(-1)}
          className={`p-2 hover:bg-[${COLORS.info}]/30 rounded-lg transition-colors text-gray-600`}
          title="Previous day"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <h4 className="font-semibold text-lg text-gray-800">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
          </h4>
          <p className="text-sm text-gray-500">
            {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {hasEntry && entries[currentDate.toISOString().slice(0, 10)].lastEdited && (
              <span className="block text-xs text-gray-400">
                Last edited: {new Date(entries[currentDate.toISOString().slice(0, 10)].lastEdited).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => navigateDate(1)}
          className={`p-2 hover:bg-[${COLORS.info}]/30 rounded-lg transition-colors text-gray-600`}
          title="Next day"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {!isEditing && !hasEntry && (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
          <Lightbulb size={48} className={`text-[${COLORS.quad}] mb-4`} />
          <p className="mb-4" style={{ color: COLORS.primary }}>No entry for this date yet! What happened today?</p>
<button
  onClick={() => setIsEditing(true)}
  className={`px-6 py-3 bg-[${COLORS.quad}] rounded-lg hover:opacity-90 shadow-sm`}
  style={{ color: COLORS.accent, fontWeight: 600 }}
>
  <Plus size={16} className="inline-block mr-1" style={{ color: COLORS.quad }} /> Create New Entry
</button>
        </div>
      )}

      {(isEditing || hasEntry) && (
        <div className="flex-grow flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Today's title... (e.g., A Productive Day)"
            value={currentEntry.title}
            onChange={(e) => setCurrentEntry({ ...currentEntry, title: e.target.value })}
            disabled={!isEditing}
            className={`w-full p-3 rounded-lg border font-semibold text-base text-gray-800 ${
              isEditing
                ? `border-[${COLORS.primary}] focus:border-[${COLORS.accent}] bg-white`
                : `border-[${COLORS.info}] bg-gray-50`
            } transition-colors focus:outline-none`}
          />

          <textarea
            ref={contentTextareaRef}
            placeholder="Write about your day... What did you do? How did you feel?"
            value={currentEntry.content}
            onChange={(e) => setCurrentEntry({ ...currentEntry, content: e.target.value })}
            disabled={!isEditing}
            className={`flex-grow w-full p-4 border rounded-lg resize-none text-gray-800 text-sm overflow-hidden`}
            style={{ minHeight: '150px' }}
          />
          <div className="text-right text-xs text-gray-500">
            {wordCount} words, {charCount} characters
          </div>

          <div className="flex justify-between">
            {isEditing ? (
              <>
              <button
  onClick={handleSave}
  className={`px-6 py-2 rounded-lg hover:opacity-90 shadow-sm`}
  style={{ backgroundColor: COLORS.primary, color: COLORS.warning }}
>
  <Save size={16} className="inline-block mr-1" style={{ color: COLORS.warning}} /> Save Entry
</button>
                <button
                  onClick={() => {
                    const dateStr = currentDate.toISOString().slice(0, 10);
                    setCurrentEntry(entries[dateStr] || { title: '', content: '', tags: [] });
                    setIsEditing(false);
                  }}
                  className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
<button
  onClick={() => setIsEditing(true)}
  className="px-6 py-2 rounded-lg hover:opacity-90 shadow-sm"
  style={{ backgroundColor: COLORS.primary, color: COLORS.warning }}
>
  <Edit size={16} className="inline-block mr-1" style={{ color: COLORS.warning }} /> Edit Entry
</button>
{hasEntry && (
  <button
    onClick={() => setShowDeleteConfirm(true)}
    className="px-6 py-2 rounded-lg hover:opacity-90 shadow-sm"
    style={{ backgroundColor: COLORS.danger, color: COLORS.warning }}
  >
    <Trash2 size={16} className="inline-block mr-1" style={{ color: COLORS.warning }} /> Delete
  </button>
)}              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Weather Widget (Dynamic with OpenWeatherMap API) ---
const WeatherWidget = () => {
  // IMPORTANT: Use environment variables for API keys in production
  // For this environment, we'll use a placeholder. In a real app, you'd use process.env.REACT_APP_OPENWEATHER_API_KEY
const API_KEY = import.meta.env.VITE_CUSTOM_API_KEY;

  const [location, setLocation] = useLocalStorage('weatherLocation', 'London, UK');
  const [inputLocation, setInputLocation] = useState(location);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('metric'); // 'metric' for Celsius, 'imperial' for Fahrenheit

  // Function to map OpenWeatherMap icon codes to Lucide React icons
  const getWeatherIconComponent = (iconCode) => {
    switch (iconCode) {
      case '01d': return { component: Sun, color: `text-[${COLORS.warning}]` }; // clear sky day
      case '01n': return { component: CloudSun, color: "text-gray-500" }; // clear sky night (using cloudsun for simplicity)
      case '02d': return { component: CloudSun, color: "text-gray-500" }; // few clouds day
      case '02n': return { component: CloudSun, color: "text-gray-500" }; // few clouds night
      case '03d':
      case '03n':
      case '04d':
      case '04n': return { component: CloudSun, color: "text-gray-500" }; // scattered, broken clouds
      case '09d':
      case '09n': return { component: Droplet, color: `text-[${COLORS.primary}]` }; // shower rain
      case '10d':
      case '10n': return { component: CloudSun, color: `text-[${COLORS.primary}]` }; // rain
      case '11d':
      case '11n': return { component: CloudSun, color: "text-gray-700" }; // thunderstorm
      case '13d':
      case '13n': return { component: CloudSnow, color: `text-[${COLORS.info}]` }; // snow
      case '50d':
      case '50n': return { component: Wind, color: "text-gray-400" }; // mist
      default: return { component: CloudSun, color: "text-gray-500" }; // default to cloud for unknown
    }
  };

  const fetchWeatherData = useCallback(async (currentLocation, currentUnit) => {
    if (!currentLocation || !API_KEY || API_KEY === 'YOUR_OPENWEATHER_API_KEY_HERE') {
      setError('Please provide a valid location and OpenWeatherMap API key.');
      setWeatherData(null);
      setForecastData(null);
      return;
    }

    setLoading(true);
    setError('');
    setWeatherData(null);
    setForecastData(null);

    try {
      // Current Weather
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${currentLocation}&appid=${API_KEY}&units=${currentUnit}`
      );

      if (!weatherResponse.ok) {
        if (weatherResponse.status === 404) {
          throw new Error('City not found. Please check the spelling.');
        } else if (weatherResponse.status === 401) {
          throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
        } else {
          throw new Error(`Error: ${weatherResponse.status} ${weatherResponse.statusText}`);
        }
      }
      const weatherData = await weatherResponse.json();
      setWeatherData(weatherData);

      // 5-Day Forecast (OpenWeatherMap's 5-day / 3-hour forecast API)
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${currentLocation}&appid=${API_KEY}&units=${currentUnit}`
      );
      if (!forecastResponse.ok) {
        throw new Error(`Error fetching forecast: ${forecastResponse.status} ${forecastResponse.statusText}`);
      }
      const forecastJson = await forecastResponse.json();

      // Process forecast data to get daily average/max/min
      const dailyForecasts = {};
      forecastJson.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyForecasts[date]) {
          dailyForecasts[date] = {
            temp_max: -Infinity,
            temp_min: Infinity,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            date: item.dt * 1000 // Store timestamp for sorting
          };
        }
        dailyForecasts[date].temp_max = Math.max(dailyForecasts[date].temp_max, item.main.temp_max);
        dailyForecasts[date].temp_min = Math.min(dailyForecasts[date].temp_min, item.main.temp_min);
      });

      // Convert to array and sort by date, taking next 5 days
      const sortedForecast = Object.values(dailyForecasts)
        .sort((a, b) => a.date - b.date)
        .slice(1, 6); // Get next 5 days, excluding today if present

      setForecastData(sortedForecast);

    } catch (err) {
      console.error("Failed to fetch weather:", err);
      setError(err.message || 'Error fetching weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [API_KEY]);

  useEffect(() => {
    fetchWeatherData(location, unit);
  }, [location, unit, fetchWeatherData]);

  const handleSearch = () => {
    setLocation(inputLocation);
  };

  const handleClearInput = () => {
    setInputLocation('');
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocoding to get city name
          const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`);
          const geoData = await geoResponse.json();
          if (geoData && geoData.length > 0) {
            const city = geoData[0].name;
            const country = geoData[0].country;
            const fullLocation = `${city}, ${country}`;
            setInputLocation(fullLocation);
            setLocation(fullLocation);
          } else {
            setError('Could not determine city from your location.');
          }
        } catch (err) {
          setError('Error getting location data.');
          console.error('Geolocation error:', err);
        } finally {
          setLoading(false);
        }
      }, (error) => {
        setLoading(false);
        setError(`Geolocation error: ${error.message}. Please enable location services.`);
        console.error('Geolocation error:', error);
      });
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const Icon = weatherData ? getWeatherIconComponent(weatherData.weather[0].icon).component : CloudSun;
  const iconColor = weatherData ? getWeatherIconComponent(weatherData.weather[0].icon).color : "text-gray-500";

  return (
    <div className="h-full flex flex-col p-2" style={{ fontFamily: 'Lora, serif' }}>
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={inputLocation}
            onChange={(e) => setInputLocation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter city, country"
            className={`w-full p-2 rounded-lg border border-[${COLORS.info}] focus:border-[${COLORS.primary}] focus:outline-none text-sm pr-8`}
            disabled={loading}
          />
          {inputLocation && (
            <button
              onClick={handleClearInput}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              title="Clear input"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          className={`p-2 bg-[${COLORS.primary}] text-white rounded-lg hover:opacity-90 shadow-sm transition-colors`}
          title="Search weather"
          disabled={loading}
        >
          {loading ? (
            <span className="animate-spin inline-block h-5 w-5 border-2 border-white border-r-transparent rounded-full"></span>
          ) : (
            <Search size={20} />
          )}
        </button>
        <button
          onClick={handleGeolocation}
          className={`p-2 bg-[${COLORS.accent}] text-white rounded-lg hover:opacity-90 shadow-sm transition-colors`}
          title="Get weather for my location"
          disabled={loading}
        >
          <MapPin size={20} />
        </button>
      </div>

      {error && (
        <div className={`text-[${COLORS.danger}] bg-red-100 p-3 rounded-md mb-4 flex items-center gap-2`}>
          <Info size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {weatherData && !loading && (
        <div className="flex flex-col items-center justify-center flex-grow text-center">
          <Icon size={80} className={`${iconColor} mb-2`} />
          <h4 className="text-3xl font-bold text-gray-800 mb-1">
            {weatherData.main.temp}°{unit === 'metric' ? 'C' : 'F'}
          </h4>
          <p className="text-xl text-gray-700 mb-2">
            {weatherData.name}, {weatherData.sys.country}
          </p>
          <p className="text-lg text-gray-600 capitalize mb-4">
            {weatherData.weather[0].description}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <ThermometerSun size={16} /> Feels like: {weatherData.main.feels_like}°{unit === 'metric' ? 'C' : 'F'}
            </div>
            <div className="flex items-center gap-1">
              <Droplet size={16} /> Humidity: {weatherData.main.humidity}%
            </div>
            <div className="flex items-center gap-1">
              <Wind size={16} /> Wind: {weatherData.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}
            </div>
            <div className="flex items-center gap-1">
              <Gauge size={16} /> Pressure: {weatherData.main.pressure} hPa
            </div>
            <div className="flex items-center gap-1 col-span-2 justify-center">
              <Clock size={16} /> Updated: {new Date(weatherData.dt * 1000).toLocaleTimeString()}
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setUnit('metric')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${unit === 'metric' ? `bg-[${COLORS.primary}] text-white` : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              °C
            </button>
            <button
              onClick={() => setUnit('imperial')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${unit === 'imperial' ? `bg-[${COLORS.primary}] text-white` : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              °F
            </button>
          </div>

          {forecastData && forecastData.length > 0 && (
            <div className="w-full mt-4 border-t border-gray-200 pt-4">
              <h5 className="font-semibold text-gray-700 mb-3 text-center">5-Day Forecast</h5>
              <div className="grid grid-cols-5 gap-2 text-center">
                {forecastData.map((day, index) => {
                  const ForecastIcon = getWeatherIconComponent(day.icon).component;
                  const forecastIconColor = getWeatherIconComponent(day.icon).color;
                  return (
                    <div key={index} className="flex flex-col items-center p-2 rounded-lg bg-gray-50 border border-gray-200">
                      <span className="text-xs text-gray-500 mb-1">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      <ForecastIcon size={24} className={`${forecastIconColor} mb-1`} />
                      <span className="text-sm font-medium text-gray-800">{Math.round(day.temp_max)}°</span>
                      <span className="text-xs text-gray-500">{Math.round(day.temp_min)}°</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {!weatherData && !error && !loading && (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500">
          <CloudSun size={48} className="mb-3 text-gray-400" />
          <p>Enter a city or use "My Location" to see the weather!</p>
        </div>
      )}
    </div>
  );
};

// --- New: Web Embed Widget ---
const WebEmbedWidget = () => {
  const [url, setUrl] = useLocalStorage('webEmbedUrl', 'https://www.google.com');
  const [inputUrl, setInputUrl] = useState(url);
  const [error, setError] = useState('');

  const handleLoad = () => {
    if (!inputUrl.trim()) {
      setError('Please enter a URL.');
      return;
    }
    try {
      // Basic URL validation
      new URL(inputUrl);
      setUrl(inputUrl);
      setError('');
    } catch (e) {
      setError('Invalid URL format. Please include http:// or https://');
    }
  };

  return (
    <div className="h-full flex flex-col p-2" style={{ fontFamily: 'Lora, serif' }}>
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLoad()}
          placeholder="Enter URL (e.g., https://example.com)"
          className={`flex-grow p-2 rounded-lg border border-[${COLORS.info}] focus:border-[${COLORS.primary}] focus:outline-none text-sm`}
        />
<button
  onClick={handleLoad}
  className="p-2 rounded-lg hover:opacity-90 shadow-sm transition-colors"
  style={{ backgroundColor: COLORS.primary, color: COLORS.secondary }}
  title="Load URL"
>
  <Search size={20} style={{ color: COLORS.secondary }} />
</button>      </div>
      {error && (
        <div className={`text-[${COLORS.danger}] bg-red-100 p-2 rounded-md mb-3 text-sm flex items-center gap-2`}>
          <Info size={16} /> {error}
        </div>
      )}
      {url && (
        <iframe
          src={url}
          title="Web Embed"
          className="flex-grow w-full border border-gray-300 rounded-lg"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals" // Security best practice
          onError={() => setError('Could not load content from this URL. It might be blocked by security policies (CSP) or does not exist.')}
        ></iframe>
      )}
      {!url && !error && (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500">
          <Globe size={48} className="mb-3 text-gray-400" />
          <p>Enter a URL to embed a website.</p>
        </div>
      )}
    </div>
  );
};

// --- New: Media Embed Widget ---
const MediaEmbedWidget = () => {
  const [mediaUrl, setMediaUrl] = useLocalStorage('mediaEmbedUrl', '');
  const [inputMediaUrl, setInputMediaUrl] = useState(mediaUrl);
  const [error, setError] = useState('');

  const getYouTubeEmbedUrl = (url) => {
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/;
    const match = url.match(regExp);
    return (match && match[1]) ? `https://www.youtube.com/embed/${match[1]}?autoplay=0` : null;
  };

  const handleLoad = () => {
    if (!inputMediaUrl.trim()) {
      setError('Please enter a media URL.');
      return;
    }
    setError('');
    setMediaUrl(inputMediaUrl);
  };

  const isYouTube = getYouTubeEmbedUrl(mediaUrl);
  const isAudio = mediaUrl.match(/\.(mp3|wav|ogg)$/i);
  const isVideo = mediaUrl.match(/\.(mp4|webm|ogg)$/i) && !isYouTube; // Exclude YouTube from direct video

  return (
    <div className="h-full flex flex-col p-2" style={{ fontFamily: 'Lora, serif' }}>
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={inputMediaUrl}
          onChange={(e) => setInputMediaUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLoad()}
          placeholder="Enter YouTube URL or direct media link"
          className={`flex-grow p-2 rounded-lg border border-[${COLORS.info}] focus:border-[${COLORS.primary}] focus:outline-none text-sm`}
        />
        <button
          onClick={handleLoad}
          className={`p-2 bg-[${COLORS.primary}] text-white rounded-lg hover:opacity-90 shadow-sm transition-colors`}
          title="Load Media"
        >
          <Play size={20} />
        </button>
      </div>
      {error && (
        <div className={`text-[${COLORS.danger}] bg-red-100 p-2 rounded-md mb-3 text-sm flex items-center gap-2`}>
          <Info size={16} /> {error}
        </div>
      )}
      <div className="flex-grow flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
        {isYouTube ? (
          <iframe
            src={isYouTube}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            onError={() => setError('Could not load YouTube video. Check URL or network.')}
          ></iframe>
        ) : isVideo ? (
          <video controls src={mediaUrl} className="w-full h-full object-contain" onError={() => setError('Could not load video. Check URL or format.')}>
            Your browser does not support the video tag.
          </video>
        ) : isAudio ? (
          <audio controls src={mediaUrl} className="w-full p-4" onError={() => setError('Could not load audio. Check URL or format.')}>
            Your browser does not support the audio element.
          </audio>
        ) : (
          <div className="flex flex-col items-center text-center text-gray-500">
            <Film size={48} className="mb-3 text-gray-400" />
            <p>Enter a media URL to play.</p>
            <p className="text-xs text-gray-400">(YouTube or direct .mp3/.mp4 links)</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AIChatbotWidget = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatHistoryRef = useRef(null);

  // For LOCAL running, replace with your actual API key
  // For Canvas environment, this won't work due to CORS restrictions
  const API_KEY = "AIzaSyDYYMQzMGcWPZSvznYEN8-IZ_JHTcCPta0";

  // Scroll to bottom of chat history
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (inputMessage.trim() === '') return;

    // Check if API key is provided
    if (!API_KEY || API_KEY.trim() === '') {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: 'Error: No API key provided. Please add your Gemini API key to the API_KEY constant.' 
      }]);
      return;
    }

    const userMessage = { role: 'user', text: inputMessage.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // For first message, just send the user message
      // For subsequent messages, include conversation history
      const conversationHistory = [...messages, userMessage];
      
      // Format for Gemini API
      const formattedContents = conversationHistory.map(msg => ({
        role: msg.role === 'bot' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      // Gemini API payload
      const payload = {
        contents: formattedContents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      };

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${"VITE_GEMINI_API_KEY"}`;

      console.log('Sending payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        console.error('API Error Response:', responseText);
        throw new Error(`API error: ${response.status} ${response.statusText} - ${responseText}`);
      }

      const result = JSON.parse(responseText);
      
      if (result.candidates && result.candidates.length > 0) {
        const candidate = result.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          const botResponseText = candidate.content.parts[0].text;
          setMessages(prev => [...prev, { role: 'bot', text: botResponseText }]);
        } else {
          throw new Error('No content in API response');
        }
      } else {
        throw new Error('No candidates in API response');
      }
    } catch (error) {
      console.error('Error sending message to AI:', error);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: `Error: ${error.message || 'Failed to get response from AI.'}`
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-2" style={{ fontFamily: 'Lora, serif' }}>
      <div ref={chatHistoryRef} className="flex-grow overflow-y-auto p-3 bg-gray-50 rounded-lg mb-3 border border-gray-200 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            <MessageCircle size={32} className="mx-auto mb-2 text-gray-400" />
            <p>Start a conversation with the AI!</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
              msg.role === 'user'
                ? 'bg-blue-500 text-white rounded-br-none'
                : 'bg-gray-200 text-gray-800 rounded-bl-none'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg shadow-sm bg-gray-200 text-gray-800 rounded-bl-none">
              <span className="animate-pulse">Typing...</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          className="flex-grow p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none text-sm"
          disabled={isTyping}
        />
        <button
          onClick={sendMessage}
          className="p-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 shadow-sm disabled:opacity-50"
          title="Send message"
          disabled={isTyping}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};


// --- New: Code Runner Widget ---
const CodeRunnerWidget = () => {
  const [code, setCode] = useLocalStorage('codeRunnerCode', `console.log("Hello, world!");\n// Try typing some JavaScript code here!\n// For example:\n// let a = 10;\n// let b = 20;\n// console.log(a + b);`);
  const [output, setOutput] = useState('');
  const outputRef = useRef(null);

  const runCode = () => {
    setOutput(''); // Clear previous output
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const tempOutput = [];

    // Redirect console.log and console.error to capture output
    console.log = (...args) => {
      tempOutput.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
    };
    console.error = (...args) => {
      tempOutput.push(`ERROR: ${args.map(arg => String(arg)).join(' ')}`);
    };

    try {
      // Use a function wrapper to prevent global scope pollution and allow 'return'
      const func = new Function(code);
      const result = func();
      if (result !== undefined) {
        tempOutput.push(`Result: ${typeof result === 'object' ? JSON.stringify(result) : String(result)}`);
      }
    } catch (e) {
      tempOutput.push(`Runtime Error: ${e.message}`);
    } finally {
      // Restore original console methods
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      setOutput(tempOutput.join('\n'));
    }
  };

  // Scroll output to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="h-full flex flex-col p-2" style={{ fontFamily: 'Lora, serif' }}>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Write your JavaScript code here..."
        className={`flex-grow w-full p-3 rounded-lg border border-[${COLORS.info}] focus:border-[${COLORS.primary}] focus:outline-none bg-gray-800 text-white text-sm font-mono resize-none mb-3`}
        spellCheck="false"
        style={{ minHeight: '150px' }}
      />
      <button
        onClick={runCode}
        className={`w-full px-4 py-2 bg-[${COLORS.success}] text-white rounded-lg hover:opacity-90 shadow-sm transition-colors mb-3`}
        title="Run Code"
      >
        <Play size={16} className="inline-block mr-2" /> Run Code
      </button>
      <div
        ref={outputRef}
        className="w-full flex-grow p-3 bg-gray-900 text-green-400 rounded-lg border border-gray-700 overflow-auto text-xs font-mono"
        style={{ minHeight: '80px' }}
      >
        {output || 'Output will appear here...'}
      </div>
    </div>
  );
};


// --- Main App Component ---
const App = () => {
  const [widgets, setWidgets] = useLocalStorage('scrapbookWidgets', []); // Persist widgets
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar always open by default

  const addWidget = (type, name, icon, color) => {
    const newWidget = {
      id: Date.now(),
      type,
      name,
      icon,
      color,
      x: Math.random() * (window.innerWidth - WIDGET_MIN_WIDTH - 250) + 200, // Offset for sidebar
      y: Math.random() * (window.innerHeight - WIDGET_MIN_HEIGHT - 100) + 50,
      width: WIDGET_MIN_WIDTH,
      height: WIDGET_MIN_HEIGHT,
      isMinimized: false,
      isMaximized: false,
    };
    setWidgets((prev) => [...prev, newWidget]);
  };

const removeWidget = (id) => {
  setWidgets((prev) => prev.filter((widget) => widget.id !== id));
};

  const handleWidgetResize = (id, newWidth, newHeight) => {
    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === id ? { ...widget, width: newWidth, height: newHeight } : widget
      )
    );
  };

  const handleWidgetDrag = (id, newX, newY) => {
    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === id ? { ...widget, x: newX, y: newY } : widget
      )
    );
  };

  const handleMinimize = (id, isMinimized) => {
    setWidgets(prev => prev.map(widget =>
      widget.id === id ? { ...widget, isMinimized, isMaximized: false } : widget
    ));
  };

  const handleMaximize = (id, isMaximized) => {
    setWidgets(prev => prev.map(widget =>
      widget.id === id ? { ...widget, isMaximized, isMinimized: false } : widget
    ));
  };

  const widgetComponents = {
    notes: NotesWidget,
    calendar: CalendarWidget,
    diary: DiaryWidget,
    weather: WeatherWidget,
    webEmbed: WebEmbedWidget,
    mediaEmbed: MediaEmbedWidget,
    aiChatbot: AIChatbotWidget,
    codeRunner: CodeRunnerWidget,
    timer: TimerWidget, // <-- Add this line
  };

  const widgetOptions = [
    { type: 'notes', name: 'Notes & Tasks', icon: 'FileText', color: COLORS.secondary },
    { type: 'calendar', name: 'Calendar', icon: 'Calendar', color: COLORS.primary },
    { type: 'diary', name: 'Diary', icon: 'Book', color: COLORS.quad },
    { type: 'weather', name: 'Weather', icon: 'CloudSun', color: COLORS.success },
    { type: 'webEmbed', name: 'Web Embed', icon: 'Globe', color: COLORS.info },
    { type: 'mediaEmbed', name: 'Media Embed', icon: 'Film', color: COLORS.danger },
    { type: 'aiChatbot', name: 'AI Chatbot', icon: 'MessageCircle', color: COLORS.tertiary },
    { type: 'codeRunner', name: 'Code Runner', icon: 'Terminal', color: COLORS.accent },
    { type: 'timer', name: 'Timer', icon: 'Clock', color: COLORS.warning }, // <-- Add this line
  ];

  return (
    <div className="relative w-full h-screen bg-transparent overflow-hidden">
      {/* Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap');
        body { font-family: 'Lora', serif; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-lg p-4 z-40 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ width: '200px', borderRight: `1px solid ${COLORS.info}` }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800" style={{ color: COLORS.primary }}>Widgets</h2>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors`}
            title="Toggle sidebar"
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
        <div className="space-y-3">
{widgetOptions.map((option) => {
  const IconComponent = ICON_COMPONENTS[option.icon];
  return (
    <button
      key={option.type}
      onClick={() => addWidget(option.type, option.name, option.icon, option.color)}
      className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors shadow-sm"
      style={{ borderColor: COLORS.info }} // border color fix
    >
      {IconComponent && <IconComponent size={20} style={{ color: option.color }} />}
      <span className="font-medium text-gray-800 text-sm">{option.name}</span>
    </button>
  );
})}
        </div>
      </div>

      {/* Main Content Area - Widgets */}
    <div className={`relative h-full min-h-screen overflow-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>        {widgets.map((widget) => {
          const WidgetComponent = widgetComponents[widget.type];
          return WidgetComponent ? (
            <ScrapbookWidget
              key={widget.id}
              id={widget.id}
              type={widget.type}
              x={widget.x}
              y={widget.y}
              width={widget.width}
              height={widget.height}
              color={widget.color}
              name={widget.name}
              icon={widget.icon}
              removeWidget={removeWidget}
              onResize={handleWidgetResize}
              onDrag={handleWidgetDrag}
              onMinimize={handleMinimize}
              onMaximize={handleMaximize}
            >
              <WidgetComponent />
            </ScrapbookWidget>
          ) : null;
        })}
      </div>

      {/* Sidebar Toggle Button (if sidebar is closed) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={`fixed left-0 top-1/2 -translate-y-1/2 p-3 bg-white rounded-r-lg shadow-lg z-40 transition-all duration-300 hover:bg-gray-100 text-gray-600`}
          title="Open sidebar"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
};
export default App;