import React from 'react'
import { createRoot } from 'react-dom/client'
import AdminHub from './admin/AdminHub.jsx'
import AdminErrorBoundary from './admin/AdminErrorBoundary.jsx'
import './admin/stage4.css'
import './admin/stage5.css'
import './admin/stage5-fixes.css'
import './admin/multistore-admin.css'
import './admin/bank-settings.css'
import './admin/contact-settings.css'

createRoot(document.getElementById('admin-root')).render(
  <React.StrictMode><AdminErrorBoundary><AdminHub /></AdminErrorBoundary></React.StrictMode>
)
