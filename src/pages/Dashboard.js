import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { usePosts } from '../hooks/usePosts'
import { supabase } from '../lib/supabase'
import {
  Star, Eye, Heart, MessageCircle, Share2, Pin, Search, ShoppingBag,
  Home, Target, Users, BarChart2, Bell, LogOut, Zap, Plus, X,
  ExternalLink, Flame, Crown, Bookmark, Image, Link2, TrendingUp,
  ChevronRight, Award, Filter
} from 'lucide-react'

const G = {
  bg: "#1a2420", bg2: "#1f2e28", bg3: "#16201d",
  card: "rgba(255,255,255,0.04)", card2: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.08)", borderL: "rgba(255,255,255,0.05)",
  accent: "#e05c4b", accentL: "rgba(224,92,75,0.12)", accentB: "rgba(224,92,75,0.3)",
  mint: "#7ecfc0", mintL: "rgba(126,207,192,0.1)", mintB: "rgba(126,207,192,0.25)",
  gold: "#d4a84b", goldL: "rgba(212,168,75,0.12)", goldB: "rgba(212,168,75,0.28)",
  text: "#f0ebe3", muted: "rgba(240,235,227,0.5)", faint: "rgba(240,235,227,0.22)",
  serif: "'Playfair Display', Georgia, serif", sans: "'DM Sans', system-ui, sans-serif",
}

const MISSIONS_DEF = [
  { id: "fav",     Icon: Star,          label: "Ajouter aux favoris",  cp: 5,  free: true  },
  { id: "visit",   Icon: Eye,           label: "Visiter la boutique",  cp: 3,  free: true  },
  { id: "like",    Icon: Heart,         label: "Liker 3 produits",     cp: 4,  free: true  },
  { id: "comment", Icon: MessageCircle, label: "Commenter le post",    cp: 6,  free: true  },
  { id: "share",   Icon: Share2,        label: "Partager en story",    cp: 10, free: true  },
  { id: "pin",     Icon: Pin,           label: "Épingler Pinterest",   cp: 8,  free: true  },
  { id: "review",  Icon: Search,        label: "Laisser un avis",      cp: 15, free: true  },
  { id: "buy",     Icon: ShoppingBag,   label: "Acheter un produit",   cp: 40, free: false },
]

const NAV = [
  { id: "dashboard", Icon: Home,     label: "Dashboard" },
  { id: "feed",      Icon: BarChart2, label: "Feed",    badge: null },
  { id: "missions",  Icon: Target,   label: "Missions", badge: 8 },
  { id: "cercle",    Icon: Users,    label: "Cercle" },
]

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
const STREAK_DONE = [true, true, true, true, false, false, false]

const TOP_MEMBRES = [
  { init: "SL", name: "Sophie L.", cp: 2450, color: G.mint, crown: true },
  { init: "TD", name: "Thomas D.", cp: 1890, color: G.accent },
  { init: "CR", name: "Camille R.", cp: 1650, color: G.gold },
  { init: "LB", name: "Lucas B.",  cp: 1230, color: G.mint },
  { init: "JM", name: "Julie M.",  cp: 980,  color: G.accent },
]

// Sparkline SVG
function Sparkline({ color, up = true }) {
  const pts = up
    ? "0,40 20,35 40,30 60,28 80,20 100,15 120,10 140,8 160,5"
    : "0,10 20,15 40,20 60,18 80,25 100,22 120,28 140,30 160,35"
  return (
    <svg width={80} height={30} viewBox="0 0 160 40" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Anneau CP circulaire
function CpRing({ cp, max = 300, rank }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const pct = Math.min(cp / max, 1)
  return (
    <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx={70} cy={70} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={8} />
        <circle cx={70} cy={70} r={r} fill="none"
          stroke={`url(#cpGrad)`} strokeWidth={8}
          strokeDasharray={`${circ * pct} ${circ}`}
          strokeLinecap="round" transform="rotate(-90 70 70)" />
        <defs>
          <linearGradient id="cpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={G.gold} />
            <stop offset="100%" stopColor={G.accent} />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: G.serif, fontSize: 26, fontWeight: 900, color: G.gold, lineHeight: 1 }}>{cp}</span>
        <span style={{ fontSize: 10, color: G.muted, marginTop: 3 }}>pts</span>
        <div style={{ marginTop: 4, background: `${G.gold}20`, border: `1px solid ${G.goldB}`, borderRadius: 6, padding: "2px 8px" }}>
          <span style={{ fontSize: 9, color: G.gold, fontWeight: 700 }}>{rank}</span>
        </div>
      </div>
    </div>
  )
}

