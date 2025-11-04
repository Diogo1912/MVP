'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<'pl' | 'en'>('pl')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store token
      localStorage.setItem('token', data.token)
      
      toast.success(language === 'pl' ? 'Zalogowano pomyślnie' : 'Logged in successfully')
      router.push('/dashboard/overview')
    } catch (error: any) {
      toast.error(error.message || (language === 'pl' ? 'Błąd logowania' : 'Login error'))
    } finally {
      setLoading(false)
    }
  }

  const t = (key: string) => {
    const translations: Record<string, { pl: string; en: string }> = {
      login: { pl: 'Logowanie', en: 'Login' },
      email: { pl: 'Email', en: 'Email' },
      password: { pl: 'Hasło', en: 'Password' },
      submit: { pl: 'Zaloguj', en: 'Login' },
      register: { pl: 'Nie masz konta? Zarejestruj się', en: "Don't have an account? Register" },
      loading: { pl: 'Logowanie...', en: 'Logging in...' },
    }
    return translations[key]?.[language] || key
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-bold text-primary-600 mb-2">GOLEXAI</h1>
          <h2 className="text-center text-3xl font-bold text-gray-900">{t('login')}</h2>
          <div className="mt-4 flex justify-center space-x-2">
            <button
              onClick={() => setLanguage('pl')}
              className={`px-3 py-1 text-sm rounded ${
                language === 'pl'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              PL
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-sm rounded ${
                language === 'en'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              EN
            </button>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                {t('email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder={t('email')}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder={t('password')}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? t('loading') : t('submit')}
            </button>
          </div>

          <div className="text-center">
            <a
              href="/auth/register"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              {t('register')}
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

