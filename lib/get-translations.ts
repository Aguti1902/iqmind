import fs from 'fs'
import path from 'path'

export async function getTranslations(lang: string) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'messages', `${lang}.json`)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(fileContents)
  } catch (error) {
    // Fallback to Spanish
    const filePath = path.join(process.cwd(), 'public', 'messages', 'es.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(fileContents)
  }
}

