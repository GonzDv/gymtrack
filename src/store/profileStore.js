import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const GOAL_LABELS = {
  perder_peso: 'Perder peso',
  ganar_musculo: 'Ganar músculo',
  mantener: 'Mantener peso',
  mejorar_resistencia: 'Mejorar resistencia',
}

export const GOALS = Object.entries(GOAL_LABELS).map(([value, label]) => ({ value, label }))

export const useProfileStore = create((set, get) => ({
  profile: null,
  weightLogs: [],
  loading: false,
  saving: false,

  fetchProfile: async () => {
    set({ loading: true })
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    const { data: weightLogs } = await supabase
      .from('weight_logs')
      .select('*')
      .order('logged_at', { ascending: false })
      .limit(10)

    set({ profile, weightLogs: weightLogs || [], loading: false })
  },

  saveProfile: async (data) => {
    set({ saving: true })
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...data, updated_at: new Date().toISOString() })

    if (!error) set({ profile: { id: user.id, ...data } })
    set({ saving: false })
    return { error }
  },

  logWeight: async (weight) => {
    const { data: { user } } = await supabase.auth.getUser()
    const today = new Date().toISOString().split('T')[0]

    // Si ya hay un log de hoy lo actualiza
    const { weightLogs } = get()
    const todayLog = weightLogs.find((l) => l.logged_at === today)

    if (todayLog) {
      const { error } = await supabase
        .from('weight_logs')
        .update({ weight_kg: weight })
        .eq('id', todayLog.id)
      if (!error) {
        set((state) => ({
          weightLogs: state.weightLogs.map((l) =>
            l.id === todayLog.id ? { ...l, weight_kg: weight } : l
          )
        }))
      }
      return { error }
    }

    const { data, error } = await supabase
      .from('weight_logs')
      .insert({ user_id: user.id, weight_kg: weight, logged_at: today })
      .select()
      .single()

    if (!error) {
      set((state) => ({ weightLogs: [data, ...state.weightLogs] }))
      // Actualiza el peso actual en el perfil
      await supabase
        .from('profiles')
        .update({ weight_kg: weight })
        .eq('id', user.id)
    }
    return { error }
  },

  // Calcula el BMI
  getBMI: () => {
    const { profile } = get()
    if (!profile?.weight_kg || !profile?.height_cm) return null
    const heightM = profile.height_cm / 100
    return (profile.weight_kg / (heightM * heightM)).toFixed(1)
  },

  // Interpreta el BMI
  getBMILabel: () => {
    const bmi = get().getBMI()
    if (!bmi) return null
    if (bmi < 18.5) return { label: 'Bajo peso', color: 'text-blue-500' }
    if (bmi < 25) return { label: 'Peso normal', color: 'text-green-500' }
    if (bmi < 30) return { label: 'Sobrepeso', color: 'text-amber-500' }
    return { label: 'Obesidad', color: 'text-red-500' }
  },
}))