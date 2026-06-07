// Redirecteur tracé. GET /api/go?token=...
// Loggue le clic côté serveur (preuve de visite), crée la mission 'visit' vérifiée,
// puis redirige (302) vers l'URL réelle. Token à usage unique.
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

module.exports = async (req, res) => {
  const fail = (loc) => { res.writeHead(302, { Location: loc || '/' }); res.end() }
  if (!SUPABASE_URL || !SERVICE_KEY) return fail('/')

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
  try {
    const token = (req.query && req.query.token) || ''
    if (!token) return fail('/')

    const { data: click } = await admin.from('mission_clicks').select('*').eq('token', token).maybeSingle()
    if (!click) return fail('/')

    const target = click.target_url || '/'

    if (!click.consumed) {
      await admin.from('mission_clicks')
        .update({ clicked_at: new Date().toISOString(), consumed: true })
        .eq('token', token)

      // La VISITE se valide au clic : le trigger réserve le budget + crédite A.
      // (Le doublon est bloqué par la contrainte unique(post,user,type) → erreur ignorée.)
      if (click.mission_type === 'visit') {
        await admin.from('missions').insert({
          post_id: click.post_id, user_id: click.actor_id,
          mission_type: 'visit', cp_earned: 0, status: 'verified',
        })
      }
    }

    res.writeHead(302, { Location: target })
    res.end()
  } catch (e) {
    return fail('/')
  }
}
