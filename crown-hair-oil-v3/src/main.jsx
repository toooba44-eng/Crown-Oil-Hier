import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import AdminDashboard from './admin/AdminDashboard.jsx'
import './styles.css'
import './overrides.css'

const params = new URLSearchParams(window.location.search)
const RootView = params.get('admin') === 'preview' ? AdminDashboard : App

createRoot(document.getElementById('root')).render(
  <React.StrictMode><RootView /></React.StrictMode>
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/Crown-Oil-Hier/sw.js').catch(() => {})
  })
}
