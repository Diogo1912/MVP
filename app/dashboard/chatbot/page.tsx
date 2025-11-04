'use client'

import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState<'pl' | 'en'>('pl')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf' && !file.name.endsWith('.docx')) {
      toast.error(language === 'pl' ? 'Tylko pliki PDF i DOCX są obsługiwane' : 'Only PDF and DOCX files are supported')
      return
    }

    setSelectedFile(file)
    toast.success(language === 'pl' ? 'Plik załadowany. Możesz zadać pytania o jego zawartość.' : 'File loaded. You can ask questions about its content.')
  }

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('message', input)
      formData.append('language', language)
      if (selectedFile) {
        formData.append('file', selectedFile)
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      toast.error(language === 'pl' ? 'Błąd podczas wysyłania wiadomości' : 'Error sending message')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateDocument = async () => {
    if (!input.trim()) {
      toast.error(language === 'pl' ? 'Wprowadź opis dokumentu do utworzenia' : 'Enter a description of the document to create')
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/documents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: input, language }),
      })

      if (!response.ok) throw new Error('Failed to create document')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `document-${Date.now()}.docx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(language === 'pl' ? 'Dokument utworzony pomyślnie' : 'Document created successfully')
      setInput('')
    } catch (error) {
      toast.error(language === 'pl' ? 'Błąd podczas tworzenia dokumentu' : 'Error creating document')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const t = (key: string) => {
    const translations: Record<string, { pl: string; en: string }> = {
      chatbot: { pl: 'Chatbot AI', en: 'AI Chatbot' },
      uploadDocument: { pl: 'Prześlij dokument', en: 'Upload Document' },
      analyzeDocument: { pl: 'Przeanalizuj dokument', en: 'Analyze Document' },
      createDocument: { pl: 'Utwórz dokument', en: 'Create Document' },
      send: { pl: 'Wyślij', en: 'Send' },
      typeMessage: { pl: 'Wpisz wiadomość...', en: 'Type a message...' },
      newChat: { pl: 'Nowa rozmowa', en: 'New Chat' },
    }
    return translations[key]?.[language] || key
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('chatbot')}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {language === 'pl'
              ? 'Rozmawiaj z AI, analizuj dokumenty i twórz nowe dokumenty'
              : 'Chat with AI, analyze documents, and create new documents'}
          </p>
        </div>
        <button
          onClick={() => setMessages([])}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          {t('newChat')}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg h-[600px] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-lg">
                {language === 'pl'
                  ? 'Rozpocznij rozmowę lub prześlij dokument do analizy'
                  : 'Start a conversation or upload a document for analysis'}
              </p>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                <p className="text-sm">
                  {language === 'pl' ? 'Pisanie...' : 'Typing...'}
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* File Upload */}
        <div className="border-t border-gray-200 p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('uploadDocument')}
            </label>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                {language === 'pl' ? 'Wybrany plik:' : 'Selected file:'} {selectedFile.name}
              </p>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={t('typeMessage')}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('send')}
            </button>
            <button
              onClick={handleCreateDocument}
              disabled={isLoading || !input.trim()}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('createDocument')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

