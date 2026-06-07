import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function usePoints() {
  const { user, fetchProfile } = useAuth()
  const [pointsHistory, setPointsHistory] = useState([])
  const [hasOpenedChestToday, setHasOpenedChestToday] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchHistory = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      setPointsHistory(data || [])
    } catch (err) {
      console.error('fetchHistory error:', err)
    }
  }, [user])

  const checkChest = useCallback(async () => {
    if (!user) return
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('daily_chest')
        .select('id')
        .eq('user_id', user.id)
        .eq('opened_at', today)
        .maybeSingle()
      setHasOpenedChestToday(!!data)
    } catch (err) {
      console.error('checkChest error:', err)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchHistory()
      checkChest()
    }
  }, [user, fetchHistory, checkChest])

  const openDailyChest = async () => {
    if (!user) return { reward: -1, error: 'Non connecté' }
    setLoading(true)
    try {
      const { data: reward, error } = await supabase.rpc('open_daily_chest', {
        p_user_id: user.id,
      })
      if (error) return { reward: -1, error: error.message }

      if (reward > 0) {
        setHasOpenedChestToday(true)
        await fetchHistory()
        await fetchProfile(user.id)
      }
      return { reward }
    } catch (err) {
      return { reward: -1, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const spendPoints = async (amount, reason) => {
    if (!user) return { success: false }
    try {
      const { data: success } = await supabase.rpc('spend_points', {
        p_user_id: user.id,
        p_points: amount,
        p_reason: reason,
      })
      if (success) {
        await fetchHistory()
        await fetchProfile(user.id)
      }
      return { success: !!success }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return {
    pointsHistory,
    hasOpenedChestToday,
    loading,
    openDailyChest,
    spendPoints,
    fetchHistory,
  }
}
