import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
	{
		label: 'Entrenar',
		path: '/',
		icon: (active) => (
			<svg
				className={`w-5 h-5 ${active ? 'text-gray-900' : 'text-gray-400'}`}
				fill='none'
				viewBox='0 0 24 24'
				stroke='currentColor'
				strokeWidth={2}
			>
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					d='M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z'
				/>
			</svg>
		),
	},
	{
		label: 'Biblioteca',
		path: '/biblioteca',
		icon: (active) => (
			<svg
				className={`w-5 h-5 ${active ? 'text-gray-900' : 'text-gray-400'}`}
				fill='none'
				viewBox='0 0 24 24'
				stroke='currentColor'
				strokeWidth={2}
			>
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					d='M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25'
				/>
			</svg>
		),
	},
	{
		label: 'Rutina',
		path: '/rutina',
		icon: (active) => (
			<svg
				className={`w-5 h-5 ${active ? 'text-gray-900' : 'text-gray-400'}`}
				fill='none'
				viewBox='0 0 24 24'
				stroke='currentColor'
				strokeWidth={2}
			>
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					d='M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z'
				/>
			</svg>
		),
	},
	{
		label: 'Perfil',
		path: '/perfil',
		icon: (active) => (
			<svg
				className={`w-5 h-5 ${active ? 'text-gray-900' : 'text-gray-400'}`}
				fill='none'
				viewBox='0 0 24 24'
				stroke='currentColor'
				strokeWidth={2}
			>
				<path
					strokeLinecap='round'
					strokeLinejoin='round'
					d='M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z'
				/>
			</svg>
		),
	},
];

export default function BottomNav() {
	const navigate = useNavigate();
	const location = useLocation();

	return (
		<nav className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 md:hidden'>
			<div className='flex'>
				{NAV_ITEMS.map((item) => {
					const active = location.pathname === item.path;
					return (
						<button
							key={item.path}
							onClick={() => navigate(item.path)}
							className='flex-1 flex flex-col items-center gap-1 py-3 transition'
						>
							{item.icon(active)}
							<span
								className={`text-xs ${active ? 'font-semibold text-gray-900' : 'text-gray-400'}`}
							>
								{item.label}
							</span>
						</button>
					);
				})}
			</div>
		</nav>
	);
}
