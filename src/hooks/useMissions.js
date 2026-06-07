import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

// ─── Système de points ────────────────────────────────────────────────────────
// Valeurs de base par mission
export const MISSION_POINTS = {
  fav:     { points: 5,  xp: 8  },
  visit:   { points: 3,  xp: 5  },
  like:    { points: 4,  xp: 6  },
  comment: { points: 6,  xp: 10 },
  share:   { points: 10, xp: 15 },
  pin:     { points: 8,  xp: 12 },
  review:  { points: 15, xp: 22 },
  cart:    { points: 20, xp: 30 },
  buy:     { points: 40, xp: 60 },
}

// Limite journalière de missions (plan gratuit)
export const FREE_DAILY_MISSION_LIMIT = 5
// Limite journalière de missions (plan premium)
export const PREMIUM_DAILY_MISSION_LIMIT = 30
// Limite de posts actifs (plan gratuit)
export const FREE_POST_LIMIT = 2

// Multiplicateur de streak : +10% tous les 7 jours, max +50%
export function getStreakMultiplier(streak) {
  const bonus = Math.floor(streak / 7) * 0.10
  return Math.min(1 + bonus, 1.5)
}

// Calcul des points finaux avec multiplicateur
export function calcPoints(missionType, streak = 0) {
  const base = MISSION_POINTS[missionType]
  if (!base) return { points: 0, xp: 0 }
  const mult = getStreakMultiplier(streak)
  return {
    points: Math.round(base.points * mult),
    xp: Math.round(base.xp * mult),
    multiplier: mult,
  }
}

// Préfixe attendu par la RPC increment_post_stat (elle ajoute "_count")
const STAT_PREFIX = {
  fav:    'favorites',
  share:  'shares',
  review: 'reviews',
  buy:    'buys',
  like:   'likes',
  visit:  null,
  comment: null,
  pin:    null,
  cart:   null,
}

export function useMissions() {
  const { user, profile, fetchProfile } = useAuth()

  const doMission = async (postId, missionType, proofUrl = null) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      if (!MISSION_POINTS[missionType]) return { success: false, error: 'Type de mission inconnu' }

      // Pré-contrôle limite/jour côté client : seulement pour l'UX (ouvrir la modale
      // d'upgrade). La VRAIE limite est imposée par le serveur (trigger).
      const isPremium = profile?.plan === 'premium'
      const dailyLimit = isPremium ? PREMIUM_DAILY_MISSION_LIMIT : FREE_DAILY_MISSION_LIMIT
      const today = new Date().toISOString().split('T')[0]
      const { count } = await supabase
        .from('missions').select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', today + 'T00:00:00')
      if ((count || 0) >= dailyLimit) {
        return { success: false, error: 'LIMIT_REACHED', limitType: 'daily_missions', isPremium }
      }

      // Insertion de l'ACTION uniquement. Le serveur calcule cp_earned (barème en
      // base), impose la limite/jour, bloque les missions sur son propre post, puis
      // crédite les points (acteur + propriétaire), les stats, la notif et la quête.
      const missionRow = {
        post_id: postId,
        user_id: user.id,
        mission_type: missionType,
        cp_earned: 0, // ignoré et recalculé par le trigger serveur
      }
      if (proofUrl) missionRow.proof_url = proofUrl

      const { error: missionError } = await supabase.from('missions').insert(missionRow)
      if (missionError) {
        const msg = missionError.message || ''
        if (msg.includes('LIMIT_REACHED')) return { success: false, error: 'LIMIT_REACHED', limitType: 'daily_missions', isPremium }
        if (msg.includes('SELF_MISSION')) return { success: false, error: 'Tu ne peux pas faire une mission sur ton propre post' }
        if (msg.includes('duplicate') || missionError.code === '23505') return { success: false, error: 'Mission déjà effectuée' }
        return { success: false, error: msg || 'Erreur mission' }
      }

      // Estimation locale pour l'animation (identique au barème serveur)
      const pts = calcPoints(missionType, profile?.streak || 0)

      // Rafraîchir le profil (CP réels mis à jour par le serveur)
      fetchProfile(user.id).then(null, () => {})

      return {
        success: true,
        pointsEarned: pts.points,
        xpEarned: pts.xp,
      }
    } catch (err) {
      console.error('doMission error:', err)
      return { success: false, error: err.message }
    }
  }

  return { doMission, MISSION_POINTS }
}
