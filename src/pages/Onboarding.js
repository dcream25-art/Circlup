import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Zap, ArrowRight, CheckCircle, ExternalLink } from 'lucide-react'

const G = {
  bg: '#050505', bg2: '#0A0A0A', bg3: '#0D0D0D',
  card: 'rgba(255,255,255,0.03)', card2: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.06)', borderHover: 'rgba(255,255,255,0.12)',
  accent: '#FF6A3D', accentL: 'rgba(255,106,61,0.08)', accentB: 'rgba(255,106,61,0.2)',
  cyan: '#00D5D5', cyanL: 'rgba(0,213,213,0.08)', cyanB: 'rgba(0,213,213,0.2)',
  gold: '#F5C518', goldL: 'rgba(245,197,24,0.08)', goldB: 'rgba(245,197,24,0.2)',
  text: '#FFFFFF', muted: '#9A9A9A', faint: 'rgba(255,255,255,0.12)',
  serif: "'Playfair Display', Georgia, serif", sans: "'DM Sans', system-ui, sans-serif",
}

const NICHES = [
  'Mode & Accessoires', 'Bijoux & Créations', 'Art & Illustration', 'Maison & Déco',
  'Beauté & Bien-être', 'Alimentation & Boissons', 'Enfants & Famille', 'Sport & Outdoor',
  'Tech & Gadgets', 'Services & Coaching', 'Autre'
]

const CHANNELS = [
  { id: 'etsy',      label: 'Etsy',          emoji: '🛍️', color: '#F1641E', colorL: 'rgba(241,100,30,0.1)',  colorB: 'rgba(241,100,30,0.25)',  desc: 'Marketplace artisanale & créative' },
  { id: 'shopify',   label: 'Shopify',        emoji: '🏪', color: '#96BF48', colorL: 'rgba(150,191,72,0.1)',  colorB: 'rgba(150,191,72,0.25)',   desc: 'Boutique e-commerce indépendante' },
  { id: 'woo',       label: 'WooCommerce',    emoji: '⚡', color: '#7F54B3', colorL: 'rgba(127,84,179,0.1)',  colorB: 'rgba(127,84,179,0.25)',   desc: 'WordPress + WooCommerce' },
  { id: 'amazon',    label: 'Amazon',         emoji: '📦', color: '#FF9900', colorL: 'rgba(255,153,0,0.1)',   colorB: 'rgba(255,153,0,0.25)',    desc: 'Marketplace Amazon / FBA' },
  { id: 'instagram', label: 'Instagram',      emoji: '📸', color: '#E1306C', colorL: 'rgba(225,48,108,0.1)',  colorB: 'rgba(225,48,108,0.25)',   desc: 'Vente via Instagram / DM' },
  { id: 'site',      label: 'Site personnel', emoji: '🌐', color: '#00D5D5', colorL: 'rgba(0,213,213,0.08)',  colorB: 'rgba(0,213,213,0.2)',     desc: 'Mon propre site web' },
  { id: 'autre',     label: 'Autre',          emoji: '✨', color: '#F5C518', colorL: 'rgba(245,197,24,0.08)', colorB: 'rgba(245,197,24,0.2)',    desc: 'Autre plateforme ou canal' },
]

const STEPS = [
  { id: 1, title: 'Ton projet' },
  { id: 2, title: 'Plateforme' },
  { id: 3, title: 'Niche' },
  { id: 4, title: 'Prêt !' },
]

