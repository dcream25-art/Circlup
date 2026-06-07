import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { uploadFile } from '../hooks/useStorage'
import {
  ExternalLink, Star, Crown, Award, Zap, Heart, Eye, ShoppingBag,
  TrendingUp, Flame, MapPin, Globe, CheckCircle, Instagram, Youtube,
  ShieldCheck, Sparkles, Target, Facebook, Twitter, Link2, Camera,
  Pencil, X, Image as ImageIcon
} from 'lucide-react'

const G = {
  bg: '#050505', bg2: '#0A0A0A', bg3: '#0D0D0D',
  card: 'rgba(255,255,255,0.03)', card2: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.06)', borderHover: 'rgba(255,255,255,0.12)',
  accent: '#FF6A3D', accentL: 'rgba(255,106,61,0.08)', accentB: 'rgba(255,106,61,0.2)',
  cyan: '#00D5D5', cyanL: 'rgba(0,213,213,0.08)', cyanB: 'rgba(0,213,213,0.2)',
  gold: '#F5C518', goldL: 'rgba(245,197,24,0.08)', goldB: 'rgba(245,197,24,0.2)',
  text: '#FFFFFF', muted: '#9A9A9A', faint: 'rgba(255,255,255,0.12)',
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', system-ui, sans-serif",
  num: "'Space Grotesk', 'DM Sans', system-ui, sans-serif",
}

