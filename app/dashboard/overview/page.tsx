'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useLanguage } from '@/lib/language-context'

interface OverviewData {
  totalCases: number
  totalDocuments: number
  activeCases: number
  documentsThisMonth: number
  aiUsageTime: number
  documentTypes: { type: string; count: number }[]
  monthlyProductivity: { month: string; count: number }[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function OverviewPage() {
  const { language } = useLanguage()
  const [data, setData] = useState<OverviewData>({
    totalCases: 0,
    totalDocuments: 0,
    activeCases: 0,
    documentsThisMonth: 0,
    aiUsageTime: 0,
    documentTypes: [],
    monthlyProductivity: [],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/overview', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        if (!response.ok) throw new Error('Failed to fetch')
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching overview:', error)
      }
    }
    fetchData()
  }, [])

  const t = (key: string) => {
    const translations: Record<string, { pl: string; en: string }> = {
      overview: { pl: 'Przegląd', en: 'Overview' },
      totalCases: { pl: 'Wszystkie sprawy', en: 'Total Cases' },
      totalDocuments: { pl: 'Wszystkie dokumenty', en: 'Total Documents' },
      activeCases: { pl: 'Aktywne sprawy', en: 'Active Cases' },
      documentsThisMonth: { pl: 'Dokumenty w tym miesiącu', en: 'Documents This Month' },
      aiActivity: { pl: 'Aktywność AI', en: 'AI Activity' },
      aiUsageTime: { pl: 'Czas użycia AI', en: 'AI Usage Time' },
      minutes: { pl: 'minut', en: 'minutes' },
      documentTypes: { pl: 'Typy dokumentów', en: 'Document Types' },
      monthlyProductivity: { pl: 'Produktywność miesięczna', en: 'Monthly Productivity' },
      documentsHandled: { pl: 'Obsłużone dokumenty', en: 'Documents Handled' },
    }
    return translations[key]?.[language] || key
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('overview')}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {language === 'pl'
            ? 'Ogólny przegląd spraw, dokumentów i aktywności AI'
            : 'General overview of cases, documents, and AI activity'}
        </p>
      </div>

      {/* Stats Grid */}
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
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('totalCases')}</dt>
                  <dd className="text-lg font-medium text-gray-900">{data.totalCases}</dd>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('totalDocuments')}</dt>
                  <dd className="text-lg font-medium text-gray-900">{data.totalDocuments}</dd>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('activeCases')}</dt>
                  <dd className="text-lg font-medium text-gray-900">{data.activeCases}</dd>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('documentsThisMonth')}</dt>
                  <dd className="text-lg font-medium text-gray-900">{data.documentsThisMonth}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Document Types Pie Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('documentTypes')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.documentTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.documentTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Productivity Bar Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('monthlyProductivity')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthlyProductivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('aiActivity')}</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{t('aiUsageTime')}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {data.aiUsageTime} {t('minutes')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

