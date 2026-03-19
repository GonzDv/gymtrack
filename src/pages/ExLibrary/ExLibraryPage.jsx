import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExerciseStore } from '../../store/exerciseStore';
import BottomNav from '../../components/bottomNav';
import { useRoutineStore, DAY_NAMES } from '../../store/routineStore'

export default function LibraryPage() {
	const navigate = useNavigate();
	const {
		loading,
		searchQuery,
		activeFilter,
		muscleGroups,
		fetchExercises,
		setSearchQuery,
		setActiveFilter,
		getFilteredExercises,
	} = useExerciseStore();

	const [selectedExercise, setSelectedExercise] = useState(null)
	const [addingDay, setAddingDay] = useState(null)
	const [dayFeedback, setDayFeedback] = useState('')

	const { addToRoutine } = useRoutineStore()

	const [showNewForm, setShowNewForm] = useState(false);
	const [newName, setNewName] = useState('');
	const [newMuscle, setNewMuscle] = useState('Pecho');
	const [creating, setCreating] = useState(false);

	const { createExercise } = useExerciseStore();
	const filtered = getFilteredExercises();

	useEffect(() => {
		fetchExercises();
	}, []);

	const handleCreate = async (e) => {
		e.preventDefault();
		if (!newName.trim()) return;
		setCreating(true);
		await createExercise(newName.trim(), newMuscle);
		setNewName('');
		setNewMuscle('Pecho');
		setShowNewForm(false);
		setCreating(false);
	};

	return (
		<div className='min-h-screen bg-white md:bg-gray-50'>
			{/* Contenido centrado */}
			<div className='md:max-w-5xl md:mx-auto md:bg-white md:min-h-screen md:shadow-sm'>
				{/* Header */}
				<header className='px-5 pt-5 pb-3 flex justify-between items-center'>
					<div className='flex items-center gap-3'>
						<button
							onClick={() => navigate('/')}
							className='text-gray-400 hover:text-gray-900 transition'
						>
							←
						</button>
						<h1 className='text-xl font-bold text-gray-900'>
							Biblioteca
						</h1>
					</div>
					<button
						onClick={() => setShowNewForm(!showNewForm)}
						className='bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-800 transition'
					>
						+ Nuevo
					</button>
				</header>

				<main className='px-5 pb-24 flex flex-col gap-4'>
					{/* Formulario nuevo ejercicio */}
					{showNewForm && (
						<form
							onSubmit={handleCreate}
							className='border border-gray-200 rounded-2xl p-4 flex flex-col gap-3'
						>
							<p className='text-sm font-semibold text-gray-900'>
								Nuevo ejercicio
							</p>
							<input
								type='text'
								value={newName}
								onChange={(e) =>
									setNewName(e.target.value)
								}
								placeholder='Nombre del ejercicio'
								className='w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition'
							/>
							<select
								value={newMuscle}
								onChange={(e) =>
									setNewMuscle(
										e.target.value,
									)
								}
								className='w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 transition'
							>
								{muscleGroups
									.filter(
										(g) =>
											g !== 'Todos',
									)
									.map((g) => (
										<option
											key={g}
											value={g}
										>
											{g}
										</option>
									))}
							</select>
							<div className='flex gap-2'>
								<button
									type='button'
									onClick={() =>
										setShowNewForm(
											false,
										)
									}
									className='flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition'
								>
									Cancelar
								</button>
								<button
									type='submit'
									disabled={
										creating ||
										!newName.trim()
									}
									className='flex-1 bg-gray-900 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50'
								>
									{creating
										? 'Guardando...'
										: 'Guardar'}
								</button>
							</div>
						</form>
					)}

					{/* Buscador */}
					<div className='relative'>
						<svg
							className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
							strokeWidth={2}
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z'
							/>
						</svg>
						<input
							type='text'
							value={searchQuery}
							onChange={(e) =>
								setSearchQuery(e.target.value)
							}
							placeholder='Buscar ejercicio...'
							className='w-full bg-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition'
						/>
					</div>

					{/* Filtros */}
					<div className='flex gap-2 overflow-x-auto pb-1 scrollbar-hide'>
						{muscleGroups.map((group) => (
							<button
								key={group}
								onClick={() =>
									setActiveFilter(group)
								}
								className={`
                  shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition
                  ${
				activeFilter === group
					? 'bg-gray-900 text-white'
					: 'bg-gray-100 text-gray-500 hover:bg-gray-200'
			}
                `}
							>
								{group}
							</button>
						))}
					</div>

					{/* Lista de ejercicios */}
					{loading ? (
						<p className='text-sm text-gray-400 text-center py-8'>
							Cargando...
						</p>
					) : filtered.length === 0 ? (
						<p className='text-sm text-gray-400 text-center py-8'>
							No se encontraron ejercicios
						</p>
					) : (
						<div className='flex flex-col'>
							{filtered.map((exercise, index) => (
								<div
									key={exercise.id}
									className={`
                    flex items-center justify-between py-4
                    ${index !== filtered.length - 1 ? 'border-b border-gray-100' : ''}
                  `}
								>
									<div className='flex flex-col justify-center items-start gap-3'>
										<p className='text-sm font-semibold text-gray-900'>
											{
												exercise.name
											}
										</p>
										<p className='text-xs font-medium text-gray-400 uppercase tracking-wide'>
											{
												exercise.muscle_group
											}
										</p>
									</div>
									<div className='flex flex-col justify-center items-center gap-3'>
										{selectedExercise?.id === exercise.id && (
											<div className='pb-3 flex flex-col justify-center items-center gap-2'>
												<p className='text-xs text-gray-400'>Agregar a:</p>
												<div className='flex flex-wrap gap-2'>
													{DAY_NAMES.map((day, index) => (
														<button
															key={day}
															disabled={addingDay === index}
															onClick={async () => {
																setAddingDay(index)
																const { error } = await addToRoutine(exercise.id, index)
																setAddingDay(null)
																if (error) {
																	setDayFeedback(error.message)
																} else {
																	setDayFeedback(`✓ Agregado al ${day}`)
																	setTimeout(() => {
																		setSelectedExercise(null)
																		setDayFeedback('')
																	}, 1500)
																}
															}}
															className={`
																px-3 py-1.5 rounded-full text-xs font-medium transition
																${addingDay === index
																	? 'bg-gray-200 text-gray-400'
																	: 'bg-gray-100 text-gray-700 hover:bg-gray-900 hover:text-white'
																}
															`}
														>
															{addingDay === index ? '...' : day}
														</button>
													))}
												</div>
												{dayFeedback && (
													<p className={`text-xs ${dayFeedback.startsWith('✓') ? 'text-green-500' : 'text-red-400'}`}>
														{dayFeedback}
													</p>
												)}
											</div>
										)}
										<button
											onClick={(e) => {
												e.stopPropagation()
												setSelectedExercise(
													selectedExercise?.id === exercise.id ? null : exercise
												)
												setDayFeedback('')
											}}
											className='w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-700 transition flex-shrink-0'
										>
											<span className='text-white text-lg leading-none'>+</span>
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</main>
			</div>

			<BottomNav />
		</div>
	);
}
