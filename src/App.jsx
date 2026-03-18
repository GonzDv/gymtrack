import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AuthPage from './pages/Auth/AuthPage';
import HomePage from './pages/Home/HomePage';
import LibraryPage from './pages/ExLibrary/ExLibraryPage';
import RoutinePage from './pages/Routine/RoutinePage';

export default function App() {
	const { session, loading, initialize } = useAuthStore();

	useEffect(() => {
		initialize();
	}, []);

	if (loading) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<p className='text-gray-400 text-sm'>Cargando...</p>
			</div>
		);
	}

	return (
		<Routes>
			<Route
				path='/auth'
				element={!session ? <AuthPage /> : <Navigate to='/' />}
			/>
			<Route
				path='/*'
				element={
					session ? <HomePage /> : <Navigate to='/auth' />
				}
			/>
			<Route
				path='/biblioteca'
				element={
					session ? (
						<LibraryPage />
					) : (
						<Navigate to='/auth' />
					)
				}
			/>
			<Route
				path='/rutina'
				element={
					session ? (
						<RoutinePage />
					) : (
						<Navigate to='/auth' />
					)
				}
			/>
		</Routes>
	);
}
