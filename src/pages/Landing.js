import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  Star, Eye, Heart, MessageCircle, Share2, Pin, Search, ShoppingBag,
  ArrowRight, CheckCircle, Users, TrendingUp, Zap, ChevronDown, ChevronUp,
  BarChart2, Shield, FileText, Award, Repeat2, Globe, Crown,
  Flame, Target, ChevronRight, ExternalLink, X, Rocket, Clock
} from 'lucide-react'

// Destinations réelles des liens de pied de page (anchors de sections, routes, mailto)
const FOOTER_LINKS = {
  "Fonctionnalités": "#fonctionnalités",
  "Tarifs": "#tarifs",
  "Missions": "#fonctionnalités",
  "CP & Rangs": "#fonctionnalités",
  "Blog": "#fonctionnalités",
  "Guides": "#fonctionnalités",
  "Témoignages": "#témoignages",
  "Affiliation": "/register",
  "À propos": "#fonctionnalités",
  "Contact": "mailto:contact@circlup.fr",
  "CGU": "mailto:contact@circlup.fr?subject=CGU",
  "Confidentialité": "mailto:contact@circlup.fr?subject=Confidentialité",
  "Conditions d'utilisation": "mailto:contact@circlup.fr?subject=CGU",
  "Cookies": "mailto:contact@circlup.fr?subject=Cookies",
}
// ⚠️ Remplacer par les vraies URLs des comptes CirclUp quand ils existeront
const SOCIAL_LINKS = {
  IG: "https://instagram.com", TK: "https://tiktok.com",
  YT: "https://youtube.com", LI: "https://linkedin.com",
}

// Inscription newsletter (capture réelle dans Supabase)
function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const submit = async () => {
    const v = email.trim()
    if (!v || !v.includes('@')) return
    try { await supabase.from('newsletter_emails').insert({ email: v }) } catch (e) {}
    setDone(true); setEmail('')
  }
  if (done) return <div style={{ fontSize: 13, color: "#00D5D5", lineHeight: 1.6 }}>Merci ! On te tient au courant 💌</div>
  return (
    <div style={{ display: "flex", gap: 0 }}>
      <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit() }}
        placeholder="Ton email" style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRight: "none", borderRadius: "9px 0 0 9px", padding: "10px 14px", color: "#fff", fontSize: 12, outline: "none", fontFamily: "'DM Sans', system-ui, sans-serif" }} />
      <button onClick={submit} aria-label="S'inscrire" style={{ background: "#FF6A3D", border: "none", color: "#fff", padding: "10px 14px", borderRadius: "0 9px 9px 0", cursor: "pointer" }}>
        <ArrowRight size={14} />
      </button>
    </div>
  )
}

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
  gold: "#F5C842",
  goldL: "rgba(245,200,66,0.08)",
  goldB: "rgba(245,200,66,0.2)",
  text: "#FFFFFF",
  muted: "#9A9A9A",
  faint: "rgba(255,255,255,0.15)",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', system-ui, sans-serif",
  num: "'Space Grotesk', 'DM Sans', system-ui, sans-serif",
}

function Logo({ size = 30 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.27, overflow: "hidden", flexShrink: 0, background: "#0a0a0a" }}>
      <img src="/logo.png" alt="CirclUp" style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.35)" }}
        onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }} />
      <div style={{ display: "none", width: "100%", height: "100%", background: "linear-gradient(135deg, #FF6A3D, #e04f25)", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: G.serif, fontSize: size * 0.44, fontWeight: 900, color: "#fff", lineHeight: 1 }}>C</span>
      </div>
    </div>
  )
}

