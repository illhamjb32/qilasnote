'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithGoogle } from '@/lib/auth'
import { createClient } from '@/lib/supabase-client'

function LoginContent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        router.replace('/')
      }
    }
    
    const errorParam = searchParams.get('error')
    const emailParam = searchParams.get('email')
    
    if (errorParam === 'unauthorized') {
      setError(`Akses ditolak! Email ${emailParam || 'Anda'} tidak memiliki izin untuk menggunakan aplikasi ini.`)
    } else if (errorParam === 'auth_failed') {
      setError('Autentikasi gagal. Silakan coba lagi.')
    }
    
    checkUser()
  }, [router, searchParams])

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError('')
      await signInWithGoogle()
    } catch (err) {
      console.error('Login error:', err)
      setError('Gagal login. Silakan coba lagi.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="card p-8 max-w-md w-full text-center shadow-2xl relative animate-fade-in">
        {/* Baby Image */}
        <div className="w-[6.5rem] h-[6.5rem] rounded-full overflow-hidden mx-auto mb-6 shadow-lg ring-4 ring-primary/20 animate-bounce-slow">
          <img 
            src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=400&fit=crop&q=80" 
            alt="Happy baby"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Title with gradient */}
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent font-quicksand mb-2 animate-slide-up">
          Qila&apos;s Note
        </h1>
        <p className="text-body text-on-surface-variant mb-8 animate-slide-up-delay">
          Pencatat Susu & MPASI Bayi
        </p>

        {/* Error message with icon */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl shadow-md animate-shake">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-red-500 text-2xl">error</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-red-700 mb-1">Akses Ditolak</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Google Sign-in Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="btn btn-primary w-full py-4 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden group"
        >
          {/* Button shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
          
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              <span className="font-medium">Memproses...</span>
            </>
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
                <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
                <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
                <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
              </svg>
              <span className="font-medium">Masuk dengan Google</span>
            </>
          )}
        </button>

        {/* Info text */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="material-symbols-outlined text-amber-600 text-lg">info</span>
            <p className="text-sm font-semibold text-amber-700">Akses Terbatas</p>
          </div>
          <p className="text-xs text-amber-600">
            Hanya untuk pengguna terdaftar
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-on-surface-variant mt-6 opacity-60">
          Dibuat dengan cinta untuk Qila
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
            <svg className="w-10 h-10 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2v6h3l-5 14l-5-14h3V2h4m-4 0h4a2 2 0 0 1 2 2v4h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-8H7a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h1V4a2 2 0 0 1 2-2z"/>
            </svg>
          </div>
          <p className="mt-4 text-on-surface-variant">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
