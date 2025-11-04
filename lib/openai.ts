import OpenAI from 'openai'

function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set')
  }
  
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export async function chatCompletion(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  language: 'pl' | 'en' = 'pl'
) {
  const systemMessage = language === 'pl' 
    ? `Jesteś ekspertem prawnym specjalizującym się w prawie polskim. Twoja wiedza obejmuje:
- Kodeks Cywilny, Kodeks Pracy, Kodeks Spółek Handlowych
- Prawo umów, prawo cywilne, prawo handlowe
- Zgodność z RODO (GDPR)
- Najnowsze zmiany w prawie polskim

Pomagasz prawnikom w:
- Analizie dokumentów prawnych
- Tworzeniu profesjonalnych dokumentów prawnych (umowy, pisma, opinie prawne)
- Odpowiadaniu na pytania związane z prawem polskim
- Identyfikowaniu potencjalnych problemów prawnych

Zawsze odpowiadaj po polsku, używając profesjonalnej terminologii prawnej. Podawaj konkretne artykuły i przepisy, gdy jest to istotne.`
    : `You are a legal expert specializing in Polish law. Your knowledge includes:
- Polish Civil Code, Labor Code, Commercial Companies Code
- Contract law, civil law, commercial law
- GDPR (RODO) compliance
- Latest changes in Polish law

You help lawyers with:
- Legal document analysis
- Creating professional legal documents (contracts, legal opinions, briefs)
- Answering questions about Polish law
- Identifying potential legal issues

Always respond in English, using professional legal terminology. Provide specific articles and regulations when relevant.`

  const openai = getOpenAI()
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
      summary: `Podsumuj ten dokument prawny zgodnie z polskim prawem. Wyodrębnij:
- Strony umowy/dokumentu
- Przedmiot umowy/dokumentu
- Kluczowe daty (podpisania, obowiązywania, terminy)
- Główne postanowienia i zobowiązania
- Warunki umowy
- Sankcje i konsekwencje prawne
- Zgodność z Kodeksem Cywilnym i innymi przepisami polskiego prawa`,
      extract: `Wyodrębnij kluczowe informacje prawne z tego dokumentu zgodnie z polskim prawem:
- Strony (dane identyfikacyjne, NIP, REGON jeśli dotyczy)
- Daty (podpisania, obowiązywania, terminy wykonania)
- Kwoty i waluty
- Postanowienia i kluczowe zapisy
- Odwołania do przepisów prawa polskiego
- Zastrzeżenia i wyłączenia odpowiedzialności`,
      review: `Przeanalizuj ten dokument pod kątem zgodności z prawem polskim:
- Zgodność z Kodeksem Cywilnym, Kodeksem Pracy lub innymi właściwymi przepisami
- Potencjalne problemy prawne i ryzyka
- Niejasności lub sprzeczności w zapisach
- Rekomendacje dotyczące zmian lub uzupełnień
- Zgodność z RODO (jeśli dotyczy danych osobowych)
- Odpowiednie zastosowanie prawa polskiego`,
    },
    en: {
      summary: `Summarize this legal document according to Polish law. Extract:
- Parties to the contract/document
- Subject matter of the contract/document
- Key dates (signing, validity, deadlines)
- Main provisions and obligations
- Contract terms
- Sanctions and legal consequences
- Compliance with the Civil Code and other Polish law provisions`,
      extract: `Extract key legal information from this document according to Polish law:
- Parties (identification data, NIP, REGON if applicable)
- Dates (signing, validity, performance deadlines)
- Amounts and currencies
- Provisions and key clauses
- References to Polish law provisions
- Reservations and liability exclusions`,
      review: `Analyze this document for compliance with Polish law:
- Compliance with the Civil Code, Labor Code or other applicable provisions
- Potential legal issues and risks
- Ambiguities or contradictions in clauses
- Recommendations for changes or additions
- GDPR compliance (if personal data is involved)
- Proper application of Polish law`,
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

