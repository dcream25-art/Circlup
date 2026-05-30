import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function usePosts() {
  const { user } = useAuth()
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
    // Écoute les nouveaux posts en temps réel
    const channel = supabase
      .channel('posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, payload => {
        setPosts(prev => [payload.new, ...prev])
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select(`*, profiles(name, shop_name, avatar_color), missions(mission_type, user_id)`)
      .order('created_at', { ascending: false })
      .limit(20)
    setPosts(data || [])
    setLoading(false)
  }

  const createPost = async ({ product, price, story, ask, tags }) => {
    // Calcule le score du post
    const words = story.trim().split(/\s+/).length
    let score = 30
    if (words >= 50)  score += 20
    if (words >= 100) score += 10
    if (words >= 150) score += 10
    if (price)        score += 10
    if (ask)          score += 15
    if (tags?.length) score += 5
    score = Math.min(score, 100)

    const { data, error } = await supabase.from('posts').insert({
      user_id: user.id,
      product,
      price,
      story,
      ask,
      tags,
      score,
    }).select().single()

    // Crédite les CP pour la publication
    if (!error) await addCp(user.id, 20, 'Post publié')

    return { data, error }
  }

  const doMission = async (postId, missionType, cpAmount) => {
    // Vérifie si la mission est déjà faite
    const { data: existing } = await supabase
      .from('missions')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .eq('mission_type', missionType)
      .single()

    if (existing) return { error: 'Mission déjà complétée' }

    // Enregistre la mission
    const { error } = await supabase.from('missions').insert({
      post_id: postId,
      user_id: user.id,
      mission_type: missionType,
      cp_earned: cpAmount,
    })

    if (!error) {
      // Crédite les CP à celui qui fait la mission
      await addCp(user.id, cpAmount, `Mission: ${missionType}`)
      // Met à jour les stats du post
      await supabase.rpc('increment_post_stat', { post_id: postId, stat_name: missionType })
      // Notifie le propriétaire du post
      await createNotification(postId, missionType)
    }

    return { error }
  }

  const likePost = async (postId) => {
    const { data: existing } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      await supabase.from('likes').delete().eq('id', existing.id)
      await supabase.rpc('decrement_post_likes', { post_id: postId })
    } else {
      await supabase.from('likes').insert({ post_id: postId, user_id: user.id })
      await supabase.rpc('increment_post_likes', { post_id: postId })
      await addCp(user.id, 2, 'Like reçu')
    }

    fetchPosts()
  }

  return { posts, loading, createPost, doMission, likePost, fetchPosts }
}

// ─── Fonctions utilitaires ────────────────────────────────────────

export async function addCp(userId, amount, reason) {
  await supabase.rpc('add_cp', { user_id: userId, amount, reason })
}

async function createNotification(postId, missionType) {
  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single()

  if (post) {
    await supabase.from('notifications').insert({
      user_id: post.user_id,
      type: missionType,
      post_id: postId,
      message: `Quelqu'un a fait une mission "${missionType}" sur ton post !`
    })
  }
}
