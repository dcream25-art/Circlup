import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  ArrowRight, Crown, Sparkles, Users, Share2, Check, Copy,
  Eye, Repeat2, Trophy, Gift, Star, Loader2,
} from 'lucide-react'

// ── Charte (alignée sur Landing.js) ─────────────────────────────────────────
const G = {
  bg: '#050505', bg2: '#0A0A0A',
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

const FOUNDER_SEATS = 200          // référence : badge Fondateur (200 ex.)
const LS_KEY = 'circlup_wl_code'

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

function Stat({ value, label, color }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 92 }}>
      <div style={{ fontFamily: G.num, fontSize: 30, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: G.muted, marginTop: 6, letterSpacing: 0.3 }}>{label}</div>
    </div>
  )
}

export default function PreLaunch() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)        // { code, position, total, referral_count }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [count, setCount] = useState(null)          // compteur public live

  // Lien de parrainage capturé dans l'URL (?ref=CODE)
  const refParam = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('ref')
    : null

  const refreshCount = useCallback(async () => {
    try {
      const { data } = await supabase.rpc('waitlist_count')
      if (typeof data === 'number') setCount(data)
    } catch (_) {}
  }, [])

  // Au montage : compteur live + restauration de l'inscription via localStorage
  useEffect(() => {
    refreshCount()
    const saved = (() => { try { return localStorage.getItem(LS_KEY) } catch (_) { return null } })()
    if (saved) {
      supabase.rpc('get_waitlist_status', { p_code: saved })
        .then(({ data }) => { if (data && !data.error) setStatus(data) })
        .catch(() => {})
    }
  }, [refreshCount])

  const submit = async () => {
    const v = email.trim().toLowerCase()
    setError('')
    if (!v || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { setError('Entre un email valide.'); return }
    setLoading(true)
    try {
      const { data, error: rpcErr } = await supabase.rpc('join_waitlist', { p_email: v, p_ref: refParam })
      if (rpcErr) throw rpcErr
      if (!data || data.error) { setError('Email invalide, réessaie.'); setLoading(false); return }
      try { localStorage.setItem(LS_KEY, data.code) } catch (_) {}
      setStatus(data)
      setCount(data.total)
      setEmail('')
    } catch (_) {
      setError("Oups, un souci côté serveur. Réessaie dans un instant.")
    }
    setLoading(false)
  }

  const shareUrl = status
    ? `${window.location.origin}/?ref=${status.code}`
    : ''
  const shareText = "Je rejoins CirclUp, la plateforme d'entraide entre e-commerçants. Inscris-toi avant le lancement 👇"

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 1800) }
    catch (_) {}
  }

  const founderTaken = Math.min(status?.total ?? count ?? 0, FOUNDER_SEATS)
  const founderPct = Math.min(100, (founderTaken / FOUNDER_SEATS) * 100)
  const isFounderRange = status && status.position <= FOUNDER_SEATS

  return (
    <div style={{ minHeight: '100vh', background: G.bg, fontFamily: G.sans, color: G.text, overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-glow { 0%,100% { opacity: 0.35; } 50% { opacity: 0.7; } }
        @keyframes badge-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,106,61,0.4); } 50% { box-shadow: 0 0 0 7px rgba(255,106,61,0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .f1 { animation: fadeUp .6s cubic-bezier(.16,1,.3,1) both; }
        .f2 { animation: fadeUp .6s .08s cubic-bezier(.16,1,.3,1) both; }
        .f3 { animation: fadeUp .6s .16s cubic-bezier(.16,1,.3,1) both; }
        .f4 { animation: fadeUp .6s .24s cubic-bezier(.16,1,.3,1) both; }
        .f5 { animation: fadeUp .6s .32s cubic-bezier(.16,1,.3,1) both; }
        .glow { animation: pulse-glow 5s ease-in-out infinite; }
        .badge-pulse { animation: badge-pulse 2.6s ease-in-out infinite; }
        .spin { animation: spin .8s linear infinite; }
        .btn-primary { background: linear-gradient(135deg,#FF6A3D,#e04f25) !important; box-shadow: 0 8px 32px rgba(255,106,61,.4), inset 0 1px 0 rgba(255,255,255,.2) !important; border: 1px solid rgba(255,130,70,.4) !important; transition: all .2s cubic-bezier(.16,1,.3,1) !important; }
        .btn-primary:hover { transform: translateY(-2px) !important; box-shadow: 0 16px 48px rgba(255,106,61,.5), inset 0 1px 0 rgba(255,255,255,.25) !important; }
        .btn-primary:active { transform: translateY(0) !important; }
        .ghost { transition: all .18s; }
        .ghost:hover { background: rgba(255,255,255,.08) !important; border-color: rgba(255,255,255,.18) !important; }
        input::placeholder { color: rgba(255,255,255,.3); }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${G.border}`, height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5%',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={30} />
          <span style={{ fontFamily: G.serif, fontSize: 18, fontWeight: 900, letterSpacing: -0.3 }}>CirclUp</span>
          <span style={{ fontSize: 8.5, color: G.accent, border: `1px solid ${G.accentB}`, background: G.accentL, borderRadius: 5, padding: '2px 6px', letterSpacing: 1, fontWeight: 700 }}>PRÉ-LANCEMENT</span>
        </Link>
        <Link to="/login" className="ghost" style={{ fontSize: 13, color: G.muted, fontWeight: 500, padding: '7px 16px', borderRadius: 9, border: `1px solid ${G.border}` }}>
          Se connecter
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '110px 6% 70px', textAlign: 'center', overflow: 'hidden' }}>
        <div className="glow" style={{ position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)', width: 760, height: 760, maxWidth: '120vw', background: 'radial-gradient(ellipse, rgba(255,106,61,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="glow" style={{ position: 'absolute', bottom: '0%', right: '0%', width: 480, height: 480, background: 'radial-gradient(ellipse, rgba(0,213,213,0.05) 0%, transparent 65%)', pointerEvents: 'none', animationDelay: '2s' }} />
        <div style={{ position: 'absolute', top: 60, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,106,61,.3), rgba(0,213,213,.3), transparent)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', width: '100%', maxWidth: 640 }}>
          {/* Pill */}
          <div className="f1 badge-pulse" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: G.accentL, border: `1px solid ${G.accentB}`, borderRadius: 100, padding: '7px 16px', marginBottom: 28 }}>
            <Sparkles size={14} color={G.accent} />
            <span style={{ fontSize: 12, color: G.accent, fontWeight: 600, letterSpacing: 0.2 }}>Bientôt disponible · accès Fondateur ouvert</span>
          </div>

          <h1 className="f2" style={{ fontFamily: G.serif, fontSize: 'clamp(36px, 7vw, 62px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: -1, marginBottom: 22 }}>
            La plateforme où les<br />e-commerçants<br />
            <span style={{ color: G.accent, fontStyle: 'italic' }}>se soutiennent.</span>
          </h1>

          <p className="f3" style={{ fontSize: 'clamp(16px, 2.4vw, 19px)', color: G.muted, lineHeight: 1.65, marginBottom: 36, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
            Échangez du vrai soutien — visites, avis, partages — gagnez des points <b style={{ color: G.text }}>CP</b> et faites grandir votre boutique en communauté. <b style={{ color: G.text }}>On ouvre bientôt.</b> Réserve ta place.
          </p>

          {/* ── Carte capture / succès ── */}
          {!status ? (
            <div className="f4" style={{ maxWidth: 520, margin: '0 auto' }}>
              {/* Offre Fondateur */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', background: G.goldL, border: `1px solid ${G.goldB}`, borderRadius: 14, padding: '14px 16px', marginBottom: 18 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(245,200,66,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Crown size={19} color={G.gold} />
                </div>
                <div style={{ fontSize: 13.5, color: '#E9E2C8', lineHeight: 1.5 }}>
                  Les <b style={{ color: G.gold }}>{FOUNDER_SEATS} premiers inscrits</b> deviennent <b style={{ color: G.gold }}>Fondateurs</b> : badge exclusif à vie + stock de CP offert au lancement.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 0, boxShadow: '0 12px 40px rgba(0,0,0,0.4)', borderRadius: 13 }}>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') submit() }}
                  type="email" inputMode="email" autoComplete="email"
                  placeholder="ton@email.com"
                  style={{ flex: 1, minWidth: 0, background: G.card2, border: `1px solid ${G.border}`, borderRight: 'none', borderRadius: '13px 0 0 13px', padding: '15px 18px', color: '#fff', fontSize: 15, outline: 'none', fontFamily: G.sans }}
                />
                <button onClick={submit} disabled={loading} className="btn-primary" style={{ color: '#fff', fontSize: 15, fontWeight: 700, padding: '0 22px', borderRadius: '0 13px 13px 0', cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                  {loading ? <Loader2 size={17} className="spin" /> : <>Je réserve <ArrowRight size={16} /></>}
                </button>
              </div>
              {error && <div style={{ fontSize: 12.5, color: '#FF6A6A', marginTop: 10 }}>{error}</div>}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 18, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12.5, color: G.muted, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Check size={13} color={G.cyan} /> Zéro spam — juste l'invitation au lancement
                </span>
                {count != null && count > 0 && (
                  <span style={{ fontSize: 12.5, color: G.text, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Users size={13} color={G.accent} /> <b>{count.toLocaleString('fr-FR')}</b> déjà inscrits
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="f4" style={{ maxWidth: 540, margin: '0 auto', background: G.card, border: `1px solid ${G.border}`, borderRadius: 20, padding: 'clamp(22px, 5vw, 34px)', boxShadow: '0 24px 70px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: G.cyanL, border: `1px solid ${G.cyanB}`, borderRadius: 100, padding: '6px 14px', marginBottom: 20 }}>
                <Check size={14} color={G.cyan} />
                <span style={{ fontSize: 12.5, color: G.cyan, fontWeight: 600 }}>Tu es sur la liste 🎉</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(20px, 8vw, 44px)', marginBottom: 8, flexWrap: 'wrap' }}>
                <Stat value={`#${(status.position).toLocaleString('fr-FR')}`} label="Ta position" color={G.accent} />
                <Stat value={(status.total).toLocaleString('fr-FR')} label="Inscrits" color={G.text} />
                <Stat value={status.referral_count} label="Parrainés" color={G.cyan} />
              </div>

              {isFounderRange && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: G.goldL, border: `1px solid ${G.goldB}`, borderRadius: 100, padding: '6px 14px', margin: '12px 0 4px' }}>
                  <Crown size={14} color={G.gold} />
                  <span style={{ fontSize: 12.5, color: G.gold, fontWeight: 600 }}>Tu es dans les {FOUNDER_SEATS} Fondateurs</span>
                </div>
              )}

              <p style={{ fontSize: 14.5, color: G.muted, lineHeight: 1.6, margin: '18px auto 20px', maxWidth: 420 }}>
                <b style={{ color: G.text }}>Remonte dans la file :</b> chaque e-commerçant qui s'inscrit avec ton lien te fait gagner des places.
              </p>

              {/* Lien de parrainage */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input readOnly value={shareUrl} onFocus={e => e.target.select()}
                  style={{ flex: 1, minWidth: 0, background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 11, padding: '12px 14px', color: G.muted, fontSize: 13, outline: 'none', fontFamily: G.num }} />
                <button onClick={copyLink} className="btn-primary" style={{ color: '#fff', fontWeight: 700, fontSize: 13.5, padding: '0 18px', borderRadius: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}>
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
          )}

          {/* Jauge Fondateurs */}
          <div className="f5" style={{ maxWidth: 520, margin: '32px auto 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
              <span style={{ color: G.gold, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Crown size={13} /> Places de Fondateur</span>
              <span style={{ color: G.muted, fontFamily: G.num }}>{founderTaken} / {FOUNDER_SEATS}</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 100, overflow: 'hidden', border: `1px solid ${G.border}` }}>
              <div style={{ width: `${founderPct}%`, height: '100%', background: `linear-gradient(90deg, ${G.gold}, ${G.accent})`, borderRadius: 100, transition: 'width .6s cubic-bezier(.16,1,.3,1)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section style={{ padding: '20px 6% 80px', maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ fontFamily: G.serif, fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
          Comment ça marche
        </h2>
        <p style={{ textAlign: 'center', color: G.muted, fontSize: 15, marginBottom: 44, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
          Une économie d'entraide entre boutiques, où chaque coup de pouce compte vraiment.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          {[
            { icon: <Eye size={22} color={G.accent} />, c: G.accent, cl: G.accentL, cb: G.accentB, t: 'Publie une mission', d: "Demande du soutien pour ta boutique — une visite, un avis, un partage — et dote-la en points CP." },
            { icon: <Repeat2 size={22} color={G.cyan} />, c: G.cyan, cl: G.cyanL, cb: G.cyanB, t: 'Soutiens, gagne des CP', d: 'Aide les autres e-commerçants, fais valider ton action et encaisse tes points. Le soutien circule.' },
            { icon: <Trophy size={22} color={G.gold} />, c: G.gold, cl: G.goldL, cb: G.goldB, t: 'Monte en puissance', d: 'Dépense tes CP en boosts, cosmétiques et statuts. Plus tu participes, plus ta boutique rayonne.' },
          ].map((s, i) => (
            <div key={i} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 18, padding: 26 }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, background: s.cl, border: `1px solid ${s.cb}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                {s.icon}
              </div>
              <div style={{ fontSize: 11, fontFamily: G.num, color: s.c, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>ÉTAPE {i + 1}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{s.t}</h3>
              <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.65 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BANDEAU AVANTAGES FONDATEUR ── */}
      <section style={{ padding: '0 6% 90px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(245,200,66,0.07), rgba(255,106,61,0.05))', border: `1px solid ${G.goldB}`, borderRadius: 22, padding: 'clamp(28px, 5vw, 44px)', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 16, background: 'rgba(245,200,66,0.12)', border: `1px solid ${G.goldB}`, marginBottom: 18 }}>
            <Crown size={26} color={G.gold} />
          </div>
          <h2 style={{ fontFamily: G.serif, fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, marginBottom: 14 }}>
            Pourquoi s'inscrire maintenant ?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 28, textAlign: 'left' }}>
            {[
              { icon: <Crown size={17} color={G.gold} />, t: 'Badge Fondateur à vie', d: 'Réservé aux 200 premiers — visible par toute la communauté.' },
              { icon: <Gift size={17} color={G.accent} />, t: 'Stock de CP offert', d: 'Démarre avec une longueur d\'avance dès l\'ouverture.' },
              { icon: <Star size={17} color={G.cyan} />, t: 'Accès anticipé', d: 'Sois parmi les premiers à publier tes missions au lancement.' },
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ marginTop: 2, flexShrink: 0 }}>{b.icon}</div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 4 }}>{b.t}</div>
                  <div style={{ fontSize: 13, color: G.muted, lineHeight: 1.55 }}>{b.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${G.border}`, padding: '32px 6%', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={26} />
          <span style={{ fontFamily: G.serif, fontSize: 15, fontWeight: 900 }}>CirclUp</span>
          <span style={{ fontSize: 12, color: G.faint }}>· {new Date().getFullYear()}</span>
        </div>
        <div style={{ display: 'flex', gap: 22, fontSize: 13, color: G.muted, flexWrap: 'wrap' }}>
          <a href="mailto:contact@circlup.fr" className="ghost" style={{ padding: '4px 0' }}>Contact</a>
          <a href="mailto:contact@circlup.fr?subject=Confidentialité" className="ghost" style={{ padding: '4px 0' }}>Confidentialité</a>
          <Link to="/login" className="ghost" style={{ padding: '4px 0' }}>Se connecter</Link>
        </div>
      </footer>
    </div>
  )
}
