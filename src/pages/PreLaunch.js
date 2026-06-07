import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  ArrowRight, Crown, Sparkles, Users, Share2, Check, Copy, Star, Loader2,
  Eye, Trophy, Gift, Rocket, ShieldCheck, TrendingUp, Mail, CheckCircle2,
  LayoutDashboard, Rss, Target, Folder, Heart, ShoppingBag,
  Twitter, Linkedin, Instagram, Youtube, Infinity as InfinityIcon,
} from 'lucide-react'

// ── Charte (alignée sur Landing.js) ─────────────────────────────────────────
const G = {
  bg: '#050505', bg2: '#0A0A0A', bg3: '#070707',
  card: 'rgba(255,255,255,0.03)', card2: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.06)', borderHover: 'rgba(255,255,255,0.12)',
  accent: '#FF6A3D', accentL: 'rgba(255,106,61,0.08)', accentB: 'rgba(255,106,61,0.2)',
  cyan: '#00D5D5', cyanL: 'rgba(0,213,213,0.08)', cyanB: 'rgba(0,213,213,0.2)',
  gold: '#F5C842', goldL: 'rgba(245,200,66,0.08)', goldB: 'rgba(245,200,66,0.25)',
  text: '#FFFFFF', muted: '#9A9A9A', faint: 'rgba(255,255,255,0.15)',
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', system-ui, sans-serif",
  num: "'Space Grotesk', 'DM Sans', system-ui, sans-serif",
}

const FOUNDER_SEATS = 200
const LS_KEY = 'circlup_wl_code'

// ── Petits composants ───────────────────────────────────────────────────────
function Logo({ size = 32 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.27, overflow: 'hidden', flexShrink: 0, background: '#0a0a0a' }}>
      <img src="/logo.png" alt="CirclUp" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.35)' }}
        onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }} />
      <div style={{ display: 'none', width: '100%', height: '100%', background: 'linear-gradient(135deg, #FF6A3D, #e04f25)', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: G.serif, fontSize: size * 0.44, fontWeight: 900, color: '#fff', lineHeight: 1 }}>C</span>
      </div>
    </div>
  )
}

