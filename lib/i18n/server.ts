import { cookies } from 'next/headers'
import { dictionaries, Locale, Dictionary } from './dictionaries'

export async function getDictionary(): Promise<Dictionary> {
  const cookieStore = await cookies()
  const locale = (cookieStore.get('clavio-locale')?.value as Locale) || 'en'
  return dictionaries[locale] || dictionaries.en
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  return (cookieStore.get('clavio-locale')?.value as Locale) || 'en'
}
