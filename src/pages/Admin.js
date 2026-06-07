import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Users, FileText, Target, Zap, LogOut, RefreshCw, Trash2, Shield, TrendingUp, Circle } from 'lucide-react'

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

const TABS = [
  { id: "overview",  Icon: TrendingUp, label: "Overview"  },
  { id: "users",     Icon: Users,      label: "Users"     },
  { id: "posts",     Icon: FileText,   label: "Posts"     },
  { id: "cercles",   Icon: Circle,     label: "Cercles"   },
]

export default function Admin() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState("overview")
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [cercles, setCercles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    const [
      { count: userCount },
      { count: postCount },
      { count: missionCount },
      { data: usersData },
      { data: postsData },
      { data: cerclesData },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('missions').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('id,name,email,shop_name,niche,cp,plan,is_active,is_admin,created_at,league').order('created_at', { ascending: false }).limit(100),
      supabase.from('posts').select('id,product,user_id,score,likes_count,favorites_count,created_at,is_boosted').order('created_at', { ascending: false }).limit(100),
      supabase.from('cercles').select('id,name,niche,max_members,created_at').order('created_at', { ascending: false }),
    ])

    const totalCp = usersData?.reduce((s, u) => s + (u.cp || 0), 0) || 0

    setStats({ userCount, postCount, missionCount, totalCp })
    setUsers(usersData || [])
    setPosts(postsData || [])
    setCercles(cerclesData || [])
    setLoading(false)
  }

  const toggleAdmin = async (userId, current) => {
    const { error } = await supabase.rpc('admin_set_admin', { p_target: userId, p_value: !current })
    if (error) { console.error('admin_set_admin error:', error); return }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: !current } : u))
  }

  const toggleActive = async (userId, current) => {
    const { error } = await supabase.rpc('admin_set_active', { p_target: userId, p_value: !current })
    if (error) { console.error('admin_set_active error:', error); return }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !current } : u))
  }

  const deletePost = async (postId) => {
    if (!window.confirm("Supprimer ce post ?")) return
    await supabase.from('posts').delete().eq('id', postId)
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  const createCercle = async () => {
    const name = prompt("Nom du cercle :")
    const niche = prompt("Niche :")
    if (!name || !niche) return
    const { data } = await supabase.from('cercles').insert({ name, niche }).select().single()
    if (data) setCercles(prev => [data, ...prev])
  }

  const deleteCercle = async (id) => {
    if (!window.confirm("Supprimer ce cercle ?")) return
    await supabase.from('cercles').delete().eq('id', id)
    setCercles(prev => prev.filter(c => c.id !== id))
  }

  const filteredUsers = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.shop_name?.toLowerCase().includes(search.toLowerCase())
  )

  const planColor = (plan) => plan === 'premium' ? G.gold : plan === 'starter' ? G.accent : G.muted

  return (
    <div style={{ minHeight: "100vh", background: G.bg, fontFamily: G.sans, color: G.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        .row-hov:hover { background: rgba(255,255,255,0.02) !important; }
        .tab-btn { cursor: pointer; transition: all 0.15s; }
        .tab-btn:hover { background: rgba(255,255,255,0.04) !important; }
        .admin-input:focus { border-color: rgba(255,106,61,0.3) !important; outline: none; }
      `}</style>

      {/* Header */}
      <div style={{
        background: G.bg2, borderBottom: `1px solid ${G.border}`,
        padding: "0 32px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 58,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg, #FF6A3D, #FF4D1C)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(255,106,61,0.3)",
          }}>
            <Shield size={15} color="#fff" />
          </div>
          <span style={{ fontFamily: G.serif, fontSize: 17, fontWeight: 900 }}>Admin Panel</span>
          <span style={{
            fontSize: 10, fontWeight: 700, background: "rgba(255,106,61,0.12)",
            border: "1px solid rgba(255,106,61,0.2)", color: G.accent,
            padding: "2px 8px", borderRadius: 20, letterSpacing: 0.5, textTransform: "uppercase",
          }}>Admin</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: G.muted }}>{profile?.name}</span>
          <button onClick={() => navigate('/app')} style={{
            background: G.card, border: `1px solid ${G.border}`,
            color: G.muted, padding: "6px 14px", borderRadius: 8,
            fontSize: 13, cursor: "pointer", fontFamily: G.sans,
            transition: "border-color 0.15s",
          }}>
            Dashboard
          </button>
          <button onClick={() => { signOut(); navigate('/') }} style={{
            background: "transparent", border: "none",
            color: G.faint, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5, fontSize: 13,
            transition: "color 0.15s",
          }}>
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 58px)" }}>

        {/* Sidebar */}
        <div style={{
          width: 196, background: G.bg2,
          borderRight: `1px solid ${G.border}`,
          padding: "20px 10px", flexShrink: 0,
        }}>
          {TABS.map(({ id, Icon, label }) => (
            <button key={id} className="tab-btn" onClick={() => setTab(id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              background: tab === id ? G.accentL : "transparent",
              border: tab === id ? `1px solid ${G.accentB}` : "1px solid transparent",
              color: tab === id ? G.accent : G.muted,
              padding: "10px 12px", borderRadius: 9, fontSize: 13,
              fontWeight: tab === id ? 600 : 400,
              marginBottom: 3, fontFamily: G.sans, textAlign: "left",
            }}>
              <Icon size={14} /> {label}
            </button>
          ))}
          <div style={{ height: 1, background: G.border, margin: "16px 4px" }} />
          <button onClick={loadAll} style={{
            width: "100%", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 6,
            background: "transparent", border: `1px solid ${G.border}`,
            color: G.faint, padding: "8px", borderRadius: 8,
            fontSize: 12, cursor: "pointer", fontFamily: G.sans,
            transition: "border-color 0.15s",
          }}>
            <RefreshCw size={12} /> Actualiser
          </button>
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: "32px 36px", overflowY: "auto", background: G.bg }}>
          {loading ? (
            <div style={{ textAlign: "center", paddingTop: 80, color: G.muted, fontSize: 14 }}>Chargement...</div>
          ) : (
            <>
              {/* OVERVIEW */}
              {tab === "overview" && (
                <div>
                  <div style={{ marginBottom: 28 }}>
                    <h2 style={{ fontFamily: G.serif, fontSize: 26, fontWeight: 900, marginBottom: 4 }}>Vue d'ensemble</h2>
                    <p style={{ fontSize: 13, color: G.muted }}>Statistiques globales de la plateforme</p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 36 }}>
                    {[
                      { label: "Membres",          value: stats.userCount,                    icon: Users,     color: G.cyan  },
                      { label: "Posts",             value: stats.postCount,                    icon: FileText,  color: G.accent },
                      { label: "Missions",          value: stats.missionCount,                 icon: Target,    color: G.gold  },
                      { label: "CP en circulation", value: stats.totalCp?.toLocaleString(),    icon: Zap,       color: G.cyan  },
                    ].map(({ label, value, icon: Icon, color }) => (
                      <div key={label} style={{
                        background: G.card, border: `1px solid ${G.border}`,
                        borderRadius: 16, padding: "22px 20px",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                          <span style={{ fontSize: 11, color: G.muted, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>{label}</span>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}12`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon size={14} color={color} />
                          </div>
                        </div>
                        <div style={{ fontFamily: G.serif, fontSize: 34, fontWeight: 900, color, lineHeight: 1 }}>{value ?? "—"}</div>
                      </div>
                    ))}
                  </div>

                  <h3 style={{ fontSize: 11, fontWeight: 700, color: G.muted, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 14 }}>Derniers membres inscrits</h3>
                  <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, overflow: "hidden" }}>
                    {users.slice(0, 8).map((u, i) => (
                      <div key={u.id} className="row-hov" style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "12px 18px",
                        borderBottom: i < 7 ? `1px solid ${G.border}` : "none",
                        background: "transparent", transition: "background 0.1s",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: G.accentL, border: `1px solid ${G.accentB}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 700, color: G.accent,
                          }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: G.text }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: G.faint }}>{u.shop_name}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                          <span style={{ fontSize: 11, color: planColor(u.plan), fontWeight: 700, textTransform: "uppercase" }}>{u.plan || 'free'}</span>
                          <span style={{ fontSize: 12, color: G.gold, fontWeight: 700 }}>{u.cp} CP</span>
                          <span style={{ fontSize: 11, color: G.faint }}>{new Date(u.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* USERS */}
              {tab === "users" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                    <div>
                      <h2 style={{ fontFamily: G.serif, fontSize: 26, fontWeight: 900, marginBottom: 3 }}>Membres</h2>
                      <p style={{ fontSize: 13, color: G.muted }}>{users.length} membres enregistrés</p>
                    </div>
                    <input
                      className="admin-input"
                      placeholder="Rechercher..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      style={{
                        background: G.card, border: `1px solid ${G.border}`,
                        borderRadius: 9, padding: "9px 14px",
                        color: G.text, fontSize: 13, width: 220,
                        fontFamily: G.sans, transition: "border-color 0.2s",
                      }}
                    />
                  </div>
                  <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, overflow: "hidden" }}>
                    <div style={{
                      display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 80px 80px 130px",
                      padding: "10px 18px", borderBottom: `1px solid ${G.border}`,
                      background: G.bg3,
                    }}>
                      {["Membre", "Boutique / Niche", "Plan", "CP", "Statut", "Actions"].map(h => (
                        <span key={h} style={{ fontSize: 10, color: G.faint, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</span>
                      ))}
                    </div>
                    {filteredUsers.map((u, i) => (
                      <div key={u.id} className="row-hov" style={{
                        display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 80px 80px 130px",
                        alignItems: "center", padding: "11px 18px",
                        borderBottom: i < filteredUsers.length - 1 ? `1px solid ${G.border}` : "none",
                        background: "transparent",
                      }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: G.text, display: "flex", alignItems: "center", gap: 6 }}>
                            {u.name}
                            {u.is_admin && <Shield size={11} color={G.accent} />}
                          </div>
                          <div style={{ fontSize: 11, color: G.faint }}>{u.email}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: G.muted }}>{u.shop_name}</div>
                          <div style={{ fontSize: 11, color: G.faint }}>{u.niche}</div>
                        </div>
                        <span style={{ fontSize: 11, color: planColor(u.plan), fontWeight: 700, textTransform: "uppercase" }}>{u.plan || 'free'}</span>
                        <span style={{ fontSize: 13, color: G.gold, fontWeight: 700 }}>{u.cp}</span>
                        <div>
                          <button onClick={() => toggleActive(u.id, u.is_active)} style={{
                            background: u.is_active ? G.cyanL : "rgba(255,255,255,0.04)",
                            border: `1px solid ${u.is_active ? G.cyanB : G.border}`,
                            color: u.is_active ? G.cyan : G.faint,
                            padding: "3px 9px", borderRadius: 6,
                            fontSize: 11, cursor: "pointer", fontFamily: G.sans,
                            fontWeight: 600,
                          }}>
                            {u.is_active ? "Actif" : "Inactif"}
                          </button>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => toggleAdmin(u.id, u.is_admin)} title={u.is_admin ? "Retirer admin" : "Rendre admin"} style={{
                            background: u.is_admin ? G.accentL : "rgba(255,255,255,0.04)",
                            border: `1px solid ${u.is_admin ? G.accentB : G.border}`,
                            color: u.is_admin ? G.accent : G.faint,
                            padding: "4px 8px", borderRadius: 6,
                            fontSize: 11, cursor: "pointer", fontFamily: G.sans,
                            display: "flex", alignItems: "center", gap: 4,
                          }}>
                            <Shield size={10} /> Admin
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* POSTS */}
              {tab === "posts" && (
                <div>
                  <div style={{ marginBottom: 22 }}>
                    <h2 style={{ fontFamily: G.serif, fontSize: 26, fontWeight: 900, marginBottom: 3 }}>Posts</h2>
                    <p style={{ fontSize: 13, color: G.muted }}>{posts.length} posts publiés</p>
                  </div>
                  <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, overflow: "hidden" }}>
                    <div style={{
                      display: "grid", gridTemplateColumns: "2fr 80px 1fr 1fr 52px",
                      padding: "10px 18px", borderBottom: `1px solid ${G.border}`, background: G.bg3,
                    }}>
                      {["Produit", "Score", "Engagement", "Date", ""].map(h => (
                        <span key={h} style={{ fontSize: 10, color: G.faint, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</span>
                      ))}
                    </div>
                    {posts.map((p, i) => (
                      <div key={p.id} className="row-hov" style={{
                        display: "grid", gridTemplateColumns: "2fr 80px 1fr 1fr 52px",
                        alignItems: "center", padding: "11px 18px",
                        borderBottom: i < posts.length - 1 ? `1px solid ${G.border}` : "none",
                        background: "transparent",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {p.is_boosted && (
                            <span style={{
                              fontSize: 9, background: G.accentL, border: `1px solid ${G.accentB}`,
                              color: G.accent, padding: "2px 6px", borderRadius: 4, fontWeight: 700,
                            }}>BOOST</span>
                          )}
                          <span style={{ fontSize: 13, fontWeight: 600, color: G.text }}>{p.product}</span>
                        </div>
                        <span style={{ fontSize: 13, color: p.score >= 70 ? G.cyan : p.score >= 40 ? G.gold : G.muted, fontWeight: 700 }}>{p.score}</span>
                        <div style={{ fontSize: 12, color: G.muted }}>
                          {p.likes_count} likes · {p.favorites_count} fav
                        </div>
                        <span style={{ fontSize: 11, color: G.faint }}>{new Date(p.created_at).toLocaleDateString('fr-FR')}</span>
                        <button onClick={() => deletePost(p.id)} style={{
                          background: "rgba(255,106,61,0.08)", border: `1px solid rgba(255,106,61,0.18)`,
                          color: G.accent, padding: "5px 8px", borderRadius: 7,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: G.sans, transition: "background 0.15s",
                        }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CERCLES */}
              {tab === "cercles" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                    <div>
                      <h2 style={{ fontFamily: G.serif, fontSize: 26, fontWeight: 900, marginBottom: 3 }}>Cercles</h2>
                      <p style={{ fontSize: 13, color: G.muted }}>{cercles.length} cercles actifs</p>
                    </div>
                    <button onClick={createCercle} style={{
                      background: G.accentL, border: `1px solid ${G.accentB}`,
                      color: G.accent, padding: "9px 18px", borderRadius: 9,
                      fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: G.sans,
                    }}>
                      + Nouveau cercle
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                    {cercles.map(c => (
                      <div key={c.id} style={{
                        background: G.card, border: `1px solid ${G.border}`,
                        borderRadius: 14, padding: "18px 20px",
                      }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: G.text }}>{c.name}</div>
                            <div style={{ fontSize: 11, color: G.cyan, marginTop: 3 }}>{c.niche}</div>
                          </div>
                          <button onClick={() => deleteCercle(c.id)} style={{
                            background: "rgba(255,106,61,0.08)", border: `1px solid rgba(255,106,61,0.18)`,
                            color: G.accent, padding: "5px 7px", borderRadius: 7,
                            cursor: "pointer", fontFamily: G.sans,
                          }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div style={{ fontSize: 11, color: G.faint }}>Max {c.max_members} membres · {new Date(c.created_at).toLocaleDateString('fr-FR')}</div>
                      </div>
                    ))}
                    {cercles.length === 0 && <div style={{ color: G.faint, fontSize: 13 }}>Aucun cercle créé.</div>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
