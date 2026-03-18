import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set) => ({
	session: null,
	user: null,
	loading: true,

	// Se llama una vez al arrancar la app — revisa si ya hay sesión activa
	initialize: async () => {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		set({ session, user: session?.user ?? null, loading: false });

		// Escucha cambios de sesión en tiempo real (login, logout, expiración)
		supabase.auth.onAuthStateChange((_event, session) => {
			set({ session, user: session?.user ?? null });
		});
	},

	signUp: async (email, password, name) => {
		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { name },
			},
		});
		return { error };
	},

	signIn: async (email, password) => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		return { error };
	},

	signOut: async () => {
		await supabase.auth.signOut();
		set({ session: null, user: null });
	},
}));
