'use client'

import DashboardLayout from '@/components/DashboardLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import { LanguageProvider } from '@/lib/language-context'
import { useState, useEffect } from 'react'

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [language, setLanguage] = useState<'pl' | 'en'>('pl')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'pl' | 'en' | null
    if (savedLanguage === 'pl' || savedLanguage === 'en') {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleLanguageChange = (lang: 'pl' | 'en') => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return (
    <ProtectedRoute>
      <LanguageProvider>
        <DashboardLayout language={language} onLanguageChange={handleLanguageChange}>
          {children}
        </DashboardLayout>
      </LanguageProvider>
    </ProtectedRoute>
  )
}

