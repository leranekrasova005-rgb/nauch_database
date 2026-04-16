import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout/Layout'
import PublicWorks from './pages/PublicWorks/PublicWorks'
import Login from './pages/Login/Login'
import MethodistCabinet from './pages/MethodistCabinet/MethodistCabinet'
import AdminPanel from './pages/AdminPanel/AdminPanel'
import Statistics from './pages/Statistics/Statistics'

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="loading">Загрузка...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/cabinet" />
  }

  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<PublicWorks />} />
        <Route path="login" element={<Login />} />
        <Route
          path="cabinet"
          element={
            <PrivateRoute>
              <MethodistCabinet />
            </PrivateRoute>
          }
        />
        <Route
          path="admin"
          element={
            <PrivateRoute adminOnly>
              <AdminPanel />
            </PrivateRoute>
          }
        />
        <Route
          path="statistics"
          element={
            <PrivateRoute>
              <Statistics />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
