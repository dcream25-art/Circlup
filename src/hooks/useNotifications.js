import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      setNotifications(data || [])
      setUnreadCount((data || []).filter(n => !n.is_read).length)
    } catch (err) {
      console.error('fetchNotifications error:', err)
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    fetchNotifications()

    // Realtime : nouvelles notifications
    const channel = supabase
      .channel('notifications-' + user.id)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev])
        setUnreadCount(prev => prev + 1)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user, fetchNotifications])

  const markAsRead = async (notifId) => {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notifId)
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('markAsRead error:', err)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('markAllAsRead error:', err)
    }
  }

  return { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications }
}
