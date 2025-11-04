'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useLanguage } from '@/lib/language-context'

interface UserProfile {
  name: string
  email: string
  language: 'pl' | 'en'
}

export default function ProfilePage() {
  const { language: contextLanguage, setLanguage: setContextLanguage } = useLanguage()
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    language: contextLanguage,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) throw new Error('Failed to fetch')
        const result = await response.json()
        setProfile({
          name: result.name || '',
          email: result.email || '',
          language: result.language || 'pl',
        })
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      })

      if (!response.ok) throw new Error('Save failed')

      // Update context language if user changed their language preference
      if (profile.language !== contextLanguage) {
        setContextLanguage(profile.language)
      }

      toast.success(profile.language === 'pl' ? 'Profil zaktualizowany' : 'Profile updated')
    } catch (error) {
      toast.error(profile.language === 'pl' ? 'Błąd podczas zapisywania' : 'Error saving')
    } finally {
      setSaving(false)
    }
  }

  const t = (key: string) => {
    const translations: Record<string, { pl: string; en: string }> = {
      profile: { pl: 'Profil', en: 'Profile' },
      name: { pl: 'Imię i nazwisko', en: 'Full Name' },
      email: { pl: 'Email', en: 'Email' },
      language: { pl: 'Język', en: 'Language' },
      save: { pl: 'Zapisz', en: 'Save' },
      saving: { pl: 'Zapisywanie...', en: 'Saving...' },
    }
    return translations[key]?.[profile.language] || key
  }

  if (loading) {
    return <div className="p-8">{profile.language === 'pl' ? 'Ładowanie...' : 'Loading...'}</div>
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('profile')}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {profile.language === 'pl'
            ? 'Zarządzaj danymi swojego profilu'
            : 'Manage your profile information'}
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('name')}
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('email')}
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('language')}
            </label>
            <select
              value={profile.language}
              onChange={(e) => setProfile({ ...profile, language: e.target.value as 'pl' | 'en' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="pl">Polski</option>
              <option value="en">English</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            {saving ? t('saving') : t('save')}
          </button>
        </form>
      </div>
    </div>
  )
}

