import { ReactNode } from 'react'
import { languages } from '@/lib/i18n'
import { getTranslations } from '@/lib/get-translations'

type Props = {
  children: ReactNode
  params: { lang: string }
}

export async function generateStaticParams() {
  return Object.keys(languages).map((lang) => ({ lang }))
}

export default async function LangLayout({ children, params }: Props) {
  // Preload translations for this language
  const translations = await getTranslations(params.lang)
  
  return (
    <>
      <script
        id="translations"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(translations) }}
      />
      {children}
    </>
  )
}
