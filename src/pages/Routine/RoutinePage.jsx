import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	useRoutineStore,
	DAY_NAMES,
	DAY_SHORT,
} from '../../store/routineStore';
import { useExerciseStore } from '../../store/exerciseStore';
import BottomNav from '../../components/Navigation/bottomNav';

export default function RoutinePage() {
	const navigate = useNavigate();
	const {
		routine,
		loading,
		fetchRoutine,
		addToRoutine,
		removeFromRoutine,
	} = useRoutineStore();
	const { exercises, fetchExercises } = useExerciseStore();

	// Día activo — arranca en el día actual de la semana
	// getDay() retorna 0=Domingo, ajustamos a 0=Lunes
	const todayIndex = (new Date().getDay() + 6) % 7;
	const [activeDay, setActiveDay] = useState(todayIndex);
	const [showPicker, setShowPicker] = useState(false);
	const [pickerSearch, setPickerSearch] = useState('');
	const [addingId, setAddingId] = useState(null);
	const [feedback, setFeedback] = useState('');

	useEffect(() => {
		fetchRoutine();
		fetchExercises();
	}, []);

	const dayExercises = routine.filter((r) => r.day_of_week === activeDay);
	const muscleGroups = [
		...new Set(dayExercises.map((r) => r.exercises.muscle_group)),
	].join(' y ');

	// Ejercicios disponibles para agregar (que no estén ya en el día)
	const alreadyAdded = dayExercises.map((r) => r.exercise_id);
	const availableExercises = exercises.filter(
		(ex) =>
			!alreadyAdded.includes(ex.id) &&
			ex.name.toLowerCase().includes(pickerSearch.toLowerCase()),
	);

	const handleAdd = async (exerciseId) => {
		setAddingId(exerciseId);
		const { error } = await addToRoutine(exerciseId, activeDay);
		if (error) {
			setFeedback(error.message);
			setTimeout(() => setFeedback(''), 3000);
		} else {
			setShowPicker(false);
			setPickerSearch('');
		}
		setAddingId(null);
	};

	const handleRemove = async (routineId) => {
		await removeFromRoutine(routineId);
	};

	return (
		<div className='min-h-screen bg-white md:bg-gray-50'>
			<div className='md:max-w-5xl md:mx-auto md:bg-white md:min-h-screen md:shadow-sm'>
				{/* Header */}
				<header className='px-5 pt-5 pb-3 flex items-center gap-3'>
					<button
						onClick={() => navigate('/')}
						className='text-gray-400 hover:text-gray-900 transition'
					>
						←
					</button>
					<h1 className='text-xl font-bold text-gray-900'>
						Mi Rutina
					</h1>
				</header>

				<main className='px-5 pb-24 flex flex-col gap-5'>
					{/* Selector de días */}
					<div className='flex gap-1'>
						{DAY_SHORT.map((day, index) => (
							<button
								key={day}
								onClick={() => {
									setActiveDay(index);
									setShowPicker(false);
									setPickerSearch('');
								}}
								className={`
                  flex-1 py-2 rounded-full text-sm font-semibold transition
                  ${
				activeDay === index
					? 'bg-gray-900 text-white'
					: 'text-gray-400 hover:text-gray-600'
			}
                `}
							>
								{day}
							</button>
						))}
					</div>

					{/* Título del día */}
					<div>
						<h2 className='text-3xl font-bold text-gray-900'>
							{DAY_NAMES[activeDay]}
						</h2>
						{muscleGroups ? (
							<p className='text-base text-gray-400 mt-0.5'>
								{muscleGroups}
							</p>
						) : (
							<p className='text-base text-gray-400 mt-0.5'>
								Sin ejercicios aún
							</p>
						)}
					</div>

					{/* Feedback message */}
					{feedback && (
						<p className='text-xs text-red-400 -mt-2'>
							{feedback}
						</p>
					)}

					{/* Lista de ejercicios del día */}
					{loading ? (
						<p className='text-sm text-gray-400 py-4'>
							Cargando...
						</p>
					) : (
						<div className='flex flex-col'>
							{dayExercises.length === 0 &&
								!showPicker && (
									<p className='text-sm text-gray-300 py-4 text-center'>
										No hay ejercicios
										para este día
									</p>
								)}
							{dayExercises.map((item, index) => (
								<div
									key={item.id}
									className={`
                    flex items-center justify-between py-4
                    ${index !== dayExercises.length - 1 ? 'border-b border-gray-100' : ''}
                  `}
								>
									<div>
										<p className='text-sm font-bold text-gray-900'>
											{
												item
													.exercises
													.name
											}
										</p>
										<p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mt-0.5'>
											{
												item
													.exercises
													.muscle_group
											}
										</p>
									</div>
									<button
										onClick={() =>
											handleRemove(
												item.id,
											)
										}
										className='p-2 text-gray-300 hover:text-red-400 transition'
										title='Eliminar'
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
							))}
						</div>
					)}

					{/* Picker de ejercicios */}
					{showPicker && (
						<div className='border border-gray-200 rounded-2xl overflow-hidden'>
							<div className='p-3 border-b border-gray-100'>
								<input
									type='text'
									value={pickerSearch}
									onChange={(e) =>
										setPickerSearch(
											e.target
												.value,
										)
									}
									placeholder='Buscar ejercicio...'
									autoFocus
									className='w-full bg-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none'
								/>
							</div>
							<div className='max-h-56 overflow-y-auto'>
								{availableExercises.length ===
								0 ? (
									<p className='text-sm text-gray-400 text-center py-6'>
										No hay más
										ejercicios
										disponibles
									</p>
								) : (
									availableExercises.map(
										(ex, index) => (
											<button
												key={
													ex.id
												}
												onClick={() =>
													handleAdd(
														ex.id,
													)
												}
												disabled={
													addingId ===
													ex.id
												}
												className={`
                        w-full flex items-center justify-between px-4 py-3 text-left
                        hover:bg-gray-50 transition disabled:opacity-50
                        ${index !== availableExercises.length - 1 ? 'border-b border-gray-100' : ''}
                      `}
											>
												<div>
													<p className='text-sm font-semibold text-gray-900'>
														{
															ex.name
														}
													</p>
													<p className='text-xs text-gray-400 uppercase tracking-wide mt-0.5'>
														{
															ex.muscle_group
														}
													</p>
												</div>
												<span className='text-gray-400 text-lg'>
													+
												</span>
											</button>
										),
									)
								)}
							</div>
						</div>
					)}

					{/* Botón agregar ejercicio */}
					<button
						onClick={() => setShowPicker(!showPicker)}
						className='w-full border border-dashed border-gray-300 rounded-2xl py-4 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition'
					>
						{showPicker
							? '✕ Cancelar'
							: '+ Agregar ejercicio'}
					</button>
				</main>
			</div>
			<BottomNav />
		</div>
	);
}
