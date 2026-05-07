'use client'

import * as React from 'react'
import { dictionaries, Locale, Dictionary } from '@/lib/i18n/dictionaries'

type I18nContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Dictionary
}

const I18nContext = React.createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = React.useState<Locale>('en')

  // Load saved locale from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('clavio-locale') as Locale
    if (saved && (saved === 'en' || saved === 'fr')) {
      setLocale(saved)
    }
  }, [])

  // Save to localStorage on change
  React.useEffect(() => {
    localStorage.setItem('clavio-locale', locale)
  }, [locale])

  const t = dictionaries[locale]

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = React.useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
