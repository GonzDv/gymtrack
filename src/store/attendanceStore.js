import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAttendanceStore = create((set) => ({
  // Fechas en las que el usuario registró al menos una sesión
  // Formato: ['2026-03-18', '2026-03-17', ...]
  attendedDates: [],
  streak: 0,
  loading: false,

  fetchAttendance: async () => {
    set({ loading: true })

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const fromDate = thirtyDaysAgo.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('workout_logs')
      .select('logged_at')
      .gte('logged_at', fromDate)
      .order('logged_at', { ascending: false })

    if (error || !data) {
      set({ loading: false })
      return
    }

    const uniqueDates = [...new Set(data.map((log) => log.logged_at))]
    
    const streak = calculateStreak(uniqueDates)

    set({ attendedDates: uniqueDates, streak, loading: false })
  },
}))

function calculateStreak(dates) {
  if (dates.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  let current = new Date(today)

  while (true) {
    const dateStr = current.toISOString().split('T')[0]
    if (dates.includes(dateStr)) {
      streak++
      current.setDate(current.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}