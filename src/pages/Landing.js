import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Star, Eye, Heart, MessageCircle, Share2, Pin, Search, ShoppingBag,
  ArrowRight, CheckCircle, Users, TrendingUp, Zap, ChevronDown, ChevronUp,
  BarChart2, Shield, FileText, Award, Repeat2, Globe, Crown,
  Flame, Target, ChevronRight, ExternalLink
} from 'lucide-react'

const G = {
  bg: "#1a2420", bg2: "#1f2e28", bg3: "#16201d",
  card: "rgba(255,255,255,0.04)", card2: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.07)", borderL: "rgba(255,255,255,0.05)",
  accent: "#e05c4b", accentL: "rgba(224,92,75,0.12)", accentB: "rgba(224,92,75,0.3)",
  mint: "#7ecfc0", mintL: "rgba(126,207,192,0.1)", mintB: "rgba(126,207,192,0.25)",
  gold: "#d4a84b", goldL: "rgba(212,168,75,0.1)", goldB: "rgba(212,168,75,0.28)",
  text: "#f0ebe3", muted: "rgba(240,235,227,0.5)", faint: "rgba(240,235,227,0.22)",
  serif: "'Playfair Display', Georgia, serif", sans: "'DM Sans', system-ui, sans-serif",
}

function Logo({ size = 30 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.27, background: "linear-gradient(135deg, #e05c4b, #c94535)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(224,92,75,0.4)", flexShrink: 0 }}>
      <span style={{ fontFamily: G.serif, fontSize: size * 0.44, fontWeight: 900, color: "#fff", lineHeight: 1 }}>C</span>
    </div>
  )
}

function Avatar({ initials, color, size = 36 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: `radial-gradient(circle at 33% 33%, ${color}cc, ${color}55)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.32, fontWeight: 700, color: "#18251f", fontFamily: G.sans, boxShadow: `0 2px 8px ${color}40` }}>
      {initials}
    </div>
  )
}

function Sparkline({ color }) {
  return (
    <svg width={60} height={22} viewBox="0 0 120 40" preserveAspectRatio="none">
      <polyline points="0,35 20,28 40,22 60,18 80,12 100,8 120,5" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${G.border}`, padding: "20px 0" }}>
      <button onClick={() => setOpen(!open)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", background: "none", border: "none", color: G.text, cursor: "pointer", textAlign: "left", gap: 16, fontFamily: G.sans }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>{q}</span>
        {open ? <ChevronUp size={18} color={G.mint} /> : <ChevronDown size={18} color={G.muted} />}
      </button>
      {open && <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.75, marginTop: 12, marginBottom: 0 }}>{a}</p>}
    </div>
  )
}

