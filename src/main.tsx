import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Episodes from './pages/Episodes'
import EpisodeDetail from './pages/EpisodeDetail'
import StoryboardFrameTab from './pages/tabs/StoryboardFrameTab'

import { storageOperations } from './lib/supabase'
import './styles/globals.css'
import { AuthProvider } from './contexts/AuthContext'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/episodes', element: <Episodes /> },
  { path: '/episodes/:id', element: <EpisodeDetail /> },
  { path: '/episodes/:id/storyboard/frame/:frameId', element: <StoryboardFrameTab /> },

])

// Initialize storage before rendering the app
console.log('🚀 Starting app initialization...')
storageOperations.initializeStorage().then((success) => {
  console.log('✅ Storage initialization completed:', success)
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </React.StrictMode>,
  )
}).catch((error) => {
  console.error('❌ Failed to initialize storage, starting app anyway:', error)
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </React.StrictMode>,
  )
})
