// Importar todos los archivos de traducción directamente
import es from '@/messages/es.json'
import en from '@/messages/en.json'
import fr from '@/messages/fr.json'
import de from '@/messages/de.json'
import it from '@/messages/it.json'
import pt from '@/messages/pt.json'
import sv from '@/messages/sv.json'
import no from '@/messages/no.json'

const translations: Record<string, any> = {
  es,
  en,
  fr,
  de,
  it,
  pt,
  sv,
  no
}

export async function getTranslations(lang: string) {
  // Retornar las traducciones directamente desde los imports
  return translations[lang] || translations.es
}