// Mockup du dashboard dans le hero
function AppMockup() {
  const days = ["L", "M", "M", "J", "V", "S", "D"]
  const done = [true, true, true, true, false, false, false]
  return (
    <div style={{ background: G.bg3, border: `1px solid ${G.border}`, borderRadius: 16, padding: 0, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.6)", width: "100%", maxWidth: 480 }}>
      {/* Top bar */}
      <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${G.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Logo size={20} />
          <span style={{ fontFamily: G.serif, fontSize: 13, fontWeight: 800 }}>CirclUp</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: `radial-gradient(circle, ${G.mint}cc, ${G.mint}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#18251f" }}>SM</div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600 }}>Sophie M.</div>
            <div style={{ fontSize: 8, color: G.gold, display: "flex", alignItems: "center", gap: 2 }}><Crown size={7} color={G.gold} /> Builder</div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex" }}>
        {/* Mini sidebar */}
        <div style={{ width: 120, background: "rgba(0,0,0,0.2)", borderRight: `1px solid ${G.border}`, padding: "12px 8px" }}>
          {[["Dashboard", true], ["Feed", false], ["Missions", false], ["Cercle", false]].map(([label, active]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 8px", borderRadius: 6, marginBottom: 2, background: active ? `${G.accent}18` : "transparent", border: active ? `1px solid ${G.accentB}` : "1px solid transparent" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: active ? G.accent : G.faint }} />
              <span style={{ fontSize: 10, color: active ? G.accent : G.muted, fontWeight: active ? 600 : 400 }}>{label}</span>
              {label === "Missions" && <span style={{ marginLeft: "auto", background: G.accent, borderRadius: 8, fontSize: 8, color: "#fff", padding: "0 4px", fontWeight: 700 }}>8</span>}
            </div>
          ))}
          <div style={{ marginTop: 16, background: G.goldL, border: `1px solid ${G.goldB}`, borderRadius: 8, padding: 8 }}>
            <div style={{ fontSize: 8, color: G.gold, marginBottom: 4, fontWeight: 700 }}>⚡ CP</div>
            <div style={{ fontFamily: G.serif, fontSize: 16, fontWeight: 900, color: G.gold }}>120</div>
            <div style={{ height: 2, background: "rgba(255,255,255,0.07)", borderRadius: 1, marginTop: 4 }}>
              <div style={{ width: "40%", height: "100%", background: G.gold, borderRadius: 1 }} />
            </div>
          </div>
        </div>
        {/* Content */}
        <div style={{ flex: 1, padding: 14, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, fontFamily: G.serif, marginBottom: 10 }}>Bonjour Sophie 👋</div>
          {/* CP ring mini + streak */}
          <div style={{ background: `${G.goldL}`, border: `1px solid ${G.goldB}`, borderRadius: 10, padding: "10px 12px", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
              <svg width={44} height={44} viewBox="0 0 44 44">
                <circle cx={22} cy={22} r={18} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={4} />
                <circle cx={22} cy={22} r={18} fill="none" stroke={G.gold} strokeWidth={4} strokeDasharray={`${2*Math.PI*18*0.4} ${2*Math.PI*18}`} strokeLinecap="round" transform="rotate(-90 22 22)" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: G.gold }}>120</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: G.gold, fontWeight: 700, marginBottom: 4 }}>Tes points · Builder</div>
              <div style={{ display: "flex", gap: 4 }}>
                {days.map((d, i) => (
                  <div key={d} style={{ width: 14, height: 14, borderRadius: "50%", background: done[i] ? G.accent : "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {done[i] && <span style={{ fontSize: 7, color: "#fff" }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 3, background: `${G.accent}18`, border: `1px solid ${G.accentB}`, borderRadius: 6, padding: "3px 7px" }}>
              <Flame size={9} color={G.accent} />
              <span style={{ fontSize: 9, color: G.accent, fontWeight: 700 }}>4 jours</span>
            </div>
          </div>
          {/* KPIs mini */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
            {[["Favoris reçus", "47", G.gold, true], ["CP gagnés", "120", G.accent, true]].map(([label, val, color, up]) => (
              <div key={label} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 8, color: G.muted, marginBottom: 3 }}>{label}</div>
                <div style={{ fontFamily: G.serif, fontSize: 16, fontWeight: 900, color, marginBottom: 3 }}>{val}</div>
                <Sparkline color={color} />
              </div>
            ))}
          </div>
          {/* Missions mini */}
          <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, marginBottom: 7, display: "flex", alignItems: "center", gap: 5 }}>
              Missions du jour <span style={{ background: G.accent, borderRadius: 8, fontSize: 8, color: "#fff", padding: "0 5px" }}>8</span>
            </div>
            {[["Ajouter aux favoris", "+5 CP"], ["Visiter la boutique", "+3 CP"], ["Partager en story", "+10 CP"]].map(([label, cp]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${G.borderL}` }}>
                <span style={{ fontSize: 9, color: G.muted }}>{label}</span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 9, color: G.mint, fontWeight: 700 }}>{cp}</span>
                  <div style={{ background: G.accent, borderRadius: 4, padding: "1px 6px", fontSize: 8, color: "#fff", fontWeight: 700 }}>Go</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const FEATURES = [
  { Icon: Star,          title: "Booste tes favoris Etsy",        desc: "Tes 9 voisins de cercle ajoutent ton produit en favori. L'algorithme Etsy le détecte et te remonte dans les résultats.",       color: G.gold },
  { Icon: MessageCircle, title: "Reçois des avis & commentaires", desc: "Des avis vérifiés sur tes produits, des commentaires pertinents sur tes posts. Ta crédibilité monte, tes ventes suivent.", color: G.mint },
  { Icon: Share2,        title: "Multiplie ton trafic externe",   desc: "Partages en story, épingles Pinterest, mentions réseaux. Google et Etsy voient affluer du trafic externe vers ta boutique.", color: G.accent },
  { Icon: Eye,           title: "Génère des visites boutique",    desc: "Chaque membre de ton cercle visite ta boutique. Ce sont de vraies sessions humaines, pas des bots. L'algo fait la différence.", color: G.mint },
  { Icon: Users,         title: "Crée des collaborations utiles", desc: "10 entrepreneurs de ta niche exacte. Pas des concurrents, des alliés. Certains deviennent même des partenaires durables.",  color: G.gold },
  { Icon: TrendingUp,    title: "Progresse chaque jour",         desc: "Le système CP te challenge à faire des missions régulièrement. Streak, rangs, récompenses — la progression est addictive.",    color: G.accent },
]

