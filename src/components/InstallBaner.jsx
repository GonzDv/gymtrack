import { useState, useEffect } from 'react'

export default function InstallBanner() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setShowBanner(false)
    setInstallPrompt(null)
  }

  if (!showBanner) return null

  return (
    <div className='fixed bottom-20 left-4 right-4 bg-gray-900 text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-lg md:max-w-5xl md:mx-auto z-50'>
      <div>
        <p className='text-sm font-semibold'>Instalar GymTrack</p>
        <p className='text-xs text-gray-400 mt-0.5'>Accede rápido desde tu pantalla de inicio</p>
      </div>
      <div className='flex gap-2'>
        <button
          onClick={() => setShowBanner(false)}
          className='text-xs text-gray-400 hover:text-white transition px-2'
        >
          Ahora no
        </button>
        <button
          onClick={handleInstall}
          className='bg-white text-gray-900 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-gray-100 transition'
        >
          Instalar
        </button>
      </div>
    </div>
  )
}