# 🎨 CirclUp — Brief de génération des illustrations 3D

But : produire un **set cohérent** d'illustrations 3D (style de tes captures) pour les
features, badges et missions. La cohérence prime sur la « beauté » de chaque image isolée.

---

## 1. Style verrouillé (NON négociable — c'est ce qui fait « une famille »)

- **Type** : illustration/icône **3D rendue** (style clay/plastique brillant, accents métalliques doux).
- **Lumière** : studio douce, venant du haut-gauche, ombre de contact douce sous l'objet.
- **Angle** : légère vue 3/4 (top-down ~15°), objet **flottant**, **centré**, **beaucoup de marge** autour.
- **Fond** : **#060606** uni (presque noir) — il se fond dans le « plateau » sombre du site (PAS de décor, PAS de sol visible).
- **Finition** : formes arrondies lisses, ambient occlusion douce, rendu type **Octane/Redshift**, haute déf.
- **Interdits** : aucun texte, aucun mot, aucune watermark, aucun logo (sauf scène « trafic »), un seul sujet par image.

### Palette (1 couleur dominante par image)
| Rôle | Couleur | HEX |
|---|---|---|
| Action / énergie | orange | `#FF6A3D` → `#e04f25` |
| Social / entraide | cyan | `#00D5D5` |
| Récompense / CP / statut | or | `#F5C842` |
| Base / fond | quasi-noir | `#060606` |

---

## 2. Astuce cohérence (à faire absolument)

1. Génère **une 1ʳᵉ image** que tu aimes (ex. la pièce CP).
2. Sur Midjourney : récupère son URL et ajoute `--sref <url>` (style reference) + `--sw 100` à **toutes** les autres → elles partagent le même style.
3. Même **cadrage / taille de sujet / marge** sur chaque image.
4. Génère tout d'un coup, même session, mêmes réglages.

---

## 3. Suffixe de style (à coller à la FIN de CHAQUE prompt)

```
, 3D render, glossy clay material with subtle metallic accents, soft studio lighting from top-left,
smooth rounded shapes, floating object, soft contact shadow, solid #060606 background, no floor,
premium fintech app icon, single centered subject, lots of padding, ultra detailed, octane render
--ar 1:1 --style raw --v 6 --no text, words, watermark, logo, signature
```
(Flux/DALL·E : enlève les `--flags` et ajoute « transparent or solid #060606 background, centered, square ».)

---

## 4. Les prompts (1 par fichier)

### Page de pré-lancement — 4 features
| Fichier | Couleur | Prompt (avant le suffixe) |
|---|---|---|
| `entraide.png` | cyan | `two cute glossy 3D hands doing a fist bump with a glowing cyan heart spark between them, teamwork and mutual help` |
| `recompense.png` | or | `a shiny gold 3D coin embossed with a star (loyalty point token), a few coins stacked behind, gold sparkles` |
| `progression.png` | cyan | `a 3D ascending staircase of glossy blocks with an upward arrow and an open golden padlock at the top, level-up and unlock` |
| `croissance.png` | orange | `a glossy 3D rocket taking off from a small shop, with a rising orange bar chart behind, growth and visibility` |

### Badge / statut
| Fichier | Couleur | Prompt |
|---|---|---|
| `fondateur.png` | or | `a premium 3D gold medal with a crown on top, laurel wreath and a small ribbon, luxury limited-edition founder badge` |

### (Optionnel) Les 6 scènes du style que tu as montré
| Fichier | Couleur | Prompt |
|---|---|---|
| `favoris.png` | or | `glossy gold 3D stars on a small podium with a rising arrow and tiny bar chart` |
| `avis.png` | cyan | `two glossy 3D speech bubbles, one filled with five gold stars, a small user avatar` |
| `trafic.png` | orange | `a 3D shopping bag in the center connected by dotted lines to social media app icons around it` |
| `visites.png` | cyan | `small 3D people figures walking through a glowing cyan doorway, store visits` |
| `collaborations.png` | or | `two glossy 3D puzzle pieces, one silver one gold, connecting together` |
| `streak.png` | orange | `a 3D orange flame inside a circular progress ring, daily streak` |

---

## 5. Export & livraison

- **Format** : PNG (ou WebP), **1024×1024**, sujet centré avec ~12 % de marge, fond `#060606` (ou transparent).
- **Nommage** : exactement les noms ci-dessus (en minuscules).
- **Où** : déposer dans `public/illustrations/`.
- Ensuite : je convertis en **WebP optimisé**, je crée le composant `<Scene>` (plateau + halo + image + lazy-load) et je remplace les icônes actuelles de la page de pré-lancement (puis dashboard).

> Tu n'as PAS besoin de tout générer d'un coup : commence par les 4 features + `fondateur`.
> Dès que les fichiers sont dans le dossier (ou tu me les envoies), je branche tout et je déploie.
