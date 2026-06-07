import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { redirectToCheckout } from '../lib/stripe'
import { RefreshCw, AlertCircle, CheckCircle, ArrowRight, Lock } from 'lucide-react'

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

const NICHES = [
  "Mode & Accessoires", "Maison & Déco", "Beauté & Bien-être", "Art & Créatif",
  "Alimentation", "Enfants & Bébé", "Bijoux", "Papeterie", "Sport & Outdoor", "Autre",
]

const PLANS = {
  gratuit: { label: "Gratuit",  price: "0€",      sub: "Gratuit · Sans carte bancaire",    color: "#00D5D5", colorL: "rgba(0,213,213,0.08)", colorB: "rgba(0,213,213,0.2)", btnText: "Créer mon compte gratuitement", isPaid: false },
  starter: { label: "Starter",  price: "9,99€",   sub: "Starter · Sans engagement",        color: "#FF6A3D", colorL: "rgba(255,106,61,0.08)", colorB: "rgba(255,106,61,0.2)", btnText: "Payer 9,99€ et accéder à CirclUp", isPaid: true },
  premium: { label: "Premium",  price: "19,99€",  sub: "Premium · Entrepreneurs sérieux",  color: "#d4a84b", colorL: "rgba(212,168,75,0.10)", colorB: "rgba(212,168,75,0.25)", btnText: "Payer 19,99€ et accéder à CirclUp", isPaid: true },
}

