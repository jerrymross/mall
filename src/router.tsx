import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })))
const EditorPage = lazy(() => import('./pages/EditorPage').then((m) => ({ default: m.EditorPage })))
const AdminPage = lazy(() => import('./pages/admin/AdminPage').then((m) => ({ default: m.AdminPage })))
const TemplateBuilderPage = lazy(() => import('./pages/admin/TemplateBuilderPage').then((m) => ({ default: m.TemplateBuilderPage })))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>
}

export const router = createBrowserRouter([
  { path: '/', element: withSuspense(<HomePage />) },
  { path: '/editor/:templateId', element: withSuspense(<EditorPage />) },
  { path: '/admin', element: withSuspense(<AdminPage />) },
  { path: '/admin/template-builder', element: withSuspense(<TemplateBuilderPage />) },
  { path: '/admin/template-builder/:templateId', element: withSuspense(<TemplateBuilderPage />) },
])
