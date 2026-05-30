import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { usePosts } from '../hooks/usePosts'
import { supabase } from '../lib/supabase'
import {
  Star, Eye, Heart, MessageCircle, Share2, Pin, Search, ShoppingBag,
  Home, Target, RefreshCw, BarChart2, Bell, LogOut, Zap,
  Plus, X, TrendingUp, ChevronRight, ExternalLink, Users
} from 'lucide-react'

const G = {
  bg: "#1a2420", bg2: "#1f2e28",
  card: "rgba(255,255,255,0.038)",
  border: "rgba(255,255,255,0.075)", accentB: "rgba(224,92,75,0.32)",
  accent: "#e05c4b", accentL: "rgba(224,92,75,0.13)",
  mint: "#7ecfc0", mintL: "rgba(126,207,192,0.11)", mintB: "rgba(126,207,192,0.28)",
  gold: "#d4a84b", goldL: "rgba(212,168,75,0.13)", goldB: "rgba(212,168,75,0.3)",
  text: "#f0ebe3", muted: "rgba(240,235,227,0.48)", faint: "rgba(240,235,227,0.2)",
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

const NAV_TABS = [
  { id: "feed",      Icon: Home,     label: "Feed" },
  { id: "missions",  Icon: Target,   label: "Missions" },
  { id: "cercle",    Icon: Users,    label: "Cercle" },
  { id: "dashboard", Icon: BarChart2, label: "Dashboard" },
]

function Avatar({ initials, color, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `radial-gradient(circle at 33% 33%, ${color}ee, ${color}55)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.3, fontWeight: 700, color: "#18251f",
      fontFamily: G.sans, boxShadow: `0 3px 10px ${color}40`,
    }}>
      {initials}
    </div>
  )
}

function ScoreRing({ score }) {
  const color = score >= 80 ? G.mint : score >= 60 ? G.gold : G.accent
  const r = 19
  const circ = 2 * Math.PI * r
  return (
    <div style={{ position: "relative", width: 46, height: 46, flexShrink: 0 }}>
      <svg width={46} height={46} viewBox="0 0 46 46">
        <circle cx={23} cy={23} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={3.5} />
        <circle cx={23} cy={23} r={r} fill="none" stroke={color} strokeWidth={3.5}
          strokeDasharray={`${circ * score / 100} ${circ}`}
          strokeLinecap="round" transform="rotate(-90 23 23)" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 800, color }}>{score}</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const { posts, loading, createPost, doMission, likePost } = usePosts()
  const [tab, setTab]             = useState("feed")
  const [notifs, setNotifs]       = useState([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [cpAnim, setCpAnim]       = useState(null)
  const [showForm, setShowForm]   = useState(false)

  const [nProduct, setNProduct] = useState("")
  const [nPrice, setNPrice]     = useState("")
  const [nStory, setNStory]     = useState("")
  const [nAsk, setNAsk]         = useState("")

  useEffect(() => { if (user) fetchNotifs() }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

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
  const words = nStory.trim().split(/\s+/).filter(Boolean).length

  const rankProgress = () => {
    const cp = profile?.cp || 0
    if (cp < 100) return { next: "Builder", pct: cp, max: 100 }
    if (cp < 300) return { next: "Booster", pct: cp - 100, max: 200 }
    if (cp < 700) return { next: "Leader",  pct: cp - 300, max: 400 }
    return { next: "Max", pct: 100, max: 100 }
  }
  const rp = rankProgress()

  const inp = {
    width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`,
    borderRadius: 10, padding: "12px 15px", color: G.text, fontSize: 14,
    outline: "none", fontFamily: G.sans, boxSizing: "border-box",
  }

  return (
    <div style={{ minHeight: "100vh", background: G.bg, fontFamily: G.sans, color: G.text, display: "flex", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: rgba(240,235,227,0.3); }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes cpFlash { 0% { opacity:0; transform:translateY(8px); } 20% { opacity:1; } 80% { opacity:1; } 100% { opacity:0; transform:translateY(-28px); } }
        .fade { animation: fadeUp 0.35s ease both; }
        .card-hover { transition: border-color 0.15s, transform 0.15s; }
        .card-hover:hover { border-color: rgba(126,207,192,0.2) !important; transform: translateY(-1px); }
      `}</style>

      {/* CP Flash */}
      {cpAnim && (
        <div style={{
          position: "fixed", top: 72, right: 28, zIndex: 1000,
          animation: "cpFlash 1.6s ease forwards", pointerEvents: "none",
        }}>
          <div style={{
            background: G.gold, borderRadius: 10, padding: "9px 16px",
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: `0 6px 22px rgba(212,168,75,0.45)`,
          }}>
            <Zap size={15} color="#18251f" fill="#18251f" />
            <span style={{ fontWeight: 800, color: "#18251f", fontSize: 14 }}>+{cpAnim.amount} CP</span>
            <span style={{ fontSize: 11, color: "rgba(24,37,31,0.65)" }}>{cpAnim.label}</span>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 220, background: "rgba(0,0,0,0.15)", borderRight: `1px solid ${G.border}`,
        padding: "22px 14px", display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh", flexShrink: 0, overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 32, paddingLeft: 4 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: `linear-gradient(135deg, ${G.accent}, #c94535)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <RefreshCw size={15} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontFamily: G.serif, fontSize: 16, fontWeight: 800 }}>CirclUp</div>
            <div style={{ fontSize: 9, color: G.faint, letterSpacing: 0.8 }}>v1.0 · BETA</div>
          </div>
        </div>

        {/* Nav */}
        {NAV_TABS.map(({ id, Icon, label }) => {
          const active = tab === id
          return (
            <button key={id} onClick={() => setTab(id)} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: active ? `${G.accent}18` : "transparent",
              border: active ? `1px solid ${G.accentB}` : "1px solid transparent",
              color: active ? G.accent : G.muted,
              padding: "10px 12px", borderRadius: 9, cursor: "pointer",
              fontSize: 13, textAlign: "left", marginBottom: 3, width: "100%",
              fontFamily: G.sans, fontWeight: active ? 600 : 400, transition: "all 0.15s",
            }}>
              <Icon size={15} />
              <span>{label}</span>
            </button>
          )
        })}

        <div style={{ marginTop: "auto" }}>
          {/* CP counter */}
          <div style={{ background: G.goldL, border: `1px solid ${G.goldB}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Zap size={11} color={G.gold} />
                <span style={{ fontSize: 10, color: G.gold, fontWeight: 700, letterSpacing: 0.5 }}>CRÉDITS CP</span>
              </div>
              <span style={{ fontFamily: G.serif, fontSize: 20, fontWeight: 800, color: G.gold }}>{profile?.cp || 0}</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
              <div style={{
                width: `${Math.min(rp.pct / rp.max * 100, 100)}%`, height: "100%",
                background: `linear-gradient(90deg,${G.gold},${G.accent})`, borderRadius: 2, transition: "width 0.4s",
              }} />
            </div>
            <div style={{ fontSize: 9, color: G.faint, marginTop: 5 }}>
              {profile?.rank || 'Starter'} · {rp.next !== "Max" ? `${rp.max - rp.pct} CP → ${rp.next}` : "Rang max !"}
            </div>
          </div>

          {/* User card */}
          <div style={{
            display: "flex", alignItems: "center", gap: 9, padding: "10px 11px",
            background: G.card, borderRadius: 10, border: `1px solid ${G.border}`, marginBottom: 8,
          }}>
            <Avatar initials={initials} color={G.mint} size={30} />
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile?.name || 'Membre'}</div>
              <div style={{ fontSize: 10, color: G.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile?.shop_name || ''}</div>
            </div>
          </div>

          <button onClick={signOut} style={{
            width: "100%", background: "transparent", border: `1px solid ${G.border}`,
            color: G.faint, padding: "8px", borderRadius: 8, cursor: "pointer",
            fontSize: 11, fontFamily: G.sans, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            transition: "border-color 0.15s",
          }}>
            <LogOut size={12} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", maxWidth: 720 }}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: G.serif, fontSize: 24, fontWeight: 900, margin: "0 0 3px" }}>
              {tab === "feed"      && "Feed CirclUp"}
              {tab === "missions"  && "Mes Missions"}
              {tab === "cercle"    && "Mon Cercle"}
              {tab === "dashboard" && "Mon Dashboard"}
            </h1>
            <p style={{ fontSize: 11, color: G.muted }}>Bienvenue {profile?.name?.split(' ')[0] || ''}</p>
          </div>
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
            {/* Notifications */}
            <div style={{ position: "relative" }}>
              <button onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markNotifsRead() }} style={{
                background: G.card, border: `1px solid ${G.border}`, color: G.text,
                width: 36, height: 36, borderRadius: 9,
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}>
                <Bell size={16} />
              </button>
              {unreadCount > 0 && (
                <div style={{
                  position: "absolute", top: -3, right: -3, width: 14, height: 14,
                  borderRadius: "50%", background: G.accent, fontSize: 8, fontWeight: 800,
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {unreadCount}
                </div>
              )}
              {notifOpen && (
                <div style={{
                  position: "absolute", right: 0, top: 44, width: 300,
                  background: G.bg2, border: `1px solid ${G.border}`,
                  borderRadius: 14, padding: 14, zIndex: 200, boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: G.muted, marginBottom: 12 }}>Notifications</div>
                  {notifs.length === 0 && (
                    <div style={{ fontSize: 13, color: G.faint, textAlign: "center", padding: "12px 0" }}>Aucune notification</div>
                  )}
                  {notifs.map((n, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 9, padding: "9px 0",
                      borderBottom: i < notifs.length - 1 ? `1px solid ${G.border}` : "none",
                      opacity: n.is_read ? 0.5 : 1,
                    }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 7, background: G.mintL,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <Bell size={13} color={G.mint} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: n.is_read ? 400 : 600 }}>{n.message}</div>
                        <div style={{ fontSize: 10, color: G.faint, marginTop: 2 }}>{new Date(n.created_at).toLocaleDateString('fr-FR')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {tab === "feed" && (
              <button onClick={() => setShowForm(!showForm)} style={{
                background: G.accent, border: "none", color: "#fff",
                padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: G.sans,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <Plus size={15} /> Publier
              </button>
            )}
          </div>
        </div>

        {/* ── FEED ── */}
        {tab === "feed" && (
          <div className="fade">
            {showForm && (
              <div style={{ background: G.card, border: `1px solid ${G.accentB}`, borderRadius: 18, padding: 24, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontFamily: G.serif, fontSize: 18, fontWeight: 800, marginBottom: 3 }}>Nouveau Post Mission</h3>
                    <p style={{ fontSize: 11, color: G.muted }}>Une vraie histoire = plus de missions = plus de signaux algorithme</p>
                  </div>
                  <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: G.faint }}>
                    <X size={18} />
                  </button>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 10, color: G.muted, display: "block", marginBottom: 6, letterSpacing: 0.7, textTransform: "uppercase" }}>Produit</label>
                  <input placeholder="Nom de ton produit" value={nProduct} onChange={e => setNProduct(e.target.value)} style={inp} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 10, color: G.muted, display: "block", marginBottom: 6, letterSpacing: 0.7, textTransform: "uppercase" }}>Prix</label>
                  <input placeholder="14,90€" value={nPrice} onChange={e => setNPrice(e.target.value)} style={{ ...inp, width: "35%" }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 10, color: G.muted, display: "block", marginBottom: 6, letterSpacing: 0.7, textTransform: "uppercase" }}>
                    Ton histoire · {words} mots {words >= 150 ? "· Score max ✓" : "· 150+ mots = score max"}
                  </label>
                  <textarea rows={5} placeholder="Raconte l'histoire de ce produit — ton inspiration, comment tu l'as créé, ce qui le rend unique..." value={nStory} onChange={e => setNStory(e.target.value)} style={{ ...inp, resize: "vertical" }} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 10, color: G.muted, display: "block", marginBottom: 6, letterSpacing: 0.7, textTransform: "uppercase" }}>Ce que tu demandes</label>
                  <input placeholder="Ex: Vos favoris Etsy m'aideraient énormément !" value={nAsk} onChange={e => setNAsk(e.target.value)} style={inp} />
                </div>
                <div style={{ display: "flex", gap: 9 }}>
                  <button onClick={handlePublish} disabled={!nProduct || !nStory} style={{
                    background: G.accent, border: "none", color: "#fff",
                    padding: "11px 24px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                    cursor: !nProduct || !nStory ? "not-allowed" : "pointer",
                    fontFamily: G.sans, opacity: !nProduct || !nStory ? 0.5 : 1,
                    display: "flex", alignItems: "center", gap: 7,
                  }}>
                    <Zap size={14} /> Publier · +20 CP
                  </button>
                  <button onClick={() => setShowForm(false)} style={{
                    background: "transparent", border: `1px solid ${G.border}`,
                    color: G.muted, padding: "11px 18px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: G.sans,
                  }}>
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: "center", padding: 48, color: G.muted }}>
                <RefreshCw size={20} color={G.muted} style={{ marginBottom: 12, display: "block", margin: "0 auto 12px" }} />
                Chargement du feed...
              </div>
            )}

            {posts.map((post) => {
              const myMissions = post.missions?.filter(m => m.user_id === user?.id).map(m => m.mission_type) || []
              const authorInit = post.profiles?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'
              return (
                <div key={post.id} className="card-hover" style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 18, padding: 22, marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <Avatar initials={authorInit} color={G.mint} size={40} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{post.profiles?.name}</div>
                        <div style={{ fontSize: 11, color: G.muted, marginTop: 1 }}>
                          {post.profiles?.shop_name} · {new Date(post.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <ScoreRing score={post.score} />
                      {post.price && (
                        <div style={{
                          background: G.accentL, border: `1px solid ${G.accentB}`,
                          borderRadius: 8, padding: "6px 13px",
                          fontFamily: G.serif, fontSize: 16, fontWeight: 800, color: G.accent,
                        }}>
                          {post.price}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ fontFamily: G.serif, fontSize: 16, fontWeight: 800, marginBottom: 7 }}>{post.product}</div>
                  <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.75, marginBottom: 10 }}>
                    {post.story?.length > 200 ? post.story.slice(0, 200) + "…" : post.story}
                  </p>

                  {post.ask && (
                    <div style={{
                      background: G.mintL, border: `1px solid ${G.mintB}`,
                      borderRadius: 8, padding: "9px 13px", marginBottom: 12,
                      fontSize: 12, color: G.mint, fontStyle: "italic",
                      display: "flex", alignItems: "center", gap: 7,
                    }}>
                      <MessageCircle size={13} color={G.mint} />
                      "{post.ask}"
                    </div>
                  )}

                  {/* Stats */}
                  <div style={{ display: "flex", gap: 16, padding: "9px 0", borderTop: `1px solid ${G.border}`, borderBottom: `1px solid ${G.border}`, marginBottom: 12 }}>
                    {[
                      [Star,         post.favorites_count, "favoris"],
                      [Share2,       post.shares_count,    "partages"],
                      [Search,       post.reviews_count,   "avis"],
                      [ShoppingBag,  post.buys_count,      "achats"],
                    ].map(([Icon, val, label]) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Icon size={12} color={G.muted} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: G.mint }}>{val || 0}</span>
                        <span style={{ fontSize: 10, color: G.faint }}>{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Mission buttons — 2 rows of 4 */}
                  {[MISSIONS_DEF.slice(0, 4), MISSIONS_DEF.slice(4)].map((row, rowIdx) => (
                    <div key={rowIdx} style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 6 }}>
                      {row.map(m => {
                        const done = myMissions.includes(m.id)
                        const color = done ? G.mint : m.free ? G.muted : G.gold
                        return (
                          <button key={m.id} onClick={() => !done && handleMission(post.id, m.id)} style={{
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                            background: done ? `${G.mint}10` : m.free ? G.card : G.goldL,
                            border: `1px solid ${done ? G.mintB : m.free ? G.border : G.goldB}`,
                            borderRadius: 8, padding: "8px 5px",
                            opacity: done ? 0.55 : 1,
                            cursor: done ? "default" : "pointer", fontFamily: G.sans,
                            transition: "border-color 0.15s",
                          }}>
                            <m.Icon size={14} color={color} />
                            <span style={{ fontSize: 9, color }}>{done ? "Fait" : m.label.split(' ')[0]}</span>
                            {!done && <span style={{ fontSize: 9, color: m.free ? G.mint : G.gold, fontWeight: 700 }}>+{m.cp}CP</span>}
                          </button>
                        )
                      })}
                    </div>
                  ))}

                  <div style={{ display: "flex", gap: 7, paddingTop: 12, borderTop: `1px solid ${G.border}`, marginTop: 6 }}>
                    <button onClick={() => likePost(post.id)} style={{
                      display: "flex", alignItems: "center", gap: 5,
                      background: G.card, border: `1px solid ${G.border}`,
                      color: G.muted, padding: "7px 13px", borderRadius: 7,
                      cursor: "pointer", fontSize: 12, fontFamily: G.sans,
                    }}>
                      <Heart size={13} /> {post.likes_count || 0}
                    </button>
                    {post.profiles?.shop_url && (
                      <a href={post.profiles.shop_url} target="_blank" rel="noreferrer" style={{
                        marginLeft: "auto", background: G.mintL, border: `1px solid ${G.mintB}`,
                        color: G.mint, padding: "7px 16px", borderRadius: 7,
                        fontSize: 12, fontWeight: 600, textDecoration: "none",
                        display: "flex", alignItems: "center", gap: 5,
                      }}>
                        Voir la boutique <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── MISSIONS ── */}
        {tab === "missions" && (
          <div className="fade">
            <div style={{ background: G.mintL, border: `1px solid ${G.mintB}`, borderRadius: 12, padding: 16, marginBottom: 24, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Target size={16} color={G.mint} style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: G.mint, lineHeight: 1.7, margin: 0 }}>
                Fais des missions pour les autres, gagne des CP, booste ta visibilité dans le feed. L'achat est un bonus, jamais une obligation.
              </p>
            </div>
            {posts.slice(0, 3).map(post => {
              const myMissions = post.missions?.filter(m => m.user_id === user?.id).map(m => m.mission_type) || []
              const completedCount = myMissions.length
              const authorInit = post.profiles?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'
              return (
                <div key={post.id} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 22, marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <Avatar initials={authorInit} color={G.mint} size={38} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{post.profiles?.name} · {post.profiles?.shop_name}</div>
                      <div style={{ fontFamily: G.serif, fontSize: 12, color: G.muted, marginTop: 1, fontStyle: "italic" }}>"{post.product}"</div>
                    </div>
                    <ScoreRing score={post.score} />
                  </div>
                  {post.ask && (
                    <div style={{ background: G.accentL, border: `1px solid ${G.accentB}`, borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 12, color: G.accent, display: "flex", gap: 7, alignItems: "center" }}>
                      <MessageCircle size={13} color={G.accent} />
                      {post.ask}
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {MISSIONS_DEF.map(m => {
                      const done = myMissions.includes(m.id)
                      return (
                        <button key={m.id} onClick={() => !done && handleMission(post.id, m.id)} style={{
                          display: "flex", alignItems: "center", gap: 10, width: "100%",
                          background: done ? `${G.mint}10` : m.free ? G.card : G.goldL,
                          border: `1px solid ${done ? G.mintB : m.free ? G.border : G.goldB}`,
                          borderRadius: 9, padding: "10px 13px",
                          opacity: done ? 0.6 : 1, cursor: done ? "default" : "pointer", fontFamily: G.sans,
                          transition: "border-color 0.15s",
                        }}>
                          <m.Icon size={16} color={done ? G.mint : m.free ? G.muted : G.gold} />
                          <span style={{ flex: 1, textAlign: "left", fontSize: 13, fontWeight: 600, color: done ? G.mint : G.text }}>{m.label}</span>
                          {done
                            ? <span style={{ fontSize: 11, color: G.mint, fontWeight: 700 }}>Fait</span>
                            : <span style={{
                                fontSize: 11, color: m.free ? G.mint : G.gold, fontWeight: 700,
                                background: m.free ? G.mintL : G.goldL,
                                border: `1px solid ${m.free ? G.mintB : G.goldB}`,
                                borderRadius: 5, padding: "2px 8px",
                              }}>
                                +{m.cp} CP
                              </span>
                          }
                        </button>
                      )
                    })}
                  </div>
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${G.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 10, color: G.muted }}>Progression missions</span>
                      <span style={{ fontSize: 10, color: G.mint, fontWeight: 700 }}>{completedCount}/{MISSIONS_DEF.length}</span>
                    </div>
                    <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
                      <div style={{
                        width: `${completedCount / MISSIONS_DEF.length * 100}%`, height: "100%",
                        background: `linear-gradient(90deg,${G.mint},${G.accent})`,
                        borderRadius: 2, transition: "width 0.4s",
                      }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div className="fade">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 18 }}>
              {[
                [TrendingUp, "Ventes estimées",   "—",             `Déclarées sur CirclUp`, G.accent],
                [Star,       "Favoris reçus",      "—",             "Sur tes produits",      G.gold],
                [Share2,     "Partages reçus",     "—",             "Via les missions",      G.mint],
                [Zap,        "Crédits CP",         profile?.cp || 0, `Rang : ${profile?.rank || 'Starter'}`, G.gold],
              ].map(([Icon, label, val, sub, color]) => (
                <div key={label} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, padding: 20 }}>
                  <div style={{ marginBottom: 10 }}>
                    <Icon size={20} color={color} />
                  </div>
                  <div style={{ fontSize: 10, color: G.muted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
                  <div style={{ fontFamily: G.serif, fontSize: 30, fontWeight: 900, color }}>{val}</div>
                  <div style={{ fontSize: 10, color: G.faint, marginTop: 5 }}>{sub}</div>
                </div>
              ))}
            </div>

            <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                <TrendingUp size={18} color={G.mint} />
                <h3 style={{ fontFamily: G.serif, fontSize: 18, fontWeight: 800 }}>Signaux Algorithme</h3>
              </div>
              <p style={{ fontSize: 11, color: G.muted, marginBottom: 16 }}>Ce que CirclUp génère pour booster ton référencement Etsy/Shopify</p>
              {[
                [Star,         "Favoris Etsy générés",    "—", "Objectif : 50/mois"],
                [Search,       "Avis vérifiés",           "—", "Objectif : 15 total"],
                [Share2,       "Sources trafic externe",  "—", "Google te remarque"],
                [Eye,          "Visites boutique",        "—", "Via le feed CirclUp"],
              ].map(([Icon, label, val, note]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: `1px solid ${G.border}` }}>
                  <Icon size={16} color={G.muted} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: G.mint }}>{val}</span>
                    </div>
                    <div style={{ fontSize: 10, color: G.faint }}>{note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CERCLE ── */}
        {tab === "cercle" && (
          <div className="fade">
            <div style={{ background: G.mintL, border: `1px solid ${G.mintB}`, borderRadius: 12, padding: 15, marginBottom: 22, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <RefreshCw size={15} color={G.mint} style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: G.mint, lineHeight: 1.7, margin: 0 }}>
                <strong>Règle :</strong> Aide les autres via les missions chaque semaine. L'achat est un bonus. La réciprocité naturelle fait le reste.
              </p>
            </div>
            <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 32, textAlign: "center" }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: G.mintL, border: `1px solid ${G.mintB}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 18px",
              }}>
                <Users size={26} color={G.mint} />
              </div>
              <h3 style={{ fontFamily: G.serif, fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Cercle Alpha</h3>
              <p style={{ fontSize: 14, color: G.muted, marginBottom: 20, lineHeight: 1.7 }}>
                Tu seras assigné à un cercle dès que 10 membres de ta niche sont inscrits.
              </p>
              <div style={{ background: G.accentL, border: `1px solid ${G.accentB}`, borderRadius: 10, padding: "12px 18px", display: "inline-block" }}>
                <span style={{ fontSize: 13, color: G.accent }}>Ta niche : <strong>{profile?.niche || 'Non définie'}</strong></span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── RIGHT ASIDE ── */}
      <aside style={{
        width: 220, padding: "28px 16px",
        borderLeft: `1px solid ${G.border}`,
        position: "sticky", top: 0, height: "100vh", overflowY: "auto", flexShrink: 0,
      }}>
        <div style={{ fontSize: 10, color: G.faint, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
          <BarChart2 size={11} color={G.faint} /> Ta boutique
        </div>
        <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{profile?.shop_name || '—'}</div>
          {profile?.shop_url && (
            <a href={profile.shop_url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: G.mint, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              Voir ma boutique <ExternalLink size={10} />
            </a>
          )}
          <div style={{ marginTop: 10, fontSize: 10, color: G.muted }}>Niche : {profile?.niche || '—'}</div>
        </div>

        <div style={{ fontSize: 10, color: G.faint, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
          <Zap size={11} color={G.faint} /> Actions rapides
        </div>
        {[
          [Star,         "Ajouter un favori",  5],
          [Pin,          "Épingler Pinterest", 8],
          [MessageCircle,"Commenter un post",  6],
        ].map(([Icon, label, cp]) => (
          <div key={label} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "9px 11px",
            background: G.card, border: `1px solid ${G.border}`, borderRadius: 8,
            marginBottom: 6, cursor: "pointer", transition: "border-color 0.15s",
          }}>
            <Icon size={14} color={G.muted} />
            <span style={{ flex: 1, fontSize: 11, color: G.muted }}>{label}</span>
            <span style={{ fontSize: 10, color: G.mint, fontWeight: 700 }}>+{cp}CP</span>
          </div>
        ))}

        <div style={{ marginTop: 18, background: G.accentL, border: `1px solid ${G.accentB}`, borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 10, color: G.accent, fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
            <Zap size={11} color={G.accent} /> Conseil du jour
          </div>
          <p style={{ fontSize: 11, color: G.muted, lineHeight: 1.65, margin: 0 }}>
            Un post avec une vraie histoire personnelle reçoit 3x plus de missions. Prends 5 min pour bien écrire la tienne.
          </p>
        </div>
      </aside>
    </div>
  )
}
