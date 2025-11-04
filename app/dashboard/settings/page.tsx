'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { useLanguage } from '@/lib/language-context'

export default function SettingsPage() {
  const { language } = useLanguage()
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/settings/export-data', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `golexai-data-export-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(language === 'pl' ? 'Dane wyeksportowane pomyślnie' : 'Data exported successfully')
    } catch (error) {
      toast.error(language === 'pl' ? 'Błąd podczas eksportu danych' : 'Error exporting data')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteData = async () => {
    if (!confirm(language === 'pl' 
      ? 'Czy na pewno chcesz usunąć wszystkie swoje dane? Ta operacja jest nieodwracalna.'
      : 'Are you sure you want to delete all your data? This operation is irreversible.')) {
      return
    }

    setIsDeleting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/settings/delete-data', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error('Deletion failed')

      toast.success(language === 'pl' ? 'Dane usunięte pomyślnie' : 'Data deleted successfully')
      // TODO: Redirect to login or home
    } catch (error) {
      toast.error(language === 'pl' ? 'Błąd podczas usuwania danych' : 'Error deleting data')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error(language === 'pl' ? 'Hasła nie są identyczne' : 'Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error(language === 'pl' ? 'Hasło musi mieć co najmniej 8 znaków' : 'Password must be at least 8 characters')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/settings/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (!response.ok) throw new Error('Password change failed')

      toast.success(language === 'pl' ? 'Hasło zmienione pomyślnie' : 'Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error(language === 'pl' ? 'Błąd podczas zmiany hasła' : 'Error changing password')
    }
  }

  const t = (key: string) => {
    const translations: Record<string, { pl: string; en: string }> = {
      settings: { pl: 'Ustawienia', en: 'Settings' },
      rodoGdpr: { pl: 'RODO/GDPR', en: 'RODO/GDPR' },
      exportData: { pl: 'Eksportuj dane', en: 'Export Data' },
      exportDataDesc: { pl: 'Pobierz kopię wszystkich swoich danych w formacie JSON', en: 'Download a copy of all your data in JSON format' },
      deleteData: { pl: 'Usuń wszystkie dane', en: 'Delete All Data' },
      deleteDataDesc: { pl: 'Trwale usuń wszystkie swoje dane z systemu', en: 'Permanently delete all your data from the system' },
      passwordManagement: { pl: 'Zarządzanie hasłem', en: 'Password Management' },
      currentPassword: { pl: 'Obecne hasło', en: 'Current Password' },
      newPassword: { pl: 'Nowe hasło', en: 'New Password' },
      confirmPassword: { pl: 'Potwierdź hasło', en: 'Confirm Password' },
      changePassword: { pl: 'Zmień hasło', en: 'Change Password' },
      dataEncryption: { pl: 'Szyfrowanie danych', en: 'Data Encryption' },
      encryptionInfo: { pl: 'Wszystkie dane są szyfrowane podczas przechowywania i przesyłania', en: 'All data is encrypted during storage and transmission' },
      exporting: { pl: 'Eksportowanie...', en: 'Exporting...' },
      deleting: { pl: 'Usuwanie...', en: 'Deleting...' },
    }
    return translations[key]?.[language] || key
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('settings')}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {language === 'pl'
            ? 'Zarządzaj ustawieniami konta i zgodnością RODO/GDPR'
            : 'Manage account settings and RODO/GDPR compliance'}
        </p>
      </div>

      <div className="space-y-6">
        {/* RODO/GDPR Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('rodoGdpr')}</h2>
          
          <div className="space-y-4">
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{t('exportData')}</h3>
                  <p className="mt-1 text-sm text-gray-500">{t('exportDataDesc')}</p>
                </div>
                <button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                >
                  {isExporting ? t('exporting') : t('exportData')}
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{t('deleteData')}</h3>
                  <p className="mt-1 text-sm text-gray-500">{t('deleteDataDesc')}</p>
                </div>
                <button
                  onClick={handleDeleteData}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  {isDeleting ? t('deleting') : t('deleteData')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Password Management */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('passwordManagement')}</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('currentPassword')}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('newPassword')}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('confirmPassword')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                minLength={8}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              {t('changePassword')}
            </button>
          </form>
        </div>

        {/* Data Encryption Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('dataEncryption')}</h2>
          <p className="text-sm text-gray-600">{t('encryptionInfo')}</p>
        </div>
      </div>
    </div>
  )
}

