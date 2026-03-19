import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useWorkoutStore = create((set, get) => ({
	// Log de hoy para el ejercicio activo
	todayLog: null,
	// Historial completo del ejercicio (todas las sesiones)
	history: [],
	// PR del ejercicio (peso máximo histórico)
	pr: null,
	loading: false,
	tips: [],
	tipsLoading: false,

	fetchTips: async (exerciseId, exerciseName, muscleGroup) => {
		set({ tipsLoading: true, tips: [] });

		// ✅ Obtén el token de sesión del usuario
		const {
			data: { session },
		} = await supabase.auth.getSession();

		const { data, error } = await supabase.functions.invoke(
			'generate-tips',
			{
				body: { exerciseId, exerciseName, muscleGroup },
				headers: {
					Authorization: `Bearer ${session?.access_token}`,
				},
			},
		);

		if (!error && data?.tips) {
			set({ tips: data.tips });
		}

		set({ tipsLoading: false });
	},

	// Carga el log de hoy + historial + PR de un ejercicio
	fetchExerciseData: async (exerciseId) => {
		set({ loading: true, todayLog: null, history: [], pr: null });

		const today = new Date().toISOString().split('T')[0];

		// Log de hoy
		const { data: todayData } = await supabase
			.from('workout_logs')
			.select('*')
			.eq('exercise_id', exerciseId)
			.eq('logged_at', today)
			.maybeSingle();

		// Historial completo ordenado por fecha
		const { data: historyData } = await supabase
			.from('workout_logs')
			.select('*')
			.eq('exercise_id', exerciseId)
			.order('logged_at', { ascending: false })
			.limit(10);

		// Calcula el PR desde el historial
		let pr = null;
		if (historyData) {
			historyData.forEach((log) => {
				log.sets.forEach((set) => {
					if (set.weight && (!pr || set.weight > pr)) {
						pr = set.weight;
					}
				});
			});
		}

		set({
			todayLog: todayData || null,
			history: historyData || [],
			pr,
			loading: false,
		});
	},

	// Guarda o actualiza el log de hoy
	saveLog: async (exerciseId, sets, notes = '') => {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		const today = new Date().toISOString().split('T')[0];
		const { todayLog } = get();

		let result;

		if (todayLog) {
			// Actualiza el log existente de hoy
			result = await supabase
				.from('workout_logs')
				.update({ sets, notes })
				.eq('id', todayLog.id)
				.select()
				.single();
		} else {
			// Crea un nuevo log para hoy
			result = await supabase
				.from('workout_logs')
				.insert({
					user_id: user.id,
					exercise_id: exerciseId,
					logged_at: today,
					sets,
					notes,
				})
				.select()
				.single();
		}

		if (!result.error) {
			// Recalcula el PR
			let pr = null;
			result.data.sets.forEach((s) => {
				if (s.weight && (!pr || s.weight > pr)) pr = s.weight;
			});

			// Compara con PR histórico
			const { pr: currentPr } = get();
			if (currentPr && currentPr > pr) pr = currentPr;

			set({ todayLog: result.data, pr });
		}

		return { error: result.error };
	},
}));
