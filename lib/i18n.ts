import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Locale = 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt' | 'sv' | 'no'

interface I18nStore {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useI18n = create<I18nStore>()(
  persist(
    (set) => ({
      locale: 'es',
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'iqmind-locale',
    }
  )
)

export const languages = {
  es: { name: 'Español', flag: '🇪🇸' },
  en: { name: 'English', flag: '🇬🇧' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  pt: { name: 'Português', flag: '🇵🇹' },
  sv: { name: 'Svenska', flag: '🇸🇪' },
  no: { name: 'Norsk', flag: '🇳🇴' },
}

export async function getTranslations(locale: Locale) {
  try {
    const messages = await import(`@/messages/${locale}.json`)
    return messages.default
  } catch (error) {
    // Fallback to Spanish if translation not found
    const messages = await import(`@/messages/es.json`)
    return messages.default
  }
}

