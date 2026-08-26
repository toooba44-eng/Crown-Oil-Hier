import React from 'react'
import { createRoot } from 'react-dom/client'
import AdminVisualCMS from './admin/AdminVisualCMS.jsx'
import './admin/stage4.css'

createRoot(document.getElementById('admin-root')).render(
  <React.StrictMode><AdminVisualCMS /></React.StrictMode>
)
