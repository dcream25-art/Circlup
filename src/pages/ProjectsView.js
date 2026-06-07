import { useState, useEffect, useRef } from 'react'
import { useProjects } from '../hooks/useProjects'
import { uploadFile } from '../hooks/useStorage'
import {
  Plus, X, Heart, Target, Clock, Users, ChevronRight, ArrowLeft,
  Upload, Trash2, Gift, CheckCircle, Sparkles
} from 'lucide-react'

const G = {
  bg: "#050505", bg2: "#0A0A0A", bg3: "#0D0D0D",
  card: "rgba(255,255,255,0.03)", card2: "rgba(255,255,255,0.05)", card3: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.06)", borderL: "rgba(255,255,255,0.03)", borderHover: "rgba(255,255,255,0.12)",
  accent: "#FF6A3D", accentL: "rgba(255,106,61,0.08)", accentB: "rgba(255,106,61,0.2)",
  cyan: "#00D5D5", cyanL: "rgba(0,213,213,0.08)", cyanB: "rgba(0,213,213,0.2)",
  gold: "#F5C518", goldL: "rgba(245,197,24,0.08)", goldB: "rgba(245,197,24,0.2)",
  text: "#FFFFFF", muted: "#A8A8A8", faint: "rgba(255,255,255,0.34)",
  serif: "'Playfair Display', Georgia, serif", sans: "'DM Sans', system-ui, sans-serif",
  num: "'Space Grotesk', 'DM Sans', system-ui, sans-serif",
}

const CATEGORIES = ["Produit", "Service", "Association", "Art & Création", "Tech", "Événement", "Autre"]
const fmt = (n) => (Number(n) || 0).toLocaleString('fr-FR')
const daysLeft = (deadline) => {
  if (!deadline) return null
  const d = Math.ceil((new Date(deadline) - Date.now()) / 86400000)
  return d > 0 ? d : 0
}

