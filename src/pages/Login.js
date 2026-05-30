import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { RefreshCw, AlertCircle, ArrowRight } from 'lucide-react'

const G = {
  bg: "#1a2420", card: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)",
  accent: "#e05c4b", mint: "#7ecfc0", mintL: "rgba(126,207,192,0.11)", mintB: "rgba(126,207,192,0.28)",
  text: "#f0ebe3", muted: "rgba(240,235,227,0.48)", faint: "rgba(240,235,227,0.2)",
  serif: "'Playfair Display', Georgia, serif", sans: "'DM Sans', system-ui, sans-serif",
}

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn({ email, password })
    if (error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
    } else {
      navigate('/app')
    }
  }

  const inp = {
    width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`,
    borderRadius: 10, padding: "13px 15px", color: G.text, fontSize: 14,
    outline: "none", fontFamily: G.sans, boxSizing: "border-box", transition: "border-color 0.15s",
  }

  return (
    <div style={{
      minHeight: "100vh", background: G.bg, display: "flex", alignItems: "center",
      justifyContent: "center", fontFamily: G.sans, color: G.text, padding: 24,
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: rgba(240,235,227,0.35); }
        input:focus { border-color: rgba(126,207,192,0.4) !important; }
      `}</style>

      {/* Background glow */}
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)",
        width: 400, height: 400,
        background: "radial-gradient(ellipse, rgba(126,207,192,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        background: G.card, border: `1px solid ${G.border}`,
        borderRadius: 24, padding: "48px 44px", width: "100%", maxWidth: 400,
        position: "relative",
      }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: `linear-gradient(135deg, ${G.accent}, #c94535)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 18px",
          }}>
            <RefreshCw size={22} color="#fff" strokeWidth={2.5} />
          </div>
          <h2 style={{ fontFamily: G.serif, fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Bon retour.</h2>
          <p style={{ fontSize: 13, color: G.muted }}>Connecte-toi à ton espace CirclUp</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: G.muted, display: "block", marginBottom: 7, letterSpacing: 0.7, textTransform: "uppercase" }}>Email</label>
            <input type="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)} required style={inp} />
          </div>
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 11, color: G.muted, display: "block", marginBottom: 7, letterSpacing: 0.7, textTransform: "uppercase" }}>Mot de passe</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={inp} />
          </div>

          {error && (
            <div style={{
              background: "rgba(224,92,75,0.1)", border: "1px solid rgba(224,92,75,0.3)",
              borderRadius: 8, padding: "10px 14px", fontSize: 13, color: G.accent,
              marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
            }}>
              <AlertCircle size={15} color={G.accent} />
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", background: G.accent, border: "none", color: "#fff",
            padding: "14px", borderRadius: 10, fontSize: 15, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
            fontFamily: G.sans, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {loading ? "Connexion..." : <><span>Se connecter</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: G.muted }}>
          Pas encore membre ?{" "}
          <Link to="/register" style={{ color: G.accent, fontWeight: 600, textDecoration: "none" }}>Rejoindre CirclUp</Link>
        </p>
      </div>
    </div>
  )
}
