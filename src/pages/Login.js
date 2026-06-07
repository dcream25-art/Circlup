import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { RefreshCw, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react'

const G = {
  bg: "#050505",
  bg2: "#0A0A0A",
  bg3: "#0D0D0D",
  card: "rgba(255,255,255,0.03)",
  card2: "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(255,255,255,0.12)",
  accent: "#FF6A3D",
  accentL: "rgba(255,106,61,0.08)",
  accentB: "rgba(255,106,61,0.2)",
  cyan: "#00D5D5",
  cyanL: "rgba(0,213,213,0.08)",
  cyanB: "rgba(0,213,213,0.2)",
  text: "#FFFFFF",
  muted: "#9A9A9A",
  faint: "rgba(255,255,255,0.15)",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', system-ui, sans-serif",
}

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [info, setInfo]         = useState('')
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

  const handleForgot = async () => {
    setError(''); setInfo('')
    if (!email) { setError("Entre ton email ci-dessus, puis reclique."); return }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login',
    })
    if (error) setError(error.message)
    else setInfo("Email de réinitialisation envoyé ! Vérifie ta boîte (et les spams).")
  }

  const inp = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "14px 16px",
    color: G.text,
    fontSize: 15,
    outline: "none",
    fontFamily: G.sans,
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: G.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: G.sans,
      color: G.text,
      padding: 24,
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: rgba(255,255,255,0.22); }
        input:focus {
          border-color: rgba(255,106,61,0.5) !important;
          box-shadow: 0 0 0 3px rgba(255,106,61,0.08) !important;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 0.8; }
        }
        .login-card {
          animation: fadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .login-btn {
          transition: transform 0.18s cubic-bezier(0.22,1,0.36,1), box-shadow 0.18s ease, opacity 0.15s ease;
        }
        .login-btn:hover:not(:disabled) {
          transform: scale(1.025) translateY(-1px);
          box-shadow: 0 12px 32px rgba(255,106,61,0.45) !important;
        }
        .login-btn:active:not(:disabled) {
          transform: scale(0.985);
        }
        .logo-wrap {
          transition: transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s ease;
        }
        .logo-wrap:hover {
          transform: scale(1.08) rotate(-2deg);
          box-shadow: 0 10px 28px rgba(255,106,61,0.45) !important;
        }
        .reg-link {
          transition: color 0.15s, opacity 0.15s;
        }
        .reg-link:hover {
          opacity: 0.8;
        }
      `}</style>

      {/* Background glows */}
      <div style={{
        position: "absolute", top: "20%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600, height: 600,
        background: "radial-gradient(ellipse, rgba(255,106,61,0.06) 0%, transparent 65%)",
        pointerEvents: "none",
        animation: "glowPulse 5s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", right: "10%",
        width: 400, height: 400,
        background: "radial-gradient(ellipse, rgba(0,213,213,0.04) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div className="login-card" style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 28,
        padding: "52px 48px",
        width: "100%",
        maxWidth: 420,
        position: "relative",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Link to="/" style={{ display: "inline-block", marginBottom: 22, textDecoration: "none" }}>
            <div className="logo-wrap" style={{ width: 52, height: 52, borderRadius: 14, overflow: "hidden", margin: "0 auto", background: "#0a0a0a" }}>
              <img src="/logo.png" alt="CirclUp" style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.35)" }}
                onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }} />
              <div style={{ display: "none", width: "100%", height: "100%", background: "linear-gradient(135deg, #FF6A3D 0%, #FF4D1C 100%)", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: G.serif, fontSize: 24, fontWeight: 900, color: "#fff" }}>C</span>
              </div>
            </div>
          </Link>
          <h2 style={{
            fontFamily: G.serif,
            fontSize: 42,
            fontWeight: 900,
            marginBottom: 10,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            background: "linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.7) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>Bon retour.</h2>
          <p style={{ fontSize: 14, color: G.muted, fontWeight: 400, letterSpacing: "0.01em" }}>
            Connecte-toi à ton espace CirclUp
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{
              fontSize: 10,
              color: G.muted,
              display: "block",
              marginBottom: 8,
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontWeight: 600,
            }}>Email</label>
            <input
              type="email"
              placeholder="ton@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inp}
            />
          </div>

          <div style={{ marginBottom: 26 }}>
            <label style={{
              fontSize: 10,
              color: G.muted,
              display: "block",
              marginBottom: 8,
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontWeight: 600,
            }}>Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={inp}
            />
            <div style={{ textAlign: "right", marginTop: 8 }}>
              <button type="button" onClick={handleForgot} style={{ background: "none", border: "none", color: G.muted, fontSize: 12, cursor: "pointer", fontFamily: G.sans, textDecoration: "underline", padding: 0 }}>
                Mot de passe oublié ?
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: "rgba(255,106,61,0.08)",
              border: "1px solid rgba(255,106,61,0.22)",
              borderRadius: 10,
              padding: "11px 15px",
              fontSize: 13,
              color: "#FF8060",
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              gap: 9,
            }}>
              <AlertCircle size={15} color="#FF8060" />
              {error}
            </div>
          )}

          {info && (
            <div style={{ background: "rgba(0,213,213,0.08)", border: "1px solid rgba(0,213,213,0.22)", borderRadius: 10, padding: "11px 15px", fontSize: 13, color: G.cyan, marginBottom: 18, display: "flex", alignItems: "center", gap: 9 }}>
              <CheckCircle size={15} color={G.cyan} />
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="login-btn"
            style={{
              width: "100%",
              background: loading
                ? "rgba(255,106,61,0.5)"
                : "linear-gradient(135deg, #FF6A3D 0%, #FF4D1C 100%)",
              border: "none",
              color: "#fff",
              padding: "15px",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: G.sans,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: loading ? "none" : "0 8px 24px rgba(255,106,61,0.35)",
              letterSpacing: "0.01em",
            }}>
            {loading
              ? <><RefreshCw size={15} style={{ animation: "spin 0.8s linear infinite" }} /> Connexion...</>
              : <><span>Se connecter</span><ArrowRight size={16} /></>
            }
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          margin: "26px 0 20px",
        }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", letterSpacing: "0.5px" }}>ou</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
        </div>

        <p style={{ textAlign: "center", fontSize: 14, color: G.muted }}>
          Pas encore membre ?{" "}
          <Link
            to="/register"
            className="reg-link"
            style={{ color: G.accent, fontWeight: 600, textDecoration: "none" }}
          >
            Rejoindre CirclUp
          </Link>
        </p>
      </div>
    </div>
  )
}
