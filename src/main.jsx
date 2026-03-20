import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import { startSyncListener } from './lib/syncService';
import './index.css';
import App from './App.jsx';

registerSW({
	onNeedRefresh() {
		console.log('Nueva versión disponible');
	},
	onOfflineReady() {
		console.log('App lista para usar offline');
	},
});
startSyncListener();

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</StrictMode>,
);
