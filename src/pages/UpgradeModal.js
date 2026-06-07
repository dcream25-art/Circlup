import { X, Zap, Star, Target, Crown, ArrowRight, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

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

const LIMIT_MESSAGES = {
  daily_missions: {
    icon: <Target size={26} color={G.accent} />,
    iconBg: G.accentL,
    iconBorder: G.accentB,
    title: "Limite de missions atteinte",
    desc: "Tu as atteint ta limite de 5 missions par jour sur le plan gratuit.",
    highlight: "Passe à Premium pour 30 missions/jour et des multiplicateurs de streak.",
  },
  post_limit: {
    icon: <Star size={26} color={G.gold} />,
    iconBg: G.goldL,
    iconBorder: G.goldB,
    title: "Limite de posts atteinte",
    desc: "Le plan gratuit permet seulement 2 posts actifs en même temps.",
    highlight: "Passe à Premium pour des posts illimités et plus de visibilité.",
  },
  premium_feature: {
    icon: <Crown size={26} color={G.gold} />,
    iconBg: G.goldL,
    iconBorder: G.goldB,
    title: "Fonctionnalité Premium",
    desc: "Cette fonctionnalité est réservée aux membres Premium.",
    highlight: "Débloques tout CirclUp pour seulement 9,99€/mois.",
  },
}

const FEATURES = [
  "30 missions par jour (vs 5 en gratuit)",
  "Posts illimités actifs",
  "Multiplicateurs de streak jusqu'à +50%",
  "Boost de post prioritaire",
  "Badge Premium visible sur ton profil",
]

export default function UpgradeModal({ type = 'daily_missions', onClose }) {
  const msg = LIMIT_MESSAGES[type] || LIMIT_MESSAGES.daily_missions

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "rgba(0,0,0,0.82)", backdropFilter: "blur(20px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, fontFamily: G.sans,
    }} onClick={onClose}>
      <style>{`
        @keyframes modalUp { from { opacity:0; transform:translateY(20px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        .upgrade-feat-row { transition: background 0.15s; }
        .upgrade-feat-row:hover { background: rgba(255,255,255,0.03) !important; }
        .upgrade-close-btn:hover { color: #fff !important; }
        .upgrade-skip-btn:hover { border-color: rgba(255,255,255,0.12) !important; color: #9A9A9A !important; }
      `}</style>

      <div onClick={e => e.stopPropagation()} style={{
        background: G.bg2,
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: 20,
        padding: "32px 28px",
        maxWidth: 440,
        width: "100%",
        boxShadow: "0 48px 96px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
        animation: "modalUp 0.28s cubic-bezier(0.22,1,0.36,1) both",
        position: "relative",
      }}>

        {/* Close */}
        <button className="upgrade-close-btn" onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "transparent", border: "none",
          cursor: "pointer", color: G.muted, padding: 4,
          borderRadius: 6, transition: "color 0.15s",
        }}>
          <X size={17} />
        </button>

        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: msg.iconBg, border: `1px solid ${msg.iconBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 20,
        }}>
          {msg.icon}
        </div>

        {/* Title + desc */}
        <h2 style={{
          fontFamily: G.serif, fontSize: 21, fontWeight: 900,
          color: G.text, marginBottom: 8, lineHeight: 1.25,
        }}>
          {msg.title}
        </h2>
        <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.7, marginBottom: 16 }}>
          {msg.desc}
        </p>

        {/* Highlight banner */}
        <div style={{
          background: G.goldL, border: `1px solid ${G.goldB}`,
          borderRadius: 10, padding: "10px 14px", marginBottom: 24,
        }}>
          <p style={{ fontSize: 13, color: G.gold, margin: 0, fontWeight: 600 }}>
            <Zap size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            {msg.highlight}
          </p>
        </div>

        {/* Features list */}
        <div style={{
          background: G.card, border: `1px solid ${G.border}`,
          borderRadius: 12, overflow: "hidden", marginBottom: 24,
        }}>
          {FEATURES.map((f, i) => (
            <div key={f} className="upgrade-feat-row" style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px",
              borderBottom: i < FEATURES.length - 1 ? `1px solid ${G.border}` : "none",
            }}>
              <CheckCircle size={14} color={G.cyan} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: G.muted }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Prix + CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontFamily: G.serif, fontSize: 30, fontWeight: 900, color: G.text, lineHeight: 1 }}>
              9,99€
            </div>
            <div style={{ fontSize: 11, color: G.muted, marginTop: 3 }}>par mois · sans engagement</div>
          </div>
          <Link to="/register" onClick={onClose} style={{
            flex: 1,
            background: "linear-gradient(135deg, #FF6A3D, #FF4D1C)",
            boxShadow: "0 4px 20px rgba(255,106,61,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
            border: "none", color: "#fff",
            padding: "14px 20px", borderRadius: 12,
            fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: G.sans,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            textDecoration: "none",
          }}>
            <Crown size={15} fill="#fff" stroke="none" /> Passer à Premium <ArrowRight size={14} />
          </Link>
        </div>

        <button className="upgrade-skip-btn" onClick={onClose} style={{
          width: "100%", background: "transparent",
          border: `1px solid ${G.border}`, color: G.faint,
          padding: "10px", borderRadius: 10,
          cursor: "pointer", fontSize: 13, fontFamily: G.sans,
          transition: "border-color 0.15s, color 0.15s",
        }}>
          Continuer en gratuit
        </button>
      </div>
    </div>
  )
}
