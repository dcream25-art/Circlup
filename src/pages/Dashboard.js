import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { usePosts } from '../hooks/usePosts'
import { useMissions } from '../hooks/useMissions'
import { useNotifications } from '../hooks/useNotifications'
import { usePoints } from '../hooks/usePoints'
import { uploadFile } from '../hooks/useStorage'
import UpgradeModal from './UpgradeModal'
import BuyMissionModal from './BuyMissionModal'
import { FREE_POST_LIMIT } from '../hooks/useMissions'
import { supabase } from '../lib/supabase'
import {
  Star, Eye, Heart, MessageCircle, Share2, Pin, Search, ShoppingBag,
  Home, Target, Users, BarChart2, Bell, LogOut, Zap, Plus, X,
  ExternalLink, Flame, Crown, Bookmark, Image, Link2, TrendingUp,
  ChevronRight, Award, Filter, Gift, Camera, Upload, Trash2, CheckCircle, Shield,
  CreditCard, PenLine, Package, Rocket
} from 'lucide-react'
import ProjectsView from './ProjectsView'

const G = {
  bg: "#050505",
  bg2: "#0A0A0A",
  bg3: "#0D0D0D",
  card: "rgba(255,255,255,0.03)",
  card2: "rgba(255,255,255,0.05)",
  card3: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.06)",
  borderL: "rgba(255,255,255,0.03)",
  borderHover: "rgba(255,255,255,0.12)",
  accent: "#FF6A3D",
  accentL: "rgba(255,106,61,0.08)",
  accentB: "rgba(255,106,61,0.2)",
  cyan: "#00D5D5",
  cyanL: "rgba(0,213,213,0.08)",
  cyanB: "rgba(0,213,213,0.2)",
  gold: "#F5C518",
  goldL: "rgba(245,197,24,0.08)",
  goldB: "rgba(245,197,24,0.2)",
  text: "#FFFFFF",
  muted: "#A8A8A8",
  faint: "rgba(255,255,255,0.34)",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', system-ui, sans-serif",
  num: "'Space Grotesk', 'DM Sans', system-ui, sans-serif",
}
// Aliases — no more G.mint in JSX, but keeping for safety
G.mint = G.cyan
G.mintL = G.cyanL
G.mintB = G.cyanB

const MISSIONS_BY_CHANNEL = {
  etsy: [
    { id: "fav",     Icon: Star,          label: "Favori Etsy",            short: "Favori Etsy",      color: "#F5C518", cp: 5,  free: true,  needsProof: false },
    { id: "visit",   Icon: Eye,           label: "Visiter la boutique",    short: "Voir boutique",    color: "#00D5D5", cp: 3,  free: true,  needsProof: false },
    { id: "like",    Icon: Heart,         label: "Liker 3 produits",       short: "Liker produits",   color: "#FF6A3D", cp: 4,  free: true,  needsProof: false },
    { id: "comment", Icon: MessageCircle, label: "Commenter le post",      short: "Commenter post",   color: "#A78BFA", cp: 6,  free: true,  needsProof: false },
    { id: "share",   Icon: Share2,        label: "Partager en story",      short: "Partager story",   color: "#00D5D5", cp: 10, free: true,  needsProof: true  },
    { id: "pin",     Icon: Pin,           label: "Épingler Pinterest",     short: "Épingler Pinterest",color: "#F5C518", cp: 8, free: true,  needsProof: true  },
    { id: "review",  Icon: Search,        label: "Laisser un avis",        short: "Laisser un avis",  color: "#60A5FA", cp: 15, free: true,  needsProof: true  },
    { id: "buy",     Icon: ShoppingBag,   label: "Acheter un produit",     short: "Acheter",          color: "#F5C518", cp: 40, free: false, needsProof: true  },
  ],
  shopify: [
    { id: "visit",   Icon: Eye,           label: "Visiter la boutique",    short: "Voir boutique",    color: "#00D5D5", cp: 3,  free: true,  needsProof: false },
    { id: "like",    Icon: Heart,         label: "Liker le produit",       short: "Liker produit",    color: "#FF6A3D", cp: 4,  free: true,  needsProof: false },
    { id: "share",   Icon: Share2,        label: "Partager en story",      short: "Partager story",   color: "#00D5D5", cp: 10, free: true,  needsProof: true  },
    { id: "comment", Icon: MessageCircle, label: "Laisser un avis Google", short: "Avis Google",      color: "#A78BFA", cp: 8,  free: true,  needsProof: true  },
    { id: "review",  Icon: Search,        label: "Avis produit",           short: "Avis produit",     color: "#60A5FA", cp: 15, free: true,  needsProof: true  },
    { id: "cart",    Icon: ShoppingBag,   label: "Ajouter au panier",      short: "Ajouter panier",   color: "#FF6A3D", cp: 20, free: true,  needsProof: false },
    { id: "buy",     Icon: ShoppingBag,   label: "Acheter un produit",     short: "Acheter",          color: "#F5C518", cp: 40, free: false, needsProof: true  },
  ],
  instagram: [
    { id: "like",    Icon: Heart,         label: "Liker le post",          short: "Liker",            color: "#FF6A3D", cp: 3,  free: true,  needsProof: false },
    { id: "comment", Icon: MessageCircle, label: "Commenter le post",      short: "Commenter",        color: "#A78BFA", cp: 6,  free: true,  needsProof: false },
    { id: "share",   Icon: Share2,        label: "Partager en story",      short: "Partager",         color: "#00D5D5", cp: 10, free: true,  needsProof: true  },
    { id: "fav",     Icon: Star,          label: "Sauvegarder le post",    short: "Sauvegarder",      color: "#F5C518", cp: 5,  free: true,  needsProof: false },
    { id: "visit",   Icon: Eye,           label: "Visiter le profil",      short: "Voir le profil",   color: "#00D5D5", cp: 3,  free: true,  needsProof: false },
    { id: "review",  Icon: Search,        label: "Laisser un avis",        short: "Laisser un avis",  color: "#60A5FA", cp: 15, free: true,  needsProof: true  },
    { id: "buy",     Icon: ShoppingBag,   label: "Acheter un produit",     short: "Acheter",          color: "#F5C518", cp: 40, free: false, needsProof: true  },
  ],
  default: [
    { id: "fav",     Icon: Star,          label: "Ajouter aux favoris",    short: "Favori",           color: "#F5C518", cp: 5,  free: true,  needsProof: false },
    { id: "visit",   Icon: Eye,           label: "Visiter la boutique",    short: "Voir la boutique", color: "#00D5D5", cp: 3,  free: true,  needsProof: false },
    { id: "like",    Icon: Heart,         label: "Liker 3 produits",       short: "Liker",            color: "#FF6A3D", cp: 4,  free: true,  needsProof: false },
    { id: "comment", Icon: MessageCircle, label: "Commenter le post",      short: "Commenter",        color: "#A78BFA", cp: 6,  free: true,  needsProof: false },
    { id: "share",   Icon: Share2,        label: "Partager en story",      short: "Partager",         color: "#00D5D5", cp: 10, free: true,  needsProof: true  },
    { id: "pin",     Icon: Pin,           label: "Épingler Pinterest",     short: "Épingler",         color: "#F5C518", cp: 8,  free: true,  needsProof: true  },
    { id: "review",  Icon: Search,        label: "Laisser un avis",        short: "Laisser un avis",  color: "#60A5FA", cp: 15, free: true,  needsProof: true  },
    { id: "buy",     Icon: ShoppingBag,   label: "Acheter un produit",     short: "Acheter",          color: "#F5C518", cp: 40, free: false, needsProof: true  },
  ],
}
const getMissions = (channel) => MISSIONS_BY_CHANNEL[channel] || MISSIONS_BY_CHANNEL.default
const MISSIONS_DEF = MISSIONS_BY_CHANNEL.default

const NAV = [
  { id: "dashboard", Icon: Home,       label: "Dashboard"              },
  { id: "feed",      Icon: BarChart2,  label: "Feed"                   },
  { id: "projets",   Icon: Rocket,     label: "Projets"                },
  { id: "missions",  Icon: Target,     label: "Missions"               },
  { id: "favoris",   Icon: Bookmark,   label: "Favoris"                },
  { id: "boutique",  Icon: Zap,        label: "Boutique CP"            },
  { id: "cercle",    Icon: Users,      label: "Cercle"                 },
  { id: "analyse",   Icon: BarChart2,  label: "Analyse boutique",  locked: true },
  { id: "seo",       Icon: TrendingUp, label: "Référencement SEO IA", locked: true },
]

// Catalogue de la boutique CP
const CP_SHOP = [
  {
    id: "boost_24h",
    ShopIcon: Zap,
    title: "Boost Express",
    desc: "Ton post passe en tête du feed pendant 24h.",
    cost: 100,
    color: G.accent, badge: "Le plus populaire",
    category: "visibilité",
  },
  {
    id: "featured_48h",
    ShopIcon: Star,
    title: "Post Featured",
    desc: "Badge \"Featured\" sur ton post + priorité absolue dans le feed pendant 48h.",
    cost: 200,
    color: G.gold, badge: "Recommandé",
    category: "visibilité",
  },
  {
    id: "analytics_7d",
    ShopIcon: BarChart2,
    title: "Analytics Avancées",
    desc: "Voir qui a fait quoi sur tes posts : missions par type, profils des visiteurs, heure de pointe.",
    cost: 150,
    color: G.cyan, badge: "Bientôt", comingSoon: true,
    category: "insights",
  },
  {
    id: "badge_vip",
    ShopIcon: Crown,
    title: "Badge VIP 30 jours",
    desc: "Couronne dorée visible sur tous tes posts et ton profil pendant 30 jours. Améliore ta visibilité auprès des investisseurs.",
    cost: 500,
    color: G.gold, badge: "Prestige",
    category: "statut",
  },
  {
    id: "cercle_premium",
    ShopIcon: Users,
    title: "Cercle Premium 1 mois",
    desc: "Accès à un cercle de membres très actifs (10+ missions/semaine) dans ta niche.",
    cost: 800,
    color: G.cyan, badge: "Bientôt", comingSoon: true,
    category: "réseau",
  },
  {
    id: "reduction_abo",
    ShopIcon: CreditCard,
    title: "Bon de réduction -1€",
    desc: "Convertis 1000 CP en 1€ de réduction sur ton abonnement CirclUp. Cumulable.",
    cost: 1000,
    color: G.accent, badge: "Disponible",
    category: "économies",
  },
]

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

const COLORS = [G.cyan, G.accent, G.gold]

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
            <stop offset="0%" stopColor={G.accent} />
            <stop offset="100%" stopColor={G.cyan} />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: G.num, fontSize: 26, fontWeight: 700, color: G.text, lineHeight: 1, letterSpacing: -1 }}>{cp}</span>
        <span style={{ fontSize: 10, color: G.muted, marginTop: 3 }}>pts</span>
        <div style={{ marginTop: 4, background: G.accentL, border: `1px solid ${G.accentB}`, borderRadius: 6, padding: "2px 8px" }}>
          <span style={{ fontSize: 9, color: G.accent, fontWeight: 700 }}>{rank}</span>
        </div>
      </div>
    </div>
  )
}