function ProgressBar({ raised, goal }) {
  const pct = goal > 0 ? Math.min(raised / goal * 100, 100) : 0
  return (
    <div style={{ height: 7, background: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${G.accent}, ${G.gold})`, borderRadius: 4, transition: "width 0.5s" }} />
    </div>
  )
}

export default function ProjectsView({ user, profile }) {
  const { projects, loading, fetchProjects, createProject, contribute, deleteProject } = useProjects()
  const [view, setView]       = useState('list')   // list | create | detail
  const [current, setCurrent] = useState(null)
  const [toast, setToast]     = useState(null)

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200) }

  return (
    <div className="fade" style={{ fontFamily: G.sans, color: G.text }}>
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 32, zIndex: 1000, background: G.bg3, border: `1px solid ${G.cyanB}`, borderRadius: 12, padding: "12px 20px", display: "flex", alignItems: "center", gap: 9, boxShadow: "0 8px 28px rgba(0,0,0,0.5)" }}>
          <CheckCircle size={16} color={G.cyan} /><span style={{ fontSize: 13, fontWeight: 600 }}>{toast}</span>
        </div>
      )}

      {view === 'list'   && <ListView   projects={projects} loading={loading} onCreate={() => setView('create')} onOpen={(p) => { setCurrent(p); setView('detail') }} />}
      {view === 'create' && <CreateView user={user} onCancel={() => setView('list')} onCreated={() => { setView('list'); showToast("Projet publié !") }} createProject={createProject} />}
      {view === 'detail' && current && <DetailView project={current} user={user} onBack={() => { setView('list'); fetchProjects() }} contribute={contribute} deleteProject={deleteProject} showToast={showToast} refresh={fetchProjects} />}
    </div>
  )
}

/* ─────────── LISTE ─────────── */
function ListView({ projects, loading, onCreate, onOpen }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button onClick={onCreate} className="btn-primary" style={{ background: "linear-gradient(135deg, #FF6A3D, #e04820)", boxShadow: "0 6px 20px rgba(255,106,61,0.35)", border: "none", color: "#fff", padding: "11px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: G.sans, display: "flex", alignItems: "center", gap: 7 }}>
          <Plus size={16} /> Lancer un projet
        </button>
      </div>

      {loading && <div style={{ textAlign: "center", padding: 48, color: G.muted }}>Chargement...</div>}

      {!loading && projects.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 24px", background: G.card, border: `1px solid ${G.border}`, borderRadius: 16 }}>
          <div style={{ width: 64, height: 64, margin: "0 auto 16px", borderRadius: 18, background: G.accentL, border: `1px solid ${G.accentB}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Target size={28} color={G.accent} />
          </div>
          <h3 style={{ fontFamily: G.serif, fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Aucun projet pour l'instant</h3>
          <p style={{ fontSize: 14, color: G.muted, marginBottom: 22 }}>Sois le premier à partager un projet qui te tient à cœur.</p>
          <button onClick={onCreate} style={{ background: G.accent, border: "none", color: "#fff", padding: "11px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: G.sans }}>Lancer mon projet</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
        {projects.map(p => {
          const dl = daysLeft(p.deadline)
          const pct = p.goal_amount > 0 ? Math.min(p.raised_amount / p.goal_amount * 100, 100) : 0
          return (
            <div key={p.id} onClick={() => onOpen(p)} className="card-hov" style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "border-color 0.15s, transform 0.15s" }}
              onMouseOver={e => { e.currentTarget.style.borderColor = G.borderHover; e.currentTarget.style.transform = "translateY(-2px)" }}
              onMouseOut={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.transform = "translateY(0)" }}
            >
              <div style={{ height: 160, background: G.bg3, overflow: "hidden", position: "relative" }}>
                {p.image_url
                  ? <img src={p.image_url} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Target size={32} color={G.faint} /></div>}
                {p.status === 'funded' && <div style={{ position: "absolute", top: 12, left: 12, background: G.cyanL, border: `1px solid ${G.cyanB}`, borderRadius: 20, padding: "3px 12px", fontSize: 11, color: G.cyan, fontWeight: 700, backdropFilter: "blur(8px)" }}>✓ Financé</div>}
                {p.category && <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(5,5,5,0.7)", border: `1px solid ${G.border}`, borderRadius: 20, padding: "3px 10px", fontSize: 10, color: G.muted, backdropFilter: "blur(8px)" }}>{p.category}</div>}
              </div>
              <div style={{ padding: "16px 18px" }}>
                <h3 style={{ fontFamily: G.serif, fontSize: 17, fontWeight: 800, marginBottom: 6, lineHeight: 1.3 }}>{p.title}</h3>
                <p style={{ fontSize: 12, color: G.muted, lineHeight: 1.6, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.story}</p>
                <ProgressBar raised={p.raised_amount} goal={p.goal_amount} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <span style={{ fontFamily: G.num, fontSize: 15, fontWeight: 700, color: G.accent }}>{fmt(p.raised_amount)}€ <span style={{ fontSize: 11, color: G.faint, fontWeight: 400 }}>/ {fmt(p.goal_amount)}€</span></span>
                  <span style={{ fontSize: 11, color: G.muted }}>{Math.round(pct)}%</span>
                </div>
                <div style={{ display: "flex", gap: 14, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${G.borderL}` }}>
                  <span style={{ fontSize: 11, color: G.muted, display: "flex", alignItems: "center", gap: 4 }}><Users size={12} /> {p.backers_count || 0} soutiens</span>
                  {dl !== null && <span style={{ fontSize: 11, color: dl === 0 ? G.accent : G.muted, display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {dl === 0 ? "Terminé" : `${dl}j restants`}</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

/* ─────────── CRÉATION ─────────── */
function CreateView({ user, onCancel, onCreated, createProject }) {
  const [f, setF] = useState({ title: "", story: "", category: "", goalAmount: "", deadline: "" })
  const [tiers, setTiers] = useState([{ title: "", amount: "", reward: "", description: "" }])
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")
  const fileRef = useRef(null)
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const setTier = (i, k, v) => setTiers(p => p.map((t, idx) => idx === i ? { ...t, [k]: v } : t))

  const inp = { width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}`, borderRadius: 10, padding: "11px 14px", color: G.text, fontSize: 14, outline: "none", fontFamily: G.sans, boxSizing: "border-box" }
  const lbl = { fontSize: 11, color: G.muted, display: "block", marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600 }

  const onImg = (e) => { const file = e.target.files?.[0]; if (file) { setImage(file); setPreview(URL.createObjectURL(file)) } }

  const submit = async () => {
    if (!f.title.trim() || !f.story.trim() || !f.goalAmount) { setErr("Titre, description et objectif sont obligatoires."); return }
    setSaving(true); setErr("")
    let imageUrl = null
    if (image) { const { url } = await uploadFile(image, 'post-images', user.id); imageUrl = url }
    const { error } = await createProject({ ...f, imageUrl, tiers })
    setSaving(false)
    if (error) { setErr(typeof error === 'string' ? error : (error.message || "Erreur")); return }
    onCreated()
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <button onClick={onCancel} style={{ background: "none", border: "none", color: G.muted, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6, marginBottom: 18, fontFamily: G.sans }}>
        <ArrowLeft size={15} /> Retour aux projets
      </button>
      <h1 style={{ fontFamily: G.serif, fontSize: 26, fontWeight: 900, marginBottom: 6 }}>Lancer un projet</h1>
      <p style={{ fontSize: 14, color: G.muted, marginBottom: 28 }}>Partage ton projet, fixe un objectif, propose des contreparties.</p>

      <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 24, marginBottom: 18 }}>
        {/* Image */}
        <div style={{ marginBottom: 18 }}>
          <label style={lbl}>Image du projet</label>
          {preview
            ? <div style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
                <img src={preview} alt="" style={{ width: "100%", height: 200, objectFit: "cover" }} />
                <button onClick={() => { setImage(null); setPreview(null) }} style={{ position: "absolute", top: 10, right: 10, background: "rgba(5,5,5,0.8)", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
              </div>
            : <button onClick={() => fileRef.current?.click()} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px dashed ${G.border}`, borderRadius: 12, padding: "28px", cursor: "pointer", color: G.muted, fontSize: 13, fontFamily: G.sans, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <Upload size={20} /> Ajouter une image
              </button>}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onImg} />
        </div>

        <div style={{ marginBottom: 16 }}><label style={lbl}>Titre du projet</label><input style={inp} value={f.title} onChange={e => set('title', e.target.value)} placeholder="Ex : Lancer ma collection éco-responsable" /></div>
        <div style={{ marginBottom: 16 }}><label style={lbl}>Histoire du projet</label><textarea style={{ ...inp, resize: "vertical", minHeight: 110 }} value={f.story} onChange={e => set('story', e.target.value)} placeholder="Raconte ton projet, pourquoi il compte, à quoi servira le financement…" /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div><label style={lbl}>Catégorie</label>
            <select style={{ ...inp, cursor: "pointer" }} value={f.category} onChange={e => set('category', e.target.value)}>
              <option value="">Choisir…</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Objectif (€)</label><input type="number" min="1" style={inp} value={f.goalAmount} onChange={e => set('goalAmount', e.target.value)} placeholder="2000" /></div>
          <div><label style={lbl}>Date limite</label><input type="date" style={inp} value={f.deadline} onChange={e => set('deadline', e.target.value)} /></div>
        </div>
      </div>

      {/* Paliers */}
      <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 24, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Gift size={16} color={G.gold} />
          <h3 style={{ fontFamily: G.serif, fontSize: 17, fontWeight: 800 }}>Paliers de contrepartie</h3>
          <span style={{ fontSize: 11, color: G.faint }}>(optionnel)</span>
        </div>
        <p style={{ fontSize: 12, color: G.muted, marginBottom: 16 }}>Propose un avantage ou un produit en échange d'un montant. Le don simple reste toujours possible.</p>
        {tiers.map((t, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${G.border}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: G.gold }}>Palier {i + 1}</span>
              {tiers.length > 1 && <button onClick={() => setTiers(p => p.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", color: G.faint, cursor: "pointer" }}><Trash2 size={14} /></button>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 10 }}>
              <input style={inp} value={t.title} onChange={e => setTier(i, 'title', e.target.value)} placeholder="Nom du palier (ex : Soutien Or)" />
              <input type="number" style={inp} value={t.amount} onChange={e => setTier(i, 'amount', e.target.value)} placeholder="Montant €" />
            </div>
            <input style={{ ...inp, marginBottom: 10 }} value={t.reward} onChange={e => setTier(i, 'reward', e.target.value)} placeholder="Contrepartie (ex : 1 produit offert + accès anticipé)" />
            <input style={inp} value={t.description} onChange={e => setTier(i, 'description', e.target.value)} placeholder="Détails (optionnel)" />
          </div>
        ))}
        <button onClick={() => setTiers(p => [...p, { title: "", amount: "", reward: "", description: "" }])} style={{ background: G.card2, border: `1px solid ${G.border}`, color: G.text, padding: "9px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: G.sans, display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> Ajouter un palier
        </button>
      </div>

      {err && <div style={{ background: G.accentL, border: `1px solid ${G.accentB}`, borderRadius: 10, padding: "11px 15px", fontSize: 13, color: "#FF8060", marginBottom: 16 }}>{err}</div>}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={submit} disabled={saving} className="btn-primary" style={{ background: "linear-gradient(135deg, #FF6A3D, #e04820)", boxShadow: "0 6px 20px rgba(255,106,61,0.35)", border: "none", color: "#fff", padding: "13px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1, fontFamily: G.sans }}>
          {saving ? "Publication…" : "Publier le projet"}
        </button>
        <button onClick={onCancel} style={{ background: "transparent", border: `1px solid ${G.border}`, color: G.muted, padding: "13px 20px", borderRadius: 10, fontSize: 14, cursor: "pointer", fontFamily: G.sans }}>Annuler</button>
      </div>
    </div>
  )
}

/* ─────────── DÉTAIL + CONTRIBUTION ─────────── */
function DetailView({ project: initial, user, onBack, contribute, deleteProject, showToast, refresh }) {
  const [project, setProject] = useState(initial)
  const [selectedTier, setSelectedTier] = useState(null)
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [anon, setAnon] = useState(false)
  const [paying, setPaying] = useState(false)
  const isOwn = project.user_id === user?.id
  const dl = daysLeft(project.deadline)
  const pct = project.goal_amount > 0 ? Math.min(project.raised_amount / project.goal_amount * 100, 100) : 0
  const paidContribs = (project.project_contributions || []).filter(c => c.status === 'paid')

  const inp = { width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${G.border}`, borderRadius: 10, padding: "11px 14px", color: G.text, fontSize: 14, outline: "none", fontFamily: G.sans, boxSizing: "border-box" }

  const doContribute = async () => {
    const amt = selectedTier ? selectedTier.amount : Number(amount)
    if (!amt || amt <= 0) { showToast("Choisis un montant"); return }
    setPaying(true)
    const { error, simulated } = await contribute({ projectId: project.id, tierId: selectedTier?.id || null, amount: amt, message, isAnonymous: anon })
    setPaying(false)
    if (error) { showToast("Erreur : " + (error.message || error)); return }
    showToast(simulated ? "Soutien enregistré (paiement simulé) 💛" : "Merci pour ton soutien !")
    setAmount(""); setMessage(""); setSelectedTier(null)
    // recharge le projet à jour
    const fresh = (await refresh(), null)
    setProject(prev => ({ ...prev, raised_amount: Number(prev.raised_amount) + Number(amt), backers_count: (prev.backers_count || 0) + 1 }))
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: G.muted, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6, marginBottom: 18, fontFamily: G.sans }}>
        <ArrowLeft size={15} /> Retour aux projets
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>
        {/* Colonne gauche */}
        <div>
          {project.image_url && <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 20, border: `1px solid ${G.border}` }}><img src={project.image_url} alt={project.title} style={{ width: "100%", maxHeight: 360, objectFit: "cover", display: "block" }} /></div>}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            {project.category && <span style={{ background: G.card2, border: `1px solid ${G.border}`, borderRadius: 20, padding: "3px 12px", fontSize: 11, color: G.muted }}>{project.category}</span>}
            {project.status === 'funded' && <span style={{ background: G.cyanL, border: `1px solid ${G.cyanB}`, borderRadius: 20, padding: "3px 12px", fontSize: 11, color: G.cyan, fontWeight: 700 }}>✓ Financé</span>}
            {isOwn && <button onClick={async () => { if (window.confirm("Supprimer ce projet ?")) { await deleteProject(project.id); onBack() } }} style={{ marginLeft: "auto", background: "none", border: "none", color: G.faint, cursor: "pointer" }}><Trash2 size={15} /></button>}
          </div>
          <h1 style={{ fontFamily: G.serif, fontSize: 30, fontWeight: 900, lineHeight: 1.15, marginBottom: 14 }}>{project.title}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: project.profiles?.avatar_url ? "transparent" : `radial-gradient(circle,${project.profiles?.avatar_color || G.cyan}cc,${project.profiles?.avatar_color || G.cyan}55)`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>
              {project.profiles?.avatar_url ? <img src={project.profiles.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (project.profiles?.name || "?")[0]}
            </div>
            <span style={{ fontSize: 13, color: G.muted }}>par <span style={{ color: G.text, fontWeight: 600 }}>{project.profiles?.name || "Membre"}</span></span>
          </div>
          <p style={{ fontSize: 15, color: G.text, opacity: 0.85, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{project.story}</p>

          {/* Soutiens */}
          {paidContribs.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontFamily: G.serif, fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Ils soutiennent ({paidContribs.length})</h3>
              {paidContribs.slice(0, 10).map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${G.borderL}` }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: G.accentL, border: `1px solid ${G.accentB}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: G.accent, overflow: "hidden" }}>
                    {c.is_anonymous ? "?" : (c.profiles?.avatar_url ? <img src={c.profiles.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (c.profiles?.name || "?")[0])}
                  </div>
                  <span style={{ flex: 1, fontSize: 13, color: G.text }}>{c.is_anonymous ? "Anonyme" : (c.profiles?.name || "Membre")}</span>
                  <span style={{ fontFamily: G.num, fontSize: 13, fontWeight: 700, color: G.accent }}>{fmt(c.amount)}€</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colonne droite : financement */}
        <div style={{ position: "sticky", top: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 22 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: G.num, fontSize: 30, fontWeight: 700, color: G.accent }}>{fmt(project.raised_amount)}€</span>
              <span style={{ fontSize: 13, color: G.muted }}>sur {fmt(project.goal_amount)}€</span>
            </div>
            <ProgressBar raised={project.raised_amount} goal={project.goal_amount} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 13 }}>
              <span style={{ color: G.muted }}><strong style={{ color: G.text, fontFamily: G.num }}>{Math.round(pct)}%</strong> financé</span>
              <span style={{ color: G.muted }}><strong style={{ color: G.text, fontFamily: G.num }}>{project.backers_count || 0}</strong> soutiens</span>
              {dl !== null && <span style={{ color: dl === 0 ? G.accent : G.muted }}><strong style={{ color: G.text, fontFamily: G.num }}>{dl}</strong>j restants</span>}
            </div>

            {!isOwn && (
              <>
                {/* Don simple */}
                <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${G.border}` }}>
                  <label style={{ fontSize: 11, color: G.muted, display: "block", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>Don libre</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="number" min="1" value={selectedTier ? "" : amount} onChange={e => { setSelectedTier(null); setAmount(e.target.value) }} placeholder="Montant €" style={inp} />
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    {[5, 10, 25, 50].map(v => (
                      <button key={v} onClick={() => { setSelectedTier(null); setAmount(String(v)) }} style={{ flex: 1, background: amount === String(v) && !selectedTier ? G.accentL : G.card2, border: `1px solid ${amount === String(v) && !selectedTier ? G.accentB : G.border}`, color: amount === String(v) && !selectedTier ? G.accent : G.muted, padding: "7px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: G.num }}>{v}€</button>
                    ))}
                  </div>
                </div>

                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Un petit mot (optionnel)" rows={2} style={{ ...inp, marginTop: 12, resize: "none" }} />
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 12, color: G.muted, cursor: "pointer" }}>
                  <input type="checkbox" checked={anon} onChange={e => setAnon(e.target.checked)} /> Soutien anonyme
                </label>

                <button onClick={doContribute} disabled={paying} className="btn-primary" style={{ width: "100%", marginTop: 14, background: "linear-gradient(135deg, #FF6A3D, #e04820)", boxShadow: "0 6px 20px rgba(255,106,61,0.35)", border: "none", color: "#fff", padding: "13px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: paying ? "not-allowed" : "pointer", opacity: paying ? 0.6 : 1, fontFamily: G.sans, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Heart size={15} fill="#fff" stroke="none" /> {paying ? "Traitement…" : selectedTier ? `Soutenir ${fmt(selectedTier.amount)}€` : "Soutenir ce projet"}
                </button>
                <p style={{ fontSize: 10, color: G.faint, textAlign: "center", marginTop: 8 }}>Paiement sécurisé · simulé en phase de test</p>
              </>
            )}
            {isOwn && <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${G.border}`, fontSize: 13, color: G.cyan, display: "flex", alignItems: "center", gap: 8 }}><Sparkles size={14} /> C'est ton projet — partage-le pour récolter des soutiens !</div>}
          </div>

          {/* Paliers */}
          {(project.project_tiers || []).length > 0 && !isOwn && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 11, color: G.muted, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>Contreparties</div>
              {[...project.project_tiers].sort((a, b) => a.amount - b.amount).map(t => {
                const full = t.max_backers && t.backers_count >= t.max_backers
                const sel = selectedTier?.id === t.id
                return (
                  <div key={t.id} onClick={() => !full && (setSelectedTier(t), setAmount(""))} style={{ background: sel ? G.accentL : G.card, border: `1px solid ${sel ? G.accentB : G.border}`, borderRadius: 12, padding: 16, cursor: full ? "not-allowed" : "pointer", opacity: full ? 0.5 : 1, transition: "all 0.15s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: G.text }}>{t.title}</span>
                      <span style={{ fontFamily: G.num, fontSize: 16, fontWeight: 700, color: G.accent }}>{fmt(t.amount)}€</span>
                    </div>
                    {t.reward && <div style={{ fontSize: 12, color: G.cyan, marginBottom: 4, display: "flex", gap: 6, alignItems: "flex-start" }}><Gift size={12} style={{ marginTop: 2, flexShrink: 0 }} /> {t.reward}</div>}
                    {t.description && <p style={{ fontSize: 12, color: G.muted, lineHeight: 1.5 }}>{t.description}</p>}
                    <div style={{ fontSize: 11, color: G.faint, marginTop: 6 }}>{t.backers_count || 0} soutien{(t.backers_count || 0) > 1 ? "s" : ""}{t.max_backers ? ` · ${t.max_backers - (t.backers_count || 0)} restants` : ""}{full ? " · Complet" : ""}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
