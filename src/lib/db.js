import Dexie from 'dexie';

export const db = new Dexie('gymtrack');

db.version(1).stores({
	// Logs de workout guardados localmente
	workout_logs: 'id, exercise_id, logged_at, synced',
	// Cola de operaciones pendientes de sincronizar
	sync_queue: '++id, table_name, operation, payload, created_at',
});
