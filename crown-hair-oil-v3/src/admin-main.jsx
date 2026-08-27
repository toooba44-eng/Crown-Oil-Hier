import React from 'react'
import { createRoot } from 'react-dom/client'
import AdminHub from './admin/AdminHub.jsx'
import './admin/stage4.css'
import './admin/stage5.css'

createRoot(document.getElementById('admin-root')).render(
  <React.StrictMode><AdminHub /></React.StrictMode>
)
