import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { exerciseId, exerciseName, muscleGroup } = await req.json()

    // Crea cliente Supabase con el service role para saltarse RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verifica si ya existen tips para este ejercicio
    const { data: existing } = await supabase
      .from('exercise_tips')
      .select('tips')
      .eq('exercise_id', exerciseId)
      .maybeSingle()

    if (existing) {
      return new Response(JSON.stringify({ tips: existing.tips }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Llama a la API de Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Eres un entrenador personal experto. Dame exactamente 4 tips cortos y prácticos para ejecutar correctamente el ejercicio "${exerciseName}" (grupo muscular: ${muscleGroup}).

Responde ÚNICAMENTE con un array JSON, sin texto adicional, sin markdown, sin explicaciones. Ejemplo de formato:
["Tip 1 aquí", "Tip 2 aquí", "Tip 3 aquí", "Tip 4 aquí"]`
        }]
      })
    })

    const aiData = await response.json()
    const tipsText = aiData.content[0].text.trim()
    const tips = JSON.parse(tipsText)

    // Guarda los tips en Supabase para no regenerarlos
    await supabase
      .from('exercise_tips')
      .insert({ exercise_id: exerciseId, tips })

    return new Response(JSON.stringify({ tips }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})


