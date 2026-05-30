import { createClient } from '@supabase/supabase-js'

// Tu remplaceras ces valeurs avec les tiennes depuis supabase.com
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
