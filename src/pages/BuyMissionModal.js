import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { uploadFile } from '../hooks/useStorage'
import { X, ShoppingBag, ExternalLink, Upload, CheckCircle, Clock, Zap } from 'lucide-react'

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

const STEP_LABELS = ['Détails', 'Preuve', 'Confirmation']

export default function BuyMissionModal({ post, user, onClose, onSuccess }) {
  const [step, setStep] = useState(1) // 1=info, 2=preuve, 3=succès
  const [orderRef, setOrderRef] = useState('')
  const [proofFile, setProofFile] = useState(null)
  const [proofPreview, setProofPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const shopUrl = post?.profiles?.shop_url || post?.link_url || '#'
  const product = post?.product || 'ce produit'
  const price = post?.price

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setProofFile(f)
    const reader = new FileReader()
    reader.onload = ev => setProofPreview(ev.target.result)
    reader.readAsDataURL(f)
  }

  const handleSubmit = async () => {
    if (!orderRef.trim()) { setError('La référence de commande est obligatoire'); return }
    setLoading(true)
    setError('')
    try {
      let proofUrl = null
      if (proofFile) {
        const { url } = await uploadFile(proofFile, 'post-images', user.id + '/proofs')
        proofUrl = url
      }

      // Insérer la demande de confirmation
      const { error: insertErr } = await supabase.from('purchase_confirmations').insert({
        post_id: post.id,
        buyer_id: user.id,
        seller_id: post.user_id,
        order_ref: orderRef.trim(),
        proof_image_url: proofUrl,
        status: 'pending',
      })

      if (insertErr) { setError(insertErr.message); return }

      // Notifier le vendeur
      await supabase.from('notifications').insert({
        user_id: post.user_id,
        type: 'purchase_pending',
        message: `Quelqu'un dit avoir acheté "${product}" — vérifie et confirme l'achat pour lui créditer ses 40 CP ! 🛍️`,
        post_id: post.id,
      })

      setStep(3)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${G.border}`,
    borderRadius: 10, padding: '12px 15px', color: G.text, fontSize: 14,
    outline: 'none', fontFamily: G.sans, boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, fontFamily: G.sans,
    }} onClick={onClose}>
      <style>{`
        @keyframes modalUp { from { opacity:0; transform:translateY(20px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes checkPop { 0% { transform: scale(0.4); opacity:0; } 70% { transform: scale(1.15); } 100% { transform: scale(1); opacity:1; } }
        .buy-modal-inp:focus { border-color: rgba(255,106,61,0.35) !important; }
        .buy-close-btn:hover { color: #fff !important; }
      `}</style>

      <div onClick={e => e.stopPropagation()} style={{
        background: G.bg2,
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: 20, padding: '28px 26px',
        maxWidth: 460, width: '100%',
        boxShadow: '0 48px 96px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
        animation: 'modalUp 0.28s cubic-bezier(0.22,1,0.36,1) both',
        position: 'relative',
      }}>

        {/* Close */}
        <button className="buy-close-btn" onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14,
          background: 'transparent', border: 'none',
          cursor: 'pointer', color: G.muted,
          padding: 4, borderRadius: 6, transition: 'color 0.15s',
        }}>
          <X size={17} />
        </button>

        {/* Step indicator */}
        {step < 3 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24 }}>
            {STEP_LABELS.map((label, i) => {
              const s = i + 1
              const active = s === step
              const done = s < step
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEP_LABELS.length - 1 ? 1 : 'initial' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: done ? G.accent : active ? 'transparent' : 'rgba(255,255,255,0.05)',
                      border: active ? `2px solid ${G.accent}` : done ? 'none' : `1px solid ${G.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.25s',
                    }}>
                      {done
                        ? <CheckCircle size={13} color="#fff" />
                        : <span style={{ fontSize: 11, fontWeight: 700, color: active ? G.accent : G.muted }}>{s}</span>
                      }
                    </div>
                    <span style={{ fontSize: 10, color: active || done ? G.accent : G.muted, fontWeight: active ? 700 : 400, whiteSpace: 'nowrap' }}>{label}</span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div style={{ flex: 1, height: 1, background: done ? G.accent : G.border, margin: '0 8px', marginBottom: 18, transition: 'background 0.25s' }} />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ÉTAPE 1 — Info */}
        {step === 1 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: G.goldL, border: `1px solid ${G.goldB}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShoppingBag size={22} color={G.gold} />
              </div>
              <div>
                <h2 style={{ fontFamily: G.serif, fontSize: 18, fontWeight: 900, color: G.text, margin: 0, lineHeight: 1.2 }}>Acheter un produit</h2>
                <div style={{ fontSize: 12, color: G.gold, fontWeight: 700, marginTop: 3 }}>+40 CP après confirmation du vendeur</div>
              </div>
            </div>

            <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontFamily: G.serif, fontSize: 15, fontWeight: 800, marginBottom: 4, color: G.text }}>{product}</div>
              {price && <div style={{ fontSize: 13, color: G.accent, fontWeight: 700, marginBottom: 8 }}>{price}</div>}
              <div style={{ fontSize: 13, color: G.muted, lineHeight: 1.65 }}>
                Visite la boutique du vendeur et effectue ton achat. Reviens ensuite avec ta référence de commande pour prouver l'achat.
              </div>
            </div>

            <div style={{ background: G.accentL, border: `1px solid ${G.accentB}`, borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: G.accent, lineHeight: 1.55 }}>
              <strong>Important :</strong> Les 40 CP ne seront crédités <strong>qu'après confirmation du vendeur</strong>. Les fausses déclarations entraînent une suspension.
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <a href={shopUrl} target="_blank" rel="noreferrer" onClick={() => setTimeout(() => setStep(2), 1500)} style={{
                flex: 1,
                background: 'linear-gradient(135deg, #FF6A3D, #FF4D1C)',
                boxShadow: '0 4px 20px rgba(255,106,61,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                border: 'none', color: '#fff', padding: '13px 16px', borderRadius: 12,
                fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: G.sans,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none',
              }}>
                <ExternalLink size={15} /> Ouvrir la boutique
              </a>
              <button onClick={() => setStep(2)} style={{
                background: G.card, border: `1px solid ${G.border}`,
                color: G.muted, padding: '13px 16px', borderRadius: 12,
                fontSize: 13, cursor: 'pointer', fontFamily: G.sans,
                transition: 'border-color 0.15s',
              }}>
                J'ai déjà acheté
              </button>
            </div>
          </>
        )}

        {/* ÉTAPE 2 — Preuve d'achat */}
        {step === 2 && (
          <>
            <h2 style={{ fontFamily: G.serif, fontSize: 19, fontWeight: 900, marginBottom: 6, color: G.text }}>Confirme ton achat</h2>
            <p style={{ fontSize: 13, color: G.muted, marginBottom: 22, lineHeight: 1.65 }}>
              Le vendeur recevra une notification pour valider ton achat avant de te créditer les 40 CP.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: G.muted, display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.7, fontWeight: 600 }}>
                Référence de commande *
                <span style={{ color: G.faint, marginLeft: 6, textTransform: 'none', letterSpacing: 0 }}>(ex: #1234, numéro Etsy/Shopify)</span>
              </label>
              <input
                className="buy-modal-inp"
                value={orderRef}
                onChange={e => setOrderRef(e.target.value)}
                placeholder="Ex: Order #56789 — Etsy"
                style={inp}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: G.muted, display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.7, fontWeight: 600 }}>
                Capture d'écran <span style={{ color: G.faint, textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(optionnel mais recommandé)</span>
              </label>
              <input type="file" accept="image/*" id="proof-upload" style={{ display: 'none' }} onChange={handleFileChange} />
              {proofPreview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={proofPreview} alt="preuve" style={{ height: 80, borderRadius: 8, border: `1px solid ${G.border}`, objectFit: 'cover' }} />
                  <button onClick={() => { setProofFile(null); setProofPreview(null) }} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: G.accent, border: 'none', cursor: 'pointer', fontSize: 11, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
              ) : (
                <label htmlFor="proof-upload" style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: G.card, border: `1px dashed rgba(255,255,255,0.1)`,
                  borderRadius: 10, padding: '14px 16px',
                  cursor: 'pointer', color: G.muted, fontSize: 13,
                  transition: 'border-color 0.15s',
                }}>
                  <Upload size={15} color={G.muted} /> Ajouter une capture d'écran
                </label>
              )}
            </div>

            {error && (
              <div style={{ color: G.accent, fontSize: 13, marginBottom: 14, background: G.accentL, border: `1px solid ${G.accentB}`, borderRadius: 8, padding: '9px 12px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} style={{
                background: G.card, border: `1px solid ${G.border}`,
                color: G.muted, padding: '13px 16px', borderRadius: 12,
                fontSize: 13, cursor: 'pointer', fontFamily: G.sans,
              }}>
                ←
              </button>
              <button onClick={handleSubmit} disabled={loading || !orderRef.trim()} style={{
                flex: 1,
                background: loading || !orderRef.trim() ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #FF6A3D, #FF4D1C)',
                boxShadow: !loading && orderRef.trim() ? '0 4px 20px rgba(255,106,61,0.35)' : 'none',
                border: 'none', color: loading || !orderRef.trim() ? G.faint : '#fff',
                padding: '13px 16px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                cursor: loading || !orderRef.trim() ? 'not-allowed' : 'pointer',
                fontFamily: G.sans, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <Zap size={14} /> {loading ? 'Envoi...' : 'Soumettre pour vérification'}
              </button>
            </div>
          </>
        )}

        {/* ÉTAPE 3 — Succès */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(0,213,213,0.1)', border: `1px solid rgba(0,213,213,0.25)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              animation: 'checkPop 0.4s cubic-bezier(0.22,1,0.36,1) both',
            }}>
              <Clock size={28} color={G.cyan} />
            </div>
            <h2 style={{ fontFamily: G.serif, fontSize: 20, fontWeight: 900, marginBottom: 10, color: G.text }}>
              En attente de confirmation
            </h2>
            <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.7, marginBottom: 24 }}>
              Le vendeur a été notifié. Dès qu'il confirme ton achat,{' '}
              <strong style={{ color: G.gold }}>+40 CP</strong> seront crédités sur ton compte automatiquement.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24, textAlign: 'left' }}>
              {[
                [CheckCircle, G.cyan, 'Référence de commande soumise'],
                [CheckCircle, G.cyan, 'Vendeur notifié'],
                [Clock, G.gold, 'En attente de confirmation du vendeur'],
                [Zap, G.gold, '+40 CP crédités après confirmation'],
              ].map(([Icon, color, label], i) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: G.card, border: `1px solid ${G.border}`,
                  borderRadius: 10, padding: '10px 14px',
                }}>
                  <Icon size={14} color={color} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: G.muted }}>{label}</span>
                </div>
              ))}
            </div>

            <button onClick={() => { onSuccess?.(); onClose() }} style={{
              width: '100%',
              background: 'linear-gradient(135deg, #FF6A3D, #FF4D1C)',
              boxShadow: '0 4px 20px rgba(255,106,61,0.35)',
              border: 'none', color: '#fff', padding: '14px',
              borderRadius: 12, fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: G.sans,
            }}>
              Retour au feed
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
