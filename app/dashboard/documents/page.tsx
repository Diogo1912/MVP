'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Document {
  id: string
  title: string
  fileType: string
  priority: string
  status: string
  uploadedAt: string | Date
  case?: {
    caseNumber?: string
  }
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<'pl' | 'en'>('pl')
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'title'>('date')

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const params = new URLSearchParams()
        if (filter !== 'all') params.append('filter', filter)
        params.append('sortBy', sortBy)
        
        const response = await fetch(`/api/documents?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        if (!response.ok) throw new Error('Failed to fetch')
        const result = await response.json()
        setDocuments(result)
      } catch (error) {
        console.error('Error fetching documents:', error)
        toast.error(language === 'pl' ? 'Błąd podczas ładowania dokumentów' : 'Error loading documents')
      } finally {
        setLoading(false)
      }
    }
    fetchDocuments()
  }, [filter, sortBy, language])

  const handleExport = async (docId: string, format: 'docx' | 'pdf') => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/documents/${docId}/export?format=${format}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `document-${docId}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(language === 'pl' ? 'Eksport zakończony pomyślnie' : 'Export completed successfully')
    } catch (error) {
      toast.error(language === 'pl' ? 'Błąd podczas eksportu' : 'Error during export')
    }
  }

  const handleAnalyze = async (docId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/documents/${docId}/analyze`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error('Analysis failed')

      const data = await response.json()
      toast.success(language === 'pl' ? 'Analiza zakończona' : 'Analysis completed')
      // TODO: Show analysis results in a modal
    } catch (error) {
      toast.error(language === 'pl' ? 'Błąd podczas analizy' : 'Error during analysis')
    }
  }

  const handlePrint = (docId: string) => {
    window.open(`/api/documents/${docId}/print`, '_blank')
  }

  const handleShare = async (docId: string) => {
    // TODO: Implement sharing functionality
    toast(language === 'pl' ? 'Funkcja udostępniania wkrótce' : 'Sharing feature coming soon')
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    }
    return colors[priority] || colors.medium
  }

  const t = (key: string) => {
    const translations: Record<string, { pl: string; en: string }> = {
      documents: { pl: 'Dokumenty/Sprawy', en: 'Documents/Cases' },
      all: { pl: 'Wszystkie', en: 'All' },
      active: { pl: 'Aktywne', en: 'Active' },
      archived: { pl: 'Zarchiwizowane', en: 'Archived' },
      export: { pl: 'Eksportuj', en: 'Export' },
      analyze: { pl: 'Analizuj', en: 'Analyze' },
      print: { pl: 'Drukuj', en: 'Print' },
      share: { pl: 'Udostępnij', en: 'Share' },
      priority: { pl: 'Priorytet', en: 'Priority' },
      status: { pl: 'Status', en: 'Status' },
      caseNumber: { pl: 'Numer sprawy', en: 'Case Number' },
      uploadedAt: { pl: 'Data przesłania', en: 'Uploaded At' },
    }
    return translations[key]?.[language] || key
  }

  if (loading) {
    return <div className="p-8">{language === 'pl' ? 'Ładowanie...' : 'Loading...'}</div>
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('documents')}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {language === 'pl'
            ? 'Zarządzaj dokumentami i sprawami'
            : 'Manage documents and cases'}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex space-x-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="all">{t('all')}</option>
          <option value="active">{t('active')}</option>
          <option value="archived">{t('archived')}</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="date">{t('uploadedAt')}</option>
          <option value="priority">{t('priority')}</option>
          <option value="title">Tytuł</option>
        </select>
      </div>

      {/* Documents List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tytuł
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('caseNumber')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('priority')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('uploadedAt')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                  <div className="text-sm text-gray-500">{doc.fileType.toUpperCase()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {doc.case?.caseNumber || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(doc.priority)}`}>
                    {doc.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {doc.status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(doc.uploadedAt as string).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleExport(doc.id, 'docx')}
                      className="text-primary-600 hover:text-primary-900"
                      title={t('export')}
                    >
                      📥
                    </button>
                    <button
                      onClick={() => handleAnalyze(doc.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title={t('analyze')}
                    >
                      🔍
                    </button>
                    <button
                      onClick={() => handlePrint(doc.id)}
                      className="text-gray-600 hover:text-gray-900"
                      title={t('print')}
                    >
                      🖨️
                    </button>
                    <button
                      onClick={() => handleShare(doc.id)}
                      className="text-green-600 hover:text-green-900"
                      title={t('share')}
                    >
                      📤
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