function Avatar({ initials, color, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `radial-gradient(circle at 33% 33%, ${color}cc, ${color}55)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.32, fontWeight: 700, color: "#18251f",
      fontFamily: G.sans, boxShadow: `0 2px 8px ${color}40`,
    }}>
      {initials}
    </div>
  )
}

function ScoreRing({ score }) {
  const color = score >= 80 ? G.mint : score >= 60 ? G.gold : G.accent
  const r = 18; const circ = 2 * Math.PI * r
  return (
    <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
      <svg width={44} height={44} viewBox="0 0 44 44">
        <circle cx={22} cy={22} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={3} />
        <circle cx={22} cy={22} r={r} fill="none" stroke={color} strokeWidth={3}
          strokeDasharray={`${circ * score / 100} ${circ}`}
          strokeLinecap="round" transform="rotate(-90 22 22)" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 10, fontWeight: 800, color }}>{score}</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const { posts, loading, createPost, doMission, likePost } = usePosts()
  const [tab, setTab]           = useState("dashboard")
  const [notifs, setNotifs]     = useState([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [cpAnim, setCpAnim]     = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [feedFilter, setFeedFilter] = useState("pour-toi")
  const [bookmarked, setBookmarked] = useState({})

  const [nProduct, setNProduct] = useState("")
  const [nPrice, setNPrice]     = useState("")
  const [nStory, setNStory]     = useState("")
  const [nAsk, setNAsk]         = useState("")

  useEffect(() => { if (user) fetchNotifs() }, [user]) // eslint-disable-line

  const fetchNotifs = async () => {
    const { data } = await supabase.from('notifications').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)
    setNotifs(data || [])
  }

  const handleMission = async (postId, missionId) => {
    const m = MISSIONS_DEF.find(x => x.id === missionId)
    const { error } = await doMission(postId, missionId, m.cp)
    if (!error) {
      setCpAnim({ amount: m.cp, label: m.label })
      setTimeout(() => setCpAnim(null), 1600)
    }
  }

  const handlePublish = async () => {
    if (!nProduct.trim() || !nStory.trim()) return
    await createPost({ product: nProduct, price: nPrice, story: nStory, ask: nAsk, tags: [] })
    setNProduct(""); setNPrice(""); setNStory(""); setNAsk("")
    setShowForm(false)
    setCpAnim({ amount: 20, label: "Post publié" })
    setTimeout(() => setCpAnim(null), 1600)
  }

  const markNotifsRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const unreadCount = notifs.filter(n => !n.is_read).length
  const initials = profile?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'
  const cp = profile?.cp || 0
  const rank = profile?.rank || 'Starter'
  const words = nStory.trim().split(/\s+/).filter(Boolean).length

  const rankMax = rank === 'Starter' ? 100 : rank === 'Builder' ? 300 : rank === 'Booster' ? 700 : 1000

  const inp = {
    width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`,
    borderRadius: 10, padding: "12px 15px", color: G.text, fontSize: 14,
    outline: "none", fontFamily: G.sans, boxSizing: "border-box",
  }

  const FEED_FILTERS = ["Pour toi", "Produits", "Services", "Actualités"]

  return (
    <div style={{ minHeight: "100vh", background: G.bg, fontFamily: G.sans, color: G.text, display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: rgba(240,235,227,0.3); }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes cpFlash { 0% { opacity:0; transform:translateY(8px) scale(0.9); } 20% { opacity:1; transform:translateY(0) scale(1); } 80% { opacity:1; } 100% { opacity:0; transform:translateY(-20px); } }
        .fade { animation: fadeUp 0.3s ease both; }
        .hov { transition: all 0.15s ease; }
        .hov:hover { border-color: rgba(126,207,192,0.2) !important; transform: translateY(-1px); }
        a { text-decoration: none; }
      `}</style>

      {/* CP Flash */}
      {cpAnim && (
        <div style={{ position: "fixed", top: 20, right: 28, zIndex: 1000, animation: "cpFlash 1.6s ease forwards", pointerEvents: "none" }}>
          <div style={{ background: `linear-gradient(135deg, ${G.gold}, #c48a20)`, borderRadius: 12, padding: "10px 18px", display: "flex", alignItems: "center", gap: 8, boxShadow: `0 8px 24px rgba(212,168,75,0.5)` }}>
            <Zap size={15} color="#18251f" fill="#18251f" />
            <span style={{ fontWeight: 800, color: "#18251f", fontSize: 15 }}>+{cpAnim.amount} CP</span>
            <span style={{ fontSize: 11, color: "rgba(24,37,31,0.7)" }}>{cpAnim.label}</span>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 220, background: G.bg3, borderRight: `1px solid ${G.border}`,
        padding: "20px 12px", display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh", flexShrink: 0, overflowY: "auto",
      }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 28, paddingLeft: 4, textDecoration: "none", color: "inherit" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #e05c4b, #c94535)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(224,92,75,0.4)", flexShrink: 0 }}>
            <span style={{ fontFamily: G.serif, fontSize: 14, fontWeight: 900, color: "#fff" }}>C</span>
          </div>
          <div>
            <div style={{ fontFamily: G.serif, fontSize: 16, fontWeight: 800 }}>CirclUp</div>
            <div style={{ fontSize: 9, color: G.faint, letterSpacing: 0.8 }}>BETA · v1.0</div>
          </div>
        </Link>

        {NAV.map(({ id, Icon, label, badge }) => {
          const active = tab === id
          return (
            <button key={id} onClick={() => setTab(id)} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: active ? `${G.accent}15` : "transparent",
              border: active ? `1px solid ${G.accentB}` : "1px solid transparent",
              color: active ? G.accent : G.muted,
              padding: "10px 12px", borderRadius: 9, cursor: "pointer",
              fontSize: 13, textAlign: "left", marginBottom: 2, width: "100%",
              fontFamily: G.sans, fontWeight: active ? 600 : 400, transition: "all 0.15s",
              position: "relative",
            }}>
              <Icon size={15} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge && (
                <span style={{ background: G.accent, color: "#fff", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>{badge}</span>
              )}
            </button>
          )
        })}

        <div style={{ marginTop: "auto" }}>
          {/* CP mini */}
          <div style={{ background: G.goldL, border: `1px solid ${G.goldB}`, borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Zap size={11} color={G.gold} />
                <span style={{ fontSize: 10, color: G.gold, fontWeight: 700, letterSpacing: 0.5 }}>CRÉDITS CP</span>
              </div>
              <span style={{ fontFamily: G.serif, fontSize: 20, fontWeight: 900, color: G.gold }}>{cp}</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
              <div style={{ width: `${Math.min(cp / rankMax * 100, 100)}%`, height: "100%", background: `linear-gradient(90deg,${G.gold},${G.accent})`, borderRadius: 2, transition: "width 0.4s" }} />
            </div>
            <div style={{ fontSize: 9, color: G.faint, marginTop: 4 }}>{rank} · {Math.max(0, rankMax - cp)} CP pour le prochain rang</div>
          </div>

          {/* User */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 11px", background: G.card, borderRadius: 10, border: `1px solid ${G.border}`, marginBottom: 8 }}>
            <Avatar initials={initials} color={G.mint} size={30} />
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile?.name || 'Membre'}</div>
              <div style={{ fontSize: 10, color: G.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile?.shop_name || ''}</div>
            </div>
          </div>

          <button onClick={signOut} style={{ width: "100%", background: "transparent", border: `1px solid ${G.border}`, color: G.faint, padding: "8px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontFamily: G.sans, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <LogOut size={12} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: "flex", minWidth: 0 }}>

        {/* Center */}
        <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto", minWidth: 0 }}>

          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <h1 style={{ fontFamily: G.serif, fontSize: 22, fontWeight: 900, margin: "0 0 2px" }}>
                {tab === "dashboard" && `Bonjour ${profile?.name?.split(' ')[0] || ''} 👋`}
                {tab === "feed"      && "Feed CirclUp"}
                {tab === "missions"  && "Mes Missions"}
                {tab === "cercle"    && "Mon Cercle"}
              </h1>
              <p style={{ fontSize: 12, color: G.muted, margin: 0 }}>
                {tab === "dashboard" && "Prêt à booster ta boutique aujourd'hui ?"}
                {tab === "feed"      && "Découvre les posts de ta communauté"}
                {tab === "missions"  && "Complète tes missions et gagne des CP"}
                {tab === "cercle"    && "Ton groupe d'entraide de 10 membres"}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {/* Notif */}
              <div style={{ position: "relative" }}>
                <button onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markNotifsRead() }} style={{ background: G.card, border: `1px solid ${G.border}`, color: G.text, width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Bell size={16} />
                </button>
                {unreadCount > 0 && <div style={{ position: "absolute", top: -3, right: -3, width: 14, height: 14, borderRadius: "50%", background: G.accent, fontSize: 8, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadCount}</div>}
                {notifOpen && (
                  <div style={{ position: "absolute", right: 0, top: 44, width: 300, background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 14, padding: 14, zIndex: 200, boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: G.muted, marginBottom: 12 }}>Notifications</div>
                    {notifs.length === 0 && <div style={{ fontSize: 13, color: G.faint, textAlign: "center", padding: "12px 0" }}>Aucune notification</div>}
                    {notifs.map((n, i) => (
                      <div key={i} style={{ display: "flex", gap: 9, padding: "9px 0", borderBottom: i < notifs.length - 1 ? `1px solid ${G.border}` : "none", opacity: n.is_read ? 0.5 : 1 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: G.mintL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Bell size={12} color={G.mint} /></div>
                        <div><div style={{ fontSize: 12, fontWeight: n.is_read ? 400 : 600 }}>{n.message}</div><div style={{ fontSize: 10, color: G.faint, marginTop: 2 }}>{new Date(n.created_at).toLocaleDateString('fr-FR')}</div></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* User avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: G.card, border: `1px solid ${G.border}`, borderRadius: 10, padding: "6px 12px 6px 6px" }}>
                <Avatar initials={initials} color={G.mint} size={28} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{profile?.name?.split(' ')[0] || 'Membre'}</div>
                  <div style={{ fontSize: 10, color: G.gold, display: "flex", alignItems: "center", gap: 3 }}><Crown size={9} color={G.gold} /> {rank}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ══ DASHBOARD TAB ══ */}
          {tab === "dashboard" && (
            <div className="fade">
              {/* CP + Performances */}
              <div style={{ background: `linear-gradient(135deg, rgba(212,168,75,0.08), rgba(224,92,75,0.06))`, border: `1px solid ${G.goldB}`, borderRadius: 18, padding: 24, marginBottom: 20, display: "flex", gap: 28, alignItems: "center" }}>
                <CpRing cp={cp} max={rankMax} rank={rank} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: G.gold, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Tes points disponibles</div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                    <button onClick={() => setTab("feed")} style={{ background: G.accent, border: "none", color: "#fff", padding: "9px 18px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: G.sans, display: "flex", alignItems: "center", gap: 6 }}>
                      <Zap size={14} /> Gagner des CP
                    </button>
                    <button onClick={() => setTab("missions")} style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.muted, padding: "9px 18px", borderRadius: 9, fontSize: 13, cursor: "pointer", fontFamily: G.sans }}>
                      Voir les missions
                    </button>
                  </div>
                  {/* Streak */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(224,92,75,0.12)", border: `1px solid ${G.accentB}`, borderRadius: 8, padding: "4px 10px" }}>
                      <Flame size={13} color={G.accent} />
                      <span style={{ fontSize: 12, color: G.accent, fontWeight: 700 }}>4 jours de suite</span>
                    </div>
                    <div style={{ display: "flex", gap: 5 }}>
                      {DAYS.map((d, i) => (
                        <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", background: STREAK_DONE[i] ? G.accent : "rgba(255,255,255,0.07)", border: `1px solid ${STREAK_DONE[i] ? G.accent : G.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {STREAK_DONE[i] && <span style={{ fontSize: 9, color: "#fff" }}>✓</span>}
                          </div>
                          <span style={{ fontSize: 8, color: G.faint }}>{d}</span>
                        </div>
                      ))}
                      <div style={{ marginLeft: 6, display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: G.gold, fontWeight: 700 }}>Prochain: +100 CP 🎁</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div style={{ fontSize: 12, fontWeight: 700, color: G.muted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 }}>Tes Performances · 7 derniers jours</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Favoris reçus",  val: "—", trend: "+0%", up: true,  color: G.gold,   Icon: Star },
                  { label: "Missions faites", val: "0",  trend: "+0%", up: true,  color: G.mint,   Icon: Target },
                  { label: "CP gagnés",       val: cp,   trend: "+12%", up: true, color: G.accent, Icon: Zap },
                  { label: "Posts actifs",    val: posts.filter(p => p.user_id === user?.id).length || 0, trend: "", up: true, color: G.mint, Icon: BarChart2 },
                ].map(({ label, val, trend, up, color, Icon }) => (
                  <div key={label} className="hov" style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ fontSize: 11, color: G.muted }}>{label}</div>
                      <Icon size={14} color={color} />
                    </div>
                    <div style={{ fontFamily: G.serif, fontSize: 26, fontWeight: 900, color, marginBottom: 6 }}>{val}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      {trend && <span style={{ fontSize: 11, color: up ? G.mint : G.accent }}>{trend}</span>}
                      <Sparkline color={color} up={up} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Missions du jour */}
              <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 20, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>Missions du jour</span>
                    <span style={{ background: G.accent, color: "#fff", borderRadius: 10, fontSize: 11, fontWeight: 700, padding: "1px 7px" }}>8</span>
                  </div>
                  <button onClick={() => setTab("missions")} style={{ background: "none", border: "none", color: G.mint, fontSize: 12, cursor: "pointer", fontFamily: G.sans, display: "flex", alignItems: "center", gap: 4 }}>
                    Voir toutes <ChevronRight size={13} />
                  </button>
                </div>
                {MISSIONS_DEF.slice(0, 4).map(m => (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${G.borderL}` }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: m.free ? G.mintL : G.goldL, border: `1px solid ${m.free ? G.mintB : G.goldB}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <m.Icon size={15} color={m.free ? G.mint : G.gold} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: G.muted }}>Disponible sur les posts du feed</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: m.free ? G.mint : G.gold }}>+{m.cp} CP</span>
                      <button onClick={() => setTab("feed")} style={{ background: G.accent, border: "none", color: "#fff", padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: G.sans }}>
                        Commencer
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Signaux algorithme */}
              <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <TrendingUp size={16} color={G.mint} />
                  <span style={{ fontSize: 14, fontWeight: 700 }}>Signaux Algorithme Etsy/Shopify</span>
                </div>
                {[
                  ["Favoris Etsy générés",   "—",  "Objectif : 50/mois", G.gold],
                  ["Avis vérifiés",          "—",  "Objectif : 15 total", G.mint],
                  ["Sources trafic externe", "—",  "Google te remarque", G.accent],
                  ["Visites boutique",       "—",  "Via le feed CirclUp", G.mint],
                ].map(([label, val, note, color]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${G.borderL}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color }}>{val}</span>
                      </div>
                      <div style={{ fontSize: 10, color: G.faint }}>{note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ FEED TAB ══ */}
          {tab === "feed" && (
            <div className="fade">
              {/* Publish box */}
              <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                {!showForm ? (
                  <div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                      <Avatar initials={initials} color={G.mint} size={36} />
                      <button onClick={() => setShowForm(true)} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}`, borderRadius: 10, padding: "10px 16px", color: G.muted, fontSize: 14, textAlign: "left", cursor: "pointer", fontFamily: G.sans }}>
                        Partage ton produit, une actu, une demande...
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: 8, paddingLeft: 46 }}>
                      {[[Image, "Image"], [Link2, "Lien"], [Target, "Mission"]].map(([Icon, label]) => (
                        <button key={label} onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: `1px solid ${G.border}`, color: G.muted, padding: "6px 12px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontFamily: G.sans }}>
                          <Icon size={13} />{label}
                        </button>
                      ))}
                      <button onClick={() => setShowForm(true)} style={{ marginLeft: "auto", background: G.accent, border: "none", color: "#fff", padding: "6px 18px", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: G.sans, display: "flex", alignItems: "center", gap: 5 }}>
                        <Plus size={14} /> Publier
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <h3 style={{ fontFamily: G.serif, fontSize: 16, fontWeight: 800, margin: 0 }}>Nouveau Post Mission</h3>
                      <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: G.faint }}><X size={18} /></button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={{ fontSize: 10, color: G.muted, display: "block", marginBottom: 5, letterSpacing: 0.7, textTransform: "uppercase" }}>Produit</label>
                        <input placeholder="Nom de ton produit" value={nProduct} onChange={e => setNProduct(e.target.value)} style={inp} />
                      </div>
                      <div>
                        <label style={{ fontSize: 10, color: G.muted, display: "block", marginBottom: 5, letterSpacing: 0.7, textTransform: "uppercase" }}>Prix</label>
                        <input placeholder="14,90€" value={nPrice} onChange={e => setNPrice(e.target.value)} style={inp} />
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 10, color: G.muted, display: "block", marginBottom: 5, letterSpacing: 0.7, textTransform: "uppercase" }}>Ton histoire · {words} mots {words >= 150 ? "✓" : "(150+ = score max)"}</label>
                      <textarea rows={4} placeholder="Raconte l'histoire de ce produit..." value={nStory} onChange={e => setNStory(e.target.value)} style={{ ...inp, resize: "vertical" }} />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 10, color: G.muted, display: "block", marginBottom: 5, letterSpacing: 0.7, textTransform: "uppercase" }}>Ce que tu demandes</label>
                      <input placeholder="Ex: Vos favoris Etsy m'aideraient beaucoup !" value={nAsk} onChange={e => setNAsk(e.target.value)} style={inp} />
                    </div>
                    <div style={{ display: "flex", gap: 9 }}>
                      <button onClick={handlePublish} disabled={!nProduct || !nStory} style={{ background: G.accent, border: "none", color: "#fff", padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: !nProduct || !nStory ? "not-allowed" : "pointer", fontFamily: G.sans, opacity: !nProduct || !nStory ? 0.5 : 1, display: "flex", alignItems: "center", gap: 6 }}>
                        <Zap size={14} /> Publier · +20 CP
                      </button>
                      <button onClick={() => setShowForm(false)} style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.muted, padding: "10px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: G.sans }}>Annuler</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Filtres */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {FEED_FILTERS.map((f, i) => {
                  const active = feedFilter === f.toLowerCase().replace(' ', '-')
                  return (
                    <button key={f} onClick={() => setFeedFilter(f.toLowerCase().replace(' ', '-'))} style={{
                      background: active ? G.accent : "transparent",
                      border: `1px solid ${active ? G.accent : G.border}`,
                      color: active ? "#fff" : G.muted,
                      padding: "7px 16px", borderRadius: 8, cursor: "pointer",
                      fontSize: 13, fontFamily: G.sans, fontWeight: active ? 600 : 400,
                      transition: "all 0.15s",
                    }}>
                      {i === 0 && <span>⭐ </span>}{f}
                    </button>
                  )
                })}
                <button style={{ marginLeft: "auto", background: "transparent", border: `1px solid ${G.border}`, color: G.muted, padding: "7px 12px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontFamily: G.sans }}>
                  <Filter size={13} /> Filtres
                </button>
              </div>

              {loading && <div style={{ textAlign: "center", padding: 48, color: G.muted }}>Chargement...</div>}

              {posts.map((post) => {
                const myMissions = post.missions?.filter(m => m.user_id === user?.id).map(m => m.mission_type) || []
                const authorInit = post.profiles?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'
                const isBookmarked = bookmarked[post.id]
                return (
                  <div key={post.id} className="hov" style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 20, marginBottom: 14 }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <Avatar initials={authorInit} color={G.mint} size={38} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{post.profiles?.name}</div>
                          <div style={{ fontSize: 11, color: G.muted }}>{post.profiles?.shop_name} · {new Date(post.created_at).toLocaleDateString('fr-FR')}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ScoreRing score={post.score} />
                        {post.price && <div style={{ background: G.accentL, border: `1px solid ${G.accentB}`, borderRadius: 7, padding: "5px 11px", fontFamily: G.serif, fontSize: 15, fontWeight: 800, color: G.accent }}>{post.price}</div>}
                      </div>
                    </div>

                    <div style={{ fontFamily: G.serif, fontSize: 17, fontWeight: 800, marginBottom: 6 }}>{post.product}</div>
                    <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.75, marginBottom: 12 }}>{post.story?.length > 180 ? post.story.slice(0, 180) + "…" : post.story}</p>

                    {post.ask && (
                      <div style={{ background: G.mintL, border: `1px solid ${G.mintB}`, borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: G.mint, display: "flex", gap: 7, alignItems: "center" }}>
                        <MessageCircle size={12} color={G.mint} /> "{post.ask}"
                      </div>
                    )}

                    {/* Stats */}
                    <div style={{ display: "flex", gap: 14, padding: "8px 0", borderTop: `1px solid ${G.borderL}`, borderBottom: `1px solid ${G.borderL}`, marginBottom: 12 }}>
                      {[[Star, post.favorites_count, "favoris", G.gold], [Share2, post.shares_count, "partages", G.mint], [Search, post.reviews_count, "avis", G.accent], [ShoppingBag, post.buys_count, "achats", G.mint]].map(([Icon, val, label, color]) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Icon size={12} color={color} />
                          <span style={{ fontSize: 13, fontWeight: 700, color }}>{val || 0}</span>
                          <span style={{ fontSize: 10, color: G.faint }}>{label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Missions 2×4 */}
                    {[MISSIONS_DEF.slice(0, 4), MISSIONS_DEF.slice(4)].map((row, ri) => (
                      <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 6 }}>
                        {row.map(m => {
                          const done = myMissions.includes(m.id)
                          const color = done ? G.mint : m.free ? G.muted : G.gold
                          return (
                            <button key={m.id} onClick={() => !done && handleMission(post.id, m.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: done ? `${G.mint}10` : m.free ? G.card : G.goldL, border: `1px solid ${done ? G.mintB : m.free ? G.border : G.goldB}`, borderRadius: 8, padding: "8px 5px", opacity: done ? 0.55 : 1, cursor: done ? "default" : "pointer", fontFamily: G.sans, transition: "all 0.15s" }}>
                              <m.Icon size={14} color={color} />
                              <span style={{ fontSize: 9, color }}>{done ? "Fait" : m.label.split(' ')[0]}</span>
                              {!done && <span style={{ fontSize: 9, color: m.free ? G.mint : G.gold, fontWeight: 700 }}>+{m.cp}CP</span>}
                            </button>
                          )
                        })}
                      </div>
                    ))}

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 7, paddingTop: 10, borderTop: `1px solid ${G.borderL}`, marginTop: 6 }}>
                      <button onClick={() => likePost(post.id)} style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: `1px solid ${G.border}`, color: G.muted, padding: "6px 12px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontFamily: G.sans }}>
                        <Heart size={13} /> {post.likes_count || 0}
                      </button>
                      <button onClick={() => setBookmarked(b => ({ ...b, [post.id]: !b[post.id] }))} style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: `1px solid ${isBookmarked ? G.goldB : G.border}`, color: isBookmarked ? G.gold : G.muted, padding: "6px 12px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontFamily: G.sans }}>
                        <Bookmark size={13} fill={isBookmarked ? G.gold : "none"} />
                      </button>
                      {post.profiles?.shop_url && (
                        <a href={post.profiles.shop_url} target="_blank" rel="noreferrer" style={{ marginLeft: "auto", background: G.mintL, border: `1px solid ${G.mintB}`, color: G.mint, padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                          Voir la boutique <ExternalLink size={11} />
                        </a>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: post.profiles?.shop_url ? 0 : "auto" }}>
                        <span style={{ fontSize: 12, color: G.gold, fontWeight: 700 }}>+{MISSIONS_DEF.filter(m => !post.missions?.find(x => x.user_id === user?.id && x.mission_type === m.id)).reduce((a, m) => a + m.cp, 0)} CP disponibles</span>
                      </div>
                    </div>
                  </div>
                )
              })}

              {posts.length === 0 && !loading && (
                <div style={{ textAlign: "center", padding: "48px 24px", background: G.card, border: `1px solid ${G.border}`, borderRadius: 16 }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
                  <h3 style={{ fontFamily: G.serif, fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Le feed est vide pour l'instant</h3>
                  <p style={{ fontSize: 14, color: G.muted, marginBottom: 20 }}>Sois le premier à publier un post et invite des membres dans ton cercle.</p>
                  <button onClick={() => setShowForm(true)} style={{ background: G.accent, border: "none", color: "#fff", padding: "11px 24px", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: G.sans }}>Publier mon premier post</button>
                </div>
              )}
            </div>
          )}

          {/* ══ MISSIONS TAB ══ */}
          {tab === "missions" && (
            <div className="fade">
              <div style={{ background: G.mintL, border: `1px solid ${G.mintB}`, borderRadius: 12, padding: 14, marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Target size={15} color={G.mint} style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: G.mint, lineHeight: 1.7, margin: 0 }}>Fais des missions pour les autres → gagne des CP → booste ta visibilité. L'achat est un bonus, jamais une obligation.</p>
              </div>
              {posts.slice(0, 3).map(post => {
                const myMissions = post.missions?.filter(m => m.user_id === user?.id).map(m => m.mission_type) || []
                const completedCount = myMissions.length
                const authorInit = post.profiles?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'
                return (
                  <div key={post.id} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 20, marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <Avatar initials={authorInit} color={G.mint} size={38} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{post.profiles?.name} · {post.profiles?.shop_name}</div>
                        <div style={{ fontFamily: G.serif, fontSize: 12, color: G.muted, fontStyle: "italic" }}>"{post.product}"</div>
                      </div>
                      <ScoreRing score={post.score} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {MISSIONS_DEF.map(m => {
                        const done = myMissions.includes(m.id)
                        return (
                          <button key={m.id} onClick={() => !done && handleMission(post.id, m.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: done ? `${G.mint}10` : m.free ? G.card : G.goldL, border: `1px solid ${done ? G.mintB : m.free ? G.border : G.goldB}`, borderRadius: 9, padding: "10px 13px", opacity: done ? 0.6 : 1, cursor: done ? "default" : "pointer", fontFamily: G.sans }}>
                            <m.Icon size={16} color={done ? G.mint : m.free ? G.muted : G.gold} />
                            <span style={{ flex: 1, textAlign: "left", fontSize: 13, fontWeight: 600, color: done ? G.mint : G.text }}>{m.label}</span>
                            {done ? <span style={{ fontSize: 11, color: G.mint, fontWeight: 700 }}>✓ Fait</span> : <span style={{ fontSize: 11, color: m.free ? G.mint : G.gold, fontWeight: 700, background: m.free ? G.mintL : G.goldL, border: `1px solid ${m.free ? G.mintB : G.goldB}`, borderRadius: 5, padding: "2px 8px" }}>+{m.cp} CP</span>}
                          </button>
                        )
                      })}
                    </div>
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${G.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 10, color: G.muted }}>Progression</span>
                        <span style={{ fontSize: 10, color: G.mint, fontWeight: 700 }}>{completedCount}/{MISSIONS_DEF.length}</span>
                      </div>
                      <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
                        <div style={{ width: `${completedCount / MISSIONS_DEF.length * 100}%`, height: "100%", background: `linear-gradient(90deg,${G.mint},${G.accent})`, borderRadius: 2, transition: "width 0.4s" }} />
                      </div>
                    </div>
                  </div>
                )
              })}
              {posts.length === 0 && <div style={{ textAlign: "center", padding: 40, color: G.muted }}>Aucun post dans le feed pour l'instant.</div>}
            </div>
          )}

          {/* ══ CERCLE TAB ══ */}
          {tab === "cercle" && (
            <div className="fade">
              <div style={{ background: G.mintL, border: `1px solid ${G.mintB}`, borderRadius: 12, padding: 14, marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Users size={15} color={G.mint} style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: G.mint, lineHeight: 1.7, margin: 0 }}><strong>Règle :</strong> Aide les autres via les missions chaque semaine. L'achat est un bonus. La réciprocité naturelle fait le reste.</p>
              </div>
              <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 32, textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: G.mintL, border: `1px solid ${G.mintB}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                  <Users size={26} color={G.mint} />
                </div>
                <h3 style={{ fontFamily: G.serif, fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Cercle Alpha</h3>
                <p style={{ fontSize: 14, color: G.muted, marginBottom: 20, lineHeight: 1.7 }}>Tu seras assigné à un cercle dès que 10 membres de ta niche sont inscrits.</p>
                <div style={{ background: G.accentL, border: `1px solid ${G.accentB}`, borderRadius: 10, padding: "12px 18px", display: "inline-block" }}>
                  <span style={{ fontSize: 13, color: G.accent }}>Ta niche : <strong>{profile?.niche || 'Non définie'}</strong></span>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ── RIGHT SIDEBAR ── */}
        <aside style={{ width: 260, padding: "24px 16px", borderLeft: `1px solid ${G.border}`, position: "sticky", top: 0, height: "100vh", overflowY: "auto", flexShrink: 0, background: G.bg3 }}>

          {/* Ta boutique */}
          <div style={{ fontSize: 10, color: G.faint, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>Ta Boutique</div>
          <div className="hov" style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: 14, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{profile?.shop_name || '—'}</div>
            {profile?.shop_url && <a href={profile.shop_url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: G.mint, display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>Voir ma boutique <ExternalLink size={10} /></a>}
            <div style={{ fontSize: 10, color: G.muted }}>Niche : <span style={{ color: G.text }}>{profile?.niche || '—'}</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
              {[["Visites", "—"], ["Favoris", "—"]].map(([label, val]) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 9, color: G.faint, marginBottom: 3 }}>{label}</div>
                  <div style={{ fontFamily: G.serif, fontSize: 16, fontWeight: 900, color: G.mint }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top membres */}
          <div style={{ fontSize: 10, color: G.faint, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>Top Membres cette semaine</div>
          <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: "8px 0", marginBottom: 20 }}>
            {TOP_MEMBRES.map((m, i) => (
              <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderBottom: i < TOP_MEMBRES.length - 1 ? `1px solid ${G.borderL}` : "none" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: i === 0 ? G.gold : G.faint, width: 14, textAlign: "center" }}>{i + 1}</span>
                <Avatar initials={m.init} color={m.color} size={28} />
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    {m.name} {m.crown && <Crown size={10} color={G.gold} />}
                  </div>
                </div>
                <span style={{ fontSize: 11, color: G.gold, fontWeight: 700 }}>{m.cp}</span>
              </div>
            ))}
            <button style={{ width: "100%", background: "none", border: "none", color: G.mint, fontSize: 12, cursor: "pointer", padding: "10px", fontFamily: G.sans, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              Voir le classement <ChevronRight size={13} />
            </button>
          </div>

          {/* Rappels du jour */}
          <div style={{ fontSize: 10, color: G.faint, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>Rappels du jour</div>
          <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
            {[
              [Star, "Ajouter 3 favoris", "+15 CP", false],
              [MessageCircle, "Laisser 2 commentaires", "+12 CP", true],
              [Share2, "Partager 1 post", "+10 CP", true],
            ].map(([Icon, label, cp, done]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: `1px solid ${G.borderL}` }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: done ? G.mint : "rgba(255,255,255,0.07)", border: `1px solid ${done ? G.mint : G.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {done && <span style={{ fontSize: 9, color: "#18251f", fontWeight: 900 }}>✓</span>}
                </div>
                <span style={{ flex: 1, fontSize: 12, color: done ? G.muted : G.text, textDecoration: done ? "line-through" : "none" }}>{label}</span>
                <span style={{ fontSize: 11, color: done ? G.faint : G.mint, fontWeight: 700 }}>{cp}</span>
              </div>
            ))}
            {/* Progress */}
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
                <div style={{ width: "66%", height: "100%", background: G.mint, borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 11, color: G.mint, fontWeight: 700 }}>2/3</span>
            </div>
          </div>

          {/* Conseil du jour */}
          <div style={{ background: G.accentL, border: `1px solid ${G.accentB}`, borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 10, color: G.accent, fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
              <Zap size={11} color={G.accent} /> Conseil du jour
            </div>
            <p style={{ fontSize: 12, color: G.muted, lineHeight: 1.65, margin: 0 }}>
              Un post avec une vraie histoire personnelle reçoit 3× plus de missions. Prends 5 min pour bien écrire la tienne.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