function Avatar({ initials, color, size = 36, src, onClick, uploading }) {
  return (
    <div onClick={onClick} style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: src ? 'transparent' : `radial-gradient(circle at 33% 33%, ${color}cc, ${color}55)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.32, fontWeight: 700, color: "#050505",
      fontFamily: G.sans, boxShadow: `0 2px 8px ${color}40`,
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative', overflow: 'hidden',
    }}>
      {src
        ? <img src={src} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        : uploading
          ? <div style={{ fontSize: size * 0.22, color: '#fff', opacity: 0.8 }}>...</div>
          : initials
      }
      {onClick && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
          onMouseOver={e => e.currentTarget.style.opacity = 1}
          onMouseOut={e => e.currentTarget.style.opacity = 0}
        >
          <Camera size={size * 0.28} color="#fff" />
        </div>
      )}
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
        <span style={{ fontFamily: G.num, fontSize: 11, fontWeight: 700, color }}>{score}</span>
      </div>
    </div>
  )
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  // Si la date n'a pas d'info de fuseau (pas de Z ni +hh:mm), on la traite comme UTC
  let s = String(dateStr)
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) s = s.replace(' ', 'T') + 'Z'
  const diff = Math.floor((Date.now() - new Date(s)) / 1000)
  if (diff < 5)     return "à l'instant"
  if (diff < 60)    return `${diff}s`
  if (diff < 3600)  return `${Math.floor(diff/60)} min`
  if (diff < 86400) return `${Math.floor(diff/3600)} h`
  return `${Math.floor(diff/86400)} j`
}

// Lightbox image
function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 3000,
      background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "zoom-out", padding: 20,
    }}>
      <button onClick={onClose} style={{ position: "absolute", top: 16, right: 20, background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
        ×
      </button>
      <img
        src={src} alt={alt}
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: "90vw", maxHeight: "88vh", objectFit: "contain", borderRadius: 12, boxShadow: "0 30px 80px rgba(0,0,0,0.8)", cursor: "default" }}
      />
    </div>
  )
}

// Composant texte expandable
function PostStory({ story }) {
  const [expanded, setExpanded] = useState(false)
  if (!story) return null
  const SHORT = 220
  const isLong = story.length > SHORT
  return (
    <div>
      <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.75, margin: 0 }}>
        {expanded || !isLong ? story : story.slice(0, SHORT) + "…"}
      </p>
      {isLong && (
        <button onClick={() => setExpanded(e => !e)} style={{ background: "none", border: "none", color: G.mint, fontSize: 12, cursor: "pointer", padding: "4px 0 0", fontFamily: G.sans, fontWeight: 600 }}>
          {expanded ? "Voir moins ↑" : "Voir plus ↓"}
        </button>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { user, profile, signOut, fetchProfile } = useAuth()
  const { posts, loading, createPost, likePost, favoritePost, deletePost, sharePost, fetchPosts, fundPost } = usePosts()
  const { doMission }            = useMissions()
  const { notifications, unreadCount, markAllAsRead } = useNotifications()
  const { openDailyChest, hasOpenedChestToday } = usePoints()

  const [tab, setTab]               = useState("dashboard")
  const [notifOpen, setNotifOpen]   = useState(false)
  const [cpAnim, setCpAnim]         = useState(null)
  const [toast, setToast]           = useState(null)
  const [missionsToday, setMissionsToday] = useState(0)
  const [showForm, setShowForm]     = useState(false)
  const [feedFilter, setFeedFilter] = useState("pour-toi")
  const [bookmarked, setBookmarked] = useState({})
  const [topMembres, setTopMembres] = useState([])
  const [userQuests, setUserQuests] = useState([])
  const [upgradeModal, setUpgradeModal] = useState(null) // null | 'daily_missions' | 'post_limit'
  const [missionModal, setMissionModal] = useState(null) // { post, mission } | null
  const [proofUrl, setProofUrl]         = useState('')
  const [commentsOpen, setCommentsOpen] = useState({}) // postId -> bool
  const [commentsData, setCommentsData] = useState({}) // postId -> []
  const [commentDraft, setCommentDraft] = useState({}) // postId -> string
  const [commentLoading, setCommentLoading] = useState({}) // postId -> bool
  const [lightbox, setLightbox] = useState(null) // { src, alt }
  const [buyModal, setBuyModal] = useState(null)  // post object
  const [shopCategory, setShopCategory] = useState('tous')
  const [purchasing, setPurchasing] = useState(null) // item id en cours
  const [purchaseSuccess, setPurchaseSuccess] = useState(null) // item acheté
  const [boostModal, setBoostModal] = useState(null)       // item (boost) en attente de choix de post
  const [rechargeModal, setRechargeModal] = useState(null) // { postId, product } pour recharger un budget
  const [rechargeAmt, setRechargeAmt] = useState('50')

  const [nProduct, setNProduct] = useState("")
  const [nPrice, setNPrice]     = useState("")
  const [nStory, setNStory]     = useState("")
  const [nAsk, setNAsk]         = useState("")
  const [nImage, setNImage]     = useState(null)   // File object
  const [nImagePreview, setNImagePreview] = useState(null) // preview URL
  const [nLink, setNLink]       = useState("")
  const [nBudget, setNBudget]   = useState(0)   // dotation CP du post (escrow, optionnel)
  const [uploading, setUploading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const avatarInputRef = useRef(null)
  const postImageInputRef = useRef(null)

  // Charger top membres et quêtes au mount
  useEffect(() => {
    const loadData = async () => {
      // Top membres par CP
      const { data: top } = await supabase
        .from('profiles').select('id, name, cp, league, username, avatar_url, avatar_color')
        .order('cp', { ascending: false }).limit(5)
      setTopMembres(top || [])

      // Quêtes en cours
      if (user) {
        const { data: quests } = await supabase
          .from('user_quests').select('*, quests(*)')
          .eq('user_id', user.id).eq('completed', false).limit(3)
        setUserQuests(quests || [])

        // Missions réalisées aujourd'hui (pour l'objectif du jour)
        const today = new Date().toISOString().split('T')[0]
        const { count } = await supabase
          .from('missions').select('id', { count: 'exact', head: true })
          .eq('user_id', user.id).gte('created_at', today + 'T00:00:00')
        setMissionsToday(count || 0)
      }
    }
    loadData()
  }, [user, profile?.cp])

  const userMissions = getMissions(profile?.sales_channel)

  const openMissionModal = (post, mission) => {
    setProofUrl('')
    setMissionModal({ post, mission })
  }

  const confirmMission = async () => {
    if (!missionModal) return
    const { post, mission } = missionModal
    // La mission "buy" garde son flow spécifique
    if (mission.id === 'buy') {
      setBuyModal(post)
      setMissionModal(null)
      return
    }
    // Missions nécessitant une preuve : la preuve est obligatoire
    if (mission.needsProof && !proofUrl.trim()) {
      return // le bouton est déjà désactivé, double sécurité
    }
    const proof = proofUrl.trim() || null
    setMissionModal(null)
    setProofUrl("")
    const result = await doMission(post.id, mission.id, proof)
    if (result.success) {
      // Récompense réelle = barème pour 'buy' (frappe), sinon plafonnée au budget du post
      const reward = mission.id === 'buy' ? mission.cp : Math.min(mission.cp, post.support_budget || 0)
      if (reward > 0) {
        setCpAnim({ amount: reward, label: mission.label })
        setTimeout(() => setCpAnim(null), 1600)
      } else {
        setToast("Mission effectuée ! (post non doté — 0 CP, mais +XP)")
        setTimeout(() => setToast(null), 2400)
      }
      fetchPosts() // met à jour le budget restant du post
    } else if (result.error === 'LIMIT_REACHED') {
      setUpgradeModal(result.limitType || 'daily_missions')
    } else if (result.error) {
      setToast(`Impossible : ${result.error}`)
      setTimeout(() => setToast(null), 2000)
    }
  }

  const toggleComments = async (postId) => {
    const isOpen = commentsOpen[postId]
    setCommentsOpen(prev => ({ ...prev, [postId]: !isOpen }))
    if (!isOpen && !commentsData[postId]) {
      const { data } = await supabase
        .from('comments')
        .select('id, content, created_at, user_id, profiles(name, username, avatar_url, avatar_color)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .limit(50)
      setCommentsData(prev => ({ ...prev, [postId]: data || [] }))
    }
  }

  const submitComment = async (postId) => {
    const content = (commentDraft[postId] || '').trim()
    if (!content || !user) return
    setCommentLoading(prev => ({ ...prev, [postId]: true }))
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: user.id, content })
      .select('id, content, created_at, user_id, profiles(name, username, avatar_url, avatar_color)')
      .single()
    if (!error && data) {
      setCommentsData(prev => ({ ...prev, [postId]: [...(prev[postId] || []), data] }))
      setCommentDraft(prev => ({ ...prev, [postId]: '' }))
      // Compteur + points + notif : gérés par trigger serveur sur l'insert.
    }
    setCommentLoading(prev => ({ ...prev, [postId]: false }))
  }

  const deleteComment = async (postId, commentId) => {
    if (!user) return
    // Suppression optimiste
    setCommentsData(prev => ({ ...prev, [postId]: (prev[postId] || []).filter(c => c.id !== commentId) }))
    try {
      await supabase.from('comments').delete().eq('id', commentId)
      // Compteur comments_count décrémenté par trigger serveur sur le delete.
    } catch (e) { console.error('deleteComment error:', e) }
  }

  const handlePublish = async () => {
    if (!nProduct.trim() || !nStory.trim()) return
    // Vérification limite plan gratuit
    const isPremium = profile?.plan === 'premium'
    const myActivePosts = posts.filter(p => p.user_id === user?.id).length
    if (!isPremium && myActivePosts >= FREE_POST_LIMIT) {
      setUpgradeModal('post_limit')
      return
    }
    setUploading(true)
    try {
      let imageUrl = null
      if (nImage) {
        const { url, error: imgErr } = await uploadFile(nImage, 'post-images', user.id)
        if (imgErr) { console.error('Image upload error:', imgErr) }
        else imageUrl = url
      }
      const budget = Math.max(0, parseInt(nBudget, 10) || 0)
      const result = await createPost({
        product: nProduct, price: nPrice, story: nStory,
        ask: nAsk, tags: [], imageUrl, linkUrl: nLink || null,
        supportBudget: budget,
      })
      if (!result.error) {
        setNProduct(""); setNPrice(""); setNStory(""); setNAsk("")
        setNImage(null); setNImagePreview(null); setNLink(""); setNBudget(0)
        if (postImageInputRef.current) postImageInputRef.current.value = ''
        setShowForm(false)
        fetchProfile(user.id) // CP mis à jour si dotation
        if (result.fundingFailed) setToast("Post publié — dotation refusée (CP insuffisants)")
        else if (budget > 0) setToast(`Post publié et doté de ${budget} CP 🎁`)
        else setToast("Post publié ✓")
        setTimeout(() => setToast(null), 2400)
      }
    } finally {
      setUploading(false)
    }
  }

  const handleCPPurchase = async (item, postId = null) => {
    if (!user || !profile) return
    // Items pas encore disponibles : on ne débite rien
    if (item.comingSoon) {
      setToast(`"${item.title}" arrive bientôt — tes CP sont conservés.`)
      setTimeout(() => setToast(null), 2200)
      return
    }
    if ((profile.cp || 0) < item.cost) {
      setCpAnim({ amount: -item.cost, label: "CP insuffisants !" })
      setTimeout(() => setCpAnim(null), 2000)
      return
    }
    setPurchasing(item.id)
    try {
      if (item.id === 'badge_vip') {
        // RPC atomique : débite 500 CP + accorde le badge, côté serveur
        const { data, error } = await supabase.rpc('purchase_vip_badge')
        if (error) { console.error('purchase_vip_badge error:', error); setToast("Erreur lors du paiement en CP"); setTimeout(() => setToast(null), 2500); return }
        if (!data) { setToast('CP insuffisants'); setTimeout(() => setToast(null), 2000); return }
        setToast("👑 Badge VIP activé !")
        setTimeout(() => setToast(null), 2400)
      } else if (item.id === 'reduction_abo') {
        // Conversion CP → crédit de réduction d'abonnement (puits réel, consommé par Stripe en P2)
        const { data, error } = await supabase.rpc('redeem_cp_for_discount', { p_cp: 1000 })
        if (error) { console.error('redeem error:', error); setToast("Erreur lors de la conversion"); setTimeout(() => setToast(null), 2500); return }
        if (!data) { setToast('CP insuffisants (1000 CP requis)'); setTimeout(() => setToast(null), 2200); return }
        setToast("✅ 1€ de réduction ajouté à ton abonnement !")
        setTimeout(() => setToast(null), 2600)
      } else {
        // Dépense sécurisée : le serveur ne débite que l'appelant
        const { data: spent, error: spendErr } = await supabase.rpc('spend_points', {
          p_user_id: user.id, p_points: item.cost, p_reason: item.title,
        })
        if (spendErr) {
          console.error('spend_points error:', spendErr)
          setToast("Erreur lors du paiement en CP")
          setTimeout(() => setToast(null), 2500)
          return
        }
        if (!spent) {
          setToast('CP insuffisants')
          setTimeout(() => setToast(null), 2000)
          return
        }

        // Actions spécifiques selon l'item
        if ((item.id === 'boost_24h' || item.id === 'featured_48h') && postId) {
          const hours = item.id === 'featured_48h' ? 48 : 24
          const { error: boostErr } = await supabase.from('posts')
            .update({ is_boosted: true, boosted_until: new Date(Date.now() + hours*60*60*1000).toISOString() })
            .eq('id', postId)
          if (boostErr) { console.error('boost error:', boostErr); setToast("Le boost a échoué (réessaie)"); setTimeout(() => setToast(null), 2500) }
          else { setToast("🚀 Post mis à la une ! Il est en tête du feed."); setTimeout(() => setToast(null), 2600) }
          await fetchPosts()
          setTab('feed')
        }
      }

      // Notifier l'utilisateur
      await supabase.from('notifications').insert({
        user_id: user.id, type: 'info',
        message: `✅ "${item.title}" activé ! (${item.cost} CP dépensés)`,
      })

      setPurchaseSuccess(item.id)
      setTimeout(() => setPurchaseSuccess(null), 3000)
      // Rafraîchir le profil
      const { data: updated } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (updated) { window.dispatchEvent(new CustomEvent('profile-updated', { detail: updated })); fetchProfile(user.id) }
    } catch (e) {
      console.error('handleCPPurchase error:', e)
      setToast("Une erreur est survenue")
      setTimeout(() => setToast(null), 2500)
    } finally {
      setPurchasing(null)
    }
  }

  const handleOpenChest = async () => {
    const { reward } = await openDailyChest()
    if (reward > 0) {
      setCpAnim({ amount: reward, label: "Coffre quotidien !" })
      setTimeout(() => setCpAnim(null), 2000)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setAvatarUploading(true)
    try {
      const { url, error } = await uploadFile(file, 'avatars', user.id)
      if (url) {
        await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
        // Mettre à jour le profil sans reload
        const { data: updated } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (updated) window.__circupRefreshProfile?.(updated)
        // Forcer un rechargement léger via event
        window.dispatchEvent(new CustomEvent('avatar-updated', { detail: { url } }))
      } else {
        console.error('Avatar upload error:', error)
      }
    } finally {
      setAvatarUploading(false)
    }
  }

  const handlePostImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setNImage(file)
    const reader = new FileReader()
    reader.onload = (ev) => setNImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const removePostImage = () => {
    setNImage(null)
    setNImagePreview(null)
    if (postImageInputRef.current) postImageInputRef.current.value = ''
  }

  const unreadCount_val = unreadCount
  const initials = profile?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'
  const cp       = profile?.cp || 0
  const xp       = profile?.xp || 0
  const rank     = profile?.rank || 'Starter'
  const league   = profile?.league || 'Bronze'
  const streak   = profile?.streak || 0
  const words    = nStory.trim().split(/\s+/).filter(Boolean).length

  const rankMax = rank === 'Starter' ? 100 : rank === 'Builder' ? 300 : rank === 'Booster' ? 700 : 1000

  // Streak dynamique : 7 derniers jours
  const today = new Date()
  const streakDays = DAYS.map((_, i) => {
    // i=0 → lundi de la semaine courante
    const dayOfWeek = today.getDay() // 0=dim, 1=lun...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const dayDate = new Date(today)
    dayDate.setDate(today.getDate() + mondayOffset + i)
    const diffDays = Math.floor((today - dayDate) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays < streak
  })

  const inp = {
    width: "100%", background: G.card2, border: `1px solid ${G.border}`,
    borderRadius: 8, padding: "11px 14px", color: G.text, fontSize: 14,
    outline: "none", fontFamily: G.sans, boxSizing: "border-box",
    transition: "border-color 0.15s ease",
  }

  const FEED_FILTERS = ["Pour toi", "Produits", "Services", "Actualités"]

  const inp2 = { width: "100%", background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: "11px 14px", color: G.text, fontSize: 14, outline: "none", fontFamily: G.sans, boxSizing: "border-box", transition: "border-color 0.15s ease" }

  return (
    <div style={{ minHeight: "100vh", background: G.bg, fontFamily: G.sans, color: G.text, display: "flex", flexDirection: "column", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,900;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Space+Grotesk:wght@500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* Atmospheric background orbs */
        #circlup-bg-orb1 { position: fixed; top: -20vh; left: -10vw; width: 60vw; height: 60vh; background: radial-gradient(ellipse, rgba(255,106,61,0.04) 0%, transparent 65%); pointer-events: none; z-index: 0; }
        #circlup-bg-orb2 { position: fixed; bottom: -20vh; right: -10vw; width: 55vw; height: 55vh; background: radial-gradient(ellipse, rgba(0,213,213,0.03) 0%, transparent 65%); pointer-events: none; z-index: 0; }

        .fade { animation: fadeIn 0.45s cubic-bezier(0.16,1,0.3,1) both; }

        /* Radar ripple (Ton impact) — translate conservé dans le keyframe pour rester centré */
        @keyframes radarPulse { 0% { transform: translate(-50%,-50%) scale(0.35); opacity: 0.65; } 100% { transform: translate(-50%,-50%) scale(1.5); opacity: 0; } }
        .radar-ring { position: absolute; top: 50%; left: 50%; width: 120px; height: 120px; border-radius: 50%; border: 1.5px solid rgba(0,213,213,0.45); transform: translate(-50%,-50%) scale(0.35); }
        .radar-r1 { animation: radarPulse 3s ease-out infinite; }
        .radar-r2 { animation: radarPulse 3s ease-out infinite 1s; }
        .radar-r3 { animation: radarPulse 3s ease-out infinite 2s; }
        @keyframes heartBeat { 0%,100% { transform: translate(-50%,-50%) scale(1); } 50% { transform: translate(-50%,-50%) scale(1.14); } }
        .radar-core { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); animation: heartBeat 1.8s ease-in-out infinite; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        @keyframes stagger1 { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes cpFlash { 0%{opacity:0;transform:translateY(14px) scale(0.8)} 12%{opacity:1;transform:translateY(0) scale(1.06)} 80%{opacity:1} 100%{opacity:0;transform:translateY(-42px) scale(0.85)} }
        @keyframes iconFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-5px) scale(1.03)} }
        @keyframes spinRing { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -339.3; } }

        .nav-btn { transition: all 0.18s cubic-bezier(0.16,1,0.3,1); }
        .nav-btn:hover { background: rgba(255,255,255,0.06) !important; }

        .kpi-card { transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease; }
        .kpi-card:hover { transform: translateY(-5px); box-shadow: 0 28px 70px rgba(0,0,0,0.5) !important; }
        .kpi-card:hover .kpi-ico { animation: iconFloat 2.5s ease infinite; }

        .post-card { transition: border-color 0.15s ease, box-shadow 0.15s ease; }
        .post-card:hover { border-color: rgba(255,255,255,0.12) !important; box-shadow: 0 20px 56px rgba(0,0,0,0.6) !important; }

        .mission-box { transition: all 0.15s ease; }
        .mission-box:hover { background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.14) !important; transform: translateY(-2px); }

        .shop-card { transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease; }
        .shop-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.12) !important; box-shadow: 0 24px 60px rgba(0,0,0,0.55) !important; }

        .btn-red { transition: all 0.15s ease; }
        .btn-red:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(255,106,61,0.45) !important; }

        .sb-member { transition: background 0.15s; }
        .sb-member:hover { background: rgba(255,255,255,0.05) !important; }

        .mission-row { transition: all 0.22s cubic-bezier(0.16,1,0.3,1); }
        .mission-row:hover { background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.15) !important; transform: translateX(5px); }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.14); }

        input:focus, textarea:focus { border-color: rgba(0,213,213,0.4) !important; outline: none !important; box-shadow: 0 0 0 3px rgba(0,213,213,0.08) !important; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.18); }
        a { text-decoration: none; color: inherit; }
        .lnk:hover { color: #00D5D5 !important; }
        .lnk { transition: color 0.15s; }
      `}</style>

      {/* Atmospheric background */}
      <div id="circlup-bg-orb1" />
      <div id="circlup-bg-orb2" />

      {/* Modals */}
      {upgradeModal && <UpgradeModal type={upgradeModal} onClose={() => setUpgradeModal(null)} />}
      {lightbox && <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />}
      {buyModal && <BuyMissionModal post={buyModal} user={user} onClose={() => setBuyModal(null)} onSuccess={() => fetchPosts()} />}

      {/* Modal vérification mission */}
      {missionModal && (
        <div onClick={e => { if (e.target === e.currentTarget) setMissionModal(null) }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: G.bg3, border: `1px solid ${G.border}`, borderRadius: 16, padding: 32, width: "100%", maxWidth: 420, boxShadow: "0 32px 80px rgba(0,0,0,0.8)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: "radial-gradient(circle, rgba(0,213,213,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 80, height: 80, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", background: `rgba(255,106,61,0.1)`, borderRadius: 20, border: `1px solid rgba(255,106,61,0.2)` }}>
                <missionModal.mission.Icon size={36} color={G.accent} />
              </div>
              <h3 style={{ fontFamily: G.serif, fontSize: 22, fontWeight: 900, marginBottom: 8, color: G.text }}>{missionModal.mission.label}</h3>
              {(() => {
                const m = missionModal.mission
                const budget = missionModal.post.support_budget || 0
                const reward = m.id === 'buy' ? m.cp : Math.min(m.cp, budget)
                return (
                  <>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: G.goldL, border: `1px solid ${G.goldB}`, borderRadius: 20, padding: "5px 16px" }}>
                      <Zap size={13} color={G.gold} />
                      <span style={{ fontSize: 14, color: G.gold, fontWeight: 800 }}>+{reward} CP</span>
                    </div>
                    {m.id !== 'buy' && reward < m.cp && (
                      <div style={{ fontSize: 11, color: G.faint, marginTop: 8, lineHeight: 1.5 }}>
                        {budget > 0
                          ? `Budget du post bientôt épuisé (${budget} CP restants)`
                          : "Post non doté — tu gagnes 0 CP, mais tu gagnes de l'XP et tu aides un membre 💛"}
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: G.faint, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.6 }}>Post ciblé</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: G.text }}>{missionModal.post.product}</div>
                <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>par {missionModal.post.profiles?.name}</div>
              </div>
              {missionModal.post.profiles?.shop_url && (
                <a href={missionModal.post.profiles.shop_url} target="_blank" rel="noreferrer" style={{ background: G.cyanL, border: `1px solid ${G.cyanB}`, color: G.cyan, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                  Ouvrir <ExternalLink size={11} />
                </a>
              )}
            </div>
            {missionModal.mission.needsProof && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, color: G.muted, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.7, fontWeight: 600 }}>Preuve de mission</label>
                <input placeholder="https://drive.google.com/... ou URL directe" value={proofUrl} onChange={e => setProofUrl(e.target.value)}
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 16px", color: G.text, fontSize: 13, fontFamily: G.sans }} />
                <p style={{ fontSize: 11, color: G.faint, marginTop: 6 }}>Colle le lien vers ta capture d'écran prouvant la mission accomplie.</p>
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setMissionModal(null)} style={{ flex: 1, background: "transparent", border: `1px solid ${G.border}`, color: G.muted, padding: "12px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontFamily: G.sans }}>Annuler</button>
              <button onClick={confirmMission} disabled={missionModal.mission.needsProof && !proofUrl.trim()}
                className="btn-primary"
                style={{ flex: 2, background: (!missionModal.mission.needsProof || proofUrl.trim()) ? "linear-gradient(135deg, #FF6A3D, #e04820)" : G.card2, boxShadow: (!missionModal.mission.needsProof || proofUrl.trim()) ? "0 4px 16px rgba(255,106,61,0.35)" : "none", border: "none", color: (!missionModal.mission.needsProof || proofUrl.trim()) ? "#fff" : G.faint, padding: "12px", borderRadius: 8, cursor: (!missionModal.mission.needsProof || proofUrl.trim()) ? "pointer" : "not-allowed", fontSize: 14, fontWeight: 700, fontFamily: G.sans, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                <CheckCircle size={15} /> J'ai effectué cette mission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal choix du post à booster */}
      {boostModal && (
        <div onClick={e => { if (e.target === e.currentTarget) setBoostModal(null) }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: G.bg3, border: `1px solid ${G.border}`, borderRadius: 16, padding: 28, width: "100%", maxWidth: 440 }}>
            <h3 style={{ fontFamily: G.serif, fontSize: 20, fontWeight: 900, marginBottom: 6, color: G.text }}>{boostModal.title}</h3>
            <p style={{ fontSize: 13, color: G.muted, marginBottom: 18 }}>Choisis le post à mettre en avant ({boostModal.cost} CP) :</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
              {posts.filter(p => p.user_id === user?.id).map(p => (
                <button key={p.id} onClick={() => { const it = boostModal; setBoostModal(null); handleCPPurchase(it, p.id) }} style={{ textAlign: "left", background: G.card, border: `1px solid ${G.border}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", color: G.text, fontSize: 13, fontFamily: G.sans }}>
                  <strong>{p.product}</strong>
                  <span style={{ display: "block", fontSize: 11, color: G.faint, marginTop: 2 }}>{p.is_boosted ? "Déjà boosté" : "Cliquer pour booster"}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setBoostModal(null)} style={{ marginTop: 16, width: "100%", background: "transparent", border: `1px solid ${G.border}`, color: G.muted, padding: "11px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontFamily: G.sans }}>Annuler</button>
          </div>
        </div>
      )}

      {/* Modal recharge du budget de soutien */}
      {rechargeModal && (
        <div onClick={e => { if (e.target === e.currentTarget) setRechargeModal(null) }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: G.bg3, border: `1px solid ${G.border}`, borderRadius: 16, padding: 28, width: "100%", maxWidth: 400 }}>
            <h3 style={{ fontFamily: G.serif, fontSize: 20, fontWeight: 900, marginBottom: 6, color: G.text }}>Recharger le budget</h3>
            <p style={{ fontSize: 13, color: G.muted, marginBottom: 16 }}>Ces CP récompenseront les missions sur « {rechargeModal.product} ». Tu as {profile?.cp || 0} CP.</p>
            <div style={{ display: "flex", gap: 7, marginBottom: 14, flexWrap: "wrap" }}>
              {[25, 50, 100, 250].map(v => (
                <button key={v} onClick={() => setRechargeAmt(String(v))} style={{ background: rechargeAmt === String(v) ? G.accent : "rgba(255,255,255,0.05)", border: `1px solid ${rechargeAmt === String(v) ? G.accent : G.border}`, color: rechargeAmt === String(v) ? "#fff" : G.muted, padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: G.sans }}>{v} CP</button>
              ))}
            </div>
            <input type="number" min="1" value={rechargeAmt} onChange={e => setRechargeAmt(e.target.value)} placeholder="Montant en CP" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, borderRadius: 10, padding: "11px 14px", color: G.text, fontSize: 14, fontFamily: G.sans, marginBottom: 16, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setRechargeModal(null)} style={{ flex: 1, background: "transparent", border: `1px solid ${G.border}`, color: G.muted, padding: "11px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontFamily: G.sans }}>Annuler</button>
              <button onClick={async () => {
                const v = parseInt(rechargeAmt, 10)
                if (!v || v <= 0) return
                const pid = rechargeModal.postId
                setRechargeModal(null)
                const r = await fundPost(pid, v)
                if (r.success) { setToast(`+${v} CP ajoutés au budget`); fetchProfile(user.id) }
                else { setToast('CP insuffisants') }
                setTimeout(() => setToast(null), 2200)
              }} style={{ flex: 2, background: G.accent, border: "none", color: "#fff", padding: "11px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: G.sans }}>Recharger</button>
            </div>
          </div>
        </div>
      )}

      {/* CP Flash */}
      {cpAnim && (
        <div style={{ position: "fixed", top: 24, right: 32, zIndex: 1000, animation: "cpFlash 1.6s ease forwards", pointerEvents: "none" }}>
          <div style={{ background: `linear-gradient(135deg, ${G.accent}, #e04820)`, borderRadius: 12, padding: "12px 20px", display: "flex", alignItems: "center", gap: 9, boxShadow: "0 8px 28px rgba(255,106,61,0.45)" }}>
            <Zap size={16} color="#fff" fill="#fff" />
            <span style={{ fontWeight: 900, color: "#fff", fontSize: 15 }}>+{cpAnim.amount} CP</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{cpAnim.label}</span>
          </div>
        </div>
      )}

      {/* Toast simple (partage, infos) */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 32, zIndex: 1000, animation: "cpFlash 1.6s ease forwards", pointerEvents: "none" }}>
          <div style={{ background: G.bg3, border: `1px solid ${G.cyanB}`, borderRadius: 12, padding: "12px 20px", display: "flex", alignItems: "center", gap: 9, boxShadow: "0 8px 28px rgba(0,0,0,0.5)" }}>
            <CheckCircle size={16} color={G.cyan} />
            <span style={{ fontWeight: 600, color: G.text, fontSize: 13 }}>{toast}</span>
          </div>
        </div>
      )}

      {/* ── LAYOUT ── */}
      <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1 }}>

      {/* ── LEFT SIDEBAR 260px ── */}
      <aside style={{ width: 260, background: G.bg2, borderRight: `1px solid ${G.border}`, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0, overflowY: "auto" }}>

        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, height: 64, padding: "0 20px", borderBottom: `1px solid ${G.border}` }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#0a0a0a" }}>
            <img src="/logo.png" alt="CirclUp" style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.35)" }}
              onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }} />
            <div style={{ display: "none", width: "100%", height: "100%", background: "linear-gradient(135deg, #FF6A3D 0%, #e04820 100%)", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: G.serif, fontSize: 19, fontWeight: 700, color: "#fff" }}>C</span>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: G.serif, fontSize: 20, fontWeight: 700, color: G.text, lineHeight: 1, letterSpacing: -0.3 }}>CirclUp</div>
            <div style={{ fontSize: 9, color: G.faint, letterSpacing: 2, marginTop: 2, textTransform: "uppercase" }}>Beta v1.0</div>
          </div>
        </Link>

        {/* Nav */}
        <nav style={{ padding: "12px 10px", flex: 1 }}>
          {NAV.filter(n => !n.locked).map(({ id, Icon, label }) => {
            const active = tab === id
            return (
              <button key={id} onClick={() => setTab(id)} className="nav-btn"
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 16px", borderRadius: 8, marginBottom: 2, cursor: "pointer", fontFamily: G.sans, fontSize: 13, fontWeight: active ? 600 : 400, textAlign: "left", border: "none", background: active ? G.accentL : "transparent", color: active ? G.accent : G.muted, borderLeft: active ? `2px solid ${G.accent}` : "2px solid transparent", transition: "all 0.15s ease" }}>
                <Icon size={15} />
                <span style={{ flex: 1 }}>{label}</span>
              </button>
            )
          })}

          <div style={{ margin: "12px 2px 8px", borderTop: `1px solid ${G.border}`, paddingTop: 10 }}>
            <div style={{ fontSize: 9, color: G.faint, letterSpacing: 1.5, fontWeight: 700, padding: "0 16px 4px", textTransform: "uppercase" }}>Bientôt</div>
          </div>

          {NAV.filter(n => n.locked).map(({ id, Icon, label }) => (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 16px", borderRadius: 8, marginBottom: 2, fontFamily: G.sans, fontSize: 13, color: G.faint, opacity: 0.4, borderLeft: "2px solid transparent" }}>
              <Icon size={15} />
              <span style={{ flex: 1 }}>{label}</span>
              <span style={{ background: G.goldL, border: `1px solid ${G.goldB}`, color: G.gold, borderRadius: 4, fontSize: 8, fontWeight: 800, padding: "2px 6px", letterSpacing: 0.5 }}>SOON</span>
            </div>
          ))}
        </nav>

        {/* CP Widget */}
        <div onClick={() => setTab('boutique')} style={{ margin: "0 10px 10px", background: G.goldL, border: `1px solid ${G.goldB}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", transition: "all 0.15s ease" }}
          onMouseOver={e => { e.currentTarget.style.borderColor = G.gold; e.currentTarget.style.background = "rgba(245,197,24,0.12)" }}
          onMouseOut={e => { e.currentTarget.style.borderColor = G.goldB; e.currentTarget.style.background = G.goldL }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Zap size={12} color={G.gold} />
              <span style={{ fontSize: 10, color: G.gold, fontWeight: 700, letterSpacing: 0.6 }}>CRÉDITS CP</span>
            </div>
            <span style={{ fontFamily: G.num, fontSize: 22, fontWeight: 700, color: G.gold, lineHeight: 1, letterSpacing: -0.5 }}>{cp}</span>
          </div>
          <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${Math.min(cp / rankMax * 100, 100)}%`, height: "100%", background: `linear-gradient(90deg, ${G.gold}, ${G.accent})`, borderRadius: 2, transition: "width 0.6s ease" }} />
          </div>
          <div style={{ fontSize: 9, color: G.faint, marginTop: 5 }}>{rank} · {Math.max(0, rankMax - cp)} CP pour le prochain rang</div>
        </div>

        {/* Input avatar caché */}
        <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />

        {/* Profil card */}
        <Link to={profile?.username ? `/u/${profile.username}` : '#'}
          style={{ display: "block", margin: "0 10px 8px", background: G.card2, border: `1px solid ${G.border}`, borderRadius: 12, padding: "14px 14px 12px", transition: "all 0.15s ease" }}
          onMouseOver={e => { e.currentTarget.style.borderColor = G.cyanB; e.currentTarget.style.background = G.card3 }}
          onMouseOut={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.background = G.card2 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Avatar initials={initials} color={G.mint} size={36} src={profile?.avatar_url} uploading={avatarUploading} onClick={e => { e.preventDefault(); avatarInputRef.current?.click() }} />
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: G.text }}>{profile?.name || 'Membre'}</div>
              {profile?.username && <div style={{ fontSize: 10, color: G.muted }}>@{profile.username}</div>}
            </div>
            <div style={{ background: G.goldL, border: `1px solid ${G.goldB}`, borderRadius: 6, padding: "2px 8px", fontSize: 9, color: G.gold, fontWeight: 700, flexShrink: 0 }}>{profile?.rank || 'Starter'}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {[{ label: "CP", val: profile?.cp || 0, color: G.gold }, { label: "Ligue", val: profile?.league || 'Bronze', color: G.cyan }, { label: "Streak", val: `${profile?.streak || 0}j`, color: G.accent }].map(({ label, val, color }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 8, padding: "7px 4px", textAlign: "center" }}>
                <div style={{ fontFamily: G.num, fontSize: 14, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 9, color: G.muted, marginTop: 4, fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 10, color: G.muted, textAlign: "center", fontWeight: 500 }}>Voir mon profil →</div>
        </Link>

        {/* Admin */}
        {profile?.is_admin && (
          <a href="/admin" style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 10px 8px", background: G.accentL, border: `1px solid ${G.accentB}`, borderRadius: 10, padding: "10px 14px", transition: "border-color 0.15s ease" }}
            onMouseOver={e => e.currentTarget.style.borderColor = G.accent}
            onMouseOut={e => e.currentTarget.style.borderColor = G.accentB}
          >
            <Shield size={15} color={G.accent} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: G.accent }}>Panel Admin</div>
              <div style={{ fontSize: 10, color: G.faint }}>Gérer la plateforme</div>
            </div>
            <span style={{ background: G.accent, color: "#fff", borderRadius: 6, fontSize: 9, fontWeight: 800, padding: "2px 7px" }}>ADMIN</span>
          </a>
        )}

        {/* Logout */}
        <button onClick={signOut} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, margin: "0 10px 14px", background: "transparent", border: `1px solid ${G.border}`, color: G.muted, padding: "9px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontFamily: G.sans, transition: "all 0.15s ease" }}
          onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = G.text }}
          onMouseOut={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.muted }}
        >
          <LogOut size={13} /> Déconnexion
        </button>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", minWidth: 0 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* ── TOP HEADER ── */}
        <header style={{ height: 64, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 36px", background: "rgba(5,5,5,0.92)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderBottom: `1px solid ${G.border}`, position: "sticky", top: 0, zIndex: 100 }}>
          <div>
            <h1 style={{ fontFamily: G.serif, fontSize: 24, fontWeight: 600, margin: 0, lineHeight: 1, color: G.text, letterSpacing: -0.3 }}>
              {tab === "dashboard" && <span>Bonjour, <em style={{ color: G.accent, fontStyle: "italic" }}>{profile?.name?.split(' ')[0] || 'Toi'}</em> 👋</span>}
              {tab === "feed"      && "Feed CirclUp"}
              {tab === "projets"   && "Projets"}
              {tab === "missions"  && "Mes Missions"}
              {tab === "cercle"    && "Mon Cercle"}
              {tab === "favoris"   && "Mes Favoris"}
              {tab === "boutique"  && "Boutique CP"}
            </h1>
            <p style={{ fontSize: 12, color: G.muted, margin: 0, marginTop: 4, letterSpacing: 0.2, fontWeight: 300 }}>
              {tab === "dashboard" && "Prêt à booster ta boutique aujourd'hui ?"}
              {tab === "feed"      && "Découvre les posts de ta communauté"}
              {tab === "projets"   && "Soutiens un projet ou lance le tien"}
              {tab === "missions"  && "Complète tes missions et gagne des CP"}
              {tab === "cercle"    && "Ton groupe d'entraide de 10 membres"}
              {tab === "favoris"   && "Les posts que tu as sauvegardés"}
              {tab === "boutique"  && "Dépense tes CP pour booster ta visibilité"}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {!hasOpenedChestToday && (
              <button onClick={handleOpenChest} title="Coffre quotidien disponible !" style={{ background: G.goldL, border: `1px solid ${G.goldB}`, color: G.gold, width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
                <Gift size={17} />
                <div style={{ position: "absolute", top: -3, right: -3, width: 10, height: 10, borderRadius: "50%", background: G.gold }} />
              </button>
            )}
            <div style={{ position: "relative" }}>
              <button onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markAllAsRead() }} style={{ background: G.card2, border: `1px solid ${G.border}`, color: G.text, width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s ease" }}
                onMouseOver={e => { e.currentTarget.style.background = G.card3; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)" }}
                onMouseOut={e => { e.currentTarget.style.background = G.card2; e.currentTarget.style.borderColor = G.border }}
              >
                <Bell size={17} />
              </button>
              {unreadCount_val > 0 && <div style={{ position: "absolute", top: -3, right: -3, width: 16, height: 16, borderRadius: "50%", background: G.accent, fontSize: 9, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadCount_val}</div>}
              {notifOpen && (
                <div style={{ position: "absolute", right: 0, top: 48, width: 330, background: "rgba(10,10,10,0.97)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: `1px solid ${G.border}`, borderRadius: 16, padding: 18, zIndex: 200, boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: G.muted, marginBottom: 14, letterSpacing: 0.5, textTransform: "uppercase" }}>Notifications</div>
                  {notifications.length === 0 && <div style={{ fontSize: 13, color: G.faint, textAlign: "center", padding: "16px 0" }}>Aucune notification</div>}
                  {notifications.map((n, i) => (
                    <div key={n.id || i} style={{ padding: "10px 0", borderBottom: i < notifications.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none", opacity: n.is_read ? 0.5 : 1 }}>
                      <div style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: n.type === 'purchase_pending' ? G.goldL : G.cyanL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {n.type === 'purchase_pending' ? <ShoppingBag size={13} color={G.gold} /> : <Bell size={13} color={G.cyan} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: n.is_read ? 400 : 600, lineHeight: 1.5 }}>{n.message}</div>
                          <div style={{ fontSize: 10, color: G.faint, marginTop: 3 }}>{new Date(n.created_at).toLocaleDateString('fr-FR')}</div>
                        </div>
                      </div>
                      {n.actor_username && (
                        <div style={{ marginTop: 9, paddingLeft: 40 }}>
                          <Link to={`/u/${n.actor_username}`} onClick={() => setNotifOpen(false)} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: G.accentL, border: `1px solid ${G.accentB}`, color: G.accent, padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 700, fontFamily: G.sans, textDecoration: "none" }}>
                            ↩ Rendre le soutien
                          </Link>
                        </div>
                      )}
                      {n.type === 'purchase_pending' && n.post_id && (
                        <div style={{ display: "flex", gap: 6, marginTop: 9, paddingLeft: 40 }}>
                          <button onClick={async () => {
                            const { data: conf } = await supabase.from('purchase_confirmations').select('id').eq('post_id', n.post_id).eq('seller_id', user.id).eq('status', 'pending').maybeSingle()
                            if (!conf) return
                            // RPC serveur : passe la confirmation à "confirmed", crée la mission 'buy'
                            // (le trigger crédite l'acheteur) et le notifie.
                            const { error: confErr } = await supabase.rpc('confirm_purchase', { p_confirmation_id: conf.id })
                            if (confErr) { console.error('confirm_purchase error:', confErr); return }
                            await supabase.from('notifications').update({ is_read: true }).eq('id', n.id)
                            setCpAnim({ amount: 5, label: "Achat confirmé !" })
                            setTimeout(() => setCpAnim(null), 2000)
                          }} style={{ background: G.cyanL, border: `1px solid ${G.cyanB}`, color: G.cyan, padding: "5px 12px", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: G.sans }}>
                            ✓ Confirmer
                          </button>
                          <button onClick={async () => {
                            const { data: conf } = await supabase.from('purchase_confirmations').select('id').eq('post_id', n.post_id).eq('seller_id', user.id).eq('status', 'pending').maybeSingle()
                            if (conf) {
                              await supabase.rpc('reject_purchase', { p_confirmation_id: conf.id })
                            }
                            await supabase.from('notifications').update({ is_read: true }).eq('id', n.id)
                          }} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: G.faint, padding: "5px 12px", borderRadius: 7, cursor: "pointer", fontSize: 11, fontFamily: G.sans }}>
                            ✗ Rejeter
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, padding: "6px 14px 6px 8px" }}>
              <Avatar initials={initials} color={G.mint} size={28} src={profile?.avatar_url} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: G.text }}>{profile?.name?.split(' ')[0] || 'Membre'}</div>
                <div style={{ fontSize: 10, color: G.gold, display: "flex", alignItems: "center", gap: 3 }}><Crown size={9} color={G.gold} /> {rank}</div>
              </div>
            </div>
          </div>
        </header>

        {/* ── CONTENT ── */}
        <main style={{ flex: 1, overflowY: "auto", padding: "32px 40px", minWidth: 0, background: "transparent" }}>

          {/* ══ DASHBOARD TAB ══ */}
          {tab === "dashboard" && (
            <div className="fade">
              {/* ── HERO : Points disponibles ── */}
              <div style={{ background: "linear-gradient(135deg, rgba(255,106,61,0.07) 0%, rgba(13,13,13,0.4) 50%, rgba(0,213,213,0.04) 100%)", border: `1px solid ${G.border}`, borderRadius: 18, padding: "30px 34px", marginBottom: 24, display: "flex", gap: 28, alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -60, right: 120, width: 260, height: 260, background: "radial-gradient(circle, rgba(255,106,61,0.1) 0%, transparent 65%)", pointerEvents: "none" }} />

                {/* Gauche : gros chiffre + actions */}
                <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                  <div style={{ fontSize: 11, color: G.muted, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>Tes points disponibles</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontFamily: G.num, fontSize: 56, fontWeight: 700, color: G.text, lineHeight: 1, letterSpacing: -2, background: `linear-gradient(135deg, ${G.gold}, ${G.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{cp.toLocaleString('fr-FR')}</span>
                    <span style={{ fontFamily: G.num, fontSize: 20, fontWeight: 600, color: G.muted }}>pts</span>
                  </div>
                  <div style={{ fontSize: 12, color: G.faint, marginBottom: 22 }}>Rang {rank} · {Math.max(0, rankMax - cp)} CP pour le prochain rang</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setTab("missions")} className="btn-primary" style={{ background: "linear-gradient(135deg, #FF6A3D, #e04820)", boxShadow: "0 6px 20px rgba(255,106,61,0.35)", border: "none", color: "#fff", padding: "11px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: G.sans, display: "flex", alignItems: "center", gap: 7 }}>
                      <TrendingUp size={15} /> Gagner des points
                    </button>
                    <button onClick={() => setTab("boutique")} style={{ background: G.card2, border: `1px solid ${G.border}`, color: G.text, padding: "11px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: G.sans, display: "flex", alignItems: "center", gap: 7, transition: "border-color 0.15s" }}
                      onMouseOver={e => e.currentTarget.style.borderColor = G.borderHover}
                      onMouseOut={e => e.currentTarget.style.borderColor = G.border}
                    >
                      <Zap size={15} /> Dépenser mes points
                    </button>
                  </div>
                </div>

                {/* Droite : anneau plan */}
                <div style={{ display: "flex", alignItems: "center", gap: 20, position: "relative", zIndex: 1, flexShrink: 0 }}>
                  <div style={{ position: "relative", width: 120, height: 120 }}>
                    <svg width={120} height={120} viewBox="0 0 120 120">
                      <circle cx={60} cy={60} r={52} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
                      <circle cx={60} cy={60} r={52} fill="none" stroke="url(#planGrad)" strokeWidth={7} strokeDasharray={`${2*Math.PI*52*Math.min(cp/rankMax,1)} ${2*Math.PI*52}`} strokeLinecap="round" transform="rotate(-90 60 60)" />
                      <defs><linearGradient id="planGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={G.gold} /><stop offset="100%" stopColor={G.accent} /></linearGradient></defs>
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: `${G.gold}12`, border: `1px solid ${G.goldB}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {profile?.plan === 'premium' ? <Crown size={22} color={G.gold} /> : <Award size={22} color={G.gold} />}
                      </div>
                    </div>
                  </div>
                  <div style={{ minWidth: 130 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: G.text, marginBottom: 4 }}>{profile?.plan === 'premium' ? 'Membre Premium' : `Plan ${profile?.plan === 'starter' ? 'Starter' : 'Gratuit'}`}</div>
                    <div style={{ fontSize: 12, color: G.muted, lineHeight: 1.5 }}>Ligue <span style={{ color: G.cyan, fontWeight: 600 }}>{profile?.league || 'Bronze'}</span></div>
                    {profile?.plan !== 'premium' && (
                      <button onClick={() => setUpgradeModal('premium_feature')} style={{ marginTop: 8, background: "none", border: "none", color: G.accent, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: G.sans, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                        Passer Premium <ChevronRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: G.muted, letterSpacing: 0.8, textTransform: "uppercase" }}>Tes Performances</span>
                <span style={{ fontSize: 11, color: G.faint }}>7 derniers jours</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 32 }}>
                {[
                  { label: "Favoris reçus",  val: posts.filter(p => p.user_id === user?.id).reduce((a, p) => a + (p.favorites_count || 0), 0) || 0, KpiIcon: Star,        color: G.gold,   glow: "rgba(245,197,24,0.3)",  trend: "sur tes posts"  },
                  { label: "Missions faites", val: posts.reduce((a, p) => a + (p.missions?.filter(m => m.user_id === user?.id).length || 0), 0),     KpiIcon: Target,      color: G.cyan,   glow: "rgba(0,213,213,0.3)",   trend: "au total"       },
                  { label: "CP total",        val: cp,                                                                                                KpiIcon: Zap,         color: G.accent, glow: "rgba(255,106,61,0.3)",   trend: "cumulés" },
                  { label: "Posts actifs",    val: posts.filter(p => p.user_id === user?.id).length || 0,                                           KpiIcon: TrendingUp,  color: G.cyan,   glow: "rgba(0,213,213,0.25)", trend: "publiés"},
                ].map(({ label, val, KpiIcon, color, glow, trend }, ki) => (
                  <div key={label} className="kpi-card" style={{
                    background: G.card,
                    border: `1px solid ${G.border}`,
                    borderRadius: 12, padding: "24px 20px 20px",
                    position: "relative", overflow: "hidden", cursor: "default",
                    animationDelay: `${ki * 0.06}s`,
                  }}>
                    {/* Glow orb */}
                    <div style={{ position: "absolute", top: -40, right: -40, width: 130, height: 130, background: `radial-gradient(circle, ${glow} 0%, transparent 65%)`, pointerEvents: "none" }} />
                    {/* Bottom accent line */}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg, transparent 0%, ${color}55 50%, transparent 100%)` }} />
                    {/* Header row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                      <span style={{ fontSize: 10, color: G.faint, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
                      <div className="kpi-ico" style={{ width: 48, height: 48, borderRadius: 12, background: `${color}10`, border: `1px solid ${color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <KpiIcon size={22} color={color} />
                      </div>
                    </div>
                    {/* Big value */}
                    <div style={{ fontFamily: G.num, fontSize: 48, fontWeight: 700, color, lineHeight: 1, marginBottom: 10, letterSpacing: -2 }}>{val}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: G.faint, fontWeight: 400 }}>{trend}</span>
                      <Sparkline color={color} up={true} />
                    </div>
                  </div>
                ))}
              </div>

              {/* ── SÉRIE EN COURS ── */}
              <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, padding: "16px 22px", marginBottom: 20, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: G.accentL, border: `1px solid ${G.accentB}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Flame size={22} color={G.accent} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: G.muted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Série en cours</div>
                    <div style={{ fontFamily: G.num, fontSize: 22, fontWeight: 700, color: G.text, lineHeight: 1.1 }}>{streak} jour{streak > 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flex: 1, justifyContent: "center" }}>
                  {DAYS.map((d, i) => (
                    <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: streakDays[i] ? G.accent : "rgba(255,255,255,0.05)", border: `1px solid ${streakDays[i] ? G.accent : G.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {streakDays[i] && <CheckCircle size={15} color="#fff" />}
                      </div>
                      <span style={{ fontSize: 10, color: streakDays[i] ? G.text : G.muted, fontWeight: 500 }}>{d}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: G.muted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Prochaine récompense</div>
                    <div style={{ fontFamily: G.num, fontSize: 16, fontWeight: 700, color: G.gold }}>+{streak >= 7 ? 150 : streak >= 3 ? 40 : 15} CP</div>
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: G.goldL, border: `1px solid ${G.goldB}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Gift size={22} color={G.gold} />
                  </div>
                </div>
              </div>

              {/* Missions du jour */}
              <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: "22px 24px", marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: G.cyanL, border: `1px solid ${G.cyanB}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Target size={16} color={G.cyan} /></div>
                    <span style={{ fontSize: 15, fontWeight: 800 }}>Missions du jour</span>
                    <span style={{ background: G.accent, color: "#fff", borderRadius: 20, fontSize: 11, fontWeight: 800, padding: "2px 9px" }}>{userMissions.length}</span>
                  </div>
                  <button onClick={() => setTab("feed")} style={{ background: "none", border: "none", color: G.mint, fontSize: 12, cursor: "pointer", fontFamily: G.sans, display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                    Voir toutes <ChevronRight size={13} />
                  </button>
                </div>
                {userMissions.slice(0, 4).map((m, i) => (
                  <div key={m.id} onClick={() => setTab("feed")} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "12px 14px", marginBottom: 8,
                    background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.07)`,
                    borderRadius: 12, cursor: "pointer", transition: "all 0.15s",
                  }}
                    onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = `rgba(255,255,255,0.12)`; e.currentTarget.style.transform = "translateX(4px)" }}
                    onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateX(0)" }}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: m.free ? G.cyanL : G.goldL, border: `1px solid ${m.free ? G.cyanB : G.goldB}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <m.Icon size={22} color={m.free ? G.cyan : G.gold} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: G.faint }}>Disponible sur les posts du feed</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: G.num, fontSize: 16, fontWeight: 700, color: m.free ? G.mint : G.gold }}>+{m.cp}</span>
                      <span style={{ fontSize: 10, color: m.free ? G.mint : G.gold, fontWeight: 700 }}>CP</span>
                      <div style={{ background: G.accent, borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 5 }}>
                        Commencer <ChevronRight size={12} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Signaux algorithme */}
              <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: G.cyanL, border: `1px solid ${G.cyanB}`, display: "flex", alignItems: "center", justifyContent: "center" }}><TrendingUp size={16} color={G.cyan} /></div>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>Signaux Algorithme</span>
                  <span style={{ fontSize: 11, color: G.faint, background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, borderRadius: 6, padding: "2px 8px" }}>Etsy · Shopify</span>
                </div>
                {[
                  { label: "Favoris générés",    val: posts.filter(p => p.user_id === user?.id).reduce((a, p) => a + (p.favorites_count || 0), 0), max: 50,  color: G.gold,   SigIcon: Star    },
                  { label: "Avis vérifiés",       val: posts.filter(p => p.user_id === user?.id).reduce((a, p) => a + (p.reviews_count || 0), 0),   max: 15,  color: G.cyan,   SigIcon: Search  },
                  { label: "Partages story",      val: posts.filter(p => p.user_id === user?.id).reduce((a, p) => a + (p.shares_count || 0), 0),    max: 30,  color: G.accent, SigIcon: Share2  },
                  { label: "Visites boutique",    val: posts.filter(p => p.user_id === user?.id).reduce((a, p) => a + (p.likes_count || 0), 0),     max: 100, color: G.cyan,   SigIcon: Eye     },
                ].map(({ label, val, max, color, SigIcon }) => (
                  <div key={label} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <SigIcon size={14} color={color} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontFamily: G.num, fontSize: 18, fontWeight: 700, color }}>{val}</span>
                        <span style={{ fontSize: 11, color: G.faint }}>/ {max}</span>
                      </div>
                    </div>
                    <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(val / max * 100, 100)}%`, height: "100%", background: `linear-gradient(90deg, ${color}aa, ${color})`, borderRadius: 3, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ PROJETS TAB ══ */}
          {tab === "projets" && <ProjectsView user={user} profile={profile} />}

          {/* ══ FEED TAB ══ */}
          {tab === "feed" && (
            <div className="fade">
              {/* Publish box */}
              <div style={{ background: G.card2, border: `1px solid ${G.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                {!showForm ? (
                  <div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                      <Avatar initials={initials} color={profile?.avatar_color || G.cyan} size={36} src={profile?.avatar_url} />
                      <button onClick={() => setShowForm(true)} style={{ flex: 1, background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: "10px 16px", color: G.muted, fontSize: 14, textAlign: "left", cursor: "pointer", fontFamily: G.sans, transition: "all 0.15s ease" }}
                        onMouseOver={e => { e.currentTarget.style.background = G.card2; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)" }}
                        onMouseOut={e => { e.currentTarget.style.background = G.card; e.currentTarget.style.borderColor = G.border }}
                      >
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
                      {!nStory && (
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 10, color: G.faint, marginBottom: 6, letterSpacing: 0.5 }}>✨ SUGGESTIONS — clique pour démarrer</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {[
                              "Je crée ce produit depuis ",
                              "Mon client idéal, c'est quelqu'un qui ",
                              "Ce qui rend ce produit unique, c'est ",
                              "L'histoire derrière ce produit : ",
                              "Le problème que je résous : ",
                            ].map(s => (
                              <button key={s} onClick={() => setNStory(s)} style={{ background: G.cyanL, border: `1px solid ${G.cyanB}`, color: G.cyan, borderRadius: 20, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: G.sans, transition: "all 0.15s ease" }}
                                onMouseOver={e => { e.currentTarget.style.background = "rgba(0,213,213,0.14)"; e.currentTarget.style.borderColor = G.cyan }}
                                onMouseOut={e => { e.currentTarget.style.background = G.cyanL; e.currentTarget.style.borderColor = G.cyanB }}
                              >{s.substring(0, 28)}…</button>
                            ))}
                          </div>
                        </div>
                      )}
                      <textarea rows={4} placeholder="Raconte l'histoire de ce produit..." value={nStory} onChange={e => setNStory(e.target.value)} style={{ ...inp, resize: "vertical" }} />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 10, color: G.muted, display: "block", marginBottom: 5, letterSpacing: 0.7, textTransform: "uppercase" }}>Ce que tu demandes</label>
                      {!nAsk && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 6 }}>
                          {[
                            "Vos favoris Etsy m'aideraient beaucoup !",
                            "Partagez en story si ça vous plaît 🙏",
                            "Un avis Google ferait toute la différence !",
                            "Visitez ma boutique et dites-moi ce que vous en pensez",
                          ].map(s => (
                            <button key={s} onClick={() => setNAsk(s)} style={{ background: G.accentL, border: `1px solid ${G.accentB}`, color: G.accent, borderRadius: 20, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: G.sans }}>{s.substring(0, 32)}…</button>
                          ))}
                        </div>
                      )}
                      <input placeholder="Ex: Vos favoris Etsy m'aideraient beaucoup !" value={nAsk} onChange={e => setNAsk(e.target.value)} style={inp} />
                    </div>

                    {/* Image du post */}
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 10, color: G.muted, display: "block", marginBottom: 5, letterSpacing: 0.7, textTransform: "uppercase" }}>Image du produit (optionnel · +30 pts)</label>
                      <input ref={postImageInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePostImageChange} />
                      {nImagePreview ? (
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <img src={nImagePreview} alt="preview" style={{ height: 100, borderRadius: 8, objectFit: "cover", border: `1px solid ${G.border}` }} />
                          <button onClick={removePostImage} style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: G.accent, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <X size={11} color="#fff" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => postImageInputRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.04)", border: `1px dashed ${G.border}`, borderRadius: 8, padding: "10px 16px", cursor: "pointer", color: G.muted, fontSize: 13, fontFamily: G.sans, width: "100%" }}>
                          <Upload size={14} /> Ajouter une photo
                        </button>
                      )}
                    </div>

                    {/* Lien du post */}
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 10, color: G.muted, display: "block", marginBottom: 5, letterSpacing: 0.7, textTransform: "uppercase" }}>Lien vers ta boutique / produit (optionnel)</label>
                      <div style={{ position: "relative" }}>
                        <Link2 size={13} color={G.faint} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                        <input placeholder="https://etsy.com/listing/..." value={nLink} onChange={e => setNLink(e.target.value)} style={{ ...inp, paddingLeft: 34 }} />
                      </div>
                    </div>

                    {/* Dotation de soutien (escrow) — optionnel */}
                    <div style={{ marginBottom: 14, background: "rgba(255,106,61,0.05)", border: `1px solid ${G.accentB}`, borderRadius: 10, padding: "12px 14px" }}>
                      <label style={{ fontSize: 10, color: G.accent, display: "block", marginBottom: 5, letterSpacing: 0.7, textTransform: "uppercase", fontWeight: 700 }}>Dotation de soutien (optionnel)</label>
                      <p style={{ fontSize: 11, color: G.muted, margin: "0 0 9px", lineHeight: 1.5 }}>
                        Les CP que tu mets ici récompensent les membres qui font des missions sur ton post. Tu as <strong style={{ color: G.gold }}>{profile?.cp || 0} CP</strong>.
                      </p>
                      <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
                        {[0, 50, 100, 250].map(v => (
                          <button key={v} type="button" onClick={() => setNBudget(v)} style={{
                            background: Number(nBudget) === v ? G.accent : "rgba(255,255,255,0.05)",
                            border: `1px solid ${Number(nBudget) === v ? G.accent : G.border}`,
                            color: Number(nBudget) === v ? "#fff" : G.muted,
                            padding: "6px 13px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: G.sans,
                          }}>{v === 0 ? "Aucune" : `${v} CP`}</button>
                        ))}
                        <input type="number" min="0" placeholder="Autre" value={nBudget || ""} onChange={e => setNBudget(Math.max(0, parseInt(e.target.value, 10) || 0))}
                          style={{ ...inp, width: 90, padding: "6px 10px" }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 9 }}>
                      <button onClick={handlePublish} disabled={!nProduct || !nStory || uploading} style={{ background: G.accent, border: "none", color: "#fff", padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: (!nProduct || !nStory || uploading) ? "not-allowed" : "pointer", fontFamily: G.sans, opacity: (!nProduct || !nStory || uploading) ? 0.5 : 1, display: "flex", alignItems: "center", gap: 6 }}>
                        <Zap size={14} /> {uploading ? "Publication..." : (Number(nBudget) > 0 ? `Publier · doter ${nBudget} CP` : "Publier")}
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
                      background: active ? G.accent : G.card,
                      border: `1px solid ${active ? G.accent : G.border}`,
                      color: active ? "#fff" : G.muted,
                      padding: "7px 16px", borderRadius: 20, cursor: "pointer",
                      fontSize: 13, fontFamily: G.sans, fontWeight: active ? 600 : 400,
                      transition: "all 0.15s ease",
                    }}>
                      {i === 0 && <Star size={11} color={G.gold} fill={G.gold} style={{ marginRight: 4 }} />}{f}
                    </button>
                  )
                })}
                <button style={{ marginLeft: "auto", background: "transparent", border: `1px solid ${G.border}`, color: G.muted, padding: "7px 12px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontFamily: G.sans }}>
                  <Filter size={13} /> Filtres
                </button>
              </div>

              {loading && <div style={{ textAlign: "center", padding: 48, color: G.muted }}>Chargement...</div>}

              {posts.filter(post => {
                if (feedFilter === "pour-toi") return true
                const t = (post.post_type || "").toLowerCase()
                if (feedFilter === "produits")   return t.includes("produit") || t.includes("promotion") || !!post.price
                if (feedFilter === "services")   return t.includes("service")
                if (feedFilter === "actualités") return t.includes("actu") || t.includes("news") || t.includes("nouveau")
                return true
              }).map((post) => {
                const myMissions = post.missions?.filter(m => m.user_id === user?.id).map(m => m.mission_type) || []
                const authorInit = post.profiles?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'
                const isOwn = post.user_id === user?.id
                const isLiked = post.post_likes?.some(l => l.user_id === user?.id)
                const isFaved = post.post_favorites?.some(f => f.user_id === user?.id)
                const isBoosted = post.is_boosted && (!post.boosted_until || new Date(post.boosted_until) > new Date())
                return (
                  <div key={post.id} className="post-card" style={{ background: G.card, border: `1px solid ${isBoosted ? G.accentB : G.border}`, borderRadius: 16, marginBottom: 16, overflow: "hidden", display: "flex", flexDirection: "column", transition: "border-color 0.15s", boxShadow: isBoosted ? `0 0 0 1px ${G.accentB}, 0 8px 30px rgba(255,106,61,0.12)` : "none" }}
                    onMouseOver={e => e.currentTarget.style.borderColor = G.borderHover}
                    onMouseOut={e => e.currentTarget.style.borderColor = G.border}
                  >
                    {/* ── TOP ROW : image + contenu ── */}
                    <div style={{ display: "flex" }}>

                      {/* IMAGE GAUCHE */}
                      {post.image_url && (
                        <div onClick={() => setLightbox({ src: post.image_url, alt: post.product })}
                          style={{ width: 320, height: 320, flexShrink: 0, cursor: "zoom-in", overflow: "hidden", position: "relative" }}>
                          <img src={post.image_url} alt={post.product}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
                            onMouseOver={e => e.currentTarget.style.transform = "scale(1.04)"}
                            onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                          />
                          {post.price && (
                            <div style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(5,5,5,0.85)", backdropFilter: "blur(8px)", border: `1px solid ${G.accentB}`, borderRadius: 8, padding: "5px 12px", fontFamily: G.num, fontSize: 14, fontWeight: 700, color: G.accent, letterSpacing: -0.3 }}>
                              {post.price}
                            </div>
                          )}
                        </div>
                      )}

                      {/* CONTENU DROITE */}
                      <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", minWidth: 0 }}>

                        {/* Budget de soutien (posts de l'utilisateur) */}
                        {isOwn && (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, background: "rgba(255,106,61,0.05)", border: `1px solid ${G.accentB}`, borderRadius: 8, padding: "6px 10px", marginBottom: 12 }}>
                            <span style={{ fontSize: 11, color: G.muted }}>
                              💛 Budget soutien : <strong style={{ color: G.gold }}>{post.support_budget || 0} CP</strong> restants
                            </span>
                            <button onClick={() => { setRechargeAmt('50'); setRechargeModal({ postId: post.id, product: post.product }) }} style={{ background: G.accentL, border: `1px solid ${G.accentB}`, color: G.accent, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: G.sans, flexShrink: 0 }}>
                              Recharger
                            </button>
                          </div>
                        )}

                        {/* En-tête auteur */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                          <Link to={post.profiles?.username ? `/u/${post.profiles.username}` : '#'} className="lnk" style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <Avatar initials={authorInit} color={post.profiles?.avatar_color || G.cyan} size={36} src={post.profiles?.avatar_url} />
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontWeight: 700, fontSize: 13, color: G.text }}>{post.profiles?.name}</span>
                                <span style={{ width: 14, height: 14, borderRadius: "50%", background: G.cyan, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                  <CheckCircle size={9} color="#050505" />
                                </span>
                              </div>
                              <div style={{ fontSize: 11, color: G.muted, marginTop: 1 }}>
                                {post.profiles?.shop_name || ''}{post.profiles?.shop_name ? ' · ' : ''}{timeAgo(post.created_at)}
                              </div>
                            </div>
                          </Link>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {isBoosted && (
                              <div style={{ display: "flex", alignItems: "center", gap: 5, background: G.accentL, border: `1px solid ${G.accentB}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, color: G.accent, fontWeight: 700 }}>
                                <Zap size={11} fill={G.accent} /> À la une
                              </div>
                            )}
                            {post.post_type && (
                              <div style={{ background: G.card2, border: `1px solid ${G.border}`, borderRadius: 20, padding: "3px 12px", fontSize: 11, color: G.muted, fontWeight: 500 }}>
                                {post.post_type.charAt(0).toUpperCase() + post.post_type.slice(1)}
                              </div>
                            )}
                            <button style={{ background: "none", border: "none", color: G.faint, cursor: "pointer", padding: 4 }}>
                              <Award size={14} color={G.faint} />
                            </button>
                            <ScoreRing score={post.score} />
                          </div>
                        </div>

                        {/* Titre */}
                        <h2 style={{ fontFamily: G.serif, fontSize: 22, fontWeight: 700, lineHeight: 1.25, letterSpacing: -0.3, marginBottom: 10, color: G.text }}>{post.product}</h2>

                        {/* Story */}
                        <div style={{ flex: 1 }}>
                          <PostStory story={post.story} />
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                            {post.tags.map(tag => (
                              <span key={tag} style={{ background: G.card2, border: `1px solid ${G.border}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, color: G.muted }}>{tag}</span>
                            ))}
                          </div>
                        )}

                        {/* Lien + Ask */}
                        {post.link_url && (
                          <a href={post.link_url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: G.cyanL, border: `1px solid ${G.cyanB}`, borderRadius: 7, padding: "5px 11px", fontSize: 11, color: G.cyan, marginTop: 10 }}>
                            <Link2 size={10} /> {post.link_url.replace(/^https?:\/\//, '').slice(0, 40)}…
                          </a>
                        )}
                        {post.ask && (
                          <div style={{ background: G.cyanL, border: `1px solid ${G.cyanB}`, borderRadius: 8, padding: "8px 12px", marginTop: 10, fontSize: 12, color: G.cyan, display: "flex", gap: 7, alignItems: "flex-start" }}>
                            <MessageCircle size={12} color={G.cyan} style={{ flexShrink: 0, marginTop: 1 }} />
                            <span style={{ fontStyle: "italic" }}>"{post.ask}"</span>
                          </div>
                        )}

                        {/* ── STATS LIVE ── */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingTop: 14, marginTop: "auto", borderTop: `1px solid rgba(255,255,255,0.05)` }}>
                          {/* Like */}
                          <button onClick={() => !isOwn && likePost(post.id)} title={isOwn ? "Ton post" : isLiked ? "Retirer le like" : "Liker"} style={{ display: "flex", alignItems: "center", gap: 6, background: isLiked ? G.accentL : "none", border: "none", borderRadius: 8, color: isLiked ? G.accent : G.muted, cursor: isOwn ? "default" : "pointer", fontFamily: G.sans, fontSize: 13, fontWeight: 600, padding: "6px 10px", transition: "all 0.15s" }}
                            onMouseOver={e => { if (!isOwn && !isLiked) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = G.accent } }}
                            onMouseOut={e => { if (!isLiked) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = G.muted } }}
                          >
                            <Heart size={15} fill={isLiked ? G.accent : "none"} color={isLiked ? G.accent : "currentColor"} strokeWidth={1.8} />
                            {post.likes_count || 0}
                          </button>
                          {/* Favoris */}
                          <button onClick={() => !isOwn && favoritePost(post.id)} title={isFaved ? "Retirer des favoris" : "Ajouter aux favoris"} style={{ display: "flex", alignItems: "center", gap: 6, background: isFaved ? G.goldL : "none", border: "none", borderRadius: 8, color: isFaved ? G.gold : G.muted, cursor: isOwn ? "default" : "pointer", fontFamily: G.sans, fontSize: 13, fontWeight: 600, padding: "6px 10px", transition: "all 0.15s" }}
                            onMouseOver={e => { if (!isOwn && !isFaved) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = G.gold } }}
                            onMouseOut={e => { if (!isFaved) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = G.muted } }}
                          >
                            <Star size={15} fill={isFaved ? G.gold : "none"} color={isFaved ? G.gold : "currentColor"} strokeWidth={1.8} />
                            {post.favorites_count || 0}
                          </button>
                          {/* Commentaires */}
                          <button onClick={() => toggleComments(post.id)} title="Commentaires" style={{ display: "flex", alignItems: "center", gap: 6, background: commentsOpen[post.id] ? "rgba(255,255,255,0.05)" : "none", border: "none", borderRadius: 8, color: commentsOpen[post.id] ? G.text : G.muted, cursor: "pointer", fontFamily: G.sans, fontSize: 13, fontWeight: 600, padding: "6px 10px", transition: "all 0.15s" }}
                            onMouseOver={e => { if (!commentsOpen[post.id]) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = G.text } }}
                            onMouseOut={e => { if (!commentsOpen[post.id]) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = G.muted } }}
                          >
                            <MessageCircle size={15} color="currentColor" strokeWidth={1.8} />
                            {commentsData[post.id] ? commentsData[post.id].length : (post.comments_count || 0)}
                          </button>
                          {/* Partage */}
                          <button onClick={async () => { const r = await sharePost(post.id); if (r?.success) { setToast("Lien copié dans le presse-papiers !"); setTimeout(() => setToast(null), 1600) } }} title="Copier le lien du produit" style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", borderRadius: 8, color: G.muted, cursor: "pointer", fontFamily: G.sans, fontSize: 13, fontWeight: 600, padding: "6px 10px", transition: "all 0.15s" }}
                            onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = G.cyan }}
                            onMouseOut={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = G.muted }}
                          >
                            <Share2 size={15} color="currentColor" strokeWidth={1.8} />
                            {post.shares_count || 0}
                          </button>
                          {/* Spacer */}
                          <div style={{ flex: 1 }} />
                          {/* Supprimer si c'est ton post */}
                          {isOwn && (
                            <button onClick={() => { if(window.confirm('Supprimer ce post ?')) deletePost(post.id) }} title="Supprimer" style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: G.faint, transition: "all 0.15s" }}
                              onMouseOver={e => { e.currentTarget.style.background = G.accentL; e.currentTarget.style.color = G.accent }}
                              onMouseOut={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = G.faint }}
                            >
                              <Trash2 size={15} color="currentColor" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── BARRE MISSIONS — pleine largeur ── */}
                    {isOwn ? (
                      <div style={{ borderTop: `1px solid rgba(255,255,255,0.05)`, padding: "12px 20px", background: `${G.cyan}08`, display: "flex", alignItems: "center", gap: 8 }}>
                        <Target size={13} color={G.cyan} />
                        <span style={{ fontSize: 12, color: G.cyan }}>Ton post — les autres membres peuvent y faire des missions et te rapporter des CP</span>
                      </div>
                    ) : (
                      <div style={{ borderTop: `1px solid rgba(255,255,255,0.06)`, display: "grid", gridTemplateColumns: `repeat(${userMissions.length}, 1fr)`, background: G.bg2 }}>
                        {userMissions.map((m, mi) => {
                          const done = myMissions.includes(m.id)
                          const isBuy = m.id === "buy" || m.id === "cart"
                          const mColor = done ? G.cyan : m.color
                          const borderRight = mi < userMissions.length - 1 ? `1px solid rgba(255,255,255,0.06)` : "none"
                          const btnBg = done ? `${G.cyan}0a` : "transparent"
                          return (
                            <button key={m.id}
                              onClick={() => !done && openMissionModal(post, m)}
                              style={{
                                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                gap: 7, padding: "16px 8px",
                                background: btnBg, border: "none", borderRight,
                                cursor: done ? "default" : "pointer",
                                fontFamily: G.sans, transition: "all 0.15s",
                                position: "relative",
                              }}
                              onMouseOver={e => { if (!done) { e.currentTarget.style.background = `${mColor}0e`; e.currentTarget.style.transform = "translateY(-1px)" }}}
                              onMouseOut={e => { e.currentTarget.style.background = btnBg; e.currentTarget.style.transform = "translateY(0)" }}
                            >
                              {/* Icône */}
                              <div style={{
                                width: 40, height: 40, borderRadius: 12,
                                background: done ? `${G.cyan}18` : `${mColor}15`,
                                border: `1px solid ${done ? G.cyan : mColor}35`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: done ? `0 0 12px ${G.cyan}20` : `0 0 10px ${mColor}15`,
                              }}>
                                {done
                                  ? <CheckCircle size={18} color={G.cyan} />
                                  : <m.Icon size={18} color={mColor} />
                                }
                              </div>
                              {/* Label */}
                              <span style={{ fontSize: 11, fontWeight: 600, color: done ? G.cyan : G.text, textAlign: "center", lineHeight: 1.3, maxWidth: 90 }}>
                                {m.short || m.label}
                              </span>
                              {/* CP badge ou statut */}
                              {done ? (
                                <span style={{ fontSize: 10, color: G.cyan, fontWeight: 700 }}>✓ Réalisé</span>
                              ) : (
                                <span style={{
                                  fontSize: 10, fontWeight: 800, color: mColor,
                                  background: `${mColor}15`, border: `1px solid ${mColor}30`,
                                  borderRadius: 20, padding: "2px 8px",
                                }}>+{m.id === 'buy' ? m.cp : Math.min(m.cp, post.support_budget || 0)} CP</span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* ── COMMENTAIRES ── */}
                    {commentsOpen[post.id] && (
                      <div style={{ borderTop: `1px solid rgba(255,255,255,0.05)`, padding: "16px 20px" }}>
                        {(commentsData[post.id] || []).length === 0 && (
                          <p style={{ fontSize: 12, color: G.faint, marginBottom: 12, textAlign: "center" }}>Aucun commentaire — sois le premier !</p>
                        )}
                        {(commentsData[post.id] || []).map(c => {
                          const canDelete = c.user_id === user?.id || post.user_id === user?.id
                          return (
                          <div key={c.id} className="cmt-row" style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: c.profiles?.avatar_url ? "transparent" : G.accentL, border: `1px solid ${G.accentB}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: G.accent, flexShrink: 0, overflow: "hidden" }}>
                              {c.profiles?.avatar_url
                                ? <img src={c.profiles.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : (c.profiles?.name || "?")[0].toUpperCase()}
                            </div>
                            <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${G.borderL}`, borderRadius: 10, padding: "8px 12px", flex: 1, position: "relative" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: G.text }}>{c.profiles?.name || "Membre"}</span>
                                {canDelete && (
                                  <button onClick={() => deleteComment(post.id, c.id)} title="Supprimer ce commentaire" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: G.faint, transition: "color 0.15s", display: "flex" }}
                                    onMouseOver={e => e.currentTarget.style.color = G.accent}
                                    onMouseOut={e => e.currentTarget.style.color = G.faint}
                                  >
                                    <Trash2 size={12} color="currentColor" />
                                  </button>
                                )}
                              </div>
                              <div style={{ fontSize: 13, color: G.muted, lineHeight: 1.5 }}>{c.content}</div>
                              <div style={{ fontSize: 10, color: G.faint, marginTop: 4 }}>{new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          </div>
                          )
                        })}
                        {/* Formulaire commentaire */}
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: G.cyanL, border: `1px solid ${G.cyanB}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: G.cyan, flexShrink: 0 }}>
                            {(profile?.name || "?")[0].toUpperCase()}
                          </div>
                          <div style={{ flex: 1, position: "relative" }}>
                            <textarea
                              placeholder="Laisser un commentaire..."
                              value={commentDraft[post.id] || ''}
                              onChange={e => setCommentDraft(prev => ({ ...prev, [post.id]: e.target.value }))}
                              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(post.id) }}}
                              rows={1}
                              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, borderRadius: 10, padding: "9px 44px 9px 13px", color: G.text, fontSize: 13, outline: "none", fontFamily: G.sans, resize: "none", boxSizing: "border-box", transition: "border-color 0.15s" }}
                            />
                            <button
                              onClick={() => submitComment(post.id)}
                              disabled={!commentDraft[post.id]?.trim() || commentLoading[post.id]}
                              style={{ position: "absolute", right: 8, bottom: 7, background: (commentDraft[post.id]?.trim()) ? G.accent : "transparent", border: "none", borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: commentDraft[post.id]?.trim() ? "pointer" : "default", transition: "all 0.15s" }}
                            >
                              <Share2 size={13} color={commentDraft[post.id]?.trim() ? "#fff" : G.faint} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {posts.length === 0 && !loading && (
                <div style={{ textAlign: "center", padding: "48px 24px", background: G.card, border: `1px solid ${G.border}`, borderRadius: 12 }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
                  <h3 style={{ fontFamily: G.serif, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Le feed est vide pour l'instant</h3>
                  <p style={{ fontSize: 14, color: G.muted, marginBottom: 20 }}>Sois le premier à publier un post et invite des membres dans ton cercle.</p>
                  <button onClick={() => setShowForm(true)} style={{ background: G.accent, border: "none", color: "#fff", padding: "11px 24px", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: G.sans }}>Publier mon premier post</button>
                </div>
              )}
            </div>
          )}

          {/* ══ MISSIONS TAB ══ */}
          {tab === "missions" && (
            <div className="fade">
              <div style={{ background: G.cyanL, border: `1px solid ${G.cyanB}`, borderRadius: 12, padding: 14, marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Target size={15} color={G.cyan} style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: G.cyan, lineHeight: 1.7, margin: 0 }}>Fais des missions pour les autres → gagne des CP → booste ta visibilité. L'achat est un bonus, jamais une obligation.</p>
              </div>
              {posts.slice(0, 3).map(post => {
                const myMissions = post.missions?.filter(m => m.user_id === user?.id).map(m => m.mission_type) || []
                const completedCount = myMissions.length
                const authorInit = post.profiles?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'
                return (
                  <div key={post.id} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: 20, marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <Avatar initials={authorInit} color={post.profiles?.avatar_color || G.cyan} size={38} src={post.profiles?.avatar_url} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{post.profiles?.name} · {post.profiles?.shop_name}</div>
                        <div style={{ fontFamily: G.serif, fontSize: 12, color: G.muted, fontStyle: "italic" }}>"{post.product}"</div>
                      </div>
                      <ScoreRing score={post.score} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {userMissions.map(m => {
                        const done = myMissions.includes(m.id)
                        const iconColor = done ? G.mint : m.free ? G.muted : G.gold
                        const glow = done ? G.mintB : m.free ? "rgba(255,255,255,0.1)" : G.goldB
                        return (
                          <button key={m.id} onClick={() => !done && openMissionModal(post, m)} style={{
                            display: "flex", alignItems: "center", gap: 12, width: "100%",
                            background: done ? G.cyanL : m.free ? G.card2 : G.goldL,
                            border: `1px solid ${done ? G.cyanB : m.free ? G.border : G.goldB}`,
                            borderRadius: 8, padding: "11px 14px", opacity: done ? 0.6 : 1,
                            cursor: done ? "default" : "pointer", fontFamily: G.sans, transition: "all 0.15s ease",
                          }}
                            onMouseOver={e => { if (!done) { e.currentTarget.style.transform = "translateX(3px)"; e.currentTarget.style.boxShadow = "0 5px 18px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.13)" } }}
                            onMouseOut={e => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = done ? "none" : "0 3px 12px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.09)" }}
                          >
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: done ? G.cyanL : m.free ? G.card3 : G.goldL, border: `1px solid ${done ? G.cyanB : m.free ? G.border : G.goldB}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <m.Icon size={22} color={iconColor} />
                            </div>
                            <span style={{ flex: 1, textAlign: "left", fontSize: 13, fontWeight: 600, color: done ? G.mint : G.text }}>{m.label}</span>
                            {done
                              ? <span style={{ fontSize: 11, color: G.cyan, fontWeight: 700 }}>✓ Fait</span>
                              : <span style={{ fontSize: 11, color: m.free ? G.cyan : G.gold, fontWeight: 700, background: m.free ? G.cyanL : G.goldL, border: `1px solid ${m.free ? G.cyanB : G.goldB}`, borderRadius: 5, padding: "2px 8px" }}>+{m.id === 'buy' ? m.cp : Math.min(m.cp, post.support_budget || 0)} CP</span>
                            }
                          </button>
                        )
                      })}
                    </div>
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${G.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 10, color: G.muted }}>Progression</span>
                        <span style={{ fontSize: 10, color: G.cyan, fontWeight: 700 }}>{completedCount}/{userMissions.length}</span>
                      </div>
                      <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
                        <div style={{ width: `${completedCount / userMissions.length * 100}%`, height: "100%", background: `linear-gradient(90deg,${G.cyan},${G.accent})`, borderRadius: 2, transition: "width 0.4s" }} />
                      </div>
                    </div>
                  </div>
                )
              })}
              {posts.length === 0 && <div style={{ textAlign: "center", padding: 40, color: G.muted }}>Aucun post dans le feed pour l'instant.</div>}
            </div>
          )}

          {/* ══ FAVORIS TAB ══ */}
          {tab === "favoris" && (
            <div className="fade">
              {(() => {
                const favPosts = posts.filter(p => p.post_favorites?.some(f => f.user_id === user?.id))
                return favPosts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 24px", background: G.card, border: `1px solid ${G.border}`, borderRadius: 16 }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>🔖</div>
                    <h3 style={{ fontFamily: G.serif, fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Aucun favori pour l'instant</h3>
                    <p style={{ fontSize: 14, color: G.muted, marginBottom: 20 }}>Clique sur 🔖 sur les posts du feed pour les sauvegarder ici.</p>
                    <button onClick={() => setTab("feed")} style={{ background: G.accent, border: "none", color: "#fff", padding: "10px 22px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: G.sans }}>
                      Explorer le feed
                    </button>
                  </div>
                ) : favPosts.map(post => {
                  const authorInit = post.profiles?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'
                  return (
                    <div key={post.id} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: 20, marginBottom: 14, transition: "border-color 0.15s ease" }}
                      onMouseOver={e => e.currentTarget.style.borderColor = G.borderHover}
                      onMouseOut={e => e.currentTarget.style.borderColor = G.border}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <Avatar initials={authorInit} color={post.profiles?.avatar_color || G.cyan} size={38} src={post.profiles?.avatar_url} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{post.profiles?.name}</div>
                            <div style={{ fontSize: 11, color: G.muted }}>{post.profiles?.shop_name} · {new Date(post.created_at).toLocaleDateString('fr-FR')}</div>
                          </div>
                        </div>
                        <ScoreRing score={post.score} />
                      </div>
                      <div style={{ fontFamily: G.serif, fontSize: 17, fontWeight: 800, marginBottom: 6 }}>{post.product}</div>
                      <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.75, marginBottom: 12 }}>{post.story?.length > 180 ? post.story.slice(0, 180) + "…" : post.story}</p>
                      {post.image_url && <img src={post.image_url} alt={post.product} style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 10, marginBottom: 12, border: `1px solid ${G.border}` }} />}
                      <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: `1px solid ${G.borderL}` }}>
                        <button onClick={() => favoritePost(post.id)} style={{ display: "flex", alignItems: "center", gap: 5, background: G.goldL, border: `1px solid ${G.goldB}`, color: G.gold, padding: "6px 12px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontFamily: G.sans }}>
                          <Bookmark size={13} fill={G.gold} /> Retirer des favoris
                        </button>
                        {post.profiles?.shop_url && (
                          <a href={post.profiles.shop_url} target="_blank" rel="noreferrer" style={{ marginLeft: "auto", background: G.cyanL, border: `1px solid ${G.cyanB}`, color: G.cyan, padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                            Voir la boutique <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          )}

          {/* ══ BOUTIQUE CP TAB ══ */}
          {tab === "boutique" && (
            <div className="fade">
              {/* Solde CP */}
              <div style={{ background: `linear-gradient(135deg, rgba(245,197,24,0.08) 0%, rgba(255,106,61,0.06) 70%, rgba(0,213,213,0.03) 100%)`, border: `1px solid ${G.goldB}`, borderRadius: 16, padding: "22px 28px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, background: "radial-gradient(circle, rgba(245,197,24,0.1) 0%, transparent 65%)", pointerEvents: "none" }} />
                <div>
                  <div style={{ fontSize: 11, color: G.gold, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Ton solde disponible</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontFamily: G.num, fontSize: 48, fontWeight: 700, color: G.gold, lineHeight: 1, letterSpacing: -2 }}>{cp}</span>
                    <span style={{ fontSize: 16, color: G.muted, fontWeight: 600 }}>CP</span>
                  </div>
                  <div style={{ fontSize: 12, color: G.faint, marginTop: 2 }}>Rang : {rank} · Ligue : {league}</div>
                  {(profile?.discount_credit_cents || 0) > 0 && (
                    <div style={{ fontSize: 12, color: G.cyan, marginTop: 5, fontWeight: 700 }}>
                      💳 Crédit abonnement : {((profile.discount_credit_cents || 0) / 100).toFixed(2)}€
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: G.muted, marginBottom: 8 }}>Gagner plus de CP</div>
                  <button onClick={() => setTab("feed")} style={{ background: G.accent, border: "none", color: "#fff", padding: "9px 18px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: G.sans, display: "flex", alignItems: "center", gap: 6 }}>
                    <Target size={14} /> Faire des missions
                  </button>
                </div>
              </div>

              {/* Filtres catégories */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {['tous', 'visibilité', 'insights', 'statut', 'réseau', 'économies'].map(cat => (
                  <button key={cat} onClick={() => setShopCategory(cat)} style={{ background: shopCategory === cat ? G.accent : G.card, border: `1px solid ${shopCategory === cat ? G.accent : G.border}`, color: shopCategory === cat ? "#fff" : G.muted, padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: G.sans, fontWeight: shopCategory === cat ? 700 : 400, transition: "all 0.15s ease", textTransform: "capitalize" }}>
                    {cat === 'tous' ? '✦ Tout' : cat}
                  </button>
                ))}
              </div>

              {/* Grille items */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {CP_SHOP.filter(item => shopCategory === 'tous' || item.category === shopCategory).map(item => {
                  const canAfford = (cp || 0) >= item.cost
                  const isSuccess = purchaseSuccess === item.id
                  const isBuying = purchasing === item.id
                  return (
                    <div key={item.id} className="shop-card" style={{ background: G.card, border: `1px solid ${isSuccess ? G.cyanB : G.border}`, borderRadius: 12, padding: 20, position: "relative", overflow: "hidden", transition: "all 0.15s ease" }}>
                      {/* Glow décoratif */}
                      <div style={{ position: "absolute", top: -30, right: -20, width: 120, height: 120, background: `${item.color}20`, borderRadius: "50%", filter: "blur(30px)", pointerEvents: "none" }} />

                      {/* Badge */}
                      {item.badge && (
                        <div style={{ position: "absolute", top: 14, right: 14, background: `${item.color}25`, border: `1px solid ${item.color}50`, borderRadius: 6, padding: "2px 8px", fontSize: 10, color: item.color, fontWeight: 700 }}>
                          {item.badge}
                        </div>
                      )}

                      {/* Icône + titre */}
                      <div style={{ marginBottom: 14, width: 48, height: 48, borderRadius: 14, background: `${item.color}15`, border: `1px solid ${item.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {item.ShopIcon && <item.ShopIcon size={22} color={item.color} />}
                      </div>
                      <h3 style={{ fontFamily: G.serif, fontSize: 17, fontWeight: 800, marginBottom: 6, color: G.text }}>{item.title}</h3>
                      <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.7, marginBottom: 16 }}>{item.desc}</p>

                      {/* Prix + bouton */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: `1px solid ${G.borderL}` }}>
                        <div>
                          <span style={{ fontFamily: G.num, fontSize: 24, fontWeight: 700, color: canAfford ? item.color : G.faint }}>{item.cost}</span>
                          <span style={{ fontSize: 12, color: G.faint, marginLeft: 4 }}>CP</span>
                          {!canAfford && <div style={{ fontSize: 10, color: G.accent, marginTop: 2 }}>Il te manque {item.cost - cp} CP</div>}
                        </div>

                        {item.comingSoon ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 12, color: G.muted, fontWeight: 600 }}>
                            Bientôt disponible
                          </div>
                        ) : isSuccess ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, background: G.cyanL, border: `1px solid ${G.cyanB}`, borderRadius: 8, padding: "8px 14px", fontSize: 13, color: G.cyan, fontWeight: 700 }}>
                            ✓ Activé !
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (item.id === 'boost_24h' || item.id === 'featured_48h') {
                                // Sélectionner quel post booster (modale)
                                const myPosts = posts.filter(p => p.user_id === user?.id)
                                if (myPosts.length === 0) { setToast("Tu n'as pas encore de post à booster."); setTimeout(() => setToast(null), 2200); return }
                                if (myPosts.length === 1) { handleCPPurchase(item, myPosts[0].id); return }
                                setBoostModal(item)
                              } else {
                                handleCPPurchase(item)
                              }
                            }}
                            disabled={!canAfford || isBuying}
                            style={{
                              background: canAfford ? `linear-gradient(160deg, ${item.color}dd, ${item.color}99)` : "rgba(255,255,255,0.06)",
                              boxShadow: canAfford ? `0 4px 14px ${item.color}40, inset 0 1px 0 rgba(255,255,255,0.2)` : "none",
                              border: "none", color: canAfford ? "#fff" : G.faint,
                              padding: "9px 18px", borderRadius: 9, fontSize: 13, fontWeight: 700,
                              cursor: canAfford && !isBuying ? "pointer" : "not-allowed",
                              fontFamily: G.sans, transition: "all 0.15s",
                              display: "flex", alignItems: "center", gap: 6,
                            }}
                          >
                            <Zap size={13} fill={canAfford ? "#fff" : G.faint} />
                            {isBuying ? "Achat..." : "Acheter"}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Historique achats */}
              <div style={{ marginTop: 32 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: G.muted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 16 }}>Comment gagner plus de CP</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                  {[
                    { LIcon: PenLine,     color: G.cyan,   action: "Publier un post",      pts: "+10 CP" },
                    { LIcon: Star,        color: G.gold,   action: "Ajouter aux favoris",  pts: "+5 CP"  },
                    { LIcon: MessageCircle, color: G.accent, action: "Commenter un post",  pts: "+6 CP"  },
                    { LIcon: Share2,      color: G.cyan,   action: "Partager en story",    pts: "+10 CP" },
                    { LIcon: Search,      color: G.gold,   action: "Laisser un avis",      pts: "+15 CP" },
                    { LIcon: ShoppingBag, color: G.accent, action: "Achat confirmé",       pts: "+40 CP" },
                    { LIcon: Flame,       color: G.accent, action: "Streak 7 jours",       pts: "+40 CP" },
                    { LIcon: Gift,        color: G.gold,   action: "Coffre quotidien",     pts: "+10 à 500 CP" },
                  ].map(({ LIcon, color, action, pts }) => (
                    <div key={action} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 10, padding: "10px 13px", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}12`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <LIcon size={15} color={color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{action}</div>
                        <div style={{ fontSize: 11, color: G.gold, fontWeight: 700 }}>{pts}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ CERCLE TAB ══ */}
          {tab === "cercle" && (
            <div className="fade">
              <div style={{ background: G.cyanL, border: `1px solid ${G.cyanB}`, borderRadius: 12, padding: 14, marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Users size={15} color={G.cyan} style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: G.cyan, lineHeight: 1.7, margin: 0 }}><strong>Règle :</strong> Aide les autres via les missions chaque semaine. L'achat est un bonus. La réciprocité naturelle fait le reste.</p>
              </div>
              <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: 32, textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: G.cyanL, border: `1px solid ${G.cyanB}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                  <Users size={26} color={G.cyan} />
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
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <aside style={{ width: 280, padding: "24px 16px", borderLeft: `1px solid ${G.border}`, position: "sticky", top: 0, height: "100vh", overflowY: "auto", flexShrink: 0, background: G.bg2 }}>
          <style>{`.sb-section { margin-bottom: 20px; } .sb-title { font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 1.4px; text-transform: uppercase; font-weight: 700; margin-bottom: 10px; }`}</style>

          {/* ── TON IMPACT (radar animé) ── */}
          <div className="sb-section">
            <div className="sb-title">Ton impact cette semaine</div>
            <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, padding: "20px 16px", overflow: "hidden" }}>
              {/* Radar — carré centré */}
              <div style={{ position: "relative", width: "100%", height: 140, marginBottom: 16 }}>
                <div className="radar-ring radar-r1" />
                <div className="radar-ring radar-r2" />
                <div className="radar-ring radar-r3" />
                <div className="radar-core" style={{ width: 54, height: 54, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, ${G.cyan}, ${G.cyan}aa)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 30px ${G.cyan}77`, zIndex: 2 }}>
                  <Heart size={24} color="#050505" fill="#050505" />
                </div>
              </div>
              {/* Stats — connectées aux vraies données */}
              {(() => {
                const myPosts = posts.filter(p => p.user_id === user?.id)
                const aided   = posts.reduce((a, p) => a + (p.missions?.filter(m => m.user_id === user?.id).length || 0), 0) // missions que j'ai faites
                const support = myPosts.reduce((a, p) => a + (p.favorites_count || 0) + (p.likes_count || 0), 0)              // soutiens reçus sur mes posts
                const rows = [
                  { Icon: Heart, label: "Projets aidés",  val: aided,   color: G.accent },
                  { Icon: Users, label: "Soutiens reçus", val: support, color: G.cyan },
                  { Icon: Zap,   label: "CP gagnés",      val: cp,      color: G.gold },
                ]
                return rows.map(({ Icon, label, val, color }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                    <Icon size={14} color={color} />
                    <span style={{ flex: 1, fontSize: 12, color: G.muted }}>{label}</span>
                    <span style={{ fontFamily: G.num, fontSize: 14, fontWeight: 700, color: G.text }}>{val}</span>
                  </div>
                ))
              })()}
              <div style={{ marginTop: 10, fontSize: 11, color: G.cyan, textAlign: "center", fontWeight: 500 }}>Continue comme ça ! 💪</div>
            </div>
          </div>

          {/* Ta boutique */}
          <div className="sb-section">
            <div className="sb-title">Ta Boutique</div>
            <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 5 }}>{profile?.shop_name || '—'}</div>
              {profile?.shop_url && <a href={profile.shop_url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: G.cyan, display: "flex", alignItems: "center", gap: 4, marginBottom: 10, textDecoration: "none", fontWeight: 600 }}>Voir ma boutique <ExternalLink size={10} /></a>}
              <div style={{ fontSize: 11, color: G.faint, marginBottom: 12 }}>Niche : <span style={{ color: G.muted }}>{profile?.niche || '—'}</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "Likes", val: posts.filter(p => p.user_id === user?.id).reduce((a, p) => a + (p.likes_count || 0), 0), color: G.cyan },
                  { label: "Favoris", val: posts.filter(p => p.user_id === user?.id).reduce((a, p) => a + (p.favorites_count || 0), 0), color: G.gold },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ background: G.card2, border: `1px solid ${G.border}`, borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 9, color: G.faint, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
                    <div style={{ fontFamily: G.num, fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top membres */}
          <div className="sb-section">
            <div className="sb-title">Top Membres</div>
            <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: "4px 0" }}>
              {topMembres.length === 0 && <div style={{ fontSize: 12, color: G.faint, textAlign: "center", padding: "14px 0" }}>Chargement...</div>}
              {topMembres.map((m, i) => {
                const memberInit = m.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'
                const memberColor = COLORS[i % COLORS.length]
                return (
                  <Link key={m.id} to={m.username ? `/u/${m.username}` : '#'} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: i < topMembres.length - 1 ? `1px solid rgba(255,255,255,0.05)` : "none", textDecoration: "none", color: "inherit", transition: "background 0.15s" }}
                    onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {i === 0 ? <Award size={16} color={G.gold} /> : <span style={{ fontSize: 11, fontWeight: 700, color: G.faint }}>{i + 1}</span>}
                    </div>
                    <Avatar initials={memberInit} color={memberColor} size={30} src={m.avatar_url} />
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {m.name} {i === 0 && <Crown size={10} color={G.gold} />}
                      </div>
                      <div style={{ fontSize: 10, color: G.faint }}>{m.league || 'Bronze'}</div>
                    </div>
                    <div style={{ background: i === 0 ? G.goldL : G.card2, border: `1px solid ${i === 0 ? G.goldB : G.border}`, borderRadius: 8, padding: "3px 8px" }}>
                      <span style={{ fontFamily: G.num, fontSize: 13, fontWeight: 700, color: i === 0 ? G.gold : G.muted }}>{m.cp}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Objectif du jour — données réelles */}
          {(() => {
            const dailyLimit = profile?.plan === 'premium' ? 30 : 5
            const pct = Math.min(missionsToday / dailyLimit * 100, 100)
            const reached = missionsToday >= dailyLimit
            return (
              <div className="sb-section">
                <div className="sb-title">Objectif du jour</div>
                <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: G.cyanL, border: `1px solid ${G.cyanB}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Target size={16} color={G.cyan} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: G.text }}>Missions du jour</div>
                      <div style={{ fontSize: 11, color: G.muted }}>{reached ? "Objectif atteint 🎉" : `Encore ${dailyLimit - missionsToday} pour aujourd'hui`}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: reached ? `linear-gradient(90deg, ${G.gold}, ${G.accent})` : `linear-gradient(90deg, ${G.cyan}aa, ${G.cyan})`, borderRadius: 3, transition: "width 0.4s" }} />
                    </div>
                    <span style={{ fontFamily: G.num, fontSize: 11, color: reached ? G.gold : G.cyan, fontWeight: 700 }}>{missionsToday}/{dailyLimit}</span>
                  </div>
                  {!reached && (
                    <button onClick={() => setTab("feed")} style={{ width: "100%", marginTop: 12, background: G.card2, border: `1px solid ${G.border}`, color: G.text, padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: G.sans }}>
                      Faire une mission
                    </button>
                  )}
                </div>
              </div>
            )
          })()}

          {/* Conseil du jour */}
          <div style={{ background: G.accentL, border: `1px solid ${G.accentB}`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
              <Zap size={14} color={G.accent} />
              <span style={{ fontSize: 11, color: G.accent, fontWeight: 800, letterSpacing: 0.3 }}>Conseil du jour</span>
            </div>
            <p style={{ fontSize: 12, color: G.muted, lineHeight: 1.7, margin: 0 }}>
              Un post avec une vraie histoire personnelle reçoit <strong style={{ color: G.text }}>3× plus de missions</strong>. Prends 5 min pour bien écrire la tienne.
            </p>
          </div>
        </aside>
      </div>
      </div>
    </div>
  )
}
