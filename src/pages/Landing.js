import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Star, Eye, Heart, MessageCircle, Share2, Pin, Search, ShoppingBag,
  ArrowRight, CheckCircle, Users, TrendingUp, Zap, ChevronDown, ChevronUp,
  RefreshCw, BarChart2, Target, Shield
} from 'lucide-react'

const G = {
  bg: "#1a2420",
  bg2: "#1f2e28",
  card: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.07)",
  accent: "#e05c4b",
  accentL: "rgba(224,92,75,0.12)",
  accentB: "rgba(224,92,75,0.3)",
  mint: "#7ecfc0",
  mintL: "rgba(126,207,192,0.1)",
  mintB: "rgba(126,207,192,0.25)",
  gold: "#d4a84b",
  goldL: "rgba(212,168,75,0.1)",
  goldB: "rgba(212,168,75,0.28)",
  text: "#f0ebe3",
  muted: "rgba(240,235,227,0.5)",
  faint: "rgba(240,235,227,0.22)",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', system-ui, sans-serif",
}

const MISSIONS = [
  { icon: Star,          label: "Ajouter aux favoris Etsy", cp: 5,  color: G.gold },
  { icon: Eye,           label: "Visiter la boutique",      cp: 3,  color: G.mint },
  { icon: Heart,         label: "Liker 3 produits",         cp: 4,  color: G.accent },
  { icon: MessageCircle, label: "Commenter le post",        cp: 6,  color: G.mint },
  { icon: Share2,        label: "Partager en story",        cp: 10, color: G.accent },
  { icon: Pin,           label: "Épingler Pinterest",       cp: 8,  color: G.gold },
  { icon: Search,        label: "Laisser un avis",          cp: 15, color: G.mint },
  { icon: ShoppingBag,   label: "Acheter un produit",       cp: 40, color: G.gold },
]

const STEPS = [
  {
    num: "01",
    title: "Publie ton produit",
    desc: "Crée un post avec l'histoire de ton produit. Plus ton histoire est vraie, plus tu reçois de missions.",
    icon: Target,
    color: G.accent,
  },
  {
    num: "02",
    title: "Fais des missions",
    desc: "Aide les autres membres — favoris Etsy, partages, avis. Chaque action te rapporte des CP.",
    icon: RefreshCw,
    color: G.mint,
  },
  {
    num: "03",
    title: "Booste ton algorithme",
    desc: "Les signaux que tu reçois (favoris, visites, avis) améliorent ton référencement Etsy et Shopify.",
    icon: TrendingUp,
    color: G.gold,
  },
]

const TESTIMONIALS = [
  {
    name: "Sophie M.",
    shop: "Bijoux Bohème",
    text: "En 3 semaines j'ai eu 47 nouveaux favoris sur mon produit phare. Mon taux de conversion a bondi de 18%.",
    cp: 340,
    rank: "Builder",
  },
  {
    name: "Lucas T.",
    shop: "Art Numérique",
    text: "Je dépensais 80€/mois en pub Etsy sans résultats. CirclUp m'a généré plus de trafic organique en 1 mois.",
    cp: 720,
    rank: "Leader",
  },
  {
    name: "Amina K.",
    shop: "Maison & Plantes",
    text: "L'entraide dans mon cercle est incroyable. On se challenge, on progresse ensemble. Jamais seule.",
    cp: 190,
    rank: "Starter",
  },
]

