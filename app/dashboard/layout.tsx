'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { useState } from 'react'

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [language, setLanguage] = useState<'pl' | 'en'>('pl')

  return (
    <DashboardLayout language={language} onLanguageChange={setLanguage}>
      {children}
    </DashboardLayout>
  )
}

