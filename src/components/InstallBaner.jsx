import { useState, useEffect } from 'react';

function isIOS() {
	return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
	return window.matchMedia('(display-mode: standalone)').matches;
}

export default function InstallBanner() {
	const [installPrompt, setInstallPrompt] = useState(null);
	const [showAndroidBanner, setShowAndroidBanner] = useState(false);
	const [showIOSBanner, setShowIOSBanner] = useState(false);

	useEffect(() => {
		// Si ya está instalada no muestra nada
		if (isInStandaloneMode()) return;

		// Android — Chrome soporta beforeinstallprompt
		const handler = (e) => {
			e.preventDefault();
			setInstallPrompt(e);
			setShowAndroidBanner(true);
		};
		window.addEventListener('beforeinstallprompt', handler);

		// iOS — muestra instrucciones manuales
		if (isIOS()) {
			setShowIOSBanner(true);
		}

		return () =>
			window.removeEventListener('beforeinstallprompt', handler);
	}, []);

	const handleAndroidInstall = async () => {
		if (!installPrompt) return;
		installPrompt.prompt();
		const { outcome } = await installPrompt.userChoice;
		if (outcome === 'accepted') setShowAndroidBanner(false);
		setInstallPrompt(null);
	};

	// Banner Android
	if (showAndroidBanner) {
		return (
			<div className='fixed bottom-20 left-4 right-4 bg-gray-900 text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-lg z-50'>
				<div>
					<p className='text-sm font-semibold'>
						Instalar GymTrack
					</p>
					<p className='text-xs text-gray-400 mt-0.5'>
						Accede rápido desde tu pantalla de inicio
					</p>
				</div>
				<div className='flex gap-2'>
					<button
						onClick={() => setShowAndroidBanner(false)}
						className='text-xs text-gray-400 hover:text-white transition px-2'
					>
						Ahora no
					</button>
					<button
						onClick={handleAndroidInstall}
						className='bg-white text-gray-900 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-gray-100 transition'
					>
						Instalar
					</button>
				</div>
			</div>
		);
	}

	// Banner iOS — instrucciones manuales
	if (showIOSBanner) {
		return (
			<div className='fixed bottom-20 left-4 right-4 bg-gray-900 text-white rounded-2xl px-5 py-4 flex flex-col gap-2 shadow-lg z-50'>
				<div className='flex justify-between items-start'>
					<p className='text-sm font-semibold'>
						Instalar GymTrack
					</p>
					<button
						onClick={() => setShowIOSBanner(false)}
						className='text-gray-400 hover:text-white transition text-lg leading-none'
					>
						×
					</button>
				</div>
				<p className='text-xs text-gray-400 leading-relaxed'>
					Toca{' '}
					<span className='text-white font-medium'>
						Compartir
					</span>{' '}
					<span className='text-base'>⎋</span> y luego{' '}
					<span className='text-white font-medium'>
						"Agregar a pantalla de inicio"
					</span>
				</p>
			</div>
		);
	}

	return null;
}
