/**
 * Main entry point for the Wheelchair Racer application
 * This file sets up React, routing, and renders the root App component
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// Get the root DOM element and assert it exists (! tells TypeScript we're confident it's not null)
const rootElement = document.getElementById('root')!

// Create React root and render the application
createRoot(rootElement).render(
  <StrictMode> {/* Enables additional React development checks and warnings */}
    <BrowserRouter> {/* Provides routing functionality for the entire app */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)
