import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { redirectToCheckout } from '../lib/stripe'
import { RefreshCw, AlertCircle, CheckCircle, ArrowRight, Lock } from 'lucide-react'

const G = {
  bg: "#1a2420", card: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)",
  accent: "#e05c4b", accentL: "rgba(224,92,75,0.13)", accentB: "rgba(224,92,75,0.32)",
  mint: "#7ecfc0", mintL: "rgba(126,207,192,0.11)", mintB: "rgba(126,207,192,0.28)",
  text: "#f0ebe3", muted: "rgba(240,235,227,0.48)", faint: "rgba(240,235,227,0.2)",
  serif: "'Playfair Display', Georgia, serif", sans: "'DM Sans', system-ui, sans-serif",
}

const NICHES = [
  "Mode & Accessoires", "Maison & Déco", "Beauté & Bien-être", "Art & Créatif",
  "Alimentation", "Enfants & Bébé", "Bijoux", "Papeterie", "Sport & Outdoor", "Autre",
]

export default function Register() {
  const { signUp } = useAuth()
  const navigate   = useNavigate()
  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm] = useState({ name: "", email: "", shopName: "", shopUrl: "", niche: "", password: "" })

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleStep1 = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.shopName || !form.shopUrl || !form.password) {
      setError("Tous les champs sont obligatoires")
      return
    }
    setError('')
    setStep(2)
  }

  const handlePay = async () => {
    setLoading(true)
    setError('')
    const { data, error } = await signUp({
      email: form.email, password: form.password, name: form.name,
      shopName: form.shopName, shopUrl: form.shopUrl, niche: form.niche,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    await redirectToCheckout(data.user.id, form.email)
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
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: rgba(240,235,227,0.35); }
        input:focus, select:focus { border-color: rgba(126,207,192,0.4) !important; }
        select option { background: #1f2e28; color: #f0ebe3; }
      `}</style>

      <div style={{
        background: G.card, border: `1px solid ${G.border}`,
        borderRadius: 24, padding: "44px 40px", width: "100%", maxWidth: 460,
      }}>
        {/* Step indicator */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: step >= s ? G.accent : "rgba(255,255,255,0.1)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>

        {step === 1 && (
          <>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `linear-gradient(135deg, ${G.accent}, #c94535)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <RefreshCw size={22} color="#fff" strokeWidth={2.5} />
              </div>
              <h2 style={{ fontFamily: G.serif, fontSize: 26, fontWeight: 900, marginBottom: 10 }}>Créer mon compte</h2>
              <span style={{
                background: G.mintL, border: `1px solid ${G.mintB}`,
                borderRadius: 20, padding: "5px 14px", fontSize: 12, color: G.mint, fontWeight: 500,
              }}>
                4,99€/mois · Sans engagement
              </span>
            </div>

            <form onSubmit={handleStep1}>
              {[
                ["Prénom & Nom",        "name",     "text",     "Rachel Dupont"],
                ["Email",               "email",    "email",    "ton@email.com"],
                ["Nom de ta boutique",  "shopName", "text",     "Ma Super Boutique"],
                ["URL de ta boutique",  "shopUrl",  "url",      "monshop.etsy.com"],
                ["Mot de passe",        "password", "password", "••••••••"],
              ].map(([label, key, type, placeholder]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: G.muted, display: "block", marginBottom: 7, letterSpacing: 0.7, textTransform: "uppercase" }}>{label}</label>
                  <input type={type} placeholder={placeholder} value={form[key]} onChange={e => set(key, e.target.value)} style={inp} />
                </div>
              ))}

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, color: G.muted, display: "block", marginBottom: 7, letterSpacing: 0.7, textTransform: "uppercase" }}>Ta niche</label>
                <select value={form.niche} onChange={e => set('niche', e.target.value)} style={{ ...inp, appearance: "none", cursor: "pointer" }}>
                  <option value="">Choisir une niche...</option>
                  {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
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

              <button type="submit" style={{
                width: "100%", background: G.accent, border: "none", color: "#fff",
                padding: "14px", borderRadius: 10, fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: G.sans,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                Continuer vers le paiement <ArrowRight size={16} />
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: G.muted }}>
              Déjà membre ?{" "}
              <Link to="/login" style={{ color: G.accent, fontWeight: 600, textDecoration: "none" }}>Se connecter</Link>
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ fontFamily: G.serif, fontSize: 24, fontWeight: 900, textAlign: "center", marginBottom: 24 }}>Finaliser l'abonnement</h2>

            <div style={{
              background: G.accentL, border: `1px solid ${G.accentB}`,
              borderRadius: 14, padding: "18px 22px", marginBottom: 24,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Abonnement CirclUp</div>
                <div style={{ fontSize: 12, color: G.muted, marginTop: 4 }}>Feed · Missions · Cercle · Dashboard</div>
              </div>
              <div style={{ fontFamily: G.serif, fontSize: 26, fontWeight: 900, color: G.accent }}>
                4,99€<span style={{ fontSize: 12, fontFamily: G.sans, color: G.muted }}>/mois</span>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, borderRadius: 12, padding: "4px 16px", marginBottom: 24 }}>
              {[
                "Accès complet au feed et aux missions",
                "Intégration dans un cercle de 10 membres",
                "Dashboard avec signaux algorithme",
                "Résiliable à tout moment",
              ].map(text => (
                <div key={text} style={{ display: "flex", gap: 10, alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${G.border}` }}>
                  <CheckCircle size={15} color={G.mint} />
                  <span style={{ fontSize: 13, color: G.muted }}>{text}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 12, color: G.muted, textAlign: "center", marginBottom: 20, lineHeight: 1.6 }}>
              Tu vas être redirigé vers Stripe pour le paiement sécurisé. Ton compte est déjà créé.
            </p>

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

            <button onClick={handlePay} disabled={loading} style={{
              width: "100%", background: G.accent, border: "none", color: "#fff",
              padding: "15px", borderRadius: 10, fontSize: 15, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
              fontFamily: G.sans, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {loading
                ? "Redirection vers Stripe..."
                : <><Lock size={15} /> Payer 4,99€ et accéder à CirclUp</>
              }
            </button>

            <p style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: G.faint, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <Lock size={11} color={G.faint} /> Paiement 100% sécurisé par Stripe
            </p>
            <p onClick={() => setStep(1)} style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: G.faint, cursor: "pointer" }}>
              ← Modifier mes informations
            </p>
          </>
        )}
      </div>
    </div>
  )
}
