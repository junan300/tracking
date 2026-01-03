import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/main.css';
import './styles/components.css';
import './styles/calendar.css';
import './styles/animations.css';

// Initialize dark mode on page load
const savedDarkMode = localStorage.getItem('darkMode');
if (savedDarkMode === 'true') {
    document.documentElement.classList.add('dark-mode');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

