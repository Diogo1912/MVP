// Simple translation utility - language is managed via context/state in components
export const translations: Record<string, Record<'pl' | 'en', string>> = {
  // Add common translations here if needed
}

export function getTranslation(key: string, language: 'pl' | 'en'): string {
  return translations[key]?.[language] || key
}

