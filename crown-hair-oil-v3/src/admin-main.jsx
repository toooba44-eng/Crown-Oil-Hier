import React from 'react'
import { createRoot } from 'react-dom/client'
import AdminCMS from './admin/AdminCMS.jsx'
import './admin/cms.css'

createRoot(document.getElementById('admin-root')).render(
  <React.StrictMode><AdminCMS /></React.StrictMode>
)
