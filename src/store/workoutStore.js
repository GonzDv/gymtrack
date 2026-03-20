import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { db } from '../lib/db';
import { syncPendingItems } from '../lib/syncService';

export const useWorkoutStore = create((set, get) => ({
	todayLog: null,
	history: [],
	pr: null,
	loading: false,

	fetchExerciseData: async (exerciseId) => {
		set({ loading: true, todayLog: null, history: [], pr: null });

		const today = new Date().toISOString().split('T')[0];

		// Primero intenta cargar desde Supabase
		try {
			const { data: todayData } = await supabase
				.from('workout_logs')
				.select('*')
				.eq('exercise_id', exerciseId)
				.eq('logged_at', today)
				.maybeSingle();

			const { data: historyData } = await supabase
				.from('workout_logs')
				.select('*')
				.eq('exercise_id', exerciseId)
				.order('logged_at', { ascending: false })
				.limit(10);

			// Guarda en Dexie para acceso offline
			if (todayData) {
				await db.workout_logs.put({ ...todayData, synced: 1 });
			}
			if (historyData) {
				for (const log of historyData) {
					await db.workout_logs.put({ ...log, synced: 1 });
				}
			}

			let pr = null;
			if (historyData) {
				historyData.forEach((log) => {
					log.sets.forEach((s) => {
						if (s.weight && (!pr || s.weight > pr))
							pr = s.weight;
					});
				});
			}

			set({
				todayLog: todayData || null,
				history: historyData || [],
				pr,
				loading: false,
			});
		} catch (err) {
			// Sin internet — carga desde Dexie
			console.log('Offline — cargando desde Dexie');

			const todayLocal = await db.workout_logs
				.where('exercise_id')
				.equals(exerciseId)
				.and((log) => log.logged_at === today)
				.first();

			const historyLocal = await db.workout_logs
				.where('exercise_id')
				.equals(exerciseId)
				.reverse()
				.limit(10)
				.toArray();

			let pr = null;
			historyLocal.forEach((log) => {
				const sets =
					typeof log.sets === 'string'
						? JSON.parse(log.sets)
						: log.sets;
				sets.forEach((s) => {
					if (s.weight && (!pr || s.weight > pr))
						pr = s.weight;
				});
			});

			set({
				todayLog: todayLocal || null,
				history: historyLocal,
				pr,
				loading: false,
			});
		}
	},

	saveLog: async (exerciseId, sets, notes = '') => {
		const today = new Date().toISOString().split('T')[0];
		const { todayLog } = get();

		let userId;
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			userId = user.id;
		} catch {
			// Offline — usa el id del log existente si hay
			userId = todayLog?.user_id;
		}

		const logData = {
			id: todayLog?.id ?? crypto.randomUUID(),
			user_id: userId,
			exercise_id: exerciseId,
			logged_at: today,
			sets,
			notes,
		};

		// Guarda en Dexie SIEMPRE — con o sin internet
		await db.workout_logs.put({ ...logData, synced: 0 });
		set({ todayLog: logData });

		// Intenta sincronizar con Supabase
		try {
			const { data, error } = await supabase
				.from('workout_logs')
				.upsert(logData)
				.select()
				.single();

			if (!error) {
				// Sincronizado — marca como synced en Dexie
				await db.workout_logs
					.where('id')
					.equals(logData.id)
					.modify({ synced: 1 });
				set({ todayLog: data });
			} else {
				// Error de Supabase — encola para después
				await db.sync_queue.add({
					table_name: 'workout_logs',
					operation: 'upsert',
					payload: logData,
					created_at: new Date().toISOString(),
				});
			}
		} catch {
			// Sin internet — encola para cuando vuelva la conexión
			console.log(
				'Offline — guardado localmente, se sincronizará después',
			);
			await db.sync_queue.add({
				table_name: 'workout_logs',
				operation: 'upsert',
				payload: logData,
				created_at: new Date().toISOString(),
			});
		}

		// Recalcula PR
		let pr = null;
		sets.forEach((s) => {
			if (s.weight && (!pr || s.weight > pr)) pr = s.weight;
		});
		const { pr: currentPr } = get();
		if (currentPr && currentPr > pr) pr = currentPr;
		set({ pr });

		return { error: null };
	},

	tips: [],
	tipsLoading: false,

	fetchTips: async (exerciseId, exerciseName, muscleGroup) => {
		set({ tipsLoading: true, tips: [] });
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

		if (!error && data?.tips) set({ tips: data.tips });
		set({ tipsLoading: false });
	},
}));
