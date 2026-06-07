import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

function generateUsername(name) {
  const base = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '')
  return base + Math.floor(Math.random() * 999)
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id) // attendre le profil avant de débloquer les guards
        supabase.rpc('update_daily_streak', { p_user_id: session.user.id }).then(null, () => {})
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile(data)
    } catch (err) {
      console.error('fetchProfile error:', err)
    }
  }

  const signUp = async ({ email, password, name, shopName, shopUrl, niche, referralCode,
    bio, website, instagram, facebook, snapchat, tiktok, youtube, pinterest, twitter, etsyUrl, shopifyUrl, goal }) => {
    try {
      // 1. Créer le compte Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
      if (authError) return { error: authError }

      const userId = authData.user.id
      const username = generateUsername(name)

      // 2. Créer le profil — on n'inclut que les champs renseignés
      const socials = { bio, website, instagram, facebook, snapchat, tiktok, youtube, pinterest, twitter, etsy_url: etsyUrl, shopify_url: shopifyUrl, goal }
      const cleanSocials = Object.fromEntries(Object.entries(socials).filter(([, v]) => v && v.trim?.()))

      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        email,
        name,
        shop_name: shopName || '',
        shop_url: shopUrl || '',
        niche: niche || '',
        cp: 50,
        xp: 0,
        level: 1,
        rank: 'Starter',
        league: 'Bronze',
        plan: 'free',
        username,
        is_active: true,
        onboarding_completed: false,
        ...cleanSocials,
      })
      if (profileError) return { error: profileError }

      // 3. Générer le code de parrainage
      await supabase.rpc('generate_referral_code', { p_user_id: userId })

      // 4. Initialiser les quêtes utilisateur
      const { data: quests } = await supabase.from('quests').select('id')
      if (quests?.length) {
        const userQuestsData = quests.map(q => ({ user_id: userId, quest_id: q.id, progress: 0 }))
        await supabase.from('user_quests').insert(userQuestsData)
      }

      // 5. Les 50 CP de bienvenue + l'historique sont posés côté serveur
      //    (valeurs forcées + trigger sur l'insert du profil).

      // 6. Code de parrainage → la RPC contrôlée crédite le parrain (anti-fraude)
      if (referralCode) {
        await supabase.rpc('apply_referral', { p_code: referralCode }).then(null, () => {})
      }

      return { data: authData }
    } catch (err) {
      return { error: err }
    }
  }

  const signIn = async ({ email, password }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error }

      if (data.user) {
        await supabase.rpc('update_daily_streak', { p_user_id: data.user.id })
        await fetchProfile(data.user.id)
      }
      return { data }
    } catch (err) {
      return { error: err }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setUser(null)
  }

  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase
        .from('profiles').update(updates).eq('id', user.id).select().single()
      if (!error) setProfile(prev => ({ ...prev, ...updates }))
      return { data, error }
    } catch (err) {
      return { error: err }
    }
  }

  const completeOnboarding = async () => {
    return updateProfile({ onboarding_completed: true })
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signUp, signIn, signOut,
      updateProfile, fetchProfile, completeOnboarding,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
