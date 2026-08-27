import React from 'react'
import { createRoot } from 'react-dom/client'
import MultiStoreApp from './MultiStoreApp.jsx'
import './multistore.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode><MultiStoreApp /></React.StrictMode>
)
