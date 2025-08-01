# Personal Dashboard React App
[![Athena Award Badge](https://img.shields.io/endpoint?url=https%3A%2F%2Faward.athena.hackclub.com%2Fapi%2Fbadge)](https://award.athena.hackclub.com?utm_source=readme)
This is a personal dashboard built with React. It allows you to manage widgets that help with tasks, notes, and schedules.

## Features

### Widgets
- **Moveable & Resizable**: Widgets can be dragged around and resized. You can make them smaller or larger based on your preferences.
- **Auto-save**: All data is automatically saved using `localStorage` in the browser. A custom `useLocalStorage` hook manages the saving and retrieving of data.
- **React Hooks**: Widgets leverage React’s `useState` and `useRef` hooks for state management and DOM references. Dragging and resizing behavior is controlled by mouse events: `onMouseDown`, `onMouseMove`, and `onMouseUp`.
- **Styling**: Tailwind CSS is used to style the widgets, utilizing utility classes like `absolute`, `transition-all`, and `rounded-xl`.

### Timer Widget
- **Countdown Timer**: Set a timer by entering minutes and clicking start. The timer uses React's `useState` and `useEffect` for its logic.
- **Controls**: You can pause, reset, and stop the timer. State updates handle the timer's behavior.

### Notes Widget
- **Task Lists**: Write notes or create task lists. You can check tasks as completed, delete them, and clear all completed tasks.
- **Auto-resize**: The text area auto-resizes using `scrollHeight`.
- **Storage**: Notes and tasks are saved with `useLocalStorage`.

### Calendar Widget
- **Monthly View**: View the calendar by month and day. Events can be added, modified, or deleted.
- **Auto-scrolling**: The calendar uses `useRef` to scroll to the current hour automatically.
- **Storage**: Events are saved in `useLocalStorage`.

## How to Use

### Widgets
- **Drag & Move**: Move a widget by dragging its top bar.
- **Resize**: Drag the corners to resize. Use the minus icon to shrink or the maximize icon to enlarge.
- **Remove**: Click the X icon to remove a widget. This triggers a React state update to remove it from the UI.

### Timer
1. Enter minutes for the countdown.
2. Click **Start** to begin the timer.
3. Click **Pause** to stop.
4. Click **Reset** to clear the timer.

### Notes
1. Switch between **Tasks** and **Notes** mode.
2. In **Tasks** mode:
   - Type and click "Add" to create tasks.
   - Check tasks to mark them as completed.
   - Click X to delete tasks.
   - Clear completed tasks with the "Clear Finished" button.
3. In **Notes** mode:
   - Just type to create notes. They are saved automatically.

### Calendar
1. Use the arrows to navigate between months.
2. Click on a day to view hourly events.
3. Add new events by clicking the **Plus** icon.
4. Modify or delete events by clicking on them.
5. Return to the monthly view with the **Back** button.
6. Click **Today** to go to the current date.

## Development

### Prerequisites
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
## Customization

### Colors
You can easily change the colors of the widgets by modifying the `COLORS` constant in the code.

### Adding New Widgets
To add a new widget:
1. Create a new React component for the widget.
2. Add the component to the `ScrapbookWidget` component to integrate it into the app.

## Important Note on API Keys

If you plan to extend this app to include external services (such as weather APIs, AI integrations, or cloud storage), **do not hardcode API keys** directly into the client-side code. This exposes your keys publicly and can lead to security risks.

### Best Practices for API Keys:
- **For development**: Store API keys in environment variables, which can be accessed securely.
- **For production**: Set up a backend server to proxy API requests and handle API key authentication securely, ensuring the keys are never exposed in the client-side code.
