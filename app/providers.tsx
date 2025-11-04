'use client'

import { Toaster } from 'react-hot-toast'
import { LanguageProvider } from '@/lib/language-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
      <Toaster position="top-right" />
    </LanguageProvider>
  )
}

