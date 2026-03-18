import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

export default function AuthPage() {
	const [activeTab, setActiveTab] = useState('signin');
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [localError, setLocalError] = useState('');
	const [formLoading, setFormLoading] = useState(false);

	const { signIn, signUp } = useAuthStore();

	const handleTabChange = (tab) => {
		setActiveTab(tab);
		setName('');
		setEmail('');
		setPassword('');
		setLocalError('');
	};

	const handleInputChange = () => {
		setLocalError('');
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setFormLoading(true);
		setLocalError('');

		try {
			const { error } = await (activeTab === 'signin'
				? signIn(email, password)
				: signUp(email, password, name));

			if (error) {
				setLocalError(error.message || 'An error occurred');
			}
		} catch (err) {
			setLocalError('An unexpected error occurred', err);
		} finally {
			setFormLoading(false);
		}
	};

	const handleGoogleClick = () => {
		console.log('Google OAuth - placeholder for now');
	};

	return (
		<div className='flex items-center justify-center min-h-screen bg-white'>
			<div className='max-w-sm w-full px-6'>
				{/* Header */}
				<div className='text-center mb-8'>
					<h1 className='text-3xl font-bold text-gray-900'>
						GymTrack
					</h1>
					<p className='text-sm text-gray-400 mt-2'>
						Tu entrenamiento, tu progreso
					</p>
				</div>

				<div className='flex gap-8 border-b border-gray-200 mb-6'>
					<button
						onClick={() => handleTabChange('signin')}
						className={`pb-2 text-sm font-semibold transition ${
							activeTab === 'signin'
								? 'text-gray-900 border-b-2 border-gray-900'
								: 'text-gray-400'
						}`}
					>
						Iniciar sesión
					</button>
					<button
						onClick={() => handleTabChange('signup')}
						className={`pb-2 text-sm font-semibold transition ${
							activeTab === 'signup'
								? 'text-gray-900 border-b-2 border-gray-900'
								: 'text-gray-400'
						}`}
					>
						Registrarse
					</button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit}>
					{activeTab === 'signup' && (
						<div className='mb-4'>
							<label className='block text-sm text-gray-600 mb-2'>
								Nombre
							</label>
							<input
								type='text'
								value={name}
								onChange={(e) => {
									setName(e.target.value);
									handleInputChange();
								}}
								placeholder='Tu nombre completo'
								className='w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition'
							/>
						</div>
					)}

					{/* Email Input */}
					<div className='mb-4'>
						<label className='block text-sm text-gray-600 mb-2'>
							Email
						</label>
						<input
							type='email'
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								handleInputChange();
							}}
							placeholder='ejemplo@gymtrack.com'
							className='w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition'
						/>
					</div>
					<div className='mb-6'>
						<label className='block text-sm text-gray-600 mb-2'>
							Contraseña
						</label>
						<input
							type='password'
							value={password}
							onChange={(e) => {
								setPassword(e.target.value);
								handleInputChange();
							}}
							placeholder='••••••••'
							className='w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition'
						/>
					</div>

					{/* Error Message */}
					{localError && (
						<div className='text-red-400 text-sm mt-2 mb-4 text-center'>
							{localError}
						</div>
					)}

					{/* Primary Button */}
					<button
						type='submit'
						disabled={
							formLoading ||
							!email ||
							!password ||
							(activeTab === 'signup' && !name)
						}
						className='w-full bg-gray-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
					>
						{formLoading && (
							<svg
								className='w-4 h-4 animate-spin'
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
							>
								<circle
									className='opacity-25'
									cx='12'
									cy='12'
									r='10'
									stroke='currentColor'
									strokeWidth='4'
								></circle>
								<path
									className='opacity-75'
									fill='currentColor'
									d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
								></path>
							</svg>
						)}
						{formLoading ? 'Cargando...' : 'Continuar'}
					</button>
				</form>

				{/* Divider */}
				<div className='flex items-center gap-3 my-6'>
					<div className='flex-1 border-t border-gray-200'></div>
					<span className='text-xs text-gray-400'>
						o continúa con
					</span>
					<div className='flex-1 border-t border-gray-200'></div>
				</div>

				{/* Google Button */}
				<button
					onClick={handleGoogleClick}
					className='w-full border border-gray-200 rounded-lg py-3 text-sm text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition'
				>
					<svg
						className='w-5 h-5'
						viewBox='0 0 24 24'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
							fill='#4285F4'
						/>
						<path
							d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
							fill='#34A853'
						/>
						<path
							d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
							fill='#FBBC05'
						/>
						<path
							d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
							fill='#EA4335'
						/>
					</svg>
					Continuar con Google
				</button>

				{/* Footer */}
				<p className='text-xs text-gray-400 text-center mt-6'>
					Al continuar aceptas los{' '}
					<a
						href='#'
						className='text-gray-600 hover:text-gray-900 transition'
					>
						términos de uso
					</a>{' '}
					y la{' '}
					<a
						href='#'
						className='text-gray-600 hover:text-gray-900 transition'
					>
						política de privacidad
					</a>
				</p>
			</div>
		</div>
	);
}
