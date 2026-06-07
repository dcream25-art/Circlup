// Génère un lien tracé pour une mission. Le token est créé CÔTÉ SERVEUR
// (clé service_role) pour qu'un clic ne puisse pas être falsifié par le client.
// POST /api/track  { postId, missionType, targetUrl }   header: Authorization: Bearer <jwt>
const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!SUPABASE_URL || !SERVICE_KEY) return res.status(500).json({ error: 'Serveur non configuré (clé manquante)' })

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
  try {
    const jwt = (req.headers.authorization || '').replace('Bearer ', '').trim()
    if (!jwt) return res.status(401).json({ error: 'Non authentifié' })

    const { data: userData, error: uErr } = await admin.auth.getUser(jwt)
    if (uErr || !userData?.user) return res.status(401).json({ error: 'Session invalide' })
    const actorId = userData.user.id

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const { postId, missionType, targetUrl } = body
    if (!postId || !missionType || !targetUrl) return res.status(400).json({ error: 'Champs manquants' })

    // Sécurité minimale de l'URL cible (http/https uniquement)
    let target
    try { target = new URL(targetUrl) } catch { return res.status(400).json({ error: 'URL invalide' }) }
    if (!['http:', 'https:'].includes(target.protocol)) return res.status(400).json({ error: 'URL invalide' })

    const token = crypto.randomBytes(24).toString('hex')
    const { error } = await admin.from('mission_clicks').insert({
      token, actor_id: actorId, post_id: postId, mission_type: missionType, target_url: target.toString(),
    })
    if (error) return res.status(500).json({ error: error.message })

    const base = `https://${req.headers.host}`
    return res.status(200).json({ url: `${base}/api/go?token=${token}` })
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Erreur serveur' })
  }
}
