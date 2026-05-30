# 🚀 GUIDE DÉPLOIEMENT CIRCLUP
# Lis ce fichier de haut en bas — fais chaque étape dans l'ordre

## ═══════════════════════════════════════
## ÉTAPE 1 — SUPABASE (Base de données)
## ═══════════════════════════════════════

1. Va sur https://supabase.com
2. Clique "Start your project" → connecte-toi avec GitHub
3. Clique "New Project"
   - Name : circlup
   - Database Password : crée un mot de passe fort (note-le)
   - Region : West EU (Ireland)
4. Attends 2 minutes que le projet se crée

5. Va dans "SQL Editor" (menu gauche)
6. Clique "New Query"
7. Copie-colle tout le contenu du fichier : src/lib/schema.sql
8. Clique "Run" → tu verras "Success"

9. Va dans Settings > API
10. Copie :
    - "Project URL" → c'est ton REACT_APP_SUPABASE_URL
    - "anon public" key → c'est ton REACT_APP_SUPABASE_ANON_KEY

## ═══════════════════════════════════════
## ÉTAPE 2 — STRIPE (Paiements)
## ═══════════════════════════════════════

1. Va sur https://stripe.com → créer un compte
2. Vérifie ton email
3. Dans le dashboard Stripe :
   - Va dans "Products" → "Add product"
   - Name : "Abonnement CirclUp"
   - Price : 4.99€ / month / recurring
   - Clique "Save product"
4. Copie le "Price ID" (commence par price_...)

5. Va dans Developers > API Keys
6. Copie la "Publishable key" (commence par pk_live_ ou pk_test_)

## ═══════════════════════════════════════
## ÉTAPE 3 — GITHUB (Stocker le code)
## ═══════════════════════════════════════

1. Va sur https://github.com → crée un compte
2. Clique "+" → "New repository"
   - Name : circlup
   - Private (recommandé)
   - Clique "Create repository"
3. Sur ton PC, installe GitHub Desktop : https://desktop.github.com
4. Ouvre GitHub Desktop → "Add existing repository"
5. Sélectionne le dossier circlup sur ton PC
6. Clique "Publish repository"

## ═══════════════════════════════════════
## ÉTAPE 4 — VARIABLES D'ENVIRONNEMENT
## ═══════════════════════════════════════

1. Dans le dossier circlup sur ton PC
2. Copie le fichier ".env.example" → renomme-le ".env"
3. Remplis les valeurs :
   REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGci...
   REACT_APP_STRIPE_PUBLIC_KEY=pk_live_...
   REACT_APP_STRIPE_PRICE_ID=price_...

## ═══════════════════════════════════════
## ÉTAPE 5 — VERCEL (Mise en ligne)
## ═══════════════════════════════════════

1. Va sur https://vercel.com → connecte-toi avec GitHub
2. Clique "Add New Project"
3. Sélectionne le repo "circlup"
4. IMPORTANT — avant de déployer, ajoute les variables d'environnement :
   - Clique "Environment Variables"
   - Ajoute chaque variable du fichier .env
5. Clique "Deploy"
6. En 2 minutes : ton URL est prête → circlup.vercel.app

## ═══════════════════════════════════════
## ÉTAPE 6 — DOMAINE CUSTOM (optionnel)
## ═══════════════════════════════════════

1. Achète circlup.fr sur https://www.ovhcloud.com (~7€/an)
2. Dans Vercel → Settings → Domains
3. Ajoute "circlup.fr"
4. Vercel te donne des DNS à copier dans OVH
5. Attends 30 min → ton site est sur circlup.fr

## ═══════════════════════════════════════
## PROBLÈMES FRÉQUENTS
## ═══════════════════════════════════════

❌ "Module not found"
→ Lance : npm install dans le dossier circlup

❌ "Invalid API key" Supabase
→ Vérifie que les variables .env sont correctes
→ Redémarre avec : npm start

❌ Page blanche
→ Ouvre la console (F12) → lis l'erreur rouge

❌ Stripe ne redirige pas
→ Il manque la fonction serverless /api/create-checkout-session
→ Dis-le moi, je te la code

## ═══════════════════════════════════════
## CHECKLIST FINALE
## ═══════════════════════════════════════

[ ] Compte Supabase créé + schema SQL exécuté
[ ] Compte Stripe créé + produit 4,99€ créé
[ ] Compte GitHub créé + code uploadé
[ ] Fichier .env rempli avec toutes les clés
[ ] Déployé sur Vercel
[ ] URL fonctionnelle et accessible
[ ] Test : créer un compte + voir le feed

🎉 CirclUp est en ligne. Let's go !