function Sparkline({ color }) {
  return (
    <svg width={48} height={18} viewBox="0 0 120 40" preserveAspectRatio="none">
      <polyline points="0,35 20,28 40,22 60,18 80,12 100,8 120,5" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AvatarStack() {
  const seeds = [
    { c: G.cyan, i: 'SL' }, { c: G.accent, i: 'TD' }, { c: G.gold, i: 'CR' },
    { c: '#9B6DFF', i: 'MB' }, { c: '#36C76F', i: 'JK' },
  ]
  return (
    <div style={{ display: 'flex' }}>
      {seeds.map((s, idx) => (
        <div key={idx} style={{
          width: 30, height: 30, borderRadius: '50%', marginLeft: idx ? -10 : 0,
          background: `radial-gradient(circle at 33% 33%, ${s.c}, ${s.c}55)`,
          border: '2px solid #0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 700, color: '#fff', fontFamily: G.sans, zIndex: idx,
        }}>{s.i}</div>
      ))}
    </div>
  )
}

// ── Aperçu de l'app (mockup premium du hero) ────────────────────────────────
function AppPreview() {
  const SIDEBAR = [
    [LayoutDashboard, 'Dashboard', true],
    [Rss, 'Feed', false],
    [Target, 'Missions', false],
    [Folder, 'Projets', false],
    [Heart, 'Favoris', false],
    [ShoppingBag, 'Boutique CP', false],
    [Users, 'Cercle', false],
  ]
  const PERF = [
    ['Missions réalisées', '23', G.accent],
    ['CP gagnés', '250', G.gold],
    ['Projets soutenus', '18', G.cyan],
  ]
  const ringR = 26, ringC = 2 * Math.PI * ringR
  return (
    <div className="app-preview float" style={{
      background: G.bg2, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden',
      boxShadow: '0 50px 130px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04), 0 0 70px rgba(255,106,61,0.07)',
      width: '100%',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: G.bg3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo size={24} />
          <span style={{ fontFamily: G.serif, fontSize: 14, fontWeight: 800 }}>CirclUp</span>
          <span style={{ fontSize: 7.5, color: G.muted, border: `1px solid ${G.border}`, borderRadius: 4, padding: '1px 5px', letterSpacing: 1, fontWeight: 600 }}>BETA</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: G.serif, fontSize: 13, fontWeight: 800 }}>Bonjour, Rachid 👋</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Prêt à booster la communauté aujourd'hui ?</div>
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <div style={{ width: 132, background: G.bg3, borderRight: '1px solid rgba(255,255,255,0.05)', padding: '12px 9px', flexShrink: 0 }}>
          {SIDEBAR.map(([Ic, label, active]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', borderRadius: 8, marginBottom: 2, background: active ? G.accentL : 'transparent', border: `1px solid ${active ? G.accentB : 'transparent'}` }}>
              <Ic size={12} color={active ? G.accent : 'rgba(255,255,255,0.35)'} />
              <span style={{ fontSize: 10, color: active ? G.accent : 'rgba(255,255,255,0.4)', fontWeight: active ? 600 : 400 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: '14px 16px', minWidth: 0 }}>
          {/* Points */}
          <div style={{ background: 'linear-gradient(135deg, rgba(255,106,61,0.08), rgba(13,13,13,0.4) 60%, rgba(0,213,213,0.04))', border: `1px solid ${G.border}`, borderRadius: 12, padding: '13px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>Tes points disponibles</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <span style={{ fontFamily: G.num, fontSize: 30, fontWeight: 700, letterSpacing: -1, background: `linear-gradient(135deg, ${G.gold}, ${G.accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>250</span>
                <span style={{ fontFamily: G.num, fontSize: 12, fontWeight: 600, color: G.muted }}>CP</span>
              </div>
              <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.35)', marginBottom: 9 }}>Rang Starter · Prochain rang : 500 CP</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ background: 'linear-gradient(135deg,#FF6A3D,#e04820)', boxShadow: '0 4px 12px rgba(255,106,61,0.3)', borderRadius: 7, padding: '5px 10px', fontSize: 9, color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <TrendingUp size={9} /> Gagner des points
                </div>
                <div style={{ background: G.card2, border: `1px solid ${G.border}`, borderRadius: 7, padding: '5px 10px', fontSize: 9, color: G.text }}>Historique</div>
              </div>
            </div>
            <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
              <svg width={64} height={64} viewBox="0 0 64 64">
                <circle cx={32} cy={32} r={ringR} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={5} />
                <circle cx={32} cy={32} r={ringR} fill="none" stroke="url(#pg)" strokeWidth={5} strokeDasharray={`${ringC * 0.5} ${ringC}`} strokeLinecap="round" transform="rotate(-90 32 32)" />
                <defs><linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={G.gold} /><stop offset="100%" stopColor={G.accent} /></linearGradient></defs>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Crown size={13} color={G.gold} />
                <span style={{ fontSize: 7, color: G.muted, marginTop: 1 }}>250/500</span>
              </div>
            </div>
          </div>

          {/* Performances */}
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: 0.5, marginBottom: 7, textTransform: 'uppercase' }}>Tes performances</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, marginBottom: 12 }}>
            {PERF.map(([label, val, color]) => (
              <div key={label} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 9, padding: '9px 10px' }}>
                <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.3)', marginBottom: 4, lineHeight: 1.3 }}>{label}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ fontFamily: G.num, fontSize: 19, fontWeight: 700, color, letterSpacing: -0.5 }}>{val}</span>
                  <Sparkline color={color} />
                </div>
              </div>
            ))}
          </div>

          {/* Mission du moment */}
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: 0.5, marginBottom: 7, textTransform: 'uppercase' }}>Mission du moment</div>
          <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: G.cyanL, border: `1px solid ${G.cyanB}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Eye size={14} color={G.cyan} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700 }}>Visiter une boutique</div>
              <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.4)' }}>Aide un entrepreneur à gagner en visibilité</div>
            </div>
            <span style={{ fontSize: 10, color: G.gold, fontWeight: 700, fontFamily: G.num }}>+5 CP</span>
            <div style={{ background: G.accent, borderRadius: 6, padding: '4px 10px', fontSize: 9, color: '#fff', fontWeight: 700 }}>Participer</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Bloc de partage (parrainage) ────────────────────────────────────────────
function ShareBlock({ status }) {
  const [copied, setCopied] = useState(false)
  const shareUrl = `${window.location.origin}/?ref=${status.code}`
  const shareText = "Je rejoins CirclUp, la plateforme d'entraide entre e-commerçants. Inscris-toi avant le lancement 👇"
  const copy = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch (_) {} }
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input readOnly value={shareUrl} onFocus={e => e.target.select()}
          style={{ flex: 1, minWidth: 0, background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 11, padding: '12px 14px', color: G.muted, fontSize: 13, outline: 'none', fontFamily: G.num }} />
        <button onClick={copy} className="btn-primary" style={{ color: '#fff', fontWeight: 700, fontSize: 13.5, padding: '0 18px', borderRadius: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}>
          {copied ? <><Check size={15} /> Copié</> : <><Copy size={15} /> Copier</>}
        </button>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <a className="ghost" href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} target="_blank" rel="noreferrer"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: G.card2, border: `1px solid ${G.border}`, borderRadius: 11, padding: '11px', fontSize: 13.5, fontWeight: 600, color: G.text }}>
          <Share2 size={15} color={G.cyan} /> WhatsApp
        </a>
        <a className="ghost" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: G.card2, border: `1px solid ${G.border}`, borderRadius: 11, padding: '11px', fontSize: 13.5, fontWeight: 600, color: G.text }}>
          <Share2 size={15} color={G.accent} /> Partager sur X
        </a>
      </div>
    </div>
  )
}

// ── État succès (après inscription) ─────────────────────────────────────────
function SuccessPanel({ status, compact }) {
  const isFounder = status.position <= FOUNDER_SEATS
  return (
    <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: compact ? 22 : 24, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: G.cyanL, border: `1px solid ${G.cyanB}`, borderRadius: 100, padding: '6px 14px', marginBottom: 16 }}>
        <Check size={14} color={G.cyan} />
        <span style={{ fontSize: 12.5, color: G.cyan, fontWeight: 600 }}>Tu es sur la liste 🎉</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: G.num, fontSize: 34, fontWeight: 700, color: G.accent, lineHeight: 1 }}>#{status.position.toLocaleString('fr-FR')}</div>
          <div style={{ fontSize: 11, color: G.muted, marginTop: 5 }}>ta position</div>
        </div>
        <div>
          <div style={{ fontFamily: G.num, fontSize: 34, fontWeight: 700, color: G.cyan, lineHeight: 1 }}>{status.referral_count}</div>
          <div style={{ fontSize: 11, color: G.muted, marginTop: 5 }}>parrainés</div>
        </div>
        {isFounder && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: G.goldL, border: `1px solid ${G.goldB}`, borderRadius: 100, padding: '7px 13px' }}>
            <Crown size={14} color={G.gold} />
            <span style={{ fontSize: 12, color: G.gold, fontWeight: 600 }}>Fondateur</span>
          </div>
        )}
      </div>
      <p style={{ fontSize: 13.5, color: G.muted, lineHeight: 1.6, marginBottom: 16 }}>
        <b style={{ color: G.text }}>Remonte dans la file :</b> chaque e-commerçant inscrit avec ton lien te fait gagner des places.
      </p>
      <ShareBlock status={status} />
    </div>
  )
}

// ── Formulaire waitlist (réutilisable hero / CTA) ───────────────────────────
function WaitlistForm({ status, submit, ctaLabel }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const go = async () => {
    setError(''); setLoading(true)
    const r = await submit(email)
    if (!r.ok) setError(r.error); else setEmail('')
    setLoading(false)
  }
  if (status) return <SuccessPanel status={status} />
  return (
    <div style={{ width: '100%', maxWidth: 460 }}>
      <div className="wl-form-row" style={{ display: 'flex', gap: 10, width: '100%' }}>
        <input
          value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') go() }}
          type="email" inputMode="email" autoComplete="email" placeholder="Votre email"
          style={{ flex: 1, minWidth: 0, background: G.card2, border: `1px solid ${G.border}`, borderRadius: 11, padding: '14px 16px', color: '#fff', fontSize: 15, outline: 'none', fontFamily: G.sans }}
        />
        <button onClick={go} disabled={loading} className="btn-primary" style={{ color: '#fff', fontSize: 14.5, fontWeight: 700, padding: '14px 20px', borderRadius: 11, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap' }}>
          {loading ? <Loader2 size={17} className="spin" /> : <>{ctaLabel} <ArrowRight size={16} /></>}
        </button>
      </div>
      {error && <div style={{ fontSize: 12.5, color: '#FF6A6A', marginTop: 10 }}>{error}</div>}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function PreLaunch() {
  const [status, setStatus] = useState(null)
  const [count, setCount] = useState(null)

  const refParam = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('ref') : null

  useEffect(() => {
    supabase.rpc('waitlist_count').then(({ data }) => { if (typeof data === 'number') setCount(data) }).catch(() => {})
    const saved = (() => { try { return localStorage.getItem(LS_KEY) } catch (_) { return null } })()
    if (saved) {
      supabase.rpc('get_waitlist_status', { p_code: saved })
        .then(({ data }) => { if (data && !data.error) setStatus(data) }).catch(() => {})
    }
  }, [])

  const submit = useCallback(async (rawEmail) => {
    const v = (rawEmail || '').trim().toLowerCase()
    if (!v || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return { ok: false, error: 'Entre un email valide.' }
    try {
      const { data, error } = await supabase.rpc('join_waitlist', { p_email: v, p_ref: refParam })
      if (error || !data || data.error) return { ok: false, error: data?.error === 'invalid_email' ? 'Email invalide.' : 'Souci serveur, réessaie dans un instant.' }
      try { localStorage.setItem(LS_KEY, data.code) } catch (_) {}
      setStatus(data); setCount(data.total)
      return { ok: true }
    } catch (_) {
      return { ok: false, error: 'Souci serveur, réessaie dans un instant.' }
    }
  }, [refParam])

  const founderTaken = Math.min(status?.total ?? count ?? 0, FOUNDER_SEATS)
  const founderPct = Math.min(100, (founderTaken / FOUNDER_SEATS) * 100)

  const FEATURES = [
    { Ic: Users, c: G.accent, cl: G.accentL, cb: G.accentB, t: 'Entraide réelle', d: "Aidez d'autres entrepreneurs à atteindre leurs objectifs." },
    { Ic: Star, c: G.gold, cl: G.goldL, cb: G.goldB, t: 'Actions récompensées', d: 'Gagnez des points CP à chaque action utile et impactante.' },
    { Ic: Trophy, c: G.cyan, cl: G.cyanL, cb: G.cyanB, t: 'Progressez & débloquez', d: 'Montez en niveau, débloquez des avantages exclusifs.' },
    { Ic: Rocket, c: G.accent, cl: G.accentL, cb: G.accentB, t: 'Développez votre projet', d: "Plus de visibilité, plus de trafic, plus d'opportunités." },
  ]
  const STATS = [
    { Ic: Crown, c: G.gold, v: String(FOUNDER_SEATS), l: 'places de Fondateur à vie' },
    { Ic: ShieldCheck, c: G.cyan, v: '100%', l: 'actions réelles · zéro bot' },
    { Ic: Gift, c: G.accent, v: 'Bonus', l: 'de CP offerts au lancement' },
    { Ic: InfinityIcon, c: G.gold, v: '∞', l: 'opportunités à créer ensemble' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: G.bg, fontFamily: G.sans, color: G.text, overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        a { text-decoration: none; color: inherit; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-glow { 0%,100% { opacity: 0.35; } 50% { opacity: 0.7; } }
        @keyframes badge-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,106,61,0.4); } 50% { box-shadow: 0 0 0 7px rgba(255,106,61,0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
        .f1 { animation: fadeUp .6s cubic-bezier(.16,1,.3,1) both; }
        .f2 { animation: fadeUp .6s .08s cubic-bezier(.16,1,.3,1) both; }
        .f3 { animation: fadeUp .6s .16s cubic-bezier(.16,1,.3,1) both; }
        .f4 { animation: fadeUp .6s .24s cubic-bezier(.16,1,.3,1) both; }
        .f5 { animation: fadeUp .6s .32s cubic-bezier(.16,1,.3,1) both; }
        .glow { animation: pulse-glow 5s ease-in-out infinite; }
        .badge-pulse { animation: badge-pulse 2.6s ease-in-out infinite; }
        .spin { animation: spin .8s linear infinite; }
        .float { animation: floaty 7s ease-in-out infinite; }
        .btn-primary { background: linear-gradient(135deg,#FF6A3D,#e04f25) !important; box-shadow: 0 8px 32px rgba(255,106,61,.4), inset 0 1px 0 rgba(255,255,255,.2) !important; border: 1px solid rgba(255,130,70,.4) !important; transition: all .2s cubic-bezier(.16,1,.3,1) !important; }
        .btn-primary:hover { transform: translateY(-2px) !important; box-shadow: 0 16px 48px rgba(255,106,61,.5), inset 0 1px 0 rgba(255,255,255,.25) !important; }
        .btn-primary:active { transform: translateY(0) !important; }
        .ghost { transition: all .18s; }
        .ghost:hover { background: rgba(255,255,255,.08) !important; border-color: rgba(255,255,255,.18) !important; transform: translateY(-1px); }
        .card-hov { transition: transform .25s cubic-bezier(.16,1,.3,1), border-color .2s, box-shadow .25s; }
        .card-hov:hover { transform: translateY(-3px); border-color: rgba(255,255,255,.12) !important; box-shadow: 0 20px 50px rgba(0,0,0,.4) !important; }
        .nav-link { transition: color .15s; }
        .nav-link:hover { color: #fff !important; }
        input::placeholder { color: rgba(255,255,255,.3); }

        @media (max-width: 980px) {
          .hero { flex-direction: column !important; text-align: center; gap: 48px !important; }
          .hero-text { max-width: 600px !important; margin: 0 auto; }
          .hero-form, .hero-proof { justify-content: center; }
          .hero-visual { width: 100% !important; max-width: 560px; margin: 0 auto; }
        }
        @media (max-width: 720px) {
          .nav-links { display: none !important; }
          .cta-card { flex-direction: column !important; }
          .cta-visual { width: 100% !important; }
        }
        @media (max-width: 480px) {
          .wl-form-row { flex-direction: column; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${G.border}`, height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5%',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={32} />
          <span style={{ fontFamily: G.serif, fontSize: 19, fontWeight: 900, letterSpacing: -0.3 }}>CirclUp</span>
          <span style={{ fontSize: 9, color: G.muted, border: `1px solid ${G.border}`, borderRadius: 5, padding: '2px 6px', letterSpacing: 1, fontWeight: 600 }}>BETA</span>
        </Link>
        <div className="nav-links" style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
          {[['Fonctionnalités', '#fonctionnalites'], ['Comment ça marche', '#comment'], ['Pourquoi CirclUp', '#pourquoi']].map(([label, href]) => (
            <a key={label} href={href} className="nav-link" style={{ fontSize: 14, color: G.muted, fontWeight: 500 }}>{label}</a>
          ))}
        </div>
        <a href="#waitlist" className="btn-primary" style={{ color: '#fff', fontSize: 14, fontWeight: 700, padding: '9px 20px', borderRadius: 9, display: 'flex', alignItems: 'center', gap: 7 }}>
          Rejoindre la liste d'attente
        </a>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', padding: '128px 5% 80px', overflow: 'hidden' }}>
        <div className="glow" style={{ position: 'absolute', top: '5%', left: '12%', width: 720, height: 720, background: 'radial-gradient(ellipse, rgba(255,106,61,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="glow" style={{ position: 'absolute', top: '30%', right: '0%', width: 520, height: 520, background: 'radial-gradient(ellipse, rgba(0,213,213,0.05) 0%, transparent 65%)', pointerEvents: 'none', animationDelay: '2s' }} />
        <div style={{ position: 'absolute', top: 64, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,106,61,.3), rgba(0,213,213,.3), transparent)', pointerEvents: 'none' }} />

        <div className="hero" style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 56 }}>
          {/* Texte */}
          <div className="hero-text" style={{ flex: '1 1 460px', minWidth: 0 }}>
            <div className="f1 badge-pulse" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: G.accentL, border: `1px solid ${G.accentB}`, borderRadius: 100, padding: '7px 15px', marginBottom: 26 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: G.accent }} />
              <span style={{ fontSize: 11.5, color: G.accent, fontWeight: 700, letterSpacing: 1.2 }}>BIENTÔT DISPONIBLE</span>
            </div>

            <h1 className="f2" style={{ fontFamily: G.serif, fontSize: 'clamp(40px, 5.2vw, 64px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: -1.2, marginBottom: 22 }}>
              L'entraide entre<br />entrepreneurs.<br />
              <span style={{ color: G.accent, fontStyle: 'italic' }}>Récompensée.</span>
            </h1>

            <p className="f3" style={{ fontSize: 'clamp(16px, 2.2vw, 18px)', color: G.muted, lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
              CirclUp est la première plateforme d'entraide entrepreneuriale où chaque action a un impact réel et est récompensée. Ensemble, faisons grandir vos projets.
            </p>

            <div id="waitlist" className="f4 hero-form" style={{ display: 'flex', scrollMarginTop: 90 }}>
              <WaitlistForm status={status} submit={submit} ctaLabel="Rejoindre la liste d'attente" />
            </div>

            {!status && (
              <div className="f5 hero-proof" style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 26 }}>
                <AvatarStack />
                <span style={{ fontSize: 13.5, color: G.muted }}>
                  {count != null && count > 0
                    ? <><b style={{ color: G.text }}>+{count.toLocaleString('fr-FR')}</b> entrepreneurs déjà inscrits</>
                    : <>Rejoins les tout premiers inscrits</>}
                </span>
              </div>
            )}
          </div>

          {/* Visuel */}
          <div className="hero-visual f3" style={{ flex: '1 1 520px', width: 520, maxWidth: 560, minWidth: 0 }}>
            <AppPreview />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="fonctionnalites" style={{ padding: '20px 5% 30px', scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', background: G.card, border: `1px solid ${G.border}`, borderRadius: 22, padding: 'clamp(28px, 4vw, 44px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 28 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: f.cl, border: `1px solid ${f.cb}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: `0 8px 28px ${f.cl}` }}>
                  <f.Ic size={26} color={f.c} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 9 }}>{f.t}</h3>
                <p style={{ fontSize: 13.5, color: G.muted, lineHeight: 1.6, maxWidth: 240, margin: '0 auto' }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section id="comment" style={{ padding: '70px 5% 30px', maxWidth: 1000, margin: '0 auto', scrollMarginTop: 80 }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 style={{ fontFamily: G.serif, fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 700, marginBottom: 12 }}>Comment ça marche</h2>
          <p style={{ color: G.muted, fontSize: 15.5, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>Une économie d'entraide entre boutiques, où chaque coup de pouce compte vraiment.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          {[
            { Ic: Eye, c: G.accent, cl: G.accentL, cb: G.accentB, t: 'Publie une mission', d: "Demande du soutien pour ta boutique — visite, avis, partage — et dote-la en points CP." },
            { Ic: Users, c: G.cyan, cl: G.cyanL, cb: G.cyanB, t: 'Soutiens, gagne des CP', d: 'Aide les autres, fais valider ton action et encaisse tes points. Le soutien circule.' },
            { Ic: Trophy, c: G.gold, cl: G.goldL, cb: G.goldB, t: 'Monte en puissance', d: 'Dépense tes CP en boosts, cosmétiques et statuts. Plus tu participes, plus ta boutique rayonne.' },
          ].map((s, i) => (
            <div key={i} className="card-hov" style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 18, padding: 26 }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, background: s.cl, border: `1px solid ${s.cb}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <s.Ic size={22} color={s.c} />
              </div>
              <div style={{ fontSize: 11, fontFamily: G.num, color: s.c, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>ÉTAPE {i + 1}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{s.t}</h3>
              <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.65 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── POURQUOI CIRCLUP ── */}
      <section id="pourquoi" style={{ padding: '70px 5%', scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: G.accentL, border: `1px solid ${G.accentB}`, borderRadius: 100, padding: '6px 14px', marginBottom: 18 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: G.accent }} />
              <span style={{ fontSize: 11, color: G.accent, fontWeight: 700, letterSpacing: 1.5 }}>POURQUOI CIRCLUP ?</span>
            </div>
            <h2 style={{ fontFamily: G.serif, fontSize: 'clamp(28px, 4.4vw, 44px)', fontWeight: 900, letterSpacing: -0.8, marginBottom: 14 }}>
              Entrepreneurs, on va plus loin <span style={{ color: G.accent, fontStyle: 'italic' }}>ensemble.</span>
            </h2>
            <p style={{ color: G.muted, fontSize: 16.5, maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>CirclUp transforme l'entraide en un moteur de croissance pour vos projets.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
            {STATS.map((s, i) => (
              <div key={i} className="card-hov" style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 18, padding: '28px 24px', textAlign: 'center' }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: G.card2, border: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <s.Ic size={24} color={s.c} />
                </div>
                <div style={{ fontFamily: G.num, fontSize: 34, fontWeight: 700, color: s.c, letterSpacing: -1, marginBottom: 6 }}>{s.v}</div>
                <div style={{ fontSize: 13.5, color: G.muted, lineHeight: 1.5 }}>{s.l}</div>
              </div>
            ))}
          </div>
          {/* Jauge Fondateurs */}
          <div style={{ maxWidth: 540, margin: '40px auto 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 8 }}>
              <span style={{ color: G.gold, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Crown size={14} /> Places de Fondateur</span>
              <span style={{ color: G.muted, fontFamily: G.num }}>{founderTaken} / {FOUNDER_SEATS}</span>
            </div>
            <div style={{ height: 9, background: 'rgba(255,255,255,0.05)', borderRadius: 100, overflow: 'hidden', border: `1px solid ${G.border}` }}>
              <div style={{ width: `${founderPct}%`, height: '100%', background: `linear-gradient(90deg, ${G.gold}, ${G.accent})`, borderRadius: 100, transition: 'width .6s cubic-bezier(.16,1,.3,1)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── ACCÈS PRIORITAIRE (CTA) ── */}
      <section style={{ padding: '40px 5% 90px' }}>
        <div className="cta-card" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 'clamp(28px, 5vw, 56px)', background: 'linear-gradient(135deg, rgba(255,106,61,0.06), rgba(13,13,13,0.4) 60%, rgba(0,213,213,0.04))', border: `1px solid ${G.accentB}`, borderRadius: 26, padding: 'clamp(30px, 5vw, 56px)' }}>
          {/* Visuel enveloppe */}
          <div className="cta-visual" style={{ flex: '0 0 240px', width: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div className="glow" style={{ position: 'absolute', width: 220, height: 220, background: 'radial-gradient(circle, rgba(255,106,61,0.25) 0%, transparent 65%)', pointerEvents: 'none' }} />
            <div className="float" style={{ position: 'relative', width: 150, height: 110, borderRadius: 16, background: 'linear-gradient(145deg, #161616, #0c0c0c)', border: `1px solid ${G.accentB}`, boxShadow: '0 30px 70px rgba(0,0,0,0.6), 0 0 50px rgba(255,106,61,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={52} color={G.accent} strokeWidth={1.4} />
              <div style={{ position: 'absolute', top: -16, right: -16, width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #FF6A3D, #e04f25)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(255,106,61,0.5)' }}>
                <span style={{ fontFamily: G.serif, fontSize: 22, fontWeight: 900, color: '#fff' }}>C</span>
              </div>
            </div>
          </div>

          {/* Texte + form */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: G.accentL, border: `1px solid ${G.accentB}`, borderRadius: 100, padding: '6px 14px', marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: G.accent }} />
              <span style={{ fontSize: 11, color: G.accent, fontWeight: 700, letterSpacing: 1.5 }}>ACCÈS PRIORITAIRE</span>
            </div>
            <h2 style={{ fontFamily: G.serif, fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: -0.8, marginBottom: 14 }}>
              Soyez parmi les premiers.<br />Rejoignez la <span style={{ color: G.accent, fontStyle: 'italic' }}>beta.</span>
            </h2>
            <p style={{ fontSize: 15.5, color: G.muted, lineHeight: 1.6, marginBottom: 26, maxWidth: 520 }}>
              Inscrivez-vous dès maintenant pour accéder en priorité à la plateforme et bénéficier d'avantages exclusifs dès le lancement.
            </p>
            <WaitlistForm status={status} submit={submit} ctaLabel="Je veux y accéder en premier" />
            {!status && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 22px', marginTop: 20 }}>
                {['Accès prioritaire garanti', 'Aucun spam', 'Désinscription en 1 clic'].map(t => (
                  <span key={t} style={{ fontSize: 12.5, color: G.muted, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                    <CheckCircle2 size={14} color={G.cyan} /> {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${G.border}`, padding: '48px 5% 32px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 40 }}>
          <div style={{ maxWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Logo size={30} />
              <span style={{ fontFamily: G.serif, fontSize: 17, fontWeight: 900 }}>CirclUp</span>
              <span style={{ fontSize: 8.5, color: G.muted, border: `1px solid ${G.border}`, borderRadius: 5, padding: '2px 6px', letterSpacing: 1, fontWeight: 600 }}>BETA</span>
            </div>
            <p style={{ fontSize: 13.5, color: G.muted, lineHeight: 1.6 }}>L'entraide entre entrepreneurs.<br /><span style={{ color: G.accent }}>Récompensée.</span></p>
          </div>

          {[
            { h: 'Produit', items: [['Fonctionnalités', '#fonctionnalites'], ['Comment ça marche', '#comment'], ['Tarifs (bientôt)', null]] },
            { h: 'Ressources', items: [['FAQ', '#pourquoi'], ['Centre d\'aide', 'mailto:contact@circlup.fr'], ['Nous contacter', 'mailto:contact@circlup.fr']] },
            { h: 'À propos', items: [['Notre mission', '#pourquoi'], ['Se connecter', '/login'], ['Contact', 'mailto:contact@circlup.fr']] },
          ].map(col => (
            <div key={col.h}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>{col.h}</div>
              {col.items.map(([label, href]) => (
                href === null
                  ? <div key={label} style={{ fontSize: 13, color: G.faint, marginBottom: 10 }}>{label}</div>
                  : href.startsWith('/')
                    ? <Link key={label} to={href} className="nav-link" style={{ display: 'block', fontSize: 13, color: G.muted, marginBottom: 10 }}>{label}</Link>
                    : <a key={label} href={href} className="nav-link" style={{ display: 'block', fontSize: 13, color: G.muted, marginBottom: 10 }}>{label}</a>
              ))}
            </div>
          ))}

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Suivez-nous</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[[Twitter, 'https://twitter.com'], [Linkedin, 'https://linkedin.com'], [Instagram, 'https://instagram.com'], [Youtube, 'https://youtube.com']].map(([Ic, url], i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer" className="ghost" aria-label="réseau social"
                  style={{ width: 36, height: 36, borderRadius: 10, background: G.card2, border: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: G.muted }}>
                  <Ic size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1160, margin: '36px auto 0', paddingTop: 24, borderTop: `1px solid ${G.border}`, textAlign: 'center', fontSize: 12.5, color: G.faint }}>
          © {new Date().getFullYear()} CirclUp. Tous droits réservés.
        </div>
      </footer>
    </div>
  )
}
