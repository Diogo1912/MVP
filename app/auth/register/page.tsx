'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<'pl' | 'en'>('pl')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error(language === 'pl' ? 'Hasła nie są identyczne' : 'Passwords do not match')
      return
    }

    if (password.length < 8) {
      toast.error(language === 'pl' ? 'Hasło musi mieć co najmniej 8 znaków' : 'Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      toast.success(language === 'pl' ? 'Rejestracja pomyślna' : 'Registration successful')
      router.push('/auth/login')
    } catch (error: any) {
      toast.error(error.message || (language === 'pl' ? 'Błąd rejestracji' : 'Registration error'))
    } finally {
      setLoading(false)
    }
  }

  const t = (key: string) => {
    const translations: Record<string, { pl: string; en: string }> = {
      register: { pl: 'Rejestracja', en: 'Register' },
      name: { pl: 'Imię i nazwisko', en: 'Full Name' },
      email: { pl: 'Email', en: 'Email' },
      password: { pl: 'Hasło', en: 'Password' },
      confirmPassword: { pl: 'Potwierdź hasło', en: 'Confirm Password' },
      submit: { pl: 'Zarejestruj się', en: 'Register' },
      login: { pl: 'Masz już konto? Zaloguj się', en: 'Already have an account? Login' },
      loading: { pl: 'Rejestrowanie...', en: 'Registering...' },
    }
    return translations[key]?.[language] || key
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-bold text-primary-600 mb-2">GOLEXAI</h1>
          <h2 className="text-center text-3xl font-bold text-gray-900">{t('register')}</h2>
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
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t('name')}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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
              href="/auth/login"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              {t('login')}
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

