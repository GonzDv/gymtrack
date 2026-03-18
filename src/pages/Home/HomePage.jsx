import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
	useRoutineStore,
	DAY_NAMES,
	DAY_SHORT,
} from '../../store/routineStore';
import BottomNav from '../../components/Navigation/bottomNav';

function getInitials(user) {
	const name = user?.user_metadata?.name;
	if (name) {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
	return user?.email?.slice(0, 2).toUpperCase() ?? 'GT';
}

// Retorna el índice del día actual (0=Lunes ... 6=Domingo)
function getTodayIndex() {
	return (new Date().getDay() + 6) % 7;
}

// Calcula cuántos días consecutivos tiene la racha
function getActiveDays(routine) {
	return [...new Set(routine.map((r) => r.day_of_week))];
}

export default function HomePage() {
	const navigate = useNavigate();
	const { user, signOut } = useAuthStore();
	const { routine, fetchRoutine } = useRoutineStore();

	const initials = getInitials(user);
	const todayIndex = getTodayIndex();
	const activeDays = getActiveDays(routine);

	// Grupos musculares del día actual
	const todayExercises = routine.filter(
		(r) => r.day_of_week === todayIndex,
	);
	const todayMuscles = [
		...new Set(todayExercises.map((r) => r.exercises.muscle_group)),
	].join(' y ');

	const streak = activeDays.length;

	useEffect(() => {
		fetchRoutine();
	}, []);

	return (
		<div className='min-h-screen bg-white md:bg-gray-50'>
			{/* Navbar */}
			<nav className='bg-white border-b border-gray-100 px-5 py-4 md:px-0'>
				<div className='md:max-w-5xl md:mx-auto md:px-5 flex justify-between items-center'>
					<h1 className='text-base font-bold text-gray-900'>
						GymTrack
					</h1>
					<button
						onClick={signOut}
						className='w-9 h-9 rounded-full border-2 border-gray-900 flex items-center justify-center hover:bg-gray-50 transition'
						title='Cerrar sesión'
					>
						<span className='text-xs font-bold text-gray-900'>
							{initials}
						</span>
					</button>
				</div>
			</nav>

			<div className='md:max-w-5xl md:mx-auto md:bg-white md:min-h-screen md:shadow-sm'>
				<main className='px-5 flex flex-col gap-8 py-6 pb-24'>
					{/* Racha */}
					<section className='flex flex-col gap-3'>
						<p className='text-xs font-semibold text-gray-400 uppercase tracking-widest'>
							Racha
						</p>

						<div className='flex gap-2'>
							{DAY_SHORT.map((day, index) => (
								<div
									key={day}
									className={`
                    flex-1 aspect-square flex items-center justify-center
                    rounded-xl text-sm font-semibold transition
                    ${
					activeDays.includes(index)
						? 'bg-gray-900 text-white'
						: 'bg-gray-100 text-gray-400'
				}
                    ${index === todayIndex ? 'ring-2 ring-offset-1 ring-gray-400' : ''}
                  `}
								>
									{day}
								</div>
							))}
						</div>

						{/* Contador */}
						{streak > 0 ? (
							<p className='text-sm font-bold text-gray-900'>
								🔥 {streak}{' '}
								{streak === 1 ? 'día' : 'días'}{' '}
								con rutina asignada
							</p>
						) : (
							<p className='text-sm text-gray-400'>
								Aún no tienes rutina asignada
							</p>
						)}
					</section>

					{/* Músculo del día */}
					<section>
						<p className='text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1'>
							Hoy
						</p>
						<div
							className='flex justify-between items-center cursor-pointer'
							onClick={() => navigate('/rutina')}
						>
							<div>
								<h2 className='text-3xl font-bold text-gray-900'>
									{DAY_NAMES[todayIndex]}
								</h2>
								<p className='text-base text-gray-500 mt-0.5'>
									{todayMuscles ||
										'Sin rutina asignada'}
								</p>
							</div>
							<span className='text-gray-400 text-xl'>
								›
							</span>
						</div>
					</section>

					{/* Accesos rápidos */}
					<section className='flex flex-col gap-3'>
						<button
							onClick={() =>
								navigate('/biblioteca')
							}
							className='w-full border border-gray-200 rounded-2xl px-5 py-4 flex justify-between items-center hover:bg-gray-50 transition'
						>
							<span className='text-sm font-medium text-gray-900'>
								Biblioteca de ejercicios
							</span>
							<span className='text-gray-400'>
								→
							</span>
						</button>
						<button
							onClick={() => navigate('/rutina')}
							className='w-full border border-gray-200 rounded-2xl px-5 py-4 flex justify-between items-center hover:bg-gray-50 transition'
						>
							<span className='text-sm font-medium text-gray-900'>
								Mi rutina
							</span>
							<span className='text-gray-400'>
								→
							</span>
						</button>
					</section>
				</main>
			</div>

			<BottomNav />
		</div>
	);
}
