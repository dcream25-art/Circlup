import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(false)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles!projects_user_id_fkey(id, name, username, avatar_url, avatar_color, shop_name),
          project_tiers(*),
          project_contributions(id, amount, status, user_id, is_anonymous, created_at, profiles(name, username, avatar_url, avatar_color))
        `)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      setProjects(data || [])
    } catch (err) {
      console.error('fetchProjects error:', err)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchProject = async (id) => {
    const { data } = await supabase
      .from('projects')
      .select(`
        *,
        profiles!projects_user_id_fkey(id, name, username, avatar_url, avatar_color, shop_name),
        project_tiers(*),
        project_contributions(id, amount, status, user_id, is_anonymous, message, created_at, profiles(name, username, avatar_url, avatar_color))
      `)
      .eq('id', id).single()
    return data
  }

  const createProject = async ({ title, story, imageUrl, category, goalAmount, deadline, tiers }) => {
    if (!user) return { error: 'Non connecté' }
    try {
      const { data: project, error } = await supabase.from('projects').insert({
        user_id: user.id,
        title, story, image_url: imageUrl || null, category: category || null,
        goal_amount: Number(goalAmount) || 0,
        deadline: deadline || null,
      }).select().single()
      if (error) return { error }

      // Paliers (contreparties)
      const validTiers = (tiers || []).filter(t => t.title && t.amount)
      if (validTiers.length) {
        await supabase.from('project_tiers').insert(
          validTiers.map((t, i) => ({
            project_id: project.id,
            title: t.title,
            description: t.description || null,
            amount: Number(t.amount) || 0,
            reward: t.reward || null,
            max_backers: t.maxBackers ? Number(t.maxBackers) : null,
            sort_order: i,
          }))
        )
      }
      await fetchProjects()
      return { data: project }
    } catch (err) {
      return { error: err }
    }
  }

  // STUB de paiement — enregistre une contribution puis la "confirme" directement.
  // ⚠️ À remplacer : créer une session Stripe Checkout côté backend, et confirmer via webhook.
  const contribute = async ({ projectId, tierId = null, amount, message = '', isAnonymous = false }) => {
    if (!user) return { error: 'Non connecté' }
    try {
      const { data: contrib, error } = await supabase.from('project_contributions').insert({
        project_id: projectId,
        user_id: user.id,
        tier_id: tierId,
        amount: Number(amount) || 0,
        message: message || null,
        is_anonymous: isAnonymous,
        status: 'pending',
      }).select().single()
      if (error) return { error }

      // === POINT D'INTÉGRATION STRIPE ===
      // Ici, en production : rediriger vers Stripe Checkout, puis le webhook appellera confirm_contribution.
      // En mode stub : on confirme immédiatement (paiement simulé).
      await supabase.rpc('confirm_contribution', { p_contribution_id: contrib.id })

      await fetchProjects()
      return { data: contrib, simulated: true }
    } catch (err) {
      return { error: err }
    }
  }

  const deleteProject = async (id) => {
    if (!user) return { error: 'Non connecté' }
    const { error } = await supabase.from('projects').delete().eq('id', id).eq('user_id', user.id)
    if (!error) setProjects(prev => prev.filter(p => p.id !== id))
    return { error }
  }

  return { projects, loading, fetchProjects, fetchProject, createProject, contribute, deleteProject }
}