function Avatar({ initials, color, size = 36 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: `radial-gradient(circle at 33% 33%, ${color}cc, ${color}33)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.32, fontWeight: 700, color: "#fff", fontFamily: G.sans, boxShadow: `0 2px 12px ${color}30` }}>
      {initials}
    </div>
  )
}

function Sparkline({ color }) {
  return (
    <svg width={60} height={22} viewBox="0 0 120 40" preserveAspectRatio="none">
      <polyline points="0,35 20,28 40,22 60,18 80,12 100,8 120,5" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${G.border}`, padding: "24px 0", transition: "all 0.2s" }}>
      <button onClick={() => setOpen(!open)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", background: "none", border: "none", color: G.text, cursor: "pointer", textAlign: "left", gap: 20, fontFamily: G.sans }}>
        <span style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.4 }}>{q}</span>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: open ? G.accentL : "rgba(255,255,255,0.04)", border: `1px solid ${open ? G.accentB : G.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
          {open ? <ChevronUp size={14} color={G.accent} /> : <ChevronDown size={14} color={G.muted} />}
        </div>
      </button>
      {open && (
        <p style={{ fontSize: 15, color: G.muted, lineHeight: 1.8, marginTop: 16, marginBottom: 0, paddingRight: 48 }}>{a}</p>
      )}
    </div>
  )
}

// Mockup du dashboard dans le hero — version détaillée
function AppMockup() {
  const r = 52, circ = 2 * Math.PI * r
  return (
    <div style={{
      background: "#0A0A0A",
      border: `1px solid rgba(255,255,255,0.08)`,
      borderRadius: 20,
      overflow: "hidden",
      boxShadow: "0 60px 160px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04), 0 0 80px rgba(255,106,61,0.06)",
      width: "100%", maxWidth: 880, fontSize: 0,
    }}>
      {/* Barre titre navigateur */}
      <div style={{ background: "#070707", padding: "10px 16px", display: "flex", alignItems: "center", gap: 7, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {["#ff5f57","#ffbd2e","#28c840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
        <div style={{ flex: 1, margin: "0 12px", background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "4px 12px", fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: G.sans }}>circlup.app/dashboard</div>
      </div>

      <div style={{ display: "flex", height: 560 }}>
        {/* Sidebar */}
        <div style={{ width: 155, background: "#070707", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "14px 10px", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, paddingLeft: 4 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#FF6A3D,#e04f25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: G.serif, fontSize: 11, fontWeight: 900, color: "#fff", lineHeight: 1 }}>C</span>
            </div>
            <span style={{ fontFamily: G.serif, fontSize: 13, fontWeight: 800, color: G.text }}>CirclUp</span>
          </div>
          {[
            ["Dashboard", true, null],
            ["Missions",  false, "8"],
            ["Feed",      false, null],
            ["Cercle",    false, null],
            ["Statistiques", false, null],
            ["Paramètres",   false, null],
          ].map(([label, active, badge]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 7, marginBottom: 2, background: active ? G.accentL : "transparent", border: `1px solid ${active ? G.accentB : "transparent"}` }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: active ? G.accent : "rgba(255,255,255,0.12)", flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: active ? G.accent : "rgba(255,255,255,0.35)", fontWeight: active ? 600 : 400, flex: 1, fontFamily: G.sans }}>{label}</span>
              {badge && <span style={{ background: G.accent, borderRadius: 8, fontSize: 8, color: "#fff", padding: "1px 5px", fontWeight: 700, fontFamily: G.sans }}>{badge}</span>}
            </div>
          ))}
          {/* CP mini sidebar */}
          <div style={{ marginTop: "auto", background: G.goldL, border: `1px solid ${G.goldB}`, borderRadius: 10, padding: "10px 10px" }}>
            <div style={{ fontSize: 8, color: G.gold, fontWeight: 700, marginBottom: 5, fontFamily: G.sans }}>CRÉDITS CP</div>
            <div style={{ fontFamily: G.num, fontSize: 22, fontWeight: 700, color: G.gold, marginBottom: 5, letterSpacing: -0.5 }}>1 250</div>
            <div style={{ height: 2.5, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
              <div style={{ width: "40%", height: "100%", background: `linear-gradient(90deg,${G.gold},${G.accent})`, borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginTop: 4, fontFamily: G.sans }}>Builder · 180 CP → Booster</div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: "16px 18px", overflowY: "hidden", background: "#0A0A0A" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: G.serif, fontSize: 14, fontWeight: 800, color: G.text }}>Bonjour Sophie 👋</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: G.sans }}>Prêt à booster ta boutique aujourd'hui ?</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: `radial-gradient(circle,${G.cyan}cc,${G.cyan}33)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", fontFamily: G.sans }}>SM</div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 600, color: G.text, fontFamily: G.sans }}>Sophie M.</div>
                <div style={{ fontSize: 8, color: G.gold, fontFamily: G.sans, display: "flex", alignItems: "center", gap: 2 }}>
                  <Crown size={7} color={G.gold} /> Builder
                </div>
              </div>
            </div>
          </div>

          {/* HERO points — gros chiffre gauche + anneau plan droite */}
          <div style={{ background: `linear-gradient(135deg, rgba(255,106,61,0.08) 0%, rgba(13,13,13,0.5) 55%, rgba(0,213,213,0.04) 100%)`, border: `1px solid ${G.border}`, borderRadius: 14, padding: "16px 18px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: 80, width: 140, height: 140, background: "radial-gradient(circle, rgba(255,106,61,0.12) 0%, transparent 65%)", pointerEvents: "none" }} />
            {/* Gauche */}
            <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, fontFamily: G.sans }}>Tes points disponibles</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 10 }}>
                <span style={{ fontFamily: G.num, fontSize: 34, fontWeight: 700, lineHeight: 1, letterSpacing: -1.5, background: `linear-gradient(135deg, ${G.gold}, ${G.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>1 250</span>
                <span style={{ fontFamily: G.num, fontSize: 13, fontWeight: 600, color: G.muted }}>pts</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ background: "linear-gradient(135deg,#FF6A3D,#e04820)", boxShadow: "0 4px 12px rgba(255,106,61,0.3)", borderRadius: 7, padding: "5px 11px", fontSize: 9, color: "#fff", fontWeight: 700, fontFamily: G.sans, display: "flex", alignItems: "center", gap: 4 }}>
                  <TrendingUp size={9} /> Gagner des points
                </div>
                <div style={{ background: G.card2, border: `1px solid ${G.border}`, borderRadius: 7, padding: "5px 11px", fontSize: 9, color: G.text, fontFamily: G.sans }}>Dépenser</div>
              </div>
            </div>
            {/* Droite : anneau plan */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 1, flexShrink: 0 }}>
              <div style={{ position: "relative", width: 76, height: 76 }}>
                <svg width={76} height={76} viewBox="0 0 76 76">
                  <circle cx={38} cy={38} r={32} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
                  <circle cx={38} cy={38} r={32} fill="none" stroke="url(#lg)" strokeWidth={5} strokeDasharray={`${2*Math.PI*32*0.78} ${2*Math.PI*32}`} strokeLinecap="round" transform="rotate(-90 38 38)" />
                  <defs><linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={G.gold} /><stop offset="100%" stopColor={G.accent} /></linearGradient></defs>
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: `${G.gold}15`, border: `1px solid ${G.goldB}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Crown size={15} color={G.gold} />
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: G.text, fontFamily: G.sans, marginBottom: 2 }}>Membre Premium</div>
                <div style={{ fontSize: 8, color: G.muted, fontFamily: G.sans }}>Ligue <span style={{ color: G.cyan, fontWeight: 600 }}>Or</span></div>
              </div>
            </div>
          </div>

          {/* KPIs 4 colonnes */}
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", fontFamily: G.sans, fontWeight: 600, letterSpacing: 0.5, marginBottom: 7, textTransform: "uppercase" }}>Tes Performances · 7 derniers jours</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7, marginBottom: 12 }}>
            {[
              ["Favoris reçus",  "47",  "+34%", G.gold],
              ["Missions faites","12",  "+18%", G.cyan],
              ["CP gagnés",      "120", "+25%", G.accent],
              ["Posts actifs",   "2",   "+11%", G.cyan],
            ].map(([label, val, pct, color]) => (
              <div key={label} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: "8px 9px" }}>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginBottom: 4, fontFamily: G.sans }}>{label}</div>
                <div style={{ fontFamily: G.num, fontSize: 18, fontWeight: 700, color, marginBottom: 2, letterSpacing: -0.5 }}>{val}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 8, color: G.cyan, fontFamily: G.sans }}>{pct}</span>
                  <Sparkline color={color} />
                </div>
              </div>
            ))}
          </div>

          {/* Missions du jour */}
          <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: G.text, fontFamily: G.sans }}>Missions du jour</span>
                <span style={{ background: G.accent, borderRadius: 8, fontSize: 8, color: "#fff", padding: "1px 6px", fontWeight: 700, fontFamily: G.sans }}>8</span>
              </div>
              <span style={{ fontSize: 8, color: G.cyan, fontFamily: G.sans }}>Voir toutes →</span>
            </div>
            {[
              [Star,         "Ajouter aux favoris Etsy", "+5 CP",  G.gold],
              [Eye,          "Visiter la boutique",       "+3 CP",  G.cyan],
              [Share2,       "Partager en story",         "+10 CP", G.accent],
            ].map(([Ic, label, cp, color]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: `${color}12`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Ic size={10} color={color} />
                </div>
                <span style={{ flex: 1, fontSize: 9, color: "rgba(255,255,255,0.45)", fontFamily: G.sans }}>{label}</span>
                <span style={{ fontSize: 9, color, fontWeight: 700, fontFamily: G.num }}>{cp}</span>
                <div style={{ background: G.accent, borderRadius: 5, padding: "2px 8px", fontSize: 8, color: "#fff", fontWeight: 700, fontFamily: G.sans }}>Commencer</div>
              </div>
            ))}
          </div>

          {/* Projets à découvrir */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "12px 0 7px" }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontFamily: G.sans, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>Projets à découvrir</span>
            <span style={{ fontSize: 8, color: G.cyan, fontFamily: G.sans }}>Voir tout →</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>
            {[
              ["GreenCare", "Cosmétiques", "+120", "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&q=70"],
              ["RoadTrip", "Voyage", "+90", "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=200&q=70"],
              ["Studio Bloom", "Design", "+110", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=70"],
            ].map(([name, cat, cp, img]) => (
              <div key={name} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, overflow: "hidden" }}>
                <div style={{ height: 44, overflow: "hidden" }}><img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                <div style={{ padding: "6px 8px" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: G.text, fontFamily: G.sans }}>{name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                    <span style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", fontFamily: G.sans }}>{cat}</span>
                    <span style={{ fontSize: 8, color: G.gold, fontWeight: 700, fontFamily: G.num }}>{cp} CP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar droite */}
        <div style={{ width: 168, background: "#070707", borderLeft: "1px solid rgba(255,255,255,0.05)", padding: "16px 12px", flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Ton impact + radar */}
          <div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8, fontFamily: G.sans }}>Ton impact</div>
            <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 10, padding: "12px 10px", overflow: "hidden" }}>
              <div style={{ position: "relative", height: 70, marginBottom: 8 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ position: "absolute", top: "50%", left: "50%", width: 64, height: 64, borderRadius: "50%", border: `1.5px solid ${G.cyan}55`, transform: "translate(-50%,-50%) scale(0.35)", animation: `mockRadar 3s ease-out infinite ${i}s` }} />
                ))}
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 34, height: 34, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, ${G.cyan}, ${G.cyan}aa)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 18px ${G.cyan}66`, zIndex: 2 }}>
                  <Heart size={15} color="#050505" fill="#050505" />
                </div>
              </div>
              {[["Projets aidés","12",G.accent],["Soutiens","9",G.cyan],["CP gagnés","620",G.gold]].map(([l,v,c]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0" }}>
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", fontFamily: G.sans }}>{l}</span>
                  <span style={{ fontSize: 9, color: G.text, fontWeight: 700, fontFamily: G.num }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Top membres */}
          <div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8, fontFamily: G.sans }}>Top membres</div>
            <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 10, padding: "4px 4px" }}>
              {[["1","Sophie L.","2 450",G.cyan],["2","Thomas D.","1 890",G.accent],["3","Camille R.","1 650",G.gold]].map(([rank,name,cp,c]) => (
                <div key={rank} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 6px" }}>
                  <span style={{ fontSize: 8, color: rank==="1"?G.gold:"rgba(255,255,255,0.3)", fontWeight: 700, fontFamily: G.num, width: 8 }}>{rank}</span>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: `radial-gradient(circle,${c}cc,${c}44)`, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 8, color: G.text, fontFamily: G.sans, fontWeight: 500 }}>{name}</span>
                  <span style={{ fontSize: 8, color: rank==="1"?G.gold:"rgba(255,255,255,0.35)", fontWeight: 700, fontFamily: G.num }}>{cp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const FEATURES = [
  { LIcon: Star,         title: "Booste tes favoris Etsy",        desc: "Tes 9 voisins de cercle ajoutent ton produit en favori. L'algorithme Etsy le détecte et te remonte dans les résultats.",                  color: G.gold,   glow: "rgba(245,200,66,0.2)"  },
  { LIcon: MessageCircle,title: "Reçois des avis & commentaires", desc: "Des avis vérifiés sur tes produits, des commentaires pertinents sur tes posts. Ta crédibilité monte, tes ventes suivent.",             color: G.cyan,   glow: "rgba(0,213,213,0.2)"   },
  { LIcon: TrendingUp,   title: "Multiplie ton trafic externe",   desc: "Partages en story, épingles Pinterest, mentions réseaux. Google et Etsy voient affluer du trafic externe vers ta boutique.",              color: G.accent, glow: "rgba(255,106,61,0.2)"  },
  { LIcon: Eye,          title: "Génère des visites boutique",    desc: "Chaque membre de ton cercle visite ta boutique. Ce sont de vraies sessions humaines, pas des bots. L'algo fait la différence.",            color: G.cyan,   glow: "rgba(0,213,213,0.2)"   },
  { LIcon: Users,        title: "Crée des collaborations utiles", desc: "10 entrepreneurs de ta niche exacte. Pas des concurrents, des alliés. Certains deviennent même des partenaires durables.",                  color: G.gold,   glow: "rgba(245,200,66,0.2)"  },
  { LIcon: Zap,          title: "Progresse chaque jour",          desc: "Le système CP te challenge à faire des missions régulièrement. Streak, rangs, récompenses — la progression est addictive.",                  color: G.accent, glow: "rgba(255,106,61,0.2)"  },
]

const POSTS_SAMPLE = [
  { init: "SL", name: "Sophie L.",  shop: "@bijoux-boheme",  title: "Bague dorée plaquée or 18K",    tag: "Bijoux",      visits: 362, supports: 25, cp: 50, color: G.cyan,   img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80" },
  { init: "TD", name: "Thomas D.",  shop: "@road-trip-app",  title: "Application voyage RoadTrip",   tag: "Application", visits: 278, supports: 18, cp: 50, color: G.accent, img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80" },
  { init: "CR", name: "Camille R.", shop: "@studio-bloom",   title: "Identité visuelle Studio Bloom", tag: "Design",     visits: 195, supports: 12, cp: 50, color: G.gold,   img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80" },
]

const TESTIMONIALS = [
  { init: "SL", name: "Sophie L.",  role: "Fondatrice · GreenCare",       text: "En 3 semaines, j'ai eu 47 nouveaux favoris sur mon produit phare. Mon taux de conversion a bondi de 18%. CirclUp m'a coûté moins qu'un café par semaine.", color: G.cyan, cp: "2 450 CP" },
  { init: "TD", name: "Thomas D.",  role: "Créateur · RoadTrip",          text: "Je dépensais 80€/mois en pub Etsy sans résultats. CirclUp m'a généré plus de trafic organique en 1 mois qu'un trimestre de pub payante.", color: G.accent, cp: "1 890 CP" },
  { init: "CR", name: "Camille R.", role: "Directrice artistique · Studio Bloom", text: "L'entraide dans mon cercle est incroyable. On se challenge, on progresse ensemble. Jamais seule. Et mes ventes ont suivi.", color: G.gold, cp: "1 650 CP" },
]

const FAQS = [
  { q: "Est-ce que CirclUp fonctionne vraiment ?", a: "Oui. Les signaux algorithmiques (favoris, visites, avis, partages) sont les vrais leviers du référencement Etsy et Shopify. CirclUp les génère organiquement via l'entraide — sans triche, sans bot." },
  { q: "Dois-je acheter les produits des autres membres ?", a: "Non. L'achat est une mission bonus à +40 CP. Les 7 autres missions sont gratuites. La philosophie de CirclUp repose sur l'entraide accessible à tous." },
  { q: "Comment sont formés les cercles ?", a: "Tu es regroupé avec 9 autres vendeurs de ta même niche. Dès que 10 membres de ta niche sont inscrits, ton cercle est activé et tu commences à recevoir des missions." },
  { q: "CirclUp respecte-t-il les CGU d'Etsy ?", a: "Oui. Toutes les actions sont réelles — des vraies personnes qui visitent, favorisent, partagent. Aucun bot, aucune automatisation. C'est de l'entraide humaine." },
  { q: "Puis-je résilier à tout moment ?", a: "Absolument. L'abonnement est mensuel, sans engagement. Tu peux annuler depuis ton espace Stripe à tout moment." },
]

const NAV_LINKS = ["Fonctionnalités", "Tarifs", "Témoignages", "FAQ"]

const fmtEur = (n) => (Number(n) || 0).toLocaleString('fr-FR')

function ProjectsShowcase() {
  const [projects, setProjects] = useState([])
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    supabase.from('projects')
      .select('id, title, story, image_url, category, goal_amount, raised_amount, backers_count, profiles!projects_user_id_fkey(name)')
      .order('created_at', { ascending: false }).limit(3)
      .then(({ data }) => { setProjects(data || []); setLoaded(true) }, () => setLoaded(true))
  }, [])

  return (
    <section id="projets" style={{ padding: "100px 5%", background: G.bg }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 11, color: G.accent, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>PROJETS</div>
          <h2 style={{ fontFamily: G.serif, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, marginBottom: 16, letterSpacing: -0.8 }}>Des projets qui prennent vie</h2>
          <p style={{ fontSize: 17, color: G.muted, maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>Soutiens un projet qui te tient à cœur, ou lance le tien et fais-toi financer par la communauté.</p>
        </div>

        {projects.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18, marginBottom: 40 }}>
            {projects.map(p => {
              const pct = p.goal_amount > 0 ? Math.min(p.raised_amount / p.goal_amount * 100, 100) : 0
              return (
                <div key={p.id} className="card-hov" style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 18, overflow: "hidden", backdropFilter: "blur(10px)" }}>
                  <div style={{ height: 170, background: G.bg3, overflow: "hidden" }}>
                    {p.image_url ? <img src={p.image_url} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Rocket size={30} color={G.faint} /></div>}
                  </div>
                  <div style={{ padding: "20px 22px" }}>
                    {p.category && <span style={{ fontSize: 11, color: G.cyan, fontWeight: 600 }}>{p.category}</span>}
                    <h3 style={{ fontFamily: G.serif, fontSize: 18, fontWeight: 800, margin: "6px 0 8px", lineHeight: 1.3 }}>{p.title}</h3>
                    <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.6, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.story}</p>
                    <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${G.accent}, ${G.gold})`, borderRadius: 3 }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                      <span style={{ fontFamily: G.num, fontSize: 15, fontWeight: 700, color: G.accent }}>{fmtEur(p.raised_amount)}€ <span style={{ fontSize: 11, color: G.faint, fontWeight: 400 }}>/ {fmtEur(p.goal_amount)}€</span></span>
                      <span style={{ fontSize: 12, color: G.muted }}>{p.backers_count || 0} soutiens</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : loaded ? (
          <div style={{ textAlign: "center", padding: "50px 24px", background: G.card, border: `1px solid ${G.border}`, borderRadius: 20, marginBottom: 40, maxWidth: 560, margin: "0 auto 40px" }}>
            <div style={{ width: 60, height: 60, margin: "0 auto 16px", borderRadius: 16, background: G.accentL, border: `1px solid ${G.accentB}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Rocket size={26} color={G.accent} />
            </div>
            <h3 style={{ fontFamily: G.serif, fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Sois le premier à lancer un projet</h3>
            <p style={{ fontSize: 14, color: G.muted }}>Rejoins CirclUp et présente ton projet à toute la communauté.</p>
          </div>
        ) : null}

        <div style={{ textAlign: "center" }}>
          <Link to="/register" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#fff", padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
            Lancer mon projet <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function Landing() {
  const [activeNav, setActiveNav] = useState(null)

  return (
    <div style={{ minHeight: "100vh", background: G.bg, fontFamily: G.sans, color: G.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes mockRadar { 0% { transform: translate(-50%,-50%) scale(0.5); opacity: 0.6; } 100% { transform: translate(-50%,-50%) scale(1.5); opacity: 0; } }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 0.7; }
        }
        @keyframes badge-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,106,61,0.4); }
          50%      { box-shadow: 0 0 0 6px rgba(255,106,61,0); }
        }

        .fade-1 { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .fade-2 { animation: fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both; }
        .fade-3 { animation: fadeUp 0.6s 0.2s cubic-bezier(0.16,1,0.3,1) both; }
        .fade-4 { animation: fadeUp 0.6s 0.3s cubic-bezier(0.16,1,0.3,1) both; }
        .fade-in { animation: fadeIn 0.8s ease both; }
        .float  { animation: float 6s ease-in-out infinite; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

        a { text-decoration: none; color: inherit; }

        .card-hov {
          transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), border-color 0.2s, box-shadow 0.25s;
        }
        .card-hov:hover {
          transform: translateY(-3px);
          border-color: rgba(255,255,255,0.1) !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4) !important;
        }

        .nav-link {
          transition: color 0.15s;
          position: relative;
        }
        .nav-link:hover { color: #FFFFFF !important; }

        .btn-primary {
          background: linear-gradient(135deg, #FF6A3D 0%, #e04f25 100%) !important;
          box-shadow: 0 8px 32px rgba(255,106,61,0.4), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2) !important;
          border: 1px solid rgba(255,130,70,0.4) !important;
          transition: all 0.2s cubic-bezier(0.16,1,0.3,1) !important;
        }
        .btn-primary:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 16px 48px rgba(255,106,61,0.5), 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.25) !important;
        }
        .btn-primary:active {
          transform: translateY(0) !important;
          box-shadow: 0 4px 16px rgba(255,106,61,0.3) !important;
        }

        .btn-secondary {
          background: rgba(255,255,255,0.04) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          backdrop-filter: blur(12px);
          transition: all 0.2s cubic-bezier(0.16,1,0.3,1) !important;
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.08) !important;
          border-color: rgba(255,255,255,0.18) !important;
          transform: translateY(-2px) !important;
        }

        .hero-badge {
          animation: badge-pulse 2.5s ease-in-out infinite;
        }

        .glow-pulse {
          animation: pulse-glow 4s ease-in-out infinite;
        }

        .feature-icon:hover {
          transform: scale(1.08) translateY(-3px) !important;
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(5,5,5,0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${G.border}`,
        height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 5%",
      }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={32} />
          <span style={{ fontFamily: G.serif, fontSize: 19, fontWeight: 900, color: G.text, letterSpacing: -0.3 }}>CirclUp</span>
          <span style={{ fontSize: 9, color: G.muted, border: `1px solid ${G.border}`, borderRadius: 5, padding: "2px 6px", letterSpacing: 1, fontWeight: 600 }}>BETA</span>
        </Link>

        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {NAV_LINKS.map(link => (
            <a key={link} href={`#${link.toLowerCase()}`} className="nav-link" style={{ fontSize: 14, color: G.muted, fontWeight: 500 }}>{link}</a>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link to="/login" style={{ fontSize: 14, color: G.muted, fontWeight: 500, padding: "8px 18px", borderRadius: 9, transition: "color 0.15s" }}
            onMouseOver={e => e.currentTarget.style.color = G.text}
            onMouseOut={e => e.currentTarget.style.color = G.muted}
          >
            Se connecter
          </Link>
          <Link to="/register" className="btn-primary" style={{ color: "#fff", fontSize: 14, fontWeight: 700, padding: "9px 22px", borderRadius: 9, display: "flex", alignItems: "center", gap: 7 }}>
            Rejoindre CirclUp <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100vh",
        display: "flex", alignItems: "center",
        padding: "100px 5% 80px",
        gap: 60,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background glows */}
        <div className="glow-pulse" style={{ position: "absolute", top: "15%", left: "20%", width: 700, height: 700, background: "radial-gradient(ellipse, rgba(255,106,61,0.04) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div className="glow-pulse" style={{ position: "absolute", top: "40%", right: "5%", width: 500, height: 500, background: "radial-gradient(ellipse, rgba(0,213,213,0.04) 0%, transparent 65%)", pointerEvents: "none", animationDelay: "2s" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,106,61,0.3), rgba(0,213,213,0.3), transparent)", pointerEvents: "none" }} />

        {/* Left */}
        <div style={{ flex: "0 0 500px", maxWidth: 500 }}>
          {/* Pill badge */}
          <div className="fade-1 hero-badge" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: G.accentL,
            border: `1px solid ${G.accentB}`,
            borderRadius: 100, padding: "6px 14px", marginBottom: 32,
          }}>
            <span style={{ fontSize: 14 }}>🚀</span>
            <span style={{ fontSize: 12, color: G.accent, fontWeight: 600, letterSpacing: 0.2 }}>+2 400 entrepreneurs actifs ce mois</span>
          </div>

          <h1 className="fade-2" style={{
            fontFamily: G.serif,
            fontSize: "clamp(34px, 3.6vw, 56px)",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: -1,
            marginBottom: 24,
            color: G.text,
          }}>
            La plateforme<br />des entrepreneurs<br />
            <span style={{ color: G.accent, fontStyle: "italic" }}>qui se soutiennent.</span>
          </h1>

          <p className="fade-3" style={{
            fontSize: 20, color: G.muted, lineHeight: 1.7,
            marginBottom: 40, maxWidth: 460,
            fontWeight: 400,
          }}>
            Échange favoris Etsy, visites et avis entre créateurs de ta niche. Booste ton algorithme grâce à l'entraide — pour 9,99€/mois.
          </p>

          <div className="fade-4" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 44 }}>
            <Link to="/register?plan=gratuit" className="btn-primary" style={{ color: "#fff", padding: "15px 32px", borderRadius: 11, fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 9 }}>
              <Zap size={18} fill="#fff" /> Commencer gratuitement
            </Link>
            <a href="#fonctionnalités" className="btn-secondary" style={{ color: G.text, padding: "15px 26px", borderRadius: 11, fontSize: 16, fontWeight: 500, display: "flex", alignItems: "center", gap: 9 }}>
              Voir comment ça marche <ChevronRight size={17} />
            </a>
          </div>

          {/* Social proof */}
          <div className="fade-4" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex" }}>
              {[G.cyan, G.accent, G.gold, G.cyan, G.accent].map((c, i) => (
                <div key={i} style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: `radial-gradient(circle, ${c}bb, ${c}33)`,
                  border: `2px solid #050505`,
                  marginLeft: i === 0 ? 0 : -11,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, color: "#fff",
                  boxShadow: `0 2px 10px ${c}30`,
                }}>
                  {["SL","TD","CR","LB","JM"][i]}
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: "flex", gap: 2, marginBottom: 3 }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={13} color={G.gold} fill={G.gold} />)}
              </div>
              <span style={{ fontSize: 13, color: G.muted }}>+2 500 entrepreneurs · <span style={{ color: G.text }}>Rejoins la communauté</span> →</span>
            </div>
          </div>
        </div>

        {/* Right - App Mockup */}
        <div className="float" style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", minWidth: 0 }}>
          <AppMockup />
        </div>
      </section>

      {/* ── TAGLINE BANNER ── */}
      <section style={{
        background: G.bg2,
        borderTop: `1px solid ${G.border}`,
        borderBottom: `1px solid ${G.border}`,
        padding: "40px 5%",
        textAlign: "center",
      }}>
        <p style={{ fontFamily: G.serif, fontSize: "clamp(20px, 3vw, 30px)", fontWeight: 700, color: G.text, letterSpacing: -0.3 }}>
          Une seule règle :{" "}
          <span style={{ color: G.accent, fontStyle: "italic" }}>donner pour recevoir.</span>
        </p>
        <p style={{ fontSize: 15, color: G.muted, marginTop: 10, lineHeight: 1.6 }}>Gagne des CP en aidant les autres et utilise-les pour booster ton propre projet.</p>
      </section>

      {/* ── FEATURES ── */}
      <section id="fonctionnalités" style={{ padding: "110px 5%" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ fontSize: 11, color: G.cyan, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>FONCTIONNALITÉS</div>
            <h2 style={{ fontFamily: G.serif, fontSize: "clamp(28px, 4vw, 50px)", fontWeight: 900, marginBottom: 16, letterSpacing: -0.8 }}>Ce que CirclUp génère pour toi</h2>
            <p style={{ fontSize: 17, color: G.muted, maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>Des signaux réels, générés par de vraies personnes. Pas de bots. Pas de triche. De l'entraide qui paie.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {FEATURES.map(({ LIcon, title, desc, color, glow }) => (
              <div key={title} className="card-hov" style={{
                background: G.card,
                border: `1px solid ${G.border}`,
                borderRadius: 20,
                padding: "36px 32px 30px",
                position: "relative",
                overflow: "hidden",
                backdropFilter: "blur(10px)",
              }}>
                {/* Glow background */}
                <div style={{ position: "absolute", top: -30, right: -30, width: 200, height: 200, background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`, pointerEvents: "none" }} />
                {/* Icon */}
                <div style={{ width: 56, height: 56, marginBottom: 24, borderRadius: 16, background: `${color}12`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LIcon size={26} color={color} />
                </div>
                <div style={{ width: 28, height: 2, background: `linear-gradient(90deg, ${color}, transparent)`, borderRadius: 1, marginBottom: 16 }} />
                <h3 style={{ fontFamily: G.serif, fontSize: 20, fontWeight: 800, marginBottom: 12, color: G.text, letterSpacing: -0.2 }}>{title}</h3>
                <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.8 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section id="comment-ça-marche" style={{ padding: "100px 5%", background: G.bg2 }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 11, color: G.accent, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>COMMENT ÇA MARCHE</div>
            <h2 style={{ fontFamily: G.serif, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, marginBottom: 16, letterSpacing: -0.8 }}>La mécanique de l'entraide</h2>
            <p style={{ fontSize: 17, color: G.muted, maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>Pas de bots, pas de faux clics. Des vrais entrepreneurs qui s'entraident — et l'algorithme qui récompense cette activité réelle.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { num: "01", LIcon: FileText,    glow: "rgba(255,106,61,0.25)",  color: G.accent, title: "Tu publies ton produit",      desc: "Tu crées un post en racontant l'histoire de ton produit. Un score de qualité (0-100) est calculé automatiquement : plus ton histoire est riche, plus tu attires de missions.", tag: "Score : longueur · histoire · appel à l'action · prix..." },
              { num: "02", LIcon: Users,        glow: "rgba(0,213,213,0.25)",   color: G.cyan,   title: "Ton cercle voit ton post",      desc: "Tu es assigné à un cercle de 10 vendeurs de ta même niche. Ils voient ton post en priorité dans leur feed. Vous vous connaissez, vous avancez ensemble.", tag: "10 membres · même niche · entraide ciblée" },
              { num: "03", LIcon: Target,       glow: "rgba(245,200,66,0.25)",  color: G.gold,   title: "Ils font des missions pour toi", desc: "Les membres de ton cercle peuvent faire jusqu'à 8 missions sur ton post : ajouter aux favoris Etsy, visiter ta boutique, partager en story, laisser un avis...", tag: "8 missions disponibles · de +3 CP à +40 CP" },
              { num: "04", LIcon: TrendingUp,   glow: "rgba(255,106,61,0.25)",  color: G.accent, title: "L'algorithme te remarque",     desc: "Etsy et Shopify mesurent les favoris, les visites, les avis et les partages pour décider qui apparaît en premier dans les recherches. CirclUp génère ces signaux de façon organique.", tag: "Favoris · Visites · Avis · Partages · Trafic externe" },
            ].map((step, idx, arr) => (
              <div key={step.num} className="card-hov" style={{
                background: G.card,
                border: `1px solid ${G.border}`,
                borderRadius: 18,
                padding: "28px 32px",
                display: "flex", gap: 28, alignItems: "flex-start",
                backdropFilter: "blur(10px)",
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ width: 74, height: 74, borderRadius: 18, background: `${step.color}08`, border: `1px solid ${step.color}20`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, borderRadius: 18, background: `radial-gradient(circle, ${step.glow} 0%, transparent 70%)`, pointerEvents: "none" }} />
                    <step.LIcon size={28} color={step.color} style={{ position: "relative", zIndex: 1 }} />
                  </div>
                  {idx < arr.length - 1 && (
                    <div style={{ width: 1, height: 20, background: `linear-gradient(${step.color}30, transparent)`, marginTop: 10 }} />
                  )}
                </div>
                <div style={{ flex: 1, paddingTop: 6 }}>
                  <span style={{ fontSize: 10, color: step.color, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>ÉTAPE {step.num}</span>
                  <h3 style={{ fontFamily: G.serif, fontSize: 20, fontWeight: 800, margin: "8px 0 10px", letterSpacing: -0.2 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.8, marginBottom: 12 }}>{step.desc}</p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${step.color}0a`, border: `1px solid ${step.color}25`, borderRadius: 8, padding: "5px 12px" }}>
                    <TrendingUp size={11} color={step.color} />
                    <span style={{ fontSize: 11, color: step.color, fontWeight: 600 }}>{step.tag}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VITRINE PROJETS (financement) ── */}
      <ProjectsShowcase />

      {/* ── PROJETS À DÉCOUVRIR ── */}
      <section style={{ padding: "110px 5%" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48 }}>
            <div>
              <div style={{ fontSize: 11, color: G.cyan, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>PROJETS À DÉCOUVRIR</div>
              <h2 style={{ fontFamily: G.serif, fontSize: "clamp(26px, 3.5vw, 44px)", fontWeight: 900, letterSpacing: -0.6 }}>Des boutiques qui décollent</h2>
            </div>
            <Link to="/register" style={{ color: G.cyan, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, transition: "gap 0.15s" }}
              onMouseOver={e => e.currentTarget.style.gap = "10px"}
              onMouseOut={e => e.currentTarget.style.gap = "6px"}
            >
              Voir tous les projets <ArrowRight size={15} />
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {POSTS_SAMPLE.map((post) => (
              <div key={post.name} className="card-hov" style={{
                background: G.card,
                border: `1px solid ${G.border}`,
                borderRadius: 18,
                overflow: "hidden",
              }}>
                {/* Photo réelle */}
                <div style={{ height: 200, position: "relative", overflow: "hidden" }}>
                  <img src={post.img} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)" }}
                    onMouseOver={e => e.currentTarget.style.transform = "scale(1.06)"}
                    onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,5,5,0.75) 0%, transparent 55%)" }} />
                  <div style={{ position: "absolute", top: 14, left: 14, background: `${post.color}18`, backdropFilter: "blur(10px)", border: `1px solid ${post.color}40`, borderRadius: 7, padding: "4px 10px", fontSize: 11, color: post.color, fontWeight: 600 }}>{post.tag}</div>
                  <div style={{ position: "absolute", bottom: 14, right: 14, background: "rgba(5,5,5,0.8)", backdropFilter: "blur(10px)", border: `1px solid ${G.goldB}`, borderRadius: 7, padding: "4px 10px", fontSize: 11, color: G.gold, fontWeight: 700 }}>+{post.cp} CP</div>
                </div>
                <div style={{ padding: 22 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <Avatar initials={post.init} color={post.color} size={30} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: G.text }}>{post.name}</div>
                      <div style={{ fontSize: 11, color: G.muted }}>{post.shop}</div>
                    </div>
                  </div>
                  <h3 style={{ fontFamily: G.serif, fontSize: 16, fontWeight: 800, marginBottom: 14, letterSpacing: -0.2 }}>{post.title}</h3>
                  <div style={{ display: "flex", gap: 18, paddingTop: 14, borderTop: `1px solid ${G.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Eye size={13} color={G.muted} />
                      <span style={{ fontSize: 12, color: G.muted }}>{post.visits} visites</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Heart size={13} color={G.muted} />
                      <span style={{ fontSize: 12, color: G.muted }}>{post.supports} soutiens</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY SECTION ── */}
      <section style={{ padding: "100px 5%", background: G.bg2 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: G.gold, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 18 }}>LA COMMUNAUTÉ</div>
            <h2 style={{ fontFamily: G.serif, fontSize: "clamp(26px, 3.5vw, 44px)", fontWeight: 900, lineHeight: 1.15, marginBottom: 22, letterSpacing: -0.6 }}>
              Une communauté bienveillante et{" "}
              <span style={{ color: G.accent, fontStyle: "italic" }}>ambitieuse.</span>
            </h2>
            <p style={{ fontSize: 16, color: G.muted, lineHeight: 1.8, marginBottom: 32 }}>
              Chaque jour, des centaines d'entrepreneurs s'entraident pour aller plus loin. Ici, pas de concurrence, que des opportunités.
            </p>
            {[
              "Des boutiques dans tous les domaines — Etsy, Shopify, créateurs",
              "Des membres actifs et engagés dans leur niche",
              "Un environnement sécurisé — pas de bots, pas de triche",
              "Une entraide 100% gagnant-gagnant",
            ].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: G.cyanL, border: `1px solid ${G.cyanB}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <CheckCircle size={12} color={G.cyan} />
                </div>
                <span style={{ fontSize: 15, color: G.muted, lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["312", "Membres actifs", G.cyan],
              ["4 850€", "Ventes ce mois", G.accent],
              ["18 400", "Missions complétées", G.gold],
              ["97%", "Membres satisfaits", G.cyan],
            ].map(([val, label, color]) => (
              <div key={label} className="card-hov" style={{
                background: G.card,
                border: `1px solid ${G.border}`,
                borderRadius: 16,
                padding: "28px 22px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${color}30, transparent)` }} />
                <div style={{ fontFamily: G.serif, fontSize: 38, fontWeight: 900, color, marginBottom: 8, letterSpacing: -1 }}>{val}</div>
                <div style={{ fontSize: 13, color: G.muted }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="témoignages" style={{ padding: "110px 5%" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 11, color: G.cyan, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>ILS NOUS FONT CONFIANCE</div>
            <h2 style={{ fontFamily: G.serif, fontSize: "clamp(28px, 4vw, 50px)", fontWeight: 900, letterSpacing: -0.8 }}>
              Des entrepreneurs qui ont{" "}
              <span style={{ color: G.accent, fontStyle: "italic" }}>décollé.</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card-hov" style={{
                background: G.card,
                border: `1px solid ${G.border}`,
                borderRadius: 20,
                padding: 32,
                position: "relative",
                overflow: "hidden",
                backdropFilter: "blur(10px)",
              }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, background: `radial-gradient(circle, ${t.color}08 0%, transparent 70%)`, pointerEvents: "none" }} />
                <div style={{ display: "flex", gap: 2, marginBottom: 20 }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={15} color={G.gold} fill={G.gold} />)}
                </div>
                <p style={{ fontSize: 15, color: G.muted, lineHeight: 1.8, marginBottom: 26, fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 20, borderTop: `1px solid ${G.border}` }}>
                  <Avatar initials={t.init} color={t.color} size={42} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: G.text }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>{t.role}</div>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: G.gold, fontWeight: 700, background: G.goldL, border: `1px solid ${G.goldB}`, borderRadius: 6, padding: "3px 10px" }}>{t.cp}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="tarifs" style={{ padding: "100px 5%", background: G.bg2 }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 11, color: G.accent, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>TARIFS</div>
            <h2 style={{ fontFamily: G.serif, fontSize: "clamp(28px, 4vw, 50px)", fontWeight: 900, marginBottom: 16, letterSpacing: -0.8 }}>
              Commence gratuitement,<br /><span style={{ color: G.accent, fontStyle: "italic" }}>scale quand tu es prêt.</span>
            </h2>
            <p style={{ fontSize: 16, color: G.muted, maxWidth: 460, margin: "0 auto", lineHeight: 1.7 }}>Sans carte bancaire pour démarrer. Résiliation à tout moment.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, alignItems: "stretch" }}>
            {/* GRATUIT */}
            <div className="card-hov" style={{
              background: G.card,
              border: `1px solid ${G.border}`,
              borderRadius: 24,
              padding: "32px 28px",
              display: "flex", flexDirection: "column",
            }}>
              <div style={{ fontSize: 11, color: G.muted, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Gratuit</div>
              <div style={{ fontFamily: G.serif, fontSize: 48, fontWeight: 900, color: G.text, marginBottom: 4, letterSpacing: -2 }}>0€</div>
              <div style={{ fontSize: 13, color: G.muted, marginBottom: 28 }}>pour toujours · sans carte</div>
              <div style={{ flex: 1, marginBottom: 28 }}>
                {[
                  [true,  "2 posts actifs maximum"],
                  [true,  "5 missions par jour"],
                  [true,  "50 CP de bienvenue"],
                  [true,  "Feed communautaire"],
                  [true,  "Coffre quotidien"],
                  [false, "Cercle premium"],
                  [false, "Boost de post"],
                  [false, "Analytics avancées"],
                ].map(([ok, f]) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${G.border}` }}>
                    <span style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {ok ? <CheckCircle size={15} color={G.cyan} /> : <X size={13} color="rgba(255,255,255,0.15)" strokeWidth={2.5} />}
                    </span>
                    <span style={{ fontSize: 13, color: ok ? G.muted : "rgba(255,255,255,0.2)", textDecoration: ok ? "none" : "line-through" }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/register?plan=gratuit" className="btn-secondary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: G.muted, padding: "14px", borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: "none" }}
                onMouseOver={e => { e.currentTarget.style.color = G.cyan; e.currentTarget.style.borderColor = G.cyanB }}
                onMouseOut={e => { e.currentTarget.style.color = G.muted; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)" }}
              >
                Commencer gratuitement
              </Link>
            </div>

            {/* STARTER — recommandé */}
            <div style={{
              background: `linear-gradient(160deg, rgba(255,106,61,0.06) 0%, rgba(255,106,61,0.02) 100%)`,
              border: `1px solid ${G.accentB}`,
              borderRadius: 24,
              padding: "32px 28px",
              display: "flex", flexDirection: "column",
              position: "relative",
              boxShadow: `0 0 0 1px rgba(255,106,61,0.1), 0 30px 80px rgba(255,106,61,0.1)`,
            }}>
              <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: G.accent, color: "#fff", borderRadius: 100, padding: "5px 18px", fontSize: 11, fontWeight: 800, letterSpacing: 0.5, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(255,106,61,0.5)" }}>
                Le plus populaire
              </div>
              <div style={{ fontSize: 11, color: G.accent, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Starter</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                <span style={{ fontFamily: G.serif, fontSize: 48, fontWeight: 900, color: G.text, letterSpacing: -2 }}>9,99€</span>
                <span style={{ fontSize: 14, color: G.muted }}>/mois</span>
              </div>
              <div style={{ fontSize: 13, color: G.muted, marginBottom: 28 }}>sans engagement · résiliable à tout moment</div>
              <div style={{ flex: 1, marginBottom: 28 }}>
                {[
                  [true,  "10 posts actifs"],
                  [true,  "20 missions par jour"],
                  [true,  "200 CP offerts/mois"],
                  [true,  "Cercle de 10 membres"],
                  [true,  "Boost de post (100 CP)"],
                  [true,  "Multiplicateur streak x1.5"],
                  [true,  "Dashboard complet"],
                  [false, "Analytics avancées"],
                ].map(([ok, f]) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid rgba(255,106,61,0.1)` }}>
                    <span style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {ok ? <CheckCircle size={15} color={G.accent} /> : <X size={13} color="rgba(255,255,255,0.15)" strokeWidth={2.5} />}
                    </span>
                    <span style={{ fontSize: 13, color: ok ? G.muted : "rgba(255,255,255,0.2)", textDecoration: ok ? "none" : "line-through" }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/register?plan=starter" className="btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#fff", padding: "14px", borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                <Zap size={16} fill="#fff" /> Rejoindre CirclUp
              </Link>
            </div>

            {/* PREMIUM */}
            <div className="card-hov" style={{
              background: `linear-gradient(160deg, rgba(245,200,66,0.06) 0%, rgba(245,200,66,0.02) 100%)`,
              border: `1px solid ${G.goldB}`,
              borderRadius: 24,
              padding: "32px 28px",
              display: "flex", flexDirection: "column",
            }}>
              <div style={{ fontSize: 11, color: G.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Premium</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                <span style={{ fontFamily: G.serif, fontSize: 48, fontWeight: 900, color: G.text, letterSpacing: -2 }}>19,99€</span>
                <span style={{ fontSize: 14, color: G.muted }}>/mois</span>
              </div>
              <div style={{ fontSize: 13, color: G.muted, marginBottom: 28 }}>pour les entrepreneurs sérieux</div>
              <div style={{ flex: 1, marginBottom: 28 }}>
                {[
                  "Posts illimités",
                  "30 missions par jour",
                  "500 CP offerts/mois",
                  "Cercle premium exclusif",
                  "Analytics avancées",
                  "Badge VIP sur le profil",
                  "Post Featured prioritaire",
                  "Support prioritaire",
                ].map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${G.goldL}` }}>
                    <span style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <CheckCircle size={15} color={G.gold} />
                    </span>
                    <span style={{ fontSize: 13, color: G.muted }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/register?plan=premium" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: `linear-gradient(135deg, ${G.gold} 0%, #d4a820 100%)`, boxShadow: `0 8px 32px rgba(245,200,66,0.25)`, border: "none", color: "#0A0A0A", padding: "14px", borderRadius: 12, fontSize: 14, fontWeight: 800, textDecoration: "none", transition: "all 0.2s" }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 16px 48px rgba(245,200,66,0.35)` }}
                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 8px 32px rgba(245,200,66,0.25)` }}
              >
                <Crown size={16} /> Passer Premium
              </Link>
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: 13, color: G.muted, marginTop: 28, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Shield size={14} color={G.muted} /> Paiement 100% sécurisé par Stripe · Résiliation en 1 clic
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: "100px 5%" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 11, color: G.cyan, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>FAQ</div>
            <h2 style={{ fontFamily: G.serif, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, letterSpacing: -0.8 }}>Questions fréquentes</h2>
          </div>
          <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 20, padding: "0 32px" }}>
            {FAQS.map(faq => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: "120px 5%", background: G.bg2, textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Background glow */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 600, background: "radial-gradient(ellipse, rgba(255,106,61,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: G.accentL, border: `1px solid ${G.accentB}`, borderRadius: 100, padding: "6px 14px", marginBottom: 28 }}>
            <span style={{ fontSize: 13 }}>✨</span>
            <span style={{ fontSize: 12, color: G.accent, fontWeight: 600 }}>312 entrepreneurs actifs aujourd'hui</span>
          </div>
          <h2 style={{ fontFamily: G.serif, fontSize: "clamp(32px, 5vw, 64px)", fontWeight: 900, lineHeight: 1.05, marginBottom: 22, letterSpacing: -1.5 }}>
            Prêt à booster<br />
            <span style={{ color: G.accent, fontStyle: "italic" }}>sans dépenser ?</span>
          </h2>
          <p style={{ fontSize: 18, color: G.muted, marginBottom: 40, lineHeight: 1.7, maxWidth: 520, margin: "0 auto 40px" }}>
            Tes concurrents paient des centaines d'euros en pub. Toi tu vas construire quelque chose de durable avec d'autres créateurs.
          </p>
          <Link to="/register" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 12, color: "#fff", padding: "18px 44px", borderRadius: 14, fontSize: 18, fontWeight: 700, marginBottom: 20, textDecoration: "none" }}>
            Commencer maintenant <ArrowRight size={22} />
          </Link>
          <p style={{ fontSize: 13, color: G.muted, marginTop: 16 }}>Aucune carte requise pour commencer · Résiliation à tout moment</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: G.bg3, borderTop: `1px solid ${G.border}`, padding: "56px 5% 36px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 48, marginBottom: 56 }}>
            {/* Brand */}
            <div>
              <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Logo size={28} />
                <span style={{ fontFamily: G.serif, fontSize: 18, fontWeight: 900 }}>CirclUp</span>
              </Link>
              <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.75, marginBottom: 24, maxWidth: 220 }}>La communauté d'entraide des entrepreneurs e-commerce.</p>
              <div style={{ display: "flex", gap: 8 }}>
                {["IG", "TK", "YT", "LI"].map(s => (
                  <a key={s} href={SOCIAL_LINKS[s]} target="_blank" rel="noreferrer" style={{ width: 34, height: 34, borderRadius: 9, background: G.card, border: `1px solid ${G.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: G.muted, fontWeight: 700, cursor: "pointer", transition: "all 0.15s", textDecoration: "none" }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = G.borderHover; e.currentTarget.style.color = G.text }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.muted }}
                  >{s}</a>
                ))}
              </div>
            </div>
            {/* Columns */}
            {[
              ["Produit", ["Fonctionnalités", "Tarifs", "Missions", "CP & Rangs"]],
              ["Ressources", ["Blog", "Guides", "Témoignages", "Affiliation"]],
              ["Entreprise", ["À propos", "Contact", "CGU", "Confidentialité"]],
              ["Rester informé", null],
            ].map(([title, links]) => (
              <div key={title}>
                <div style={{ fontSize: 12, fontWeight: 700, color: G.text, marginBottom: 18, letterSpacing: 0.3 }}>{title}</div>
                {links ? links.map(link => {
                  const href = FOOTER_LINKS[link] || "#fonctionnalités"
                  const common = { key: link, style: { display: "block", fontSize: 13, color: G.muted, marginBottom: 12, cursor: "pointer", transition: "color 0.15s", textDecoration: "none" }, onMouseOver: e => e.currentTarget.style.color = G.text, onMouseOut: e => e.currentTarget.style.color = G.muted }
                  return href.startsWith('/')
                    ? <Link to={href} {...common}>{link}</Link>
                    : <a href={href} {...common}>{link}</a>
                }) : (
                  <NewsletterForm />
                )}
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <span style={{ fontSize: 12, color: G.muted }}>© 2025 CirclUp · Tous droits réservés</span>
            <div style={{ display: "flex", gap: 24 }}>
              {["Conditions d'utilisation", "Confidentialité", "Cookies"].map(l => (
                <a key={l} href={FOOTER_LINKS[l] || "mailto:contact@circlup.fr"} style={{ fontSize: 12, color: G.muted, cursor: "pointer", transition: "color 0.15s", textDecoration: "none" }}
                  onMouseOver={e => e.currentTarget.style.color = G.text}
                  onMouseOut={e => e.currentTarget.style.color = G.muted}
                >{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