const POSTS_SAMPLE = [
  { init: "SL", name: "Sophie L.",   shop: "@bijoux-boheme",   title: "Bague dorée plaquée or 18K",   tag: "Bijoux",       visits: 362, supports: 25, cp: 50, color: G.mint,   bgColor: "#2a3d38" },
  { init: "TD", name: "Thomas D.",   shop: "@road-trip-app",   title: "Application voyage RoadTrip",  tag: "Application",  visits: 278, supports: 18, cp: 50, color: G.accent, bgColor: "#2d2420" },
  { init: "CR", name: "Camille R.",  shop: "@studio-bloom",    title: "Identité visuelle Studio Bloom",tag: "Design",      visits: 195, supports: 12, cp: 50, color: G.gold,   bgColor: "#2a2a1f" },
]

const TESTIMONIALS = [
  { init: "SL", name: "Sophie L.",  role: "Fondatrice · GreenCare",       text: "En 3 semaines, j'ai eu 47 nouveaux favoris sur mon produit phare. Mon taux de conversion a bondi de 18%. CirclUp m'a coûté moins qu'un café par semaine.", color: G.mint, cp: "2 450 CP" },
  { init: "TD", name: "Thomas D.",  role: "Créateur · RoadTrip",          text: "Je dépensais 80€/mois en pub Etsy sans résultats. CirclUp m'a généré plus de trafic organique en 1 mois qu'un trimestre de pub payante.", color: G.accent, cp: "1 890 CP" },
  { init: "CR", name: "Camille R.", role: "Directrice artistique · Studio Bloom", text: "L'entraide dans mon cercle est incroyable. On se challenge, on progresse ensemble. Jamais seule. Et mes ventes ont suivi.", color: G.gold, cp: "1 650 CP" },
]

const FAQS = [
  { q: "Est-ce que CirclUp fonctionne vraiment ?", a: "Oui. Les signaux algorithmiques (favoris, visites, avis, partages) sont les vrais leviers du référencement Etsy et Shopify. CirclUp les génère organiquement via l'entraide — sans triche, sans bot." },
  { q: "Dois-je acheter les produits des autres membres ?", a: "Non. L'achat est une mission bonus à +40 CP. Les 7 autres missions sont gratuites. La philosophie de CirclUp repose sur l'entraide accessible à tous." },
  { q: "Comment sont formés les cercles ?", a: "Tu es regroupé avec 9 autres vendeurs de ta même niche. Dès que 10 membres de ta niche sont inscrits, ton cercle est activé et tu commences à recevoir des missions." },
  { q: "CirclUp respecte-t-il les CGU d'Etsy ?", a: "Oui. Toutes les actions sont réelles — des vraies personnes qui visitent, favorisent, partagent. Aucun bot, aucune automatisation. C'est de l'entraide humaine." },
  { q: "Puis-je résilier à tout moment ?", a: "Absolument. L'abonnement est mensuel, sans engagement. Tu peux annuler depuis ton espace Stripe à tout moment." },
]