export default function Register() {
  const { signUp } = useAuth()
  const navigate   = useNavigate()
  const [searchParams] = useSearchParams()
  const plan = PLANS[searchParams.get('plan')] || PLANS.starter
  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm] = useState({ name: "", email: "", shopName: "", shopUrl: "", niche: "", password: "",
    bio: "", website: "", instagram: "", facebook: "", snapchat: "", tiktok: "", youtube: "", pinterest: "", goal: "" })
  const [showSocial, setShowSocial] = useState(false)

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleStep1 = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.shopName || !form.shopUrl || !form.password) {
      setError("Tous les champs sont obligatoires")
      return
    }
    setError('')
    if (!plan.isPaid) {
      await handlePay()
    } else {
      setStep(2)
    }
  }

  const handlePay = async () => {
    setLoading(true)
    setError('')
    const { data, error } = await signUp({
      email: form.email, password: form.password, name: form.name,
      shopName: form.shopName, shopUrl: form.shopUrl, niche: form.niche,
      bio: form.bio, website: form.website, instagram: form.instagram,
      facebook: form.facebook, snapchat: form.snapchat, tiktok: form.tiktok,
      youtube: form.youtube, pinterest: form.pinterest, goal: form.goal,
    })
    if (error) {
      setError(error.message || 'Une erreur est survenue')
      setLoading(false)
      return
    }
    // Rediriger vers onboarding après inscription
    navigate('/onboarding')
  }

  const inp = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "13px 16px",
    color: G.text,
    fontSize: 14,
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
        input:focus, select:focus {
          border-color: rgba(255,106,61,0.5) !important;
          box-shadow: 0 0 0 3px rgba(255,106,61,0.08) !important;
        }
        select option { background: #0D0D0D; color: #FFFFFF; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.75; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .reg-card {
          animation: fadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .step-content {
          animation: fadeIn 0.3s ease both;
        }
        .reg-btn {
          transition: transform 0.18s cubic-bezier(0.22,1,0.36,1), box-shadow 0.18s ease, opacity 0.15s ease;
        }
        .reg-btn:hover:not(:disabled) {
          transform: scale(1.025) translateY(-1px);
          box-shadow: 0 12px 32px rgba(255,106,61,0.45) !important;
        }
        .reg-btn:active:not(:disabled) {
          transform: scale(0.985);
        }
        .logo-wrap {
          transition: transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s ease;
        }
        .logo-wrap:hover {
          transform: scale(1.08) rotate(-2deg);
          box-shadow: 0 10px 28px rgba(255,106,61,0.45) !important;
        }
        .back-link {
          transition: color 0.15s, opacity 0.15s;
          cursor: pointer;
        }
        .back-link:hover {
          opacity: 0.7;
        }
        .check-row {
          transition: background 0.15s;
        }
        .check-row:hover {
          background: rgba(255,255,255,0.02);
        }
      `}</style>

      {/* Background glows */}
      <div style={{
        position: "absolute", top: "25%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 700, height: 700,
        background: "radial-gradient(ellipse, rgba(255,106,61,0.05) 0%, transparent 65%)",
        pointerEvents: "none",
        animation: "glowPulse 6s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "-5%", right: "5%",
        width: 350, height: 350,
        background: "radial-gradient(ellipse, rgba(0,213,213,0.04) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div className="reg-card" style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 28,
        padding: "44px 44px 40px",
        width: "100%",
        maxWidth: 480,
        position: "relative",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
      }}>

        {/* Step indicator — thin line premium */}
        <div style={{ display: "flex", gap: 6, marginBottom: 36, alignItems: "center" }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              flex: 1,
              height: 2,
              borderRadius: 99,
              background: step >= s
                ? "linear-gradient(90deg, #FF6A3D, #FF4D1C)"
                : "rgba(255,255,255,0.08)",
              transition: "background 0.4s ease",
              position: "relative",
              overflow: "hidden",
            }}>
              {step >= s && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                  animation: "shimmer 2s ease-in-out infinite",
                }} />
              )}
            </div>
          ))}
          <span style={{ fontSize: 11, color: G.muted, marginLeft: 8, whiteSpace: "nowrap", letterSpacing: "0.5px" }}>
            {step} / 2
          </span>
        </div>

        {/* ─── STEP 1 ─── */}
        {step === 1 && (
          <div className="step-content">
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <Link to="/" style={{ display: "inline-block", marginBottom: 20, textDecoration: "none" }}>
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
                fontSize: 34,
                fontWeight: 900,
                marginBottom: 14,
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                background: "linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.7) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Créer mon compte</h2>

              {/* Plan badge */}
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: plan.colorL,
                border: `1px solid ${plan.colorB}`,
                borderRadius: 99,
                padding: "5px 14px",
                fontSize: 12,
                color: plan.color,
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: plan.color, display: "inline-block",
                  boxShadow: `0 0 6px ${plan.color}`,
                }} />
                {plan.sub}
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
                  <label style={{
                    fontSize: 10,
                    color: G.muted,
                    display: "block",
                    marginBottom: 7,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}>{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    style={inp}
                  />
                </div>
              ))}

              {/* Niche select */}
              <div style={{ marginBottom: 22 }}>
                <label style={{
                  fontSize: 10,
                  color: G.muted,
                  display: "block",
                  marginBottom: 7,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}>Ta niche</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={form.niche}
                    onChange={e => set('niche', e.target.value)}
                    style={{
                      ...inp,
                      appearance: "none",
                      WebkitAppearance: "none",
                      cursor: "pointer",
                      paddingRight: 40,
                    }}
                  >
                    <option value="">Choisir une niche...</option>
                    {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  {/* Custom arrow */}
                  <div style={{
                    position: "absolute", right: 14, top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    display: "flex", flexDirection: "column", gap: 2,
                  }}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                      <path d="M1 1L5 5L9 1" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Section réseaux sociaux — optionnelle, repliable */}
              <div style={{ marginBottom: 22, border: `1px solid ${G.border}`, borderRadius: 12, overflow: "hidden" }}>
                <button type="button" onClick={() => setShowSocial(s => !s)} style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "none", padding: "13px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", fontFamily: G.sans }}>
                  <span style={{ fontSize: 12, color: G.text, fontWeight: 600 }}>Réseaux sociaux & objectif <span style={{ color: G.muted, fontWeight: 400 }}>(optionnel)</span></span>
                  <span style={{ color: G.muted, transform: showSocial ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "flex" }}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </button>
                {showSocial && (
                  <div style={{ padding: "4px 16px 16px" }}>
                    <p style={{ fontSize: 11, color: G.muted, margin: "8px 0 14px", lineHeight: 1.5 }}>Renseigne-les maintenant pour qu'ils apparaissent directement sur ta page profil. Tu pourras les modifier plus tard.</p>
                    {[
                      ["Site web",   "website",   "https://monsite.com"],
                      ["Instagram",  "instagram", "https://instagram.com/..."],
                      ["Facebook",   "facebook",  "https://facebook.com/..."],
                      ["TikTok",     "tiktok",    "https://tiktok.com/@..."],
                      ["YouTube",    "youtube",   "https://youtube.com/@..."],
                      ["Pinterest",  "pinterest", "https://pinterest.com/..."],
                      ["Snapchat",   "snapchat",  "@pseudo"],
                    ].map(([label, key, ph]) => (
                      <div key={key} style={{ marginBottom: 10 }}>
                        <label style={{ fontSize: 10, color: G.muted, display: "block", marginBottom: 5, letterSpacing: "0.5px", textTransform: "uppercase", fontWeight: 600 }}>{label}</label>
                        <input type="text" placeholder={ph} value={form[key]} onChange={e => set(key, e.target.value)} style={inp} />
                      </div>
                    ))}
                    <div style={{ marginBottom: 4 }}>
                      <label style={{ fontSize: 10, color: G.muted, display: "block", marginBottom: 5, letterSpacing: "0.5px", textTransform: "uppercase", fontWeight: 600 }}>Ton objectif sur CirclUp</label>
                      <textarea placeholder="Ex : booster mes ventes Etsy, trouver des partenaires…" value={form.goal} onChange={e => set('goal', e.target.value)} rows={2} style={{ ...inp, resize: "none" }} />
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div style={{
                  background: "rgba(255,106,61,0.08)",
                  border: "1px solid rgba(255,106,61,0.22)",
                  borderRadius: 10,
                  padding: "11px 15px",
                  fontSize: 13,
                  color: "#FF8060",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                }}>
                  <AlertCircle size={15} color="#FF8060" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="reg-btn"
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #FF6A3D 0%, #FF4D1C 100%)",
                  border: "none",
                  color: "#fff",
                  padding: "15px",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: G.sans,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 8px 24px rgba(255,106,61,0.35)",
                  letterSpacing: "0.01em",
                }}>
                {plan.isPaid
                  ? <>Continuer vers le paiement <ArrowRight size={16} /></>
                  : <>Créer mon compte gratuit <ArrowRight size={16} /></>
                }
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: 22, fontSize: 14, color: G.muted }}>
              Déjà membre ?{" "}
              <Link to="/login" style={{ color: G.accent, fontWeight: 600, textDecoration: "none" }}>Se connecter</Link>
            </p>
          </div>
        )}

        {/* ─── STEP 2 ─── */}
        {step === 2 && (
          <div className="step-content">
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <h2 style={{
                fontFamily: G.serif,
                fontSize: 32,
                fontWeight: 900,
                marginBottom: 6,
                letterSpacing: "-0.02em",
                background: "linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.7) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Finaliser l'abonnement</h2>
              <p style={{ fontSize: 13, color: G.muted }}>Une dernière étape pour accéder à CirclUp</p>
            </div>

            {/* Plan summary card */}
            <div style={{
              background: plan.colorL,
              border: `1px solid ${plan.colorB}`,
              borderRadius: 16,
              padding: "20px 22px",
              marginBottom: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: plan.color,
                    display: "inline-block",
                    boxShadow: `0 0 8px ${plan.color}`,
                  }} />
                  <span style={{ fontWeight: 700, fontSize: 15, color: G.text }}>{plan.label}</span>
                </div>
                <div style={{ fontSize: 12, color: G.muted }}>Feed · Missions · Cercle · Dashboard</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{
                  fontFamily: G.serif,
                  fontSize: 30,
                  fontWeight: 900,
                  color: plan.color,
                  lineHeight: 1,
                }}>
                  {plan.price}
                </div>
                {plan.isPaid && (
                  <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>/mois</div>
                )}
              </div>
            </div>

            {/* Features list */}
            <div style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14,
              overflow: "hidden",
              marginBottom: 22,
            }}>
              {[
                "Accès complet au feed et aux missions",
                "Intégration dans un cercle de 10 membres",
                "Dashboard avec signaux algorithme",
                "Résiliable à tout moment",
              ].map((text, i, arr) => (
                <div
                  key={text}
                  className="check-row"
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    padding: "13px 18px",
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}>
                  <CheckCircle size={15} color={G.cyan} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{text}</span>
                </div>
              ))}
            </div>

            <p style={{
              fontSize: 12,
              color: G.muted,
              textAlign: "center",
              marginBottom: 20,
              lineHeight: 1.7,
            }}>
              Tu vas être redirigé vers Stripe pour le paiement sécurisé.
              <br />Ton compte est déjà créé.
            </p>

            {error && (
              <div style={{
                background: "rgba(255,106,61,0.08)",
                border: "1px solid rgba(255,106,61,0.22)",
                borderRadius: 10,
                padding: "11px 15px",
                fontSize: 13,
                color: "#FF8060",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 9,
              }}>
                <AlertCircle size={15} color="#FF8060" />
                {error}
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={loading}
              className="reg-btn"
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
                gap: 9,
                boxShadow: loading ? "none" : "0 8px 24px rgba(255,106,61,0.35)",
                letterSpacing: "0.01em",
              }}>
              {loading
                ? <><RefreshCw size={15} style={{ animation: "spin 0.8s linear infinite" }} /> Redirection vers Stripe...</>
                : <><Lock size={15} /> {plan.btnText}</>
              }
            </button>

            <p style={{
              textAlign: "center",
              marginTop: 12,
              fontSize: 11,
              color: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              letterSpacing: "0.3px",
            }}>
              <Lock size={11} color="rgba(255,255,255,0.2)" /> Paiement 100% sécurisé par Stripe
            </p>

            <p
              className="back-link"
              onClick={() => setStep(1)}
              style={{
                textAlign: "center",
                marginTop: 10,
                fontSize: 13,
                color: G.muted,
              }}>
              ← Modifier mes informations
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
