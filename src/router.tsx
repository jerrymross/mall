import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { EditorPage } from './pages/EditorPage'
import { AdminPage } from './pages/admin/AdminPage'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/editor/:templateId', element: <EditorPage /> },
  { path: '/admin', element: <AdminPage /> },
])
