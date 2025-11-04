'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useLanguage } from '@/lib/language-context'

interface AnalyticsData {
  documentsGenerated: number[]
  documentsUploaded: number[]
  documentsAnalyzed: number[]
  aiUsageTime: number[]
  productivity: number[]
  accuracy: number[]
  dates: string[]
}

export default function AnalyticsPage() {
  const { language } = useLanguage()
  const [data, setData] = useState<AnalyticsData>({
    documentsGenerated: [],
    documentsUploaded: [],
    documentsAnalyzed: [],
    aiUsageTime: [],
    productivity: [],
    accuracy: [],
    dates: [],
  })
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    // TODO: Fetch from API
    const mockData = {
      documentsGenerated: [5, 8, 12, 15, 10, 18, 20],
      documentsUploaded: [10, 15, 20, 18, 22, 25, 30],
      documentsAnalyzed: [8, 12, 15, 18, 20, 22, 25],
      aiUsageTime: [120, 180, 240, 200, 280, 320, 350],
      productivity: [75, 80, 85, 82, 88, 90, 92],
      accuracy: [85, 87, 89, 88, 90, 91, 92],
      dates: ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'],
    }
    setData(mockData)
  }, [timeRange])

  const chartData = data.dates.map((date, index) => ({
    date,
    generated: data.documentsGenerated[index] || 0,
    uploaded: data.documentsUploaded[index] || 0,
    analyzed: data.documentsAnalyzed[index] || 0,
    aiTime: data.aiUsageTime[index] || 0,
    productivity: data.productivity[index] || 0,
    accuracy: data.accuracy[index] || 0,
  }))

  const t = (key: string) => {
    const translations: Record<string, { pl: string; en: string }> = {
      analytics: { pl: 'Analityka', en: 'Analytics' },
      documentsGenerated: { pl: 'Dokumenty wygenerowane', en: 'Documents Generated' },
      documentsUploaded: { pl: 'Dokumenty przesłane', en: 'Documents Uploaded' },
      documentsAnalyzed: { pl: 'Dokumenty przeanalizowane', en: 'Documents Analyzed' },
      aiUsageTime: { pl: 'Czas użycia AI (min)', en: 'AI Usage Time (min)' },
      productivity: { pl: 'Produktywność (%)', en: 'Productivity (%)' },
      accuracy: { pl: 'Dokładność (%)', en: 'Accuracy (%)' },
      week: { pl: 'Tydzień', en: 'Week' },
      month: { pl: 'Miesiąc', en: 'Month' },
      year: { pl: 'Rok', en: 'Year' },
    }
    return translations[key]?.[language] || key
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('analytics')}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {language === 'pl'
              ? 'Analiza i wizualizacja danych dotyczących dokumentów i użycia AI'
              : 'Analysis and visualization of data regarding documents and AI usage'}
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="week">{t('week')}</option>
          <option value="month">{t('month')}</option>
          <option value="year">{t('year')}</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('documentsGenerated')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.documentsGenerated.reduce((a, b) => a + b, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('documentsUploaded')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.documentsUploaded.reduce((a, b) => a + b, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('documentsAnalyzed')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.documentsAnalyzed.reduce((a, b) => a + b, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('aiUsageTime')}</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {Math.round(data.aiUsageTime.reduce((a, b) => a + b, 0) / 60)}h
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('documentsGenerated')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="generated" fill="#0ea5e9" name={t('documentsGenerated')} />
              <Bar dataKey="uploaded" fill="#10b981" name={t('documentsUploaded')} />
              <Bar dataKey="analyzed" fill="#f59e0b" name={t('documentsAnalyzed')} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('productivity')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="productivity" stroke="#0ea5e9" name={t('productivity')} />
              <Line type="monotone" dataKey="accuracy" stroke="#10b981" name={t('accuracy')} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('aiUsageTime')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="aiTime" stroke="#8b5cf6" name={t('aiUsageTime')} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

