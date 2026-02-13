/**
 * Application Entry Point
 * ========================
 * This is the main entry point for the React application.
 * It renders the root App component into the DOM.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Get the root element from the HTML
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
