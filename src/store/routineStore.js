import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// 0 = Lunes, 1 = Martes ... 6 = Domingo
export const DAY_NAMES = [
	'Lunes',
	'Martes',
	'Miércoles',
	'Jueves',
	'Viernes',
	'Sábado',
	'Domingo',
];
export const DAY_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const useRoutineStore = create((set, get) => ({
	routine: [], // array de { id, exercise_id, day_of_week, order_index, exercises: { name, muscle_group } }
	loading: false,

	fetchRoutine: async () => {
		set({ loading: true });
		const { data, error } = await supabase
			.from('routines')
			.select(
				`
        id,
        exercise_id,
        day_of_week,
        order_index,
        exercises ( name, muscle_group )
      `,
			)
			.order('day_of_week')
			.order('order_index');
		if (!error) set({ routine: data });
		set({ loading: false });
	},

	// Agrega un ejercicio a un día específico
	addToRoutine: async (exerciseId, dayOfWeek) => {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		// Verifica que no esté duplicado
		const { routine } = get();
		const exists = routine.some(
			(r) =>
				r.exercise_id === exerciseId &&
				r.day_of_week === dayOfWeek,
		);
		if (exists)
			return {
				error: { message: 'Este ejercicio ya está en ese día' },
			};

		const orderIndex = routine.filter(
			(r) => r.day_of_week === dayOfWeek,
		).length;

		const { data, error } = await supabase
			.from('routines')
			.insert({
				user_id: user.id,
				exercise_id: exerciseId,
				day_of_week: dayOfWeek,
				order_index: orderIndex,
			})
			.select(
				`
        id,
        exercise_id,
        day_of_week,
        order_index,
        exercises ( name, muscle_group )
      `,
			)
			.single();

		if (!error) {
			set((state) => ({ routine: [...state.routine, data] }));
		}
		return { error };
	},

	removeFromRoutine: async (routineId) => {
		// Actualiza la UI primero, sin esperar a Supabase
		set((state) => ({
			routine: state.routine.filter((r) => r.id !== routineId),
		}));

		const { error } = await supabase
			.from('routines')
			.delete()
			.eq('id', routineId);

		// Si falla, vuelve a cargar desde Supabase para restaurar el estado real
		if (error) {
			const { data } = await supabase
				.from('routines')
				.select(
					`id, exercise_id, day_of_week, order_index, exercises ( name, muscle_group )`,
				)
				.order('day_of_week')
				.order('order_index');
			if (data) set({ routine: data });
		}

		return { error };
	},

	// Retorna los ejercicios de un día específico
	getExercisesByDay: (dayOfWeek) => {
		return get().routine.filter((r) => r.day_of_week === dayOfWeek);
	},

	// Retorna los grupos musculares únicos de un día
	getMuscleGroupsByDay: (dayOfWeek) => {
		const exercises = get().routine.filter(
			(r) => r.day_of_week === dayOfWeek,
		);
		const groups = [
			...new Set(exercises.map((r) => r.exercises.muscle_group)),
		];
		return groups.join(',');
	},
}));
