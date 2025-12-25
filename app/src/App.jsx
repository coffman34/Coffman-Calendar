/**
 * @fileoverview Main application component
 * @module App
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * This is the root component of the React application.
 * It's the entry point that ties everything together.
 * 
 * DESIGN PATTERN: Composition Pattern
 * We compose the app from smaller, focused components:
 * - AppProviders: Wraps app with contexts
 * - ModuleRouter: Handles navigation and routing
 * 
 * REFACTORING NOTE:
 * Before: 80 lines with nested providers and routing logic
 * After: 10 lines that compose focused components
 * 
 * This is the power of good architecture!
 */

import React from 'react';
import { AppProviders } from './providers/AppProviders';
import { ModuleRouter } from './routing/ModuleRouter';
import './App.css';

/**
 * Main App Component
 * 
 * WHAT IT DOES:
 * Renders the entire application.
 * 
 * HOW IT WORKS:
 * 1. AppProviders wraps everything with contexts (theme, auth, data, etc.)
 * 2. ModuleRouter handles navigation between views
 * 
 * JUNIOR DEV NOTE: Why is this so simple?
 * We've extracted all complexity into focused components.
 * This makes the app structure crystal clear:
 * - Providers provide global state
 * - Router handles navigation
 * - That's it!
 * 
 * @returns {React.ReactElement} The application
 */
function App() {
  console.log('[APP] Rendering App component...');
  return (
    <AppProviders>
      <ModuleRouter />
    </AppProviders>
  );
}

export default App;

/**
 * COMPARISON:
 * 
 * OLD App.jsx (80 lines):
 * - 6 levels of nested providers
 * - Routing logic mixed with providers
 * - Module switch statement
 * - Animation configuration
 * - Escape key handler
 * 
 * NEW App.jsx (10 lines):
 * - Clean composition
 * - Single responsibility (compose the app)
 * - Easy to understand at a glance
 * 
 * This is what good refactoring looks like!
 */