const NAV_LINKS = ["Fonctionnalités", "Tarifs", "Témoignages", "FAQ"]

export default function Landing() {
  const [activeNav, setActiveNav] = useState(null)

  return (
    <div style={{ minHeight: "100vh", background: G.bg, fontFamily: G.sans, color: G.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        .fade-1 { animation: fadeUp 0.5s ease both; }
        .fade-2 { animation: fadeUp 0.5s 0.12s ease both; }
        .fade-3 { animation: fadeUp 0.5s 0.24s ease both; }
        .float { animation: float 4s ease-in-out infinite; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        a { text-decoration: none; color: inherit; }
        .card-hov { transition: transform 0.2s, border-color 0.2s; }
        .card-hov:hover { transform: translateY(-3px); border-color: rgba(126,207,192,0.25) !important; }
        .nav-link { transition: color 0.15s; }
        .nav-link:hover { color: #f0ebe3 !important; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(26,36,32,0.92)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${G.border}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 5%" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Logo size={30} />
          <span style={{ fontFamily: G.serif, fontSize: 18, fontWeight: 900, color: G.text }}>CirclUp</span>
          <span style={{ fontSize: 9, color: G.faint, border: `1px solid ${G.border}`, borderRadius: 4, padding: "2px 5px", letterSpacing: 0.8 }}>BETA</span>
        </Link>
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {NAV_LINKS.map(link => (
            <a key={link} href={`#${link.toLowerCase()}`} className="nav-link" style={{ fontSize: 14, color: G.muted, fontWeight: 500 }}>{link}</a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/login" style={{ fontSize: 14, color: G.muted, fontWeight: 500, padding: "8px 16px", borderRadius: 8 }}>Se connecter</Link>
          <Link to="/register" style={{ background: G.accent, color: "#fff", fontSize: 14, fontWeight: 700, padding: "9px 20px", borderRadius: 8, display: "flex", alignItems: "center", gap: 6 }}>
            Rejoindre CirclUp
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "80px 5% 60px", gap: 60, position: "relative", overflow: "hidden" }}>
        {/* Glow */}
        <div style={{ position: "absolute", top: "30%", left: "30%", width: 500, height: 500, background: "radial-gradient(ellipse, rgba(126,207,192,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "20%", right: "10%", width: 300, height: 300, background: "radial-gradient(ellipse, rgba(224,92,75,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Left */}
        <div style={{ flex: 1, maxWidth: 520 }}>
          <div className="fade-1" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: G.mintL, border: `1px solid ${G.mintB}`, borderRadius: 20, padding: "6px 14px", marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: G.mint, display: "inline-block" }} />
            <span style={{ fontSize: 12, color: G.mint, fontWeight: 600 }}>312 entrepreneurs actifs · 4 850€ de ventes ce mois</span>
          </div>

          <h1 className="fade-2" style={{ fontFamily: G.serif, fontSize: "clamp(36px, 5vw, 58px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 20 }}>
            Développe<br />ta boutique.<br />
            <span style={{ color: G.accent, fontStyle: "italic" }}>Sans publicité.</span>
          </h1>

          <p className="fade-3" style={{ fontSize: 16, color: G.muted, lineHeight: 1.75, marginBottom: 32, maxWidth: 440 }}>
            Échange de visibilité, favoris Etsy, avis et partages entre entrepreneurs de ta niche. Booste ton algorithme grâce à la puissance de l'entraide — pour 4,99€/mois.
          </p>

          <div className="fade-3" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 36 }}>
            <Link to="/register" style={{ background: G.accent, color: "#fff", padding: "14px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <Zap size={16} fill="#fff" /> Commencer gratuitement
            </Link>
            <a href="#fonctionnalités" style={{ background: "transparent", color: G.text, border: `1px solid ${G.border}`, padding: "14px 22px", borderRadius: 10, fontSize: 15, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
              Voir comment ça marche
            </a>
          </div>

          {/* Social proof */}
          <div className="fade-3" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex" }}>
              {[G.mint, G.accent, G.gold, G.mint, G.accent].map((c, i) => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: `radial-gradient(circle, ${c}cc, ${c}55)`, border: `2px solid ${G.bg}`, marginLeft: i === 0 ? 0 : -10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#18251f" }}>
                  {["SL","TD","CR","LB","JM"][i]}
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: "flex", gap: 2, marginBottom: 2 }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={12} color={G.gold} fill={G.gold} />)}
              </div>
              <span style={{ fontSize: 12, color: G.muted }}>+2 500 entrepreneurs · Rejoins la communauté →</span>
            </div>
          </div>
        </div>

        {/* Right - App Mockup */}
        <div className="float" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <AppMockup />
        </div>
      </section>

      {/* ── TAGLINE BANNER ── */}
      <section style={{ background: G.bg2, borderTop: `1px solid ${G.border}`, borderBottom: `1px solid ${G.border}`, padding: "32px 5%", textAlign: "center" }}>
        <p style={{ fontFamily: G.serif, fontSize: "clamp(18px, 3vw, 26px)", fontWeight: 700, color: G.text }}>
          Une seule règle : <span style={{ color: G.accent, fontStyle: "italic" }}>donner pour recevoir.</span>
        </p>
        <p style={{ fontSize: 14, color: G.muted, marginTop: 8 }}>Gagne des CP en aidant les autres et utilise-les pour booster ton propre projet.</p>
      </section>

      {/* ── FEATURES ── */}
      <section id="fonctionnalités" style={{ padding: "90px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ fontSize: 11, color: G.mint, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>FONCTIONNALITÉS</div>
            <h2 style={{ fontFamily: G.serif, fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, marginBottom: 14 }}>Ce que CirclUp génère pour toi</h2>
            <p style={{ fontSize: 15, color: G.muted, maxWidth: 520, margin: "0 auto" }}>Des signaux réels, générés par de vraies personnes. Pas de bots. Pas de triche. De l'entraide qui paie.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {FEATURES.map(({ Icon, title, desc, color }) => (
              <div key={title} className="card-hov" style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 28 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, border: `1px solid ${color}35`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Icon size={22} color={color} />
                </div>
                <h3 style={{ fontFamily: G.serif, fontSize: 17, fontWeight: 800, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.75 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section id="comment-ça-marche" style={{ padding: "80px 5%", background: G.bg2 }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 11, color: G.accent, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>COMMENT ÇA MARCHE</div>
            <h2 style={{ fontFamily: G.serif, fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, marginBottom: 14 }}>La mécanique de l'entraide</h2>
            <p style={{ fontSize: 15, color: G.muted, maxWidth: 520, margin: "0 auto" }}>Pas de bots, pas de faux clics. Des vrais entrepreneurs qui s'entraident — et l'algorithme qui récompense cette activité réelle.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { num: "01", Icon: FileText, color: G.accent, title: "Tu publies ton produit", desc: "Tu crées un post en racontant l'histoire de ton produit. Un score de qualité (0-100) est calculé automatiquement : plus ton histoire est riche, plus tu attires de missions.", tag: "Score : longueur · histoire · appel à l'action · prix..." },
              { num: "02", Icon: Users,    color: G.mint,   title: "Ton cercle voit ton post",      desc: "Tu es assigné à un cercle de 10 vendeurs de ta même niche. Ils voient ton post en priorité dans leur feed. Vous vous connaissez, vous avancez ensemble.", tag: "10 membres · même niche · entraide ciblée" },
              { num: "03", Icon: Repeat2,  color: G.gold,   title: "Ils font des missions pour toi", desc: "Les membres de ton cercle peuvent faire jusqu'à 8 missions sur ton post : ajouter aux favoris Etsy, visiter ta boutique, partager en story, laisser un avis...", tag: "8 missions disponibles · de +3 CP à +40 CP" },
              { num: "04", Icon: TrendingUp, color: G.accent, title: "L'algorithme te remarque",  desc: "Etsy et Shopify mesurent les favoris, les visites, les avis et les partages pour décider qui apparaît en premier dans les recherches. CirclUp génère ces signaux de façon organique.", tag: "Favoris · Visites · Avis · Partages · Trafic externe" },
            ].map((step, idx, arr) => (
              <div key={step.num} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: "24px 28px", display: "flex", gap: 24, alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: `${step.color}18`, border: `1px solid ${step.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <step.Icon size={20} color={step.color} />
                  </div>
                  {idx < arr.length - 1 && <div style={{ width: 1, height: 16, background: `linear-gradient(${step.color}40, transparent)`, marginTop: 6 }} />}
                </div>
                <div style={{ flex: 1, paddingTop: 4 }}>
                  <span style={{ fontSize: 10, color: step.color, fontWeight: 700, letterSpacing: 1 }}>ÉTAPE {step.num}</span>
                  <h3 style={{ fontFamily: G.serif, fontSize: 19, fontWeight: 800, margin: "6px 0 8px" }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.75, marginBottom: 10 }}>{step.desc}</p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${step.color}12`, border: `1px solid ${step.color}30`, borderRadius: 7, padding: "4px 10px" }}>
                    <step.Icon size={11} color={step.color} />
                    <span style={{ fontSize: 11, color: step.color, fontWeight: 600 }}>{step.tag}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJETS À DÉCOUVRIR ── */}
      <section style={{ padding: "90px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
            <div>
              <div style={{ fontSize: 11, color: G.mint, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>PROJETS À DÉCOUVRIR</div>
              <h2 style={{ fontFamily: G.serif, fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 900 }}>Des boutiques qui décollent</h2>
            </div>
            <Link to="/register" style={{ color: G.mint, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              Voir tous les projets <ChevronRight size={14} />
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {POSTS_SAMPLE.map((post) => (
              <div key={post.name} className="card-hov" style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, overflow: "hidden" }}>
                {/* Image placeholder */}
                <div style={{ height: 160, background: post.bgColor, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <div style={{ width: 80, height: 80, borderRadius: 16, background: `${post.color}30`, border: `2px solid ${post.color}50`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShoppingBag size={32} color={post.color} />
                  </div>
                  <div style={{ position: "absolute", top: 12, left: 12, background: `${post.color}20`, border: `1px solid ${post.color}40`, borderRadius: 6, padding: "3px 9px", fontSize: 11, color: post.color, fontWeight: 600 }}>{post.tag}</div>
                  <div style={{ position: "absolute", bottom: 12, right: 12, background: G.goldL, border: `1px solid ${G.goldB}`, borderRadius: 6, padding: "3px 9px", fontSize: 11, color: G.gold, fontWeight: 700 }}>+{post.cp} CP</div>
                </div>
                <div style={{ padding: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <Avatar initials={post.init} color={post.color} size={28} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{post.name}</div>
                      <div style={{ fontSize: 10, color: G.muted }}>{post.shop}</div>
                    </div>
                  </div>
                  <h3 style={{ fontFamily: G.serif, fontSize: 15, fontWeight: 800, marginBottom: 12 }}>{post.title}</h3>
                  <div style={{ display: "flex", gap: 16, paddingTop: 12, borderTop: `1px solid ${G.borderL}` }}>
                    <div style={{ display: "flex", align: "center", gap: 4 }}>
                      <Eye size={12} color={G.muted} style={{ marginTop: 1 }} />
                      <span style={{ fontSize: 12, color: G.muted }}>{post.visits} visites</span>
                    </div>
                    <div style={{ display: "flex", align: "center", gap: 4 }}>
                      <Heart size={12} color={G.muted} style={{ marginTop: 1 }} />
                      <span style={{ fontSize: 12, color: G.muted }}>{post.supports} soutiens</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY SECTION ── */}
      <section style={{ padding: "80px 5%", background: G.bg2 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: G.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>LA COMMUNAUTÉ</div>
            <h2 style={{ fontFamily: G.serif, fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 900, lineHeight: 1.2, marginBottom: 20 }}>
              Une communauté bienveillante et{" "}
              <span style={{ color: G.accent, fontStyle: "italic" }}>ambitieuse.</span>
            </h2>
            <p style={{ fontSize: 15, color: G.muted, lineHeight: 1.75, marginBottom: 28 }}>
              Chaque jour, des centaines d'entrepreneurs s'entraident pour aller plus loin. Ici, pas de concurrence, que des opportunités.
            </p>
            {[
              "Des boutiques dans tous les domaines — Etsy, Shopify, créateurs",
              "Des membres actifs et engagés dans leur niche",
              "Un environnement sécurisé — pas de bots, pas de triche",
              "Une entraide 100% gagnant-gagnant",
            ].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                <CheckCircle size={16} color={G.mint} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 14, color: G.muted }}>{item}</span>
              </div>
            ))}
          </div>
          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              ["312", "Membres actifs", G.mint],
              ["4 850€", "Ventes ce mois", G.accent],
              ["18 400", "Missions complétées", G.gold],
              ["97%", "Membres satisfaits", G.mint],
            ].map(([val, label, color]) => (
              <div key={label} className="card-hov" style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, padding: "22px 18px", textAlign: "center" }}>
                <div style={{ fontFamily: G.serif, fontSize: 32, fontWeight: 900, color, marginBottom: 6 }}>{val}</div>
                <div style={{ fontSize: 12, color: G.muted }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="témoignages" style={{ padding: "90px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 11, color: G.mint, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>ILS NOUS FONT CONFIANCE</div>
            <h2 style={{ fontFamily: G.serif, fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900 }}>
              Des entrepreneurs qui ont{" "}
              <span style={{ color: G.accent, fontStyle: "italic" }}>décollé.</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card-hov" style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 18, padding: 28 }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} color={G.gold} fill={G.gold} />)}
                </div>
                <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.75, marginBottom: 22, fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 18, borderTop: `1px solid ${G.borderL}` }}>
                  <Avatar initials={t.init} color={t.color} size={40} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: G.muted }}>{t.role}</div>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: G.gold, fontWeight: 700 }}>{t.cp}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="tarifs" style={{ padding: "80px 5%", background: G.bg2 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: G.accent, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>TARIF</div>
            <h2 style={{ fontFamily: G.serif, fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>
              Prêt à booster ta boutique dès aujourd'hui ?
            </h2>
            <p style={{ fontSize: 15, color: G.muted, lineHeight: 1.7, marginBottom: 28 }}>
              Rejoins la communauté et profite de tous les avantages pour seulement{" "}
              <span style={{ color: G.accent, fontWeight: 700 }}>4,99€/mois.</span>
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                [Zap,          "500 CP offerts", "chaque mois"],
                [Target,       "Accès complet", "toutes les fonctionnalités"],
                [Award,        "Outils premium", "à venir"],
                [Shield,       "Annulation", "à tout moment"],
              ].map(([Icon, title, sub]) => (
                <div key={title} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: G.accentL, border: `1px solid ${G.accentB}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={15} color={G.accent} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
                    <div style={{ fontSize: 11, color: G.muted }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 24, padding: 36 }}>
            <div style={{ fontFamily: G.serif, fontSize: 52, fontWeight: 900, color: G.accent, marginBottom: 4 }}>4,99€</div>
            <div style={{ fontSize: 14, color: G.muted, marginBottom: 28 }}>par mois · sans engagement · résiliable à tout moment</div>
            <div style={{ marginBottom: 28 }}>
              {[
                "Feed infini avec les posts de ta niche",
                "8 missions par post pour booster l'algorithme",
                "Cercle de 10 membres de ta niche",
                "Dashboard avec signaux Etsy/Shopify",
                "Système CP avec rangs et progression",
                "Streak journalier + récompenses",
              ].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${G.borderL}` }}>
                  <CheckCircle size={15} color={G.mint} />
                  <span style={{ fontSize: 13, color: G.muted }}>{f}</span>
                </div>
              ))}
            </div>
            <Link to="/register" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: G.accent, color: "#fff", padding: "15px", borderRadius: 12, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              Rejoindre CirclUp <ArrowRight size={18} />
            </Link>
            <p style={{ textAlign: "center", fontSize: 12, color: G.faint, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <Shield size={12} color={G.faint} /> Paiement 100% sécurisé par Stripe
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: "80px 5%" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 11, color: G.mint, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>FAQ</div>
            <h2 style={{ fontFamily: G.serif, fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900 }}>Questions fréquentes</h2>
          </div>
          {FAQS.map(faq => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: "80px 5%", background: G.bg2, textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: G.serif, fontSize: "clamp(28px, 5vw, 50px)", fontWeight: 900, lineHeight: 1.15, marginBottom: 18 }}>
            Prêt à booster<br />
            <span style={{ color: G.accent, fontStyle: "italic" }}>sans dépenser ?</span>
          </h2>
          <p style={{ fontSize: 15, color: G.muted, marginBottom: 32, lineHeight: 1.7 }}>
            Tes concurrents paient des centaines d'euros en pub. Toi tu vas construire quelque chose de durable avec d'autres créateurs.
          </p>
          <Link to="/register" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: G.accent, color: "#fff", padding: "16px 36px", borderRadius: 12, fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            Commencer maintenant <ArrowRight size={20} />
          </Link>
          <p style={{ fontSize: 12, color: G.faint }}>Rejoins les 312 entrepreneurs déjà actifs · Aucune carte requise pour commencer</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: G.bg3, borderTop: `1px solid ${G.border}`, padding: "48px 5% 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
            {/* Brand */}
            <div>
              <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                <Logo size={28} />
                <span style={{ fontFamily: G.serif, fontSize: 18, fontWeight: 900 }}>CirclUp</span>
              </Link>
              <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.7, marginBottom: 20, maxWidth: 220 }}>La communauté d'entraide des entrepreneurs e-commerce.</p>
              <div style={{ display: "flex", gap: 10 }}>
                {["IG", "TK", "YT", "LI"].map(s => (
                  <div key={s} style={{ width: 32, height: 32, borderRadius: 8, background: G.card, border: `1px solid ${G.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: G.muted, fontWeight: 700, cursor: "pointer" }}>{s}</div>
                ))}
              </div>
            </div>
            {/* Columns */}
            {[
              ["Produit", ["Fonctionnalités", "Tarifs", "Missions", "CP & Rangs"]],
              ["Ressources", ["Blog", "Guides", "Témoignages", "Affiliation"]],
              ["Entreprise", ["À propos", "Contact", "CGU", "Confidentialité"]],
              ["Rester informé", null],
            ].map(([title, links]) => (
              <div key={title}>
                <div style={{ fontSize: 12, fontWeight: 700, color: G.text, marginBottom: 16, letterSpacing: 0.3 }}>{title}</div>
                {links ? links.map(link => (
                  <div key={link} style={{ fontSize: 13, color: G.muted, marginBottom: 10, cursor: "pointer" }}>{link}</div>
                )) : (
                  <div style={{ display: "flex", gap: 0 }}>
                    <input placeholder="Ton email" style={{ flex: 1, background: G.card, border: `1px solid ${G.border}`, borderRight: "none", borderRadius: "8px 0 0 8px", padding: "9px 12px", color: G.text, fontSize: 12, outline: "none", fontFamily: G.sans }} />
                    <button style={{ background: G.accent, border: "none", color: "#fff", padding: "9px 12px", borderRadius: "0 8px 8px 0", cursor: "pointer" }}>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 12, color: G.faint }}>© 2025 CirclUp · Tous droits réservés</span>
            <div style={{ display: "flex", gap: 20 }}>
              {["Conditions d'utilisation", "Confidentialité", "Cookies"].map(l => (
                <span key={l} style={{ fontSize: 12, color: G.faint, cursor: "pointer" }}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