export default function Onboarding() {
  const { profile, updateProfile, completeOnboarding } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [shopName, setShopName] = useState(profile?.shop_name || '')
  const [shopUrl, setShopUrl]   = useState(profile?.shop_url || '')
  const [bio, setBio]           = useState(profile?.bio || '')
  const [channel, setChannel]   = useState(profile?.sales_channel || '')
  const [niche, setNiche]       = useState(profile?.niche || '')

  const inp = {
    width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${G.border}`,
    borderRadius: 10, padding: '13px 15px', color: G.text, fontSize: 14,
    outline: 'none', fontFamily: G.sans, boxSizing: 'border-box', transition: 'border-color 0.2s',
  }

  const canNext = () => {
    if (step === 1) return shopName.trim().length > 0
    if (step === 2) return channel.length > 0
    if (step === 3) return niche.length > 0
    return true
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      await updateProfile({ shop_name: shopName, shop_url: shopUrl, niche, bio, sales_channel: channel })
      await completeOnboarding()
      navigate('/app')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const selectedChannel = CHANNELS.find(c => c.id === channel)

  return (
    <div style={{
      minHeight: '100vh', background: G.bg, fontFamily: G.sans, color: G.text,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea { transition: border-color 0.2s; }
        input:focus, textarea:focus { border-color: rgba(255,106,61,0.35) !important; outline: none; }
        .channel-card { transition: all 0.18s cubic-bezier(0.22,1,0.36,1); }
        .channel-card:hover { transform: translateY(-1px); border-color: rgba(255,255,255,0.1) !important; }
        .niche-btn { transition: all 0.15s; }
        .niche-btn:hover { border-color: rgba(255,106,61,0.25) !important; }
        .onb-back:hover { border-color: rgba(255,255,255,0.12) !important; }
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400,
        background: 'radial-gradient(circle, rgba(255,106,61,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 560, position: 'relative' }}>

        {/* Logo + headline */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, overflow: 'hidden', marginBottom: 18, display: 'inline-block', background: '#0a0a0a' }}>
            <img src="/logo.png" alt="CirclUp" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.35)' }}
              onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }} />
            <div style={{ display: 'none', width: '100%', height: '100%', background: 'linear-gradient(135deg, #FF6A3D, #FF4D1C)', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: G.serif, fontSize: 26, fontWeight: 900, color: '#fff' }}>C</span>
            </div>
          </div>
          <div style={{ fontFamily: G.serif, fontSize: 26, fontWeight: 900, marginBottom: 6, lineHeight: 1.2 }}>
            Bienvenue sur CirclUp
          </div>
          <div style={{ fontSize: 14, color: G.muted, lineHeight: 1.6 }}>
            Quelques infos pour personnaliser ton expérience
          </div>
        </div>

        {/* Progress steps */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 32, alignItems: 'center' }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'initial' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: s.id < step ? G.accent : s.id === step ? 'transparent' : 'rgba(255,255,255,0.05)',
                  border: s.id === step ? `2px solid ${G.accent}` : s.id < step ? 'none' : `1px solid rgba(255,255,255,0.1)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s',
                  boxShadow: s.id === step ? `0 0 0 4px rgba(255,106,61,0.1)` : 'none',
                }}>
                  {s.id < step
                    ? <CheckCircle size={14} color="#fff" />
                    : <span style={{ fontSize: 11, fontWeight: 700, color: s.id === step ? G.accent : G.faint }}>{s.id}</span>
                  }
                </div>
                <span style={{
                  fontSize: 10, color: s.id <= step ? G.accent : G.faint,
                  fontWeight: s.id === step ? 700 : 400, whiteSpace: 'nowrap',
                  letterSpacing: 0.3,
                }}>
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 1,
                  background: s.id < step ? G.accent : 'rgba(255,255,255,0.07)',
                  margin: '0 8px', marginBottom: 20,
                  transition: 'background 0.4s',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: G.bg2, border: `1px solid rgba(255,255,255,0.07)`,
          borderRadius: 20, padding: '32px 28px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
        }}>

          {/* STEP 1 — Projet */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: G.serif, fontSize: 22, fontWeight: 900, marginBottom: 6, lineHeight: 1.25 }}>
                Parle-nous de ton projet
              </h2>
              <p style={{ fontSize: 13, color: G.muted, marginBottom: 26, lineHeight: 1.65 }}>
                Ces infos permettent aux membres de te découvrir et de faire des missions pertinentes.
              </p>

              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 11, color: G.muted, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>
                  Nom de ta boutique / projet *
                </label>
                <input value={shopName} onChange={e => setShopName(e.target.value)} placeholder="Ex: Bijoux Bohème by Sophie" style={inp} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 11, color: G.muted, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>
                  URL de ta boutique
                </label>
                <div style={{ position: 'relative' }}>
                  <ExternalLink size={13} color={G.faint} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input value={shopUrl} onChange={e => setShopUrl(e.target.value)} placeholder="https://etsy.com/shop/ton-shop" style={{ ...inp, paddingLeft: 36 }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: G.muted, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>
                  Bio courte
                </label>
                <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Ex: Je crée des bijoux fait-main inspirés de la nature, pour les femmes qui aiment l'artisanat local..." style={{ ...inp, resize: 'vertical' }} />
              </div>
            </div>
          )}

          {/* STEP 2 — Canal de vente */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: G.serif, fontSize: 22, fontWeight: 900, marginBottom: 6, lineHeight: 1.25 }}>
                Sur quelle plateforme vends-tu ?
              </h2>
              <p style={{ fontSize: 13, color: G.muted, marginBottom: 26, lineHeight: 1.65 }}>
                Les missions proposées seront adaptées à ta plateforme pour maximiser ton impact.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {CHANNELS.map(c => {
                  const active = channel === c.id
                  return (
                    <button key={c.id} className="channel-card" onClick={() => setChannel(c.id)} style={{
                      background: active ? c.colorL : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${active ? c.colorB : G.border}`,
                      borderRadius: 12, padding: '13px 15px', cursor: 'pointer',
                      textAlign: 'left', fontFamily: G.sans,
                      display: 'flex', alignItems: 'center', gap: 11,
                      boxShadow: active ? `0 4px 16px ${c.colorL}` : 'none',
                    }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{c.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: active ? c.color : G.text }}>{c.label}</div>
                        <div style={{ fontSize: 11, color: G.faint, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.desc}</div>
                      </div>
                      {active && <CheckCircle size={14} color={c.color} style={{ flexShrink: 0 }} />}
                    </button>
                  )
                })}
              </div>

              {channel && (
                <div style={{
                  marginTop: 16,
                  background: selectedChannel?.colorL, border: `1px solid ${selectedChannel?.colorB}`,
                  borderRadius: 10, padding: '11px 14px',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 16 }}>{selectedChannel?.emoji}</span>
                  <span style={{ fontSize: 13, color: selectedChannel?.color, fontWeight: 600 }}>
                    Les missions seront optimisées pour <strong>{selectedChannel?.label}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — Niche */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: G.serif, fontSize: 22, fontWeight: 900, marginBottom: 6, lineHeight: 1.25 }}>
                Ta niche
              </h2>
              <p style={{ fontSize: 13, color: G.muted, marginBottom: 26, lineHeight: 1.65 }}>
                Tu seras mis en relation avec des vendeurs de la même niche pour un cercle d'entraide ultra-pertinent.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {NICHES.map(n => (
                  <button key={n} className="niche-btn" onClick={() => setNiche(n)} style={{
                    background: niche === n ? G.accentL : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${niche === n ? G.accentB : G.border}`,
                    color: niche === n ? G.accent : G.muted,
                    borderRadius: 10, padding: '11px 14px', cursor: 'pointer',
                    fontSize: 13, fontFamily: G.sans, fontWeight: niche === n ? 700 : 400,
                    textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    {niche === n && <CheckCircle size={13} color={G.accent} style={{ flexShrink: 0 }} />}
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4 — Résumé */}
          {step === 4 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(255,106,61,0.2), rgba(255,106,61,0.05))',
                border: `1px solid ${G.accentB}`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 18, fontSize: 32,
              }}>
                🎉
              </div>
              <h2 style={{ fontFamily: G.serif, fontSize: 24, fontWeight: 900, marginBottom: 10, lineHeight: 1.2 }}>
                Tu es prêt à décoller !
              </h2>
              <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.75, marginBottom: 24 }}>
                Tu commences avec <strong style={{ color: G.gold }}>50 CP</strong> de bienvenue.<br />
                Rejoins le feed, publie ton projet, et commence à recevoir des missions de la communauté.
              </p>

              <div style={{
                background: G.card, border: `1px solid ${G.border}`,
                borderRadius: 14, overflow: 'hidden', textAlign: 'left', marginBottom: 16,
              }}>
                {[
                  { label: 'Boutique',   value: shopName || '—',   color: G.text },
                  { label: 'Plateforme', value: selectedChannel ? `${selectedChannel.emoji} ${selectedChannel.label}` : '—', color: selectedChannel?.color || G.text },
                  { label: 'Niche',      value: niche || '—',      color: G.cyan },
                ].map(({ label, value, color }, i) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 18px',
                    borderBottom: i < 2 ? `1px solid ${G.border}` : 'none',
                  }}>
                    <span style={{ fontSize: 12, color: G.faint }}>{label}</span>
                    <span style={{ fontSize: 13, color, fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{
                background: G.goldL, border: `1px solid ${G.goldB}`,
                borderRadius: 12, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <Zap size={15} color={G.gold} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: G.gold, fontWeight: 500, textAlign: 'left' }}>
                  Tes missions seront adaptées à <strong>{selectedChannel?.label || 'ta plateforme'}</strong> dès le départ
                </span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            {step > 1 && (
              <button className="onb-back" onClick={() => setStep(s => s - 1)} style={{
                background: 'transparent', border: `1px solid ${G.border}`, color: G.muted,
                padding: '13px 22px', borderRadius: 11, cursor: 'pointer',
                fontSize: 14, fontFamily: G.sans, transition: 'border-color 0.15s',
              }}>
                ← Retour
              </button>
            )}
            <button
              onClick={step < 4 ? () => setStep(s => s + 1) : handleFinish}
              disabled={loading || !canNext()}
              style={{
                flex: 1,
                background: canNext()
                  ? 'linear-gradient(135deg, #FF6A3D, #FF4D1C)'
                  : 'rgba(255,255,255,0.05)',
                boxShadow: canNext() ? '0 4px 24px rgba(255,106,61,0.35), inset 0 1px 0 rgba(255,255,255,0.15)' : 'none',
                border: 'none', color: canNext() ? '#fff' : G.faint,
                padding: '14px 22px', borderRadius: 11,
                cursor: canNext() ? 'pointer' : 'not-allowed',
                fontSize: 14, fontWeight: 700, fontFamily: G.sans,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
            >
              {loading
                ? 'Chargement...'
                : step < 4
                  ? <><span>Continuer</span><ArrowRight size={16} /></>
                  : <><Zap size={15} fill="#fff" /><span>Accéder au dashboard</span></>
              }
            </button>
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: G.faint }}>
          Étape {step} sur {STEPS.length} · Tu pourras modifier ces infos depuis ton profil
        </p>
      </div>
    </div>
  )
}
