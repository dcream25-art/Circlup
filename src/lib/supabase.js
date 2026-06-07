import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Message clair en console plutôt qu'un "supabaseUrl is required" cryptique / écran blanc
  console.error(
    '[CirclUp] Variables Supabase manquantes. Définis REACT_APP_SUPABASE_URL et ' +
    'REACT_APP_SUPABASE_ANON_KEY dans ton fichier .env (puis redémarre le serveur).'
  )
}

// Fallback inoffensif pour éviter le crash total au boot ; les requêtes échoueront proprement.
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key'
)
