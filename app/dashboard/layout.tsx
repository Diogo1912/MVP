'use client'

import DashboardLayout from '@/components/DashboardLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useState } from 'react'

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [language, setLanguage] = useState<'pl' | 'en'>('pl')

  return (
    <ProtectedRoute>
      <DashboardLayout language={language} onLanguageChange={setLanguage}>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  )
}

