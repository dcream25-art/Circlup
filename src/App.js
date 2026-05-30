import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Landing  from './pages/Landing'
import Login    from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

// Guard : redirige vers login si pas connecté
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#161f1c", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ color:"#7ecfc0", fontFamily:"Georgia", fontSize:18 }}>Chargement...</div>
    </div>
  )
  return user ? children : <Navigate to="/login" />
}

// Guard : redirige vers app si déjà connecté
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return !user ? children : <Navigate to="/app" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/app/*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