function Avatar({ name, color, size = 64, src }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: src ? 'transparent' : `radial-gradient(circle at 33% 33%, ${color}cc, ${color}55)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32, fontWeight: 700, color: '#fff', fontFamily: G.sans,
      flexShrink: 0, overflow: 'hidden',
      border: `3px solid ${G.bg2}`, boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
    }}>
      {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </div>
  )
}

// Anneau d'influence circulaire
function InfluenceRing({ score }) {
  const r = 70, circ = 2 * Math.PI * r
  const pct = Math.min(score / 100, 1)
  return (
    <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto' }}>
      <svg width={180} height={180} viewBox="0 0 180 180">
        <circle cx={90} cy={90} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
        <circle cx={90} cy={90} r={r} fill="none" stroke="url(#infGrad)" strokeWidth={10}
          strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round" transform="rotate(-90 90 90)" />
        <defs>
          <linearGradient id="infGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={G.cyan} />
            <stop offset="100%" stopColor={G.accent} />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: G.num, fontSize: 40, fontWeight: 700, color: G.text, lineHeight: 1, letterSpacing: -1 }}>{score}%</span>
      </div>
    </div>
  )
}

export default function PublicProfile() {
  const { username } = useParams()
  const { user, profile: myProfile, updateProfile } = useAuth()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [editing, setEditing] = useState(false)
  const [edit, setEdit]       = useState({})
  const [saving, setSaving]   = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)
  const bannerInputRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data: prof } = await supabase
          .from('profiles').select('*').eq('username', username).single()
        if (!prof) { setNotFound(true); return }
        setProfile(prof)
        const { data: userPosts } = await supabase
          .from('posts')
          .select('*, missions(mission_type)')
          .eq('user_id', prof.id)
          .order('created_at', { ascending: false })
          .limit(12)
        setPosts(userPosts || [])
      } catch (err) {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [username])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: G.sans }}>
      <div style={{ color: G.muted, fontSize: 14 }}>Chargement...</div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: G.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: G.sans }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <div style={{ fontFamily: G.num, fontSize: 64, fontWeight: 700, color: G.faint }}>404</div>
      <h1 style={{ fontFamily: G.serif, fontSize: 24, fontWeight: 900, color: G.text, margin: '8px 0' }}>Profil introuvable</h1>
      <p style={{ color: G.muted, marginBottom: 28, fontSize: 14 }}>@{username} ne correspond à aucun membre</p>
      <Link to="/" style={{ background: G.accent, color: '#fff', padding: '10px 24px', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Retour à l'accueil</Link>
    </div>
  )

  const leagueColor = { Légende: '#ff6b9d', Diamant: '#88c8ff', Or: G.gold, Argent: '#c0c0c0', Bronze: '#cd7f32' }[profile.league] || G.cyan
  const avatarColor = profile.avatar_color || G.accent
  const isOwn = user?.id === profile.id

  // Stats agrégées réelles
  const sum = (k) => posts.reduce((a, p) => a + (p[k] || 0), 0)
  const totalLikes   = sum('likes_count')
  const totalFav     = sum('favorites_count')
  const totalBuys    = sum('buys_count')
  const totalShares  = sum('shares_count')
  const totalViews   = totalLikes + totalFav + totalShares
  const influence    = Math.min(99, 40 + (profile.cp || 0) / 50 + posts.length * 2)

  // Réseaux sociaux disponibles — icônes 3D
  const socials = [
    { img: '/icons3d/social/website.webp',   label: 'Site web',    url: profile.website },
    { img: '/icons3d/social/shop.webp',       label: 'Boutique',    url: profile.shop_url },
    { img: '/icons3d/social/shop.webp',       label: 'Etsy',        url: profile.etsy_url },
    { img: '/icons3d/social/shop.webp',       label: 'Shopify',     url: profile.shopify_url },
    { img: '/icons3d/social/instagram.webp',  label: 'Instagram',   url: profile.instagram },
    { img: '/icons3d/social/facebook.webp',   label: 'Facebook',    url: profile.facebook },
    { img: '/icons3d/social/youtube.webp',    label: 'YouTube',     url: profile.youtube },
    { img: '/icons3d/social/tiktok.webp',     label: 'TikTok',      url: profile.tiktok },
    { img: '/icons3d/social/pinterest.webp',  label: 'Pinterest',   url: profile.pinterest },
    { img: '/icons3d/social/twitter.webp',    label: 'X / Twitter', url: profile.twitter },
    { img: '/icons3d/social/snapchat.webp',   label: 'Snapchat',    url: profile.snapchat },
  ].filter(s => s.url)

  // ── Édition (propriétaire) ──
  const openEdit = () => {
    setEdit({
      bio: profile.bio || '', website: profile.website || '', instagram: profile.instagram || '',
      facebook: profile.facebook || '', snapchat: profile.snapchat || '', tiktok: profile.tiktok || '',
      youtube: profile.youtube || '', pinterest: profile.pinterest || '', twitter: profile.twitter || '',
      etsy_url: profile.etsy_url || '', shopify_url: profile.shopify_url || '', goal: profile.goal || '',
      banner_url: profile.banner_url || '',
    })
    setEditing(true)
  }
  const setE = (k, v) => setEdit(prev => ({ ...prev, [k]: v }))
  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerUploading(true)
    const { url, error } = await uploadFile(file, 'banners', user.id)
    if (!error && url) setEdit(prev => ({ ...prev, banner_url: url }))
    else if (error) {
      // fallback bucket post-images si banners n'existe pas
      const { url: url2 } = await uploadFile(file, 'post-images', user.id)
      if (url2) setEdit(prev => ({ ...prev, banner_url: url2 }))
    }
    setBannerUploading(false)
  }
  const saveEdit = async () => {
    setSaving(true)
    const { error } = await updateProfile(edit)
    if (!error) { setProfile(prev => ({ ...prev, ...edit })); setEditing(false) }
    setSaving(false)
  }

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : null

  return (
    <div style={{ minHeight: '100vh', background: G.bg, fontFamily: G.sans, color: G.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .card-hov { transition: border-color 0.15s, transform 0.15s; }
        .card-hov:hover { border-color: rgba(255,255,255,0.12) !important; transform: translateY(-2px); }
        .social-row:hover { border-color: rgba(255,255,255,0.15) !important; background: rgba(255,255,255,0.04) !important; }
        .nav-cta:hover { background: #FF4D1C !important; }
        .btn-follow:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(255,106,61,0.45) !important; }
        @media (max-width: 900px) { .pp-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        background: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${G.border}`, height: 60, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', padding: '0 5%',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: G.text }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, overflow: 'hidden', background: '#0a0a0a' }}>
            <img src="/logo.png" alt="CirclUp" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.35)' }}
              onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }} />
            <div style={{ display: 'none', width: '100%', height: '100%', background: 'linear-gradient(135deg, #FF6A3D, #FF4D1C)', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: G.serif, fontSize: 14, fontWeight: 900, color: '#fff' }}>C</span>
            </div>
          </div>
          <span style={{ fontFamily: G.serif, fontSize: 17, fontWeight: 900 }}>CirclUp</span>
        </Link>

        {/* Header adapté à l'état de connexion */}
        {user ? (
          <Link to="/app" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: G.text, background: G.card, border: `1px solid ${G.border}`, padding: '6px 8px 6px 14px', borderRadius: 30, transition: 'border-color 0.15s' }}
            onMouseOver={e => e.currentTarget.style.borderColor = G.borderHover}
            onMouseOut={e => e.currentTarget.style.borderColor = G.border}
          >
            <span style={{ fontSize: 13, fontWeight: 600 }}>Mon espace</span>
            <Avatar name={myProfile?.name} color={myProfile?.avatar_color || G.cyan} size={28} src={myProfile?.avatar_url} />
          </Link>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/login" style={{ fontSize: 13, color: G.muted, textDecoration: 'none', fontWeight: 500 }}>Se connecter</Link>
            <Link className="nav-cta" to="/register" style={{ background: G.accent, color: '#fff', padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'background 0.15s' }}>
              Rejoindre CirclUp
            </Link>
          </div>
        )}
      </nav>

      {/* ── COVER / BANNIÈRE ── */}
      <div style={{
        height: 240, position: 'relative', overflow: 'hidden',
        background: `linear-gradient(135deg, ${avatarColor}25 0%, rgba(5,5,5,0) 55%), linear-gradient(180deg, ${G.bg2} 0%, ${G.bg} 100%)`,
        borderBottom: `1px solid ${G.border}`,
      }}>
        {profile.banner_url ? (
          <img src={profile.banner_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : posts[0]?.image_url && (
          <img src={posts[0].image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(5,5,5,0.15) 0%, ${G.bg} 100%)` }} />
        {isOwn && (
          <button onClick={openEdit} style={{ position: 'absolute', top: 16, right: '5%', display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(5,5,5,0.7)', backdropFilter: 'blur(10px)', border: `1px solid ${G.border}`, color: G.text, padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: G.sans }}>
            <Camera size={14} /> Personnaliser ma page
          </button>
        )}
      </div>

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 20px 60px' }}>

        {/* ── HEADER PROFIL ── */}
        <div style={{ marginTop: -60, marginBottom: 24, position: 'relative' }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Avatar name={profile.name} color={avatarColor} size={120} src={profile.avatar_url} />
              {profile.plan === 'premium' && (
                <div style={{ position: 'absolute', bottom: 6, right: 6, width: 28, height: 28, borderRadius: '50%', background: G.cyan, border: `3px solid ${G.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={14} color="#050505" />
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 240, paddingBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                <h1 style={{ fontFamily: G.serif, fontSize: 30, fontWeight: 900, color: G.text, lineHeight: 1.1 }}>{profile.shop_name || profile.name}</h1>
                {profile.plan === 'premium' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: G.cyanL, border: `1px solid ${G.cyanB}`, borderRadius: 20, padding: '3px 10px', fontSize: 11, color: G.cyan, fontWeight: 700 }}>
                    <ShieldCheck size={11} /> Vérifié
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={{ fontSize: 14, color: G.muted }}>@{profile.username}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: `${leagueColor}18`, border: `1px solid ${leagueColor}35`, borderRadius: 20, padding: '2px 10px', fontSize: 11, color: leagueColor, fontWeight: 700 }}>
                  <Crown size={9} /> {profile.league || 'Bronze'}
                </span>
              </div>
              {profile.bio && <p style={{ fontSize: 14, color: G.text, opacity: 0.85, lineHeight: 1.6, marginBottom: 10, maxWidth: 520 }}>{profile.bio}</p>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: 13, color: G.muted }}>
                {profile.niche && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={13} /> {profile.niche}</span>}
                {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, color: G.cyan, textDecoration: 'none' }}><Globe size={13} /> {profile.website.replace(/^https?:\/\//, '')}</a>}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', paddingBottom: 4 }}>
              {profile.shop_url && (
                <a href={profile.shop_url} target="_blank" rel="noreferrer" className="social-row" style={{ display: 'flex', alignItems: 'center', gap: 7, background: G.card, border: `1px solid ${G.border}`, color: G.text, padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all 0.15s' }}>
                  Voir la boutique <ExternalLink size={13} />
                </a>
              )}
              {!isOwn && (
                <Link to={user ? '/app' : '/register'} className="btn-follow" style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg, #FF6A3D, #FF4D1C)', boxShadow: '0 4px 16px rgba(255,106,61,0.35)', color: '#fff', padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'all 0.15s' }}>
                  <Heart size={14} fill="#fff" stroke="none" /> Soutenir
                </Link>
              )}
              {isOwn && (
                <button onClick={openEdit} className="btn-follow" style={{ display: 'flex', alignItems: 'center', gap: 7, background: G.card2, border: `1px solid ${G.border}`, color: G.text, padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: G.sans, transition: 'all 0.15s' }}>
                  <Pencil size={13} /> Modifier mon profil
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, background: G.border, border: `1px solid ${G.border}`, borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
          {[
            { label: 'Likes reçus',    val: totalLikes,        color: G.cyan,   trend: 'sur ses posts' },
            { label: 'Favoris reçus',  val: totalFav,          color: G.accent, trend: 'sur ses posts' },
            { label: 'Achats générés', val: totalBuys,         color: G.accent, trend: 'au total' },
            { label: 'Posts publiés',  val: posts.length,      color: G.cyan,   trend: 'au total' },
            { label: 'Streak',         val: `${profile.streak || 0}j`, color: G.gold, trend: 'jours' },
            { label: 'Score CP',       val: profile.cp || 0,   color: G.gold,   trend: profile.league || 'Bronze' },
          ].map(({ label, val, color, trend }) => (
            <div key={label} style={{ background: G.bg2, padding: '18px 16px' }}>
              <div style={{ fontFamily: G.num, fontSize: 26, fontWeight: 700, color, lineHeight: 1, letterSpacing: -0.5 }}>{val}</div>
              <div style={{ fontSize: 11, color: G.muted, marginTop: 6, fontWeight: 500 }}>{label}</div>
              <div style={{ fontSize: 10, color: G.faint, marginTop: 3 }}>{trend}</div>
            </div>
          ))}
        </div>

        {/* ── GRID 2 COLONNES ── */}
        <div className="pp-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

          {/* ── COLONNE PRINCIPALE ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* À propos */}
            <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: '22px 24px' }}>
              <h2 style={{ fontFamily: G.serif, fontSize: 18, fontWeight: 800, marginBottom: 14 }}>À propos de la boutique</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.7 }}>
                  {profile.bio || `${profile.shop_name || profile.name} fait partie de la communauté CirclUp. Découvrez ses produits et soutenez son activité.`}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {memberSince && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: G.muted }}><Sparkles size={14} color={G.gold} /> Membre depuis {memberSince}</div>}
                  {profile.niche && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: G.muted }}><Target size={14} color={G.cyan} /> Niche : {profile.niche}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: G.muted }}><CheckCircle size={14} color={G.accent} /> {posts.length} produit{posts.length !== 1 ? 's' : ''} en ligne</div>
                </div>
              </div>
            </div>

            {/* Produits vedettes */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ fontFamily: G.serif, fontSize: 18, fontWeight: 800 }}>Produits vedettes</h2>
                <span style={{ fontSize: 12, color: G.faint }}>{posts.length} au total</span>
              </div>
              {posts.length === 0 ? (
                <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 40, textAlign: 'center', color: G.faint, fontSize: 14 }}>
                  Aucun produit pour l'instant
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
                  {posts.map(post => (
                    <div key={post.id} className="card-hov" style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, overflow: 'hidden' }}>
                      {post.image_url
                        ? <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden' }}><img src={post.image_url} alt={post.product} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                        : <div style={{ width: '100%', aspectRatio: '1', background: G.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={28} color={G.faint} /></div>
                      }
                      <div style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: G.text, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.product}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {post.price && <span style={{ fontFamily: G.num, fontSize: 14, fontWeight: 700, color: G.accent }}>{post.price}</span>}
                          <div style={{ display: 'flex', gap: 10, fontSize: 11, color: G.muted, marginLeft: 'auto' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Heart size={11} color={G.accent} /> {post.likes_count || 0}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={11} /> {(post.favorites_count || 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── SIDEBAR DROITE ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Influence */}
            <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: '22px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, textAlign: 'left' }}>Influence CirclUp</div>
              <InfluenceRing score={Math.round(influence)} />
              <div style={{ fontSize: 12, color: G.muted, marginTop: 12 }}>Top {Math.max(1, 100 - Math.round(influence))}% des boutiques</div>
            </div>

            {/* Réseaux sociaux */}
            {socials.length > 0 && (
              <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: '20px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Réseaux & liens</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {socials.map(({ img, label, url }) => (
                    <a key={label} href={url} target="_blank" rel="noreferrer" className="social-row" style={{ display: 'flex', alignItems: 'center', gap: 10, background: G.card2, border: `1px solid ${G.border}`, borderRadius: 10, padding: '8px 12px', textDecoration: 'none', transition: 'all 0.15s' }}>
                      <img src={img} alt={label} style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.4))' }} />
                      <span style={{ flex: 1, fontSize: 13, color: G.text }}>{label}</span>
                      <ExternalLink size={12} color={G.faint} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Badges */}
            {profile.badges?.length > 0 && (
              <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: '20px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Badges</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {profile.badges.map((b, i) => (
                    <div key={i} style={{ width: 44, height: 44, borderRadius: 12, background: G.goldL, border: `1px solid ${G.goldB}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{b}</div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA rejoindre */}
            {!user && (
              <div style={{ background: `linear-gradient(135deg, rgba(255,106,61,0.1), rgba(255,106,61,0.03))`, border: `1px solid ${G.accentB}`, borderRadius: 16, padding: '20px' }}>
                <div style={{ fontFamily: G.serif, fontSize: 17, fontWeight: 800, marginBottom: 8 }}>Rejoins la communauté</div>
                <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.6, marginBottom: 16 }}>Échange des soutiens, gagne des CP et booste ton algorithme Etsy & Shopify.</p>
                <Link to="/register" className="btn-follow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'linear-gradient(135deg, #FF6A3D, #FF4D1C)', boxShadow: '0 4px 16px rgba(255,106,61,0.35)', color: '#fff', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none', transition: 'all 0.15s' }}>
                  Créer mon compte
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL ÉDITION ── */}
      {editing && (
        <div onClick={e => { if (e.target === e.currentTarget) setEditing(false) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', overflowY: 'auto' }}>
          <div style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 20, width: '100%', maxWidth: 560, boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
            {/* Header modal */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${G.border}` }}>
              <h2 style={{ fontFamily: G.serif, fontSize: 20, fontWeight: 800 }}>Personnaliser ma page</h2>
              <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: G.muted, padding: 4 }}><X size={20} /></button>
            </div>

            <div style={{ padding: 24 }}>
              {/* Bannière */}
              <label style={{ fontSize: 10, color: G.muted, display: 'block', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>Bannière</label>
              <div onClick={() => bannerInputRef.current?.click()} style={{ height: 120, borderRadius: 12, border: `1px dashed ${G.border}`, marginBottom: 20, cursor: 'pointer', overflow: 'hidden', position: 'relative', background: G.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {edit.banner_url ? (
                  <img src={edit.banner_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: G.muted }}>
                    <ImageIcon size={22} />
                    <span style={{ fontSize: 12 }}>{bannerUploading ? 'Téléchargement…' : 'Cliquer pour ajouter une bannière'}</span>
                  </div>
                )}
                {edit.banner_url && <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(5,5,5,0.7)', borderRadius: 8, padding: '5px 10px', fontSize: 11, color: '#fff', display: 'flex', alignItems: 'center', gap: 5 }}><Camera size={11} /> Changer</div>}
                <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerUpload} style={{ display: 'none' }} />
              </div>

              {/* Bio */}
              <label style={{ fontSize: 10, color: G.muted, display: 'block', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>Bio</label>
              <textarea value={edit.bio} onChange={e => setE('bio', e.target.value)} rows={3} placeholder="Décris ta boutique…" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${G.border}`, borderRadius: 10, padding: '11px 14px', color: G.text, fontSize: 14, fontFamily: G.sans, outline: 'none', resize: 'none', marginBottom: 20, boxSizing: 'border-box' }} />

              {/* Objectif */}
              <label style={{ fontSize: 10, color: G.muted, display: 'block', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>Mon objectif sur CirclUp</label>
              <input value={edit.goal} onChange={e => setE('goal', e.target.value)} placeholder="Ex : booster mes ventes Etsy…" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${G.border}`, borderRadius: 10, padding: '11px 14px', color: G.text, fontSize: 14, fontFamily: G.sans, outline: 'none', marginBottom: 20, boxSizing: 'border-box' }} />

              {/* Réseaux sociaux */}
              <label style={{ fontSize: 10, color: G.muted, display: 'block', marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>Réseaux sociaux & liens</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                {[
                  ['Site web', 'website'], ['Etsy', 'etsy_url'], ['Shopify', 'shopify_url'],
                  ['Instagram', 'instagram'], ['Facebook', 'facebook'], ['TikTok', 'tiktok'],
                  ['YouTube', 'youtube'], ['Pinterest', 'pinterest'], ['X / Twitter', 'twitter'],
                  ['Snapchat', 'snapchat'],
                ].map(([label, key]) => (
                  <div key={key}>
                    <label style={{ fontSize: 10, color: G.faint, display: 'block', marginBottom: 4 }}>{label}</label>
                    <input value={edit[key] || ''} onChange={e => setE(key, e.target.value)} placeholder="https://…" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${G.border}`, borderRadius: 8, padding: '8px 11px', color: G.text, fontSize: 12, fontFamily: G.sans, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setEditing(false)} style={{ flex: 1, background: 'transparent', border: `1px solid ${G.border}`, color: G.muted, padding: '12px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontFamily: G.sans }}>Annuler</button>
                <button onClick={saveEdit} disabled={saving} style={{ flex: 2, background: 'linear-gradient(135deg, #FF6A3D, #FF4D1C)', boxShadow: '0 4px 16px rgba(255,106,61,0.35)', border: 'none', color: '#fff', padding: '12px', borderRadius: 10, cursor: saving ? 'wait' : 'pointer', fontSize: 14, fontWeight: 700, fontFamily: G.sans }}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
