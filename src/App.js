import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Landing     from './pages/Landing'
import PreLaunch   from './pages/PreLaunch'
import Login       from './pages/Login'
import Register    from './pages/Register'
import Dashboard   from './pages/Dashboard'
import Onboarding  from './pages/Onboarding'
import PublicProfile from './pages/PublicProfile'
import Admin       from './pages/Admin'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, overflow: 'hidden', background: '#0a0a0a' }}>
          <img src="/logo.png" alt="CirclUp" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.35)' }}
            onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }} />
          <div style={{ display: 'none', width: '100%', height: '100%', background: 'linear-gradient(135deg, #FF6A3D, #FF4D1C)', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 900, color: '#fff' }}>C</span>
          </div>
        </div>
        <div style={{ width: 24, height: 24, border: '2px solid rgba(255,106,61,0.3)', borderTopColor: '#FF6A3D', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return !user ? children : <Navigate to="/app" />
}

function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" />
  if (!profile?.is_admin) return <Navigate to="/app" />
  return children
}

function OnboardingRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" />
  if (profile?.onboarding_completed) return <Navigate to="/app" />
  return children
}

// ── INTERRUPTEUR DE LANCEMENT ──────────────────────────────────────────────
// true  = pré-lancement : "/" affiche la waitlist (PreLaunch), la landing
//         complète reste accessible sur "/decouvrir" (preview interne).
// false = lancé : "/" affiche la vraie landing. Le jour J, passer à false.
const PRELAUNCH = true

export default function App() {
  return (
    <Routes>
      <Route path="/"           element={PRELAUNCH ? <PreLaunch /> : <Landing />} />
      <Route path="/decouvrir"  element={<Landing />} />
      <Route path="/login"      element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register"   element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
      <Route path="/app/*"      element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/u/:username" element={<PublicProfile />} />
      <Route path="/admin"      element={<AdminRoute><Admin /></AdminRoute>} />
      <Route path="*"           element={<Navigate to="/" />} />
    </Routes>
  )
}
