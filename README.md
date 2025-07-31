
Personal Dashboard React App
This is a personal dashboard built with React. It allows you to manage widgets that help with tasks, notes, and schedules.

Features
Widgets
Moveable & Resizable: Widgets can be dragged around and resized. You can make them smaller or larger based on your preferences.

Auto-save: All data is automatically saved using localStorage in the browser. A custom useLocalStorage hook manages the saving and retrieving of data.

React Hooks: Widgets leverage React’s useState and useRef hooks for state management and DOM references. Dragging and resizing behavior is controlled by mouse events: onMouseDown, onMouseMove, and onMouseUp.

Styling: Tailwind CSS is used to style the widgets, utilizing utility classes like absolute, transition-all, and rounded-xl.

Timer Widget
Countdown Timer: Set a timer by entering minutes and clicking start. The timer uses React's useState and useEffect for its logic.

Controls: You can pause, reset, and stop the timer. State updates handle the timer's behavior.

Notes Widget
Task Lists: Write notes or create task lists. You can check tasks as completed, delete them, and clear all completed tasks.

Auto-resize: The text area auto-resizes using scrollHeight.

Storage: Notes and tasks are saved with useLocalStorage.

Calendar Widget
Monthly View: View the calendar by month and day. Events can be added, modified, or deleted.

Auto-scrolling: The calendar uses useRef to scroll to the current hour automatically.

Storage: Events are saved in useLocalStorage.

How to Use
Widgets
Drag & Move: Move a widget by dragging its top bar.

Resize: Drag the corners to resize. Use the minus icon to shrink or the maximize icon to enlarge.

Remove: Click the X icon to remove a widget. This triggers a React state update to remove it from the UI.

Timer
Enter minutes for the countdown.

Click Start to begin the timer.

Click Pause to stop.

Click Reset to clear the timer.

Notes
Switch between Tasks and Notes mode.

In Tasks mode:

Type and click "Add" to create tasks.

Check tasks to mark them as completed.

Click X to delete tasks.

Clear completed tasks with the "Clear Finished" button.

In Notes mode:

Just type to create notes. They are saved automatically.

Calendar
Use the arrows to navigate between months.

Click on a day to view hourly events.

Add new events by clicking the Plus icon.

Modify or delete events by clicking on them.

Return to the monthly view with the Back button.

Click Today to go to the current date.

Development
Prerequisites
Clone the repository.

Install dependencies:

bash
Copy
Edit
npm install
Start the development server:

bash
Copy
Edit
npm start
The app will open in your browser.

Customization
Colors: You can change the widget colors by modifying the COLORS constant in the code.

Adding New Widgets: To add a new widget, create a new React component and add it to the ScrapbookWidget component.

Important Note on API Keys
If you decide to extend this app to include external services (like weather APIs, AI integrations, or cloud storage), be aware that API keys should never be hardcoded in the client-side code. This poses a security risk by making the keys publicly accessible.

Instead:

For development: Use environment variables to store API keys.

For production: Set up a secure backend server to proxy API requests and handle API key authentication securely.
