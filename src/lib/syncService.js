import { db } from './db';
import { supabase } from './supabase';

// Intenta sincronizar todos los items pendientes en la cola
export async function syncPendingItems() {
	const pending = await db.sync_queue.toArray();
	if (pending.length === 0) return;

	for (const item of pending) {
		try {
			if (item.operation === 'upsert') {
				const { error } = await supabase
					.from(item.table_name)
					.upsert(item.payload);

				if (!error) {
					// Sincronizado exitosamente — elimina de la cola
					await db.sync_queue.delete(item.id);
					// Marca el log local como sincronizado
					if (item.table_name === 'workout_logs') {
						await db.workout_logs
							.where('id')
							.equals(item.payload.id)
							.modify({ synced: 1 });
					}
				}
			}
		} catch (err) {
			console.log('Sync failed for item:', item.id, err);
		}
	}
}

// Escucha cuando vuelve la conexión y sincroniza automáticamente
export function startSyncListener() {
	window.addEventListener('online', async () => {
		console.log('Conexión restaurada — sincronizando...');
		await syncPendingItems();
	});
}
