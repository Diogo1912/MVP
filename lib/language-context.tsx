'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'pl' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations: Record<string, Record<Language, string>> = {
  // Common translations
  overview: { pl: 'Przegląd', en: 'Overview' },
  chatbot: { pl: 'Chatbot AI', en: 'AI Chatbot' },
  documents: { pl: 'Dokumenty/Sprawy', en: 'Documents/Cases' },
  analytics: { pl: 'Analityka', en: 'Analytics' },
  settings: { pl: 'Ustawienia', en: 'Settings' },
  profile: { pl: 'Profil', en: 'Profile' },
  // Add more translations as needed
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pl')

  useEffect(() => {
    // Load language from localStorage or user profile
    const savedLanguage = localStorage.getItem('language') as Language | null
    if (savedLanguage === 'pl' || savedLanguage === 'en') {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return translations[key]?.[language] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

