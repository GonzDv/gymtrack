import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkoutStore } from '../../store/workoutStore';
import { useExerciseStore } from '../../store/exerciseStore';

export default function WorkoutPage() {
	const { exerciseId } = useParams();
	const navigate = useNavigate();

	const { todayLog, history, pr, fetchExerciseData, saveLog } =
		useWorkoutStore();
	const { exercises, fetchExercises } = useExerciseStore();

	const exercise = exercises.find((e) => e.id === exerciseId);

	const [sets, setSets] = useState([]);
	const [notes, setNotes] = useState('');
	const [newWeight, setNewWeight] = useState('');
	const [newReps, setNewReps] = useState('');
	const [saving, setSaving] = useState(false);
	const [savedFeedback, setSavedFeedback] = useState(false);

	useEffect(() => {
		fetchExerciseData(exerciseId);
		if (exercises.length === 0) fetchExercises();
	}, [exerciseId, exercises.length, fetchExerciseData, fetchExercises]);

	// Cuando carga el log de hoy, rellena los sets y notas
	useEffect(() => {
		if (todayLog) {
			setSets(todayLog.sets || []);
			setNotes(todayLog.notes || '');
		} else {
			setSets([]);
			setNotes('');
		}
	}, [todayLog]);

	// Calcula el PR de la sesión actual
	//const sessionPr = sets.reduce((max, s) => {
	//return s.weight > max ? s.weight : max;
	//}, 0);

	// Una serie es PR si supera el PR histórico previo
	const isNewPr = (weight) => {
		const historicalPr = history.length > 0 ? pr : null;
		return historicalPr ? weight > historicalPr : false;
	};

	const handleAddSet = () => {
		const weight = parseFloat(newWeight);
		const reps = parseInt(newReps);
		if (!weight || !reps) return;

		const newSet = { weight, reps };
		const updatedSets = [...sets, newSet];
		setSets(updatedSets);
		setNewWeight('');
		setNewReps('');
		handleSave(updatedSets, notes);
	};

	const handleRemoveSet = (index) => {
		const updatedSets = sets.filter((_, i) => i !== index);
		setSets(updatedSets);
		handleSave(updatedSets, notes);
	};

	const handleNotesBlur = () => {
		handleSave(sets, notes);
	};

	const handleSave = useCallback(
		async (currentSets, currentNotes) => {
			setSaving(true);
			await saveLog(exerciseId, currentSets, currentNotes);
			setSaving(false);
			setSavedFeedback(true);
			setTimeout(() => setSavedFeedback(false), 2000);
		},
		[exerciseId, saveLog],
	);

	return (
		<div className='min-h-screen bg-white md:bg-gray-50'>
			<div className='md:max-w-5xl md:mx-auto md:bg-white md:min-h-screen md:shadow-sm'>
				{/* Header */}
				<header className='px-5 pt-5 pb-4 border-b border-gray-100'>
					<button
						onClick={() => navigate(-1)}
						className='text-gray-400 hover:text-gray-900 transition mb-3 block'
					>
						←
					</button>
					<h1 className='text-2xl font-bold text-gray-900'>
						{exercise?.name ?? 'Ejercicio'}
					</h1>
					<p className='text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1'>
						{exercise?.muscle_group}
					</p>
				</header>

				<main className='px-5 pb-24 flex flex-col gap-6 pt-5'>
					{/* PR Banner */}
					<div className='bg-gray-50 rounded-2xl px-5 py-4 flex items-center justify-between'>
						<div className='flex items-center gap-3'>
							<span className='text-xl'>🏆</span>
							<p className='text-xs font-semibold text-gray-400 uppercase tracking-widest'>
								Mejor marca
							</p>
						</div>
						<p className='text-2xl font-bold text-gray-900'>
							{pr ? `${pr} kg` : '—'}
						</p>
					</div>

					{/* Series de hoy */}
					<section className='flex flex-col gap-3'>
						<div className='flex items-center justify-between'>
							<p className='text-xs font-semibold text-gray-400 uppercase tracking-widest'>
								Series de hoy
							</p>
							{saving && (
								<p className='text-xs text-gray-400'>
									Guardando...
								</p>
							)}
							{savedFeedback && !saving && (
								<p className='text-xs text-green-500'>
									Guardado ✓
								</p>
							)}
						</div>

						{/* Cabecera de columnas */}
						{sets.length > 0 && (
							<div className='grid grid-cols-[40px_1fr_1fr_32px] gap-2 px-1'>
								<p className='text-xs font-semibold text-gray-400 uppercase'>
									Serie
								</p>
								<p className='text-xs font-semibold text-gray-400 uppercase'>
									Kg
								</p>
								<p className='text-xs font-semibold text-gray-400 uppercase'>
									Reps
								</p>
								<span />
							</div>
						)}

						{/* Filas de series */}
						{sets.length === 0 ? (
							<p className='text-sm text-gray-300 text-center py-4'>
								Agrega tu primera serie
							</p>
						) : (
							<div className='flex flex-col'>
								{sets.map((set, index) => {
									const isPr = isNewPr(
										set.weight,
									);
									return (
										<div
											key={index}
											className={`
                        grid grid-cols-[40px_1fr_1fr_32px] gap-2 items-center py-3 px-1
                        ${index !== sets.length - 1 ? 'border-b border-gray-100' : ''}
                        ${isPr ? 'border-l-2 border-l-green-400 pl-3 bg-green-50 rounded-r-xl' : ''}
                      `}
										>
											<div className='flex items-center gap-1.5'>
												<span className='text-sm font-semibold text-gray-900'>
													{index +
														1}
												</span>
												{isPr && (
													<span className='text-xs font-bold text-green-500'>
														PR
													</span>
												)}
											</div>
											<span className='text-sm font-semibold text-gray-900'>
												{
													set.weight
												}
											</span>
											<span className='text-sm font-semibold text-gray-900'>
												{
													set.reps
												}
											</span>
											<button
												onClick={() =>
													handleRemoveSet(
														index,
													)
												}
												className='text-gray-300 hover:text-red-400 transition flex items-center justify-center'
											>
												<svg
													className='w-4 h-4'
													fill='none'
													viewBox='0 0 24 24'
													stroke='currentColor'
													strokeWidth={
														1.5
													}
												>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.021-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
													/>
												</svg>
											</button>
										</div>
									);
								})}
							</div>
						)}

						{/* Fila para agregar serie */}
						<div className='grid grid-cols-[1fr_1fr_auto] gap-2 items-end mt-1'>
							<div className='flex flex-col gap-1'>
								<label className='text-xs font-semibold text-gray-400 uppercase'>
									Kg
								</label>
								<input
									type='number'
									value={newWeight}
									onChange={(e) =>
										setNewWeight(
											e.target
												.value,
										)
									}
									placeholder='0'
									min='0'
									className='w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition'
								/>
							</div>
							<div className='flex flex-col gap-1'>
								<label className='text-xs font-semibold text-gray-400 uppercase'>
									Reps
								</label>
								<input
									type='number'
									value={newReps}
									onChange={(e) =>
										setNewReps(
											e.target
												.value,
										)
									}
									placeholder='0'
									min='0'
									className='w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition'
								/>
							</div>
							<button
								onClick={handleAddSet}
								disabled={
									!newWeight || !newReps
								}
								className='bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed'
							>
								+ Serie
							</button>
						</div>
					</section>

					{/* Notas */}
					<section className='flex flex-col gap-2'>
						<p className='text-xs font-semibold text-gray-400 uppercase tracking-widest'>
							Notas
						</p>
						<textarea
							value={notes}
							onChange={(e) =>
								setNotes(e.target.value)
							}
							onBlur={handleNotesBlur}
							placeholder='Anotaciones de la sesión...'
							rows={3}
							className='w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition resize-none'
						/>
					</section>

					{/* Historial reciente */}
					{history.length > 0 && (
						<section className='flex flex-col gap-3'>
							<p className='text-xs font-semibold text-gray-400 uppercase tracking-widest'>
								Historial reciente
							</p>
							<div className='flex flex-col'>
								{history
									.slice(0, 5)
									.map((log, index) => {
										const maxWeight =
											Math.max(
												...log.sets.map(
													(
														s,
													) =>
														s.weight,
												),
											);
										const totalSets =
											log.sets
												.length;
										return (
											<div
												key={
													log.id
												}
												className={`
                        flex items-center justify-between py-3
                        ${index !== Math.min(history.length, 5) - 1 ? 'border-b border-gray-100' : ''}
                      `}
											>
												<div>
													<p className='text-sm font-semibold text-gray-900'>
														{new Date(
															log.logged_at,
														).toLocaleDateString(
															'es-MX',
															{
																day: 'numeric',
																month: 'short',
																year: 'numeric',
															},
														)}
													</p>
													<p className='text-xs text-gray-400 mt-0.5'>
														{
															totalSets
														}{' '}
														{totalSets ===
														1
															? 'serie'
															: 'series'}
													</p>
												</div>
												<p className='text-sm font-bold text-gray-900'>
													{
														maxWeight
													}{' '}
													kg
												</p>
											</div>
										);
									})}
							</div>
						</section>
					)}
				</main>
			</div>
		</div>
	);
}
