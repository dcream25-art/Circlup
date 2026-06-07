import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function usePosts() {
  const { user } = useAuth()
  const [posts, setPosts]     = useState([])
  const [myPosts, setMyPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey(id, name, username, level, reputation, league, badges, shop_name, shop_url, avatar_url, avatar_color),
          post_likes(user_id),
          post_favorites(user_id),
          missions(mission_type, user_id)
        `)
        .order('is_boosted', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setPosts(data || [])
    } catch (err) {
      console.error('fetchPosts error:', err)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMyPosts = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('posts')
        .select('*, missions(mission_type, user_id), post_likes(user_id)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setMyPosts(data || [])
    } catch (err) {
      console.error('fetchMyPosts error:', err)
    }
  }, [user])

  useEffect(() => {
    fetchPosts()

    // Realtime : nouveaux posts
    const feedChannel = supabase
      .channel('feed-posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => {
        fetchPosts()
      })
      .subscribe()

    return () => supabase.removeChannel(feedChannel)
  }, [fetchPosts])

  const createPost = async ({ product, price, story, ask, tags, imageUrl, linkUrl, postType, supportBudget = 0 }) => {
    if (!user) return { error: 'Non connecté' }

    // Calcul du score
    const words = story?.trim().split(/\s+/).filter(Boolean).length || 0
    let score = 0
    if (words >= 150) score += 20
    else if (words >= 50) score += 10
    if (imageUrl)        score += 30
    if (ask)             score += 15
    if (price)           score += 10
    if (tags?.length)    score += 5
    score = Math.min(score, 100)

    // 1. Insérer le post — erreur fatale si ça rate
    let post, insertError
    try {
      const { data, error } = await supabase.from('posts').insert({
        user_id: user.id,
        product,
        price: price || null,
        story,
        ask: ask || null,
        tags: tags || [],
        score,
        post_type: postType || 'promotion',
        image_url: imageUrl || null,
        link_url: linkUrl || null,
      }).select().single()
      post = data
      insertError = error
    } catch (err) {
      return { error: err }
    }

    if (insertError) return { error: insertError }

    // 2. Dotation optionnelle : déplace des CP de l'auteur vers le budget du post
    //    (escrow). Ces CP récompenseront ceux qui font des missions sur ce post.
    if (supportBudget > 0) {
      const { data: funded } = await supabase.rpc('fund_post', {
        p_post_id: post.id, p_amount: supportBudget,
      })
      if (funded === false) {
        // Pas assez de CP : le post est créé mais non doté (on le signale au caller)
        await fetchPosts()
        return { data: post, fundingFailed: true }
      }
    }

    // 3. Rafraîchir le feed — toujours exécuté
    await fetchPosts()
    return { data: post }
  }

  const likePost = async (postId) => {
    if (!user) return
    try {
      // Optimistic update immédiat
      const alreadyLiked = posts.find(p => p.id === postId)?.post_likes?.some(l => l.user_id === user.id)
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p
        return {
          ...p,
          likes_count: alreadyLiked ? Math.max(0, (p.likes_count || 0) - 1) : (p.likes_count || 0) + 1,
          post_likes: alreadyLiked
            ? (p.post_likes || []).filter(l => l.user_id !== user.id)
            : [...(p.post_likes || []), { user_id: user.id }]
        }
      }))

      const { data: existing } = await supabase
        .from('post_likes').select('id')
        .eq('post_id', postId).eq('user_id', user.id).maybeSingle()

      if (existing) {
        await supabase.from('post_likes').delete().eq('id', existing.id)
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id })
      }
      // Compteur likes_count + points "Like reçu" au propriétaire : triggers serveur.
    } catch (err) {
      console.error('likePost error:', err)
      await fetchPosts() // rollback en cas d'erreur
    }
  }

  const favoritePost = async (postId) => {
    if (!user) return
    try {
      const alreadyFaved = posts.find(p => p.id === postId)?.post_favorites?.some(f => f.user_id === user.id)
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p
        return {
          ...p,
          favorites_count: alreadyFaved ? Math.max(0, (p.favorites_count || 0) - 1) : (p.favorites_count || 0) + 1,
          post_favorites: alreadyFaved
            ? (p.post_favorites || []).filter(f => f.user_id !== user.id)
            : [...(p.post_favorites || []), { user_id: user.id }]
        }
      }))

      const { data: existing } = await supabase
        .from('post_favorites').select('id')
        .eq('post_id', postId).eq('user_id', user.id).maybeSingle()

      if (existing) {
        await supabase.from('post_favorites').delete().eq('id', existing.id)
      } else {
        await supabase.from('post_favorites').insert({ post_id: postId, user_id: user.id })
      }
    } catch (err) {
      console.error('favoritePost error:', err)
      await fetchPosts()
    }
  }

  const addComment = async (postId, content) => {
    if (!user) return { error: 'Non connecté' }
    if (!content || content.trim().length < 20) {
      return { error: 'Commentaire trop court (minimum 20 caractères)' }
    }
    try {
      const { data: comment, error } = await supabase.from('comments').insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
      }).select().single()

      if (error) return { error }

      // Compteur, points (+6/+10, 1×/post hors propre post), notif et quête :
      // entièrement gérés par trigger serveur sur l'insert du commentaire.
      return { data: comment }
    } catch (err) {
      return { error: err }
    }
  }

  const boostPost = async (postId) => {
    if (!user) return { success: false }
    try {
      const { data: success } = await supabase.rpc('spend_points', {
        p_user_id: user.id, p_points: 100, p_reason: 'Boost post 24h',
      })
      if (success) {
        await supabase.from('posts').update({
          is_boosted: true,
          boosted_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }).eq('id', postId)
        await fetchPosts()
      }
      return { success }
    } catch (err) {
      return { success: false, error: err }
    }
  }

  const sharePost = async (postId) => {
    if (!user) return { success: false }
    try {
      // Copie simple du lien — AUCUN CP crédité ici.
      // La récompense de partage se gagne via la mission "Partager en story" avec preuve.
      const post = posts.find(p => p.id === postId)
      const shareUrl = post?.link_url || post?.profiles?.shop_url || `${window.location.origin}/u/${post?.profiles?.username || ''}`
      try { await navigator.clipboard.writeText(shareUrl) } catch (e) {}
      return { success: true, url: shareUrl }
    } catch (err) {
      console.error('sharePost error:', err)
      return { success: false }
    }
  }

  const deletePost = async (postId) => {
    if (!user) return { error: 'Non connecté' }
    try {
      const { error } = await supabase
        .from('posts').delete()
        .eq('id', postId).eq('user_id', user.id) // sécurité : seulement ses propres posts
      if (error) return { error }
      setPosts(prev => prev.filter(p => p.id !== postId))
      return { success: true }
    } catch (err) {
      return { error: err }
    }
  }

  // Recharger le budget de soutien d'un post existant (escrow)
  const fundPost = async (postId, amount) => {
    if (!user || !amount || amount <= 0) return { success: false }
    try {
      const { data } = await supabase.rpc('fund_post', { p_post_id: postId, p_amount: amount })
      if (data) await fetchPosts()
      return { success: !!data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return {
    posts, myPosts, loading,
    createPost, likePost, favoritePost, addComment, boostPost, deletePost, sharePost, fundPost,
    fetchPosts, fetchMyPosts,
  }
}