const FAQS = [
  {
    q: "Est-ce que CirclUp fonctionne vraiment ?",
    a: "Oui. Les signaux algorithmiques (favoris, visites, avis, partages) sont les vrais leviers du référencement Etsy et Shopify. CirclUp les génère organiquement via l'entraide — sans triche, sans bot.",
  },
  {
    q: "Dois-je acheter les produits des autres membres ?",
    a: "Non. L'achat est une mission bonus à +40 CP. Les 7 autres missions sont gratuites. La philosophie de CirclUp repose sur l'entraide accessible à tous.",
  },
  {
    q: "Comment sont formés les cercles ?",
    a: "Tu es regroupé avec 9 autres vendeurs de ta même niche. Dès que 10 membres de ta niche sont inscrits, ton cercle est activé et tu commences à recevoir des missions.",
  },
  {
    q: "Puis-je résilier à tout moment ?",
    a: "Absolument. L'abonnement est mensuel, sans engagement. Tu peux annuler depuis ton espace Stripe ou en nous contactant.",
  },
  {
    q: "CirclUp respecte-t-il les CGU d'Etsy ?",
    a: "Oui. Toutes les actions sont réelles — des vraies personnes qui visitent, qui favorisent, qui partagent. Il n'y a aucun bot, aucune automatisation. C'est de l'entraide humaine.",
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      borderBottom: `1px solid ${G.border}`,
      padding: "20px 0",
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          width: "100%", background: "none", border: "none", color: G.text,
          cursor: "pointer", textAlign: "left", gap: 16, fontFamily: G.sans,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600 }}>{q}</span>
        {open
          ? <ChevronUp size={18} color={G.mint} />
          : <ChevronDown size={18} color={G.muted} />
        }
      </button>
      {open && (
        <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.75, marginTop: 12, marginBottom: 0 }}>{a}</p>
      )}
    </div>
  )
}

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: G.bg, fontFamily: G.sans, color: G.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        .fade-1 { animation: fadeUp 0.6s ease both; }
        .fade-2 { animation: fadeUp 0.6s 0.15s ease both; }
        .fade-3 { animation: fadeUp 0.6s 0.3s ease both; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        a { text-decoration: none; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(26,36,32,0.88)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${G.border}`,
        padding: "0 5%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${G.accent}, #c94535)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <RefreshCw size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: G.serif, fontSize: 20, fontWeight: 900 }}>CirclUp</span>
          <span style={{ fontSize: 9, color: G.faint, border: `1px solid ${G.border}`, borderRadius: 4, padding: "2px 6px", letterSpacing: 1 }}>BETA</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link to="/login" style={{
            color: G.muted, fontSize: 14, fontWeight: 500, padding: "8px 16px",
            borderRadius: 8, transition: "color 0.15s",
          }}>
            Connexion
          </Link>
          <Link to="/register" style={{
            background: G.accent, color: "#fff", fontSize: 14, fontWeight: 700,
            padding: "9px 20px", borderRadius: 8,
          }}>
            Rejoindre — 4,99€/mois
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        padding: "120px 5% 80px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
          width: 600, height: 600,
          background: `radial-gradient(ellipse, rgba(126,207,192,0.06) 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <div style={{ textAlign: "center", maxWidth: 760, position: "relative" }}>
          {/* Badge */}
          <div className="fade-1" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: G.mintL, border: `1px solid ${G.mintB}`,
            borderRadius: 20, padding: "6px 16px", marginBottom: 28,
          }}>
            <Zap size={13} color={G.mint} />
            <span style={{ fontSize: 12, color: G.mint, fontWeight: 600, letterSpacing: 0.5 }}>
              312 entrepreneurs · 4 850€ de ventes ce mois
            </span>
          </div>

          <h1 className="fade-2" style={{
            fontFamily: G.serif, fontSize: "clamp(38px, 6vw, 70px)",
            fontWeight: 900, lineHeight: 1.1, marginBottom: 24,
          }}>
            Tes premières ventes.<br />
            <span style={{ color: G.accent, fontStyle: "italic" }}>Sans un centime</span><br />
            de publicité.
          </h1>

          <p className="fade-3" style={{
            fontSize: "clamp(15px, 2vw, 18px)", color: G.muted,
            lineHeight: 1.7, maxWidth: 540, margin: "0 auto 40px",
          }}>
            CirclUp réunit des vendeurs Etsy et Shopify qui s'entraident via des petites missions.
            Favoris, partages, avis — les signaux qui boostent ton algorithme, générés sans pub.
          </p>

          <div className="fade-3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register" style={{
              background: G.accent, color: "#fff",
              padding: "16px 32px", borderRadius: 10, fontSize: 16, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              Rejoindre pour 4,99€/mois <ArrowRight size={18} />
            </Link>
            <a href="#comment" style={{
              background: "transparent", color: G.text,
              border: `1px solid ${G.border}`,
              padding: "16px 28px", borderRadius: 10, fontSize: 15, fontWeight: 500,
            }}>
              Comment ça marche
            </a>
          </div>

          {/* Trust line */}
          <div style={{ marginTop: 32, display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              [Shield, "Sans engagement"],
              [CheckCircle, "Résiliable à tout moment"],
              [Users, "312 membres actifs"],
            ].map(([Icon, label]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon size={14} color={G.mint} />
                <span style={{ fontSize: 12, color: G.muted }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ── */}
      <section style={{
        background: G.bg2, borderTop: `1px solid ${G.border}`, borderBottom: `1px solid ${G.border}`,
        padding: "40px 5%",
      }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32,
          textAlign: "center",
        }}>
          {[
            ["312", "Membres actifs", G.mint],
            ["4 850€", "Ventes générées ce mois", G.accent],
            ["18 400", "Missions complétées", G.gold],
            ["4,99€", "Par mois, sans engagement", G.mint],
          ].map(([val, label, color]) => (
            <div key={label}>
              <div style={{ fontFamily: G.serif, fontSize: 32, fontWeight: 900, color, marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: 12, color: G.muted }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="comment" style={{ padding: "100px 5%" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 11, color: G.mint, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>COMMENT ÇA MARCHE</div>
            <h2 style={{ fontFamily: G.serif, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, marginBottom: 16 }}>
              Simple comme 1-2-3
            </h2>
            <p style={{ fontSize: 15, color: G.muted, maxWidth: 480, margin: "0 auto" }}>
              Pas d'algorithme magique. Juste de l'entraide réelle entre entrepreneurs.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.num} style={{
                  background: G.card, border: `1px solid ${G.border}`,
                  borderRadius: 18, padding: 32, position: "relative",
                }}>
                  <div style={{
                    position: "absolute", top: 24, right: 24,
                    fontFamily: G.serif, fontSize: 48, fontWeight: 900,
                    color: "rgba(255,255,255,0.04)", lineHeight: 1,
                  }}>
                    {step.num}
                  </div>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `${step.color}18`, border: `1px solid ${step.color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 20,
                  }}>
                    <Icon size={22} color={step.color} />
                  </div>
                  <h3 style={{ fontFamily: G.serif, fontSize: 20, fontWeight: 800, marginBottom: 10 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── MISSIONS ── */}
      <section style={{ padding: "80px 5%", background: G.bg2 }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 11, color: G.gold, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>LES MISSIONS</div>
            <h2 style={{ fontFamily: G.serif, fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, marginBottom: 14 }}>
              8 actions qui font la différence
            </h2>
            <p style={{ fontSize: 15, color: G.muted }}>
              Chaque mission génère un signal réel pour l'algorithme. Tu gagnes des CP à chaque action.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
            {MISSIONS.map((m) => {
              const Icon = m.icon
              return (
                <div key={m.label} style={{
                  background: G.card, border: `1px solid ${G.border}`,
                  borderRadius: 14, padding: "18px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                  transition: "border-color 0.2s",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: `${m.color}15`, border: `1px solid ${m.color}35`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon size={17} color={m.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: G.text, marginBottom: 2 }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: m.color, fontWeight: 700 }}>+{m.cp} CP</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <div style={{
              display: "inline-block",
              background: G.goldL, border: `1px solid ${G.goldB}`,
              borderRadius: 12, padding: "14px 28px",
            }}>
              <div style={{ fontSize: 13, color: G.muted, marginBottom: 4 }}>Total CP possible par post</div>
              <div style={{ fontFamily: G.serif, fontSize: 28, fontWeight: 900, color: G.gold }}>
                91 CP
                <span style={{ fontSize: 12, fontFamily: G.sans, color: G.muted, fontWeight: 400, marginLeft: 8 }}>soit ~3 semaines de signaux</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section style={{ padding: "100px 5%" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: G.accent, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>TON DASHBOARD</div>
              <h2 style={{ fontFamily: G.serif, fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 900, marginBottom: 20, lineHeight: 1.2 }}>
                Suis tes signaux algorithme en temps réel
              </h2>
              <p style={{ fontSize: 15, color: G.muted, lineHeight: 1.75, marginBottom: 28 }}>
                Vois exactement combien de favoris, partages et avis ton cercle t'a générés cette semaine. Et comment ça impacte ton référencement.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  [BarChart2, "Signaux Etsy & Shopify en temps réel", G.mint],
                  [Users, "Cercle de 10 membres de ta niche", G.accent],
                  [Zap, "Système CP avec rangs et progression", G.gold],
                ].map(([Icon, text, color]) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: `${color}15`, border: `1px solid ${color}35`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Icon size={16} color={color} />
                    </div>
                    <span style={{ fontSize: 14, color: G.muted }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fake dashboard preview */}
            <div style={{
              background: G.card, border: `1px solid ${G.border}`,
              borderRadius: 20, padding: 24, overflow: "hidden",
            }}>
              <div style={{ fontSize: 11, color: G.faint, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>Mon Dashboard</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {[
                  ["Favoris reçus", "47", G.gold],
                  ["Partages", "23", G.accent],
                  ["Avis générés", "8", G.mint],
                  ["Crédits CP", "340", G.mint],
                ].map(([label, val, color]) => (
                  <div key={label} style={{
                    background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`,
                    borderRadius: 10, padding: "12px 14px",
                  }}>
                    <div style={{ fontSize: 9, color: G.faint, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontFamily: G.serif, fontSize: 22, fontWeight: 900, color }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10, color: G.faint, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Signaux Algorithme</div>
              {[
                ["Favoris Etsy", 78, G.gold],
                ["Visites boutique", 55, G.mint],
                ["Trafic externe", 40, G.accent],
              ].map(([label, pct, color]) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: G.muted }}>{label}</span>
                    <span style={{ fontSize: 11, color, fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "80px 5%", background: G.bg2 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 11, color: G.mint, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>TÉMOIGNAGES</div>
            <h2 style={{ fontFamily: G.serif, fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900 }}>
              Ils ont arrêté de payer la pub
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} style={{
                background: G.card, border: `1px solid ${G.border}`,
                borderRadius: 18, padding: 28,
              }}>
                <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.75, marginBottom: 20, fontStyle: "italic" }}>
                  "{t.text}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${G.mint}44, ${G.accent}44)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: G.text,
                  }}>
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: G.muted }}>{t.shop}</div>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: G.gold, fontWeight: 700 }}>{t.cp} CP</div>
                    <div style={{ fontSize: 9, color: G.faint }}>{t.rank}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: "100px 5%" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: G.accent, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>TARIF</div>
          <h2 style={{ fontFamily: G.serif, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, marginBottom: 16 }}>
            Un seul abonnement.<br />Tout inclus.
          </h2>
          <p style={{ fontSize: 15, color: G.muted, marginBottom: 48 }}>Moins cher qu'un café. Plus efficace que 100€ de pub.</p>

          <div style={{
            background: G.card, border: `1px solid ${G.border}`,
            borderRadius: 24, padding: 40,
          }}>
            <div style={{ fontFamily: G.serif, fontSize: 56, fontWeight: 900, color: G.accent, marginBottom: 4 }}>
              4,99€
            </div>
            <div style={{ fontSize: 14, color: G.muted, marginBottom: 36 }}>par mois · sans engagement · résiliable à tout moment</div>

            <div style={{ textAlign: "left", marginBottom: 36 }}>
              {[
                "Feed infini avec les posts de ta niche",
                "8 missions par post pour booster l'algorithme",
                "Intégration dans un cercle de 10 membres",
                "Dashboard avec signaux Etsy/Shopify",
                "Système CP avec rangs et progression",
                "Notifications en temps réel",
              ].map((feature) => (
                <div key={feature} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${G.border}` }}>
                  <CheckCircle size={16} color={G.mint} />
                  <span style={{ fontSize: 14, color: G.muted }}>{feature}</span>
                </div>
              ))}
            </div>

            <Link to="/register" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: G.accent, color: "#fff",
              padding: "16px", borderRadius: 12, fontSize: 16, fontWeight: 700, width: "100%",
            }}>
              Commencer maintenant <ArrowRight size={18} />
            </Link>

            <p style={{ fontSize: 11, color: G.faint, marginTop: 16 }}>
              Rejoins les 312 entrepreneurs déjà actifs
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "80px 5%", background: G.bg2 }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 11, color: G.mint, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>FAQ</div>
            <h2 style={{ fontFamily: G.serif, fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900 }}>Questions fréquentes</h2>
          </div>
          {FAQS.map((faq) => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section style={{ padding: "100px 5%", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: G.serif, fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 900, lineHeight: 1.15, marginBottom: 20 }}>
            Prêt à booster<br />
            <span style={{ color: G.accent, fontStyle: "italic" }}>sans dépenser ?</span>
          </h2>
          <p style={{ fontSize: 15, color: G.muted, marginBottom: 36, lineHeight: 1.7 }}>
            Tes concurrents paient des centaines d'euros en pub. Toi tu vas construire quelque chose de durable avec d'autres créateurs.
          </p>
          <Link to="/register" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: G.accent, color: "#fff",
            padding: "18px 40px", borderRadius: 12, fontSize: 17, fontWeight: 700,
          }}>
            Rejoindre CirclUp — 4,99€/mois <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: `1px solid ${G.border}`,
        padding: "32px 5%",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: `linear-gradient(135deg, ${G.accent}, #c94535)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <RefreshCw size={13} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: G.serif, fontSize: 16, fontWeight: 800 }}>CirclUp</span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {["Conditions d'utilisation", "Confidentialité", "Contact"].map(label => (
            <span key={label} style={{ fontSize: 12, color: G.faint, cursor: "pointer" }}>{label}</span>
          ))}
        </div>
        <div style={{ fontSize: 12, color: G.faint }}>© 2025 CirclUp · Tous droits réservés</div>
      </footer>
    </div>
  )
}
