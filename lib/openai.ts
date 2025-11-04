import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function chatCompletion(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  language: 'pl' | 'en' = 'pl'
) {
  const systemMessage = language === 'pl' 
    ? 'Jesteś pomocnym asystentem AI dla prawników. Pomagasz w analizie dokumentów, tworzeniu dokumentów prawnych i odpowiadaniu na pytania związane z prawem. Odpowiadaj zawsze po polsku.'
    : 'You are a helpful AI assistant for lawyers. You help with document analysis, creating legal documents, and answering legal questions. Always respond in English.'

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemMessage },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 2000,
  })

  return response.choices[0]?.message?.content || ''
}

export async function analyzeDocument(
  content: string,
  analysisType: 'summary' | 'extract' | 'review',
  language: 'pl' | 'en' = 'pl'
) {
  const prompts = {
    pl: {
      summary: 'Podsumuj ten dokument prawny, wyodrębniając kluczowe informacje, strony, daty i główne postanowienia.',
      extract: 'Wyodrębnij kluczowe informacje z tego dokumentu: strony, daty, kwoty, postanowienia.',
      review: 'Przeanalizuj ten dokument pod kątem zgodności z prawem, potencjalnych problemów i rekomendacji.',
    },
    en: {
      summary: 'Summarize this legal document, extracting key information, parties, dates, and main provisions.',
      extract: 'Extract key information from this document: parties, dates, amounts, provisions.',
      review: 'Analyze this document for legal compliance, potential issues, and recommendations.',
    },
  }

  const prompt = prompts[language][analysisType]
  
  return await chatCompletion(
    [
      {
        role: 'user',
        content: `${prompt}\n\nDokument:\n${content}`,
      },
    ],
    language
  )
}

