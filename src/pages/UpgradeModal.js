import { X, Zap, Star, Target, Crown, ArrowRight, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PLAN_LIMITS, getPlanLimits } from '../hooks/useMissions'

const G = {
  bg: "#050505", bg2: "#0A0A0A", bg3: "#0D0D0D",
  card: "rgba(255,255,255,0.03)", card2: "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.06)", borderHover: "rgba(255,255,255,0.12)",
  accent: "#FF6A3D", accentL: "rgba(255,106,61,0.08)", accentB: "rgba(255,106,61,0.2)",
  cyan: "#00D5D5", cyanL: "rgba(0,213,213,0.08)", cyanB: "rgba(0,213,213,0.2)",
  gold: "#F5C518", goldL: "rgba(245,197,24,0.08)", goldB: "rgba(245,197,24,0.2)",
  text: "#FFFFFF", muted: "#9A9A9A", faint: "rgba(255,255,255,0.12)",
  serif: "'Playfair Display', Georgia, serif", sans: "'DM Sans', system-ui, sans-serif",
}

const HEAD = {
  daily_missions: { icon: <Target size={26} color={G.accent} />, iconBg: G.accentL, iconBorder: G.accentB, title: "Limite de missions atteinte" },
  post_limit:     { icon: <Star size={26} color={G.gold} />,     iconBg: G.goldL,   iconBorder: G.goldB,   title: "Limite de posts atteinte" },
  premium_feature:{ icon: <Crown size={26} color={G.gold} />,    iconBg: G.goldL,   iconBorder: G.goldB,   title: "Fonctionnalité Premium" },
}

export default function UpgradeModal({ type = 'daily_missions', plan = 'free', onClose }) {
  const head = HEAD[type] || HEAD.daily_missions
  const cur = getPlanLimits(plan)

  // Description honnête, calée sur le plan ACTUEL de l'utilisateur
  let desc
  if (type === 'daily_missions') desc = `Tu as atteint ta limite de ${cur.missions} missions/jour (plan ${cur.label}).`
  else if (type === 'post_limit') desc = `Ton plan ${cur.label} permet ${cur.posts === Infinity ? 'des posts illimités' : `${cur.posts} posts actifs`}.`
  else desc = "Cette fonctionnalité fait partie des abonnements payants."

  // On propose les paliers SUPÉRIEURS au plan courant
  const order = ['free', 'starter', 'premium']
  const upgrades = order.slice(order.indexOf(plan) + 1).map(k => ({ key: k, ...PLAN_LIMITS[k] }))
  const tiers = upgrades.length ? upgrades : [{ key: 'premium', ...PLAN_LIMITS.premium }]

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: G.sans }} onClick={onClose}>
      <style>{`
        @keyframes modalUp { from { opacity:0; transform:translateY(20px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        .upgrade-close-btn:hover { color: #fff !important; }
        .upgrade-skip-btn:hover { border-color: rgba(255,255,255,0.12) !important; }
      `}</style>

      <div onClick={e => e.stopPropagation()} style={{ background: G.bg2, border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 20, padding: "32px 28px", maxWidth: 460, width: "100%", boxShadow: "0 48px 96px rgba(0,0,0,0.7)", animation: "modalUp 0.28s cubic-bezier(0.22,1,0.36,1) both", position: "relative" }}>
        <button className="upgrade-close-btn" onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", cursor: "pointer", color: G.muted, padding: 4, borderRadius: 6, transition: "color 0.15s" }}>
          <X size={17} />
        </button>

        <div style={{ width: 52, height: 52, borderRadius: 14, background: head.iconBg, border: `1px solid ${head.iconBorder}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          {head.icon}
        </div>

        <h2 style={{ fontFamily: G.serif, fontSize: 21, fontWeight: 900, color: G.text, marginBottom: 8, lineHeight: 1.25 }}>{head.title}</h2>
        <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.7, marginBottom: 22 }}>{desc}</p>

        {/* Offres supérieures — vraies limites, vrais prix */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
          {tiers.map(t => (
            <div key={t.key} style={{ background: G.card, border: `1px solid ${t.key === 'premium' ? G.goldB : G.border}`, borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {t.key === 'premium' ? <Crown size={16} color={G.gold} /> : <Zap size={16} color={G.accent} />}
                  <span style={{ fontFamily: G.serif, fontSize: 17, fontWeight: 900, color: G.text }}>{t.label}</span>
                </div>
                <div style={{ fontFamily: G.serif, fontSize: 20, fontWeight: 900, color: G.text }}>
                  {t.price}€<span style={{ fontSize: 11, color: G.muted, fontWeight: 400 }}>/mois</span>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: G.muted, display: "inline-flex", alignItems: "center", gap: 5 }}><CheckCircle size={12} color={G.cyan} /> {t.posts === Infinity ? 'Posts illimités' : `${t.posts} posts`}</span>
                <span style={{ fontSize: 12, color: G.muted, display: "inline-flex", alignItems: "center", gap: 5 }}><CheckCircle size={12} color={G.cyan} /> {t.missions} missions/jour</span>
              </div>
              <Link to="/register" onClick={onClose} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: t.key === 'premium' ? "linear-gradient(135deg, #FF6A3D, #FF4D1C)" : G.card2, border: t.key === 'premium' ? "none" : `1px solid ${G.border}`, color: t.key === 'premium' ? "#fff" : G.text, padding: "11px", borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: G.sans, textDecoration: "none" }}>
                Choisir {t.label} <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>

        <button className="upgrade-skip-btn" onClick={onClose} style={{ width: "100%", background: "transparent", border: `1px solid ${G.border}`, color: G.faint, padding: "10px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontFamily: G.sans, transition: "border-color 0.15s" }}>
          Plus tard
        </button>
      </div>
    </div>
  )
}
