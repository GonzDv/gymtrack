import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const MUSCLE_GROUPS = [
	'Todos',
	'Pecho',
	'Espalda',
	'Hombro',
	'Bíceps',
	'Tríceps',
	'Pierna',
	'Core',
];

export const useExerciseStore = create((set, get) => ({
	exercises: [],
	loading: false,
	searchQuery: '',
	activeFilter: 'Todos',
	muscleGroups: MUSCLE_GROUPS,

	// Carga todos los ejercicios (predefinidos + propios del usuario)
	fetchExercises: async () => {
		set({ loading: true });
		const { data, error } = await supabase
			.from('exercises')
			.select('*')
			.order('name');
		if (!error) set({ exercises: data });
		set({ loading: false });
	},

	setSearchQuery: (query) => set({ searchQuery: query }),
	setActiveFilter: (filter) => set({ activeFilter: filter }),

	// Ejercicios filtrados por búsqueda y grupo muscular
	getFilteredExercises: () => {
		const { exercises, searchQuery, activeFilter } = get();
		return exercises.filter((ex) => {
			const matchesSearch = ex.name
				.toLowerCase()
				.includes(searchQuery.toLowerCase());
			const matchesFilter =
				activeFilter === 'Todos' ||
				ex.muscle_group === activeFilter;
			return matchesSearch && matchesFilter;
		});
	},

	// Crea un ejercicio personalizado
	createExercise: async (name, muscleGroup) => {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		const { data, error } = await supabase
			.from('exercises')
			.insert({
				name,
				muscle_group: muscleGroup,
				is_predefined: false,
				created_by: user.id,
			})
			.select()
			.single();
		if (!error) {
			set((state) => ({ exercises: [...state.exercises, data] }));
		}
		return { error };
	},

	deleteExercise: async (id) => {
		const { error } = await supabase
			.from('exercises')
			.delete()
			.eq('id', id);
		if (!error) {
			set((state) => ({
				exercises: state.exercises.filter((ex) => ex.id !== id),
			}));
		}
		return { error };
	},
}));
