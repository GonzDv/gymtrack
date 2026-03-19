import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useProfileStore, GOALS } from '../../store/profileStore'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/bottomNav'

function getInitials(user) {
  const name = user?.user_metadata?.name
  if (name) return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  return user?.email?.slice(0, 2).toUpperCase() ?? 'GT'
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const {
    profile, weightLogs, loading, saving,
    fetchProfile, saveProfile, logWeight, getBMI, getBMILabel
  } = useProfileStore()

  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [goal, setGoal] = useState('')
  const [newWeight, setNewWeight] = useState('')
  const [savedFeedback, setSavedFeedback] = useState(false)

  // Tips por objetivo
  const [goalTips, setGoalTips] = useState([])
  const [tipsLoading, setTipsLoading] = useState(false)

  const initials = getInitials(user)
  const bmi = getBMI()
  const bmiLabel = getBMILabel()

  useEffect(() => {
    fetchProfile()
  }, [])

  // Rellena el formulario cuando carga el perfil
  useEffect(() => {
    if (profile) {
      setWeight(profile.weight_kg ?? '')
      setHeight(profile.height_cm ?? '')
      setGoal(profile.goal ?? '')
    }
  }, [profile])

  // Genera tips cuando cambia el objetivo
  useEffect(() => {
    if (!goal) return
    fetchGoalTips(goal)
  }, [goal])

  const fetchGoalTips = async (selectedGoal) => {
    const { data: existing } = await supabase

    .from('goal_tips')
    .select('tips')
    .eq('user_id', user.id)
    .eq('goal', selectedGoal)
    .maybeSingle()

  if (existing) {
    // Ya existen — carga instantáneo sin llamar a Claude
    setGoalTips(existing.tips)
    setTipsLoading(false)
    return
  }
    setTipsLoading(true)
    setGoalTips([])

    const goalLabels = {
      perder_peso: 'perder peso',
      ganar_musculo: 'ganar músculo',
      mantener: 'mantener el peso actual',
      mejorar_resistencia: 'mejorar la resistencia cardiovascular',
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          messages: [{
            role: 'user',
            content: `Eres un entrenador personal y nutricionista experto. El usuario tiene como objetivo: ${goalLabels[selectedGoal]}.

                        Dame exactamente 6 tips prácticos y concretos divididos en estas categorías: ejercicio (2 tips), alimentación (2 tips), hidratación (1 tip) y descanso (1 tip).

                        Responde ÚNICAMENTE con un array JSON con exactamente 6 objetos, sin texto adicional, sin markdown. Formato:
                        [
                          {"categoria": "Ejercicio", "tip": "tip aquí"},
                          {"categoria": "Ejercicio", "tip": "tip aquí"},
                          {"categoria": "Alimentación", "tip": "tip aquí"},
                          {"categoria": "Alimentación", "tip": "tip aquí"},
                          {"categoria": "Hidratación", "tip": "tip aquí"},
                          {"categoria": "Descanso", "tip": "tip aquí"}
                        ]`
          }]
        })
      })

      const data = await response.json()
      const tips = JSON.parse(data.content[0].text.trim())
      setGoalTips(tips)

      // Guardar en el perfil
      await supabase
      .from('goal_tips')
      .insert({ user_id: user.id, goal: selectedGoal, tips })

      

    } catch (err) {
      console.error('Error fetching tips:', err)
    }

    setTipsLoading(false)
  }

  const handleSave = async () => {
    const { error } = await saveProfile({
      name: user?.user_metadata?.name,
      weight_kg: parseFloat(weight) || null,
      height_cm: parseInt(height) || null,
      goal: goal || null,
    })
    if (!error) {
      setSavedFeedback(true)
      setTimeout(() => setSavedFeedback(false), 2000)
    }
  }

  const handleLogWeight = async () => {
    if (!newWeight) return
    await logWeight(parseFloat(newWeight))
    setNewWeight('')
  }

  const CATEGORY_ICONS = {
    'Ejercicio': '💪',
    'Alimentación': '🥗',
    'Hidratación': '💧',
    'Descanso': '😴',
  }

  const CATEGORY_COLORS = {
    'Ejercicio': 'bg-blue-50 text-blue-700',
    'Alimentación': 'bg-green-50 text-green-700',
    'Hidratación': 'bg-cyan-50 text-cyan-700',
    'Descanso': 'bg-purple-50 text-purple-700',
  }

  return (
    <div className='min-h-screen bg-white md:bg-gray-50'>
      <div className='md:max-w-5xl md:mx-auto md:bg-white md:min-h-screen md:shadow-sm'>

        {/* Header */}
        <header className='px-5 pt-5 pb-3 flex items-center gap-3'>
          <button
            onClick={() => navigate('/')}
            className='text-gray-400 hover:text-gray-900 transition'
          >
            ←
          </button>
          <h1 className='text-xl font-bold text-gray-900'>Perfil</h1>
        </header>

        <main className='px-5 pb-24 flex flex-col gap-8'>

          {/* Avatar + info */}
          <section className='flex flex-col items-center gap-2 pt-4'>
            <div className='w-20 h-20 rounded-2xl border-2 border-gray-900 flex items-center justify-center'>
              <span className='text-2xl font-bold text-gray-900'>{initials}</span>
            </div>
            <div className='text-center'>
              <p className='text-xl font-bold text-gray-900'>
                {user?.user_metadata?.name || 'Usuario'}
              </p>
              <p className='text-sm text-gray-400'>{user?.email}</p>
            </div>
          </section>

          {/* Stats */}
          {(profile?.weight_kg || profile?.height_cm) && (
            <section className='grid grid-cols-3 gap-3'>
              <div className='bg-gray-50 rounded-2xl p-4 flex flex-col items-center gap-1'>
                <p className='text-2xl font-bold text-gray-900'>{profile?.weight_kg ?? '—'}</p>
                <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>kg</p>
                <p className='text-xs text-gray-400 uppercase tracking-widest'>Peso</p>
              </div>
              <div className='bg-gray-50 rounded-2xl p-4 flex flex-col items-center gap-1'>
                <p className='text-2xl font-bold text-gray-900'>{profile?.height_cm ?? '—'}</p>
                <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>cm</p>
                <p className='text-xs text-gray-400 uppercase tracking-widest'>Altura</p>
              </div>
              <div className='bg-gray-50 rounded-2xl p-4 flex flex-col items-center gap-1'>
                <p className='text-2xl font-bold text-gray-900'>{bmi ?? '—'}</p>
                <p className='text-xs text-gray-400 uppercase tracking-widest'>IMC</p>
                {bmiLabel && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 ${bmiLabel.color}`}>
                    {bmiLabel.label}
                  </span>
                )}
              </div>
            </section>
          )}

          {/* Objetivo */}
          <section className='flex flex-col gap-3'>
            <p className='text-xs font-semibold text-gray-400 uppercase tracking-widest'>
              Objetivo
            </p>
            <div className='flex flex-wrap gap-2'>
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium transition
                    ${goal === g.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </section>

          {/* Tips por objetivo */}
          {goal && (
            <section className='flex flex-col gap-3'>
              <p className='text-xs font-semibold text-gray-400 uppercase tracking-widest'>
                Tips para tu objetivo
              </p>

              {tipsLoading ? (
                <div className='flex items-center gap-2 py-2'>
                  <div className='w-3 h-3 rounded-full bg-gray-300 animate-pulse' />
                  <p className='text-sm text-gray-400'>Generando tips personalizados...</p>
                </div>
              ) : (
                <div className='flex flex-col gap-2'>
                  {goalTips.map((item, index) => (
                    <div
                      key={index}
                      className='flex items-start gap-3 p-4 bg-gray-50 rounded-2xl'
                    >
                      <span className='text-lg flex-shrink-0'>
                        {CATEGORY_ICONS[item.categoria] ?? '💡'}
                      </span>
                      <div>
                        <span className={`
                          text-xs font-semibold px-2 py-0.5 rounded-full mb-1 inline-block
                          ${CATEGORY_COLORS[item.categoria] ?? 'bg-gray-100 text-gray-600'}
                        `}>
                          {item.categoria}
                        </span>
                        <p className='text-sm text-gray-700 leading-relaxed mt-1'>
                          {item.tip}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Formulario editar */}
          <section className='flex flex-col gap-3'>
            <p className='text-xs font-semibold text-gray-400 uppercase tracking-widest'>
              Mis datos
            </p>
            <div className='grid grid-cols-2 gap-3'>
              <div className='flex flex-col gap-1'>
                <label className='text-xs text-gray-400 uppercase tracking-wide'>
                  Peso (kg)
                </label>
                <input
                  type='number'
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder='75'
                  className='w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition'
                />
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-xs text-gray-400 uppercase tracking-wide'>
                  Altura (cm)
                </label>
                <input
                  type='number'
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder='175'
                  className='w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition'
                />
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className='w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50'
            >
              {saving ? 'Guardando...' : savedFeedback ? '✓ Guardado' : 'Guardar cambios'}
            </button>
          </section>

          {/* Registrar peso hoy */}
          <section className='flex flex-col gap-3'>
            <p className='text-xs font-semibold text-gray-400 uppercase tracking-widest'>
              Registrar peso hoy
            </p>
            <div className='flex gap-2'>
              <input
                type='number'
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder='75.5'
                className='flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition'
              />
              <button
                onClick={handleLogWeight}
                disabled={!newWeight}
                className='bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-40'
              >
                Guardar
              </button>
            </div>
          </section>

          {/* Historial de peso */}
          {weightLogs.length > 0 && (
            <section className='flex flex-col gap-3'>
              <p className='text-xs font-semibold text-gray-400 uppercase tracking-widest'>
                Historial de peso
              </p>
              <div className='flex flex-col'>
                {weightLogs.map((log, index) => (
                  <div
                    key={log.id}
                    className={`
                      flex items-center justify-between py-3
                      ${index !== weightLogs.length - 1 ? 'border-b border-gray-100' : ''}
                    `}
                  >
                    <p className='text-sm text-gray-600'>
                      {new Date(log.logged_at).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <p className='text-sm font-bold text-gray-900'>{log.weight_kg} kg</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Cerrar sesión */}
          <button
            onClick={signOut}
            className='w-full border border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:text-red-400 hover:border-red-200 transition'
          >
            Cerrar sesión
          </button>

        </main>
      </div>
      <BottomNav />
    </div>
  )
}