'use client'

import React, { createContext, useContext } from 'react'
import { Dictionary } from './dictionaries'

const TranslationContext = createContext<Dictionary | null>(null)

export function TranslationProvider({
  dictionary,
  children,
}: {
  dictionary: Dictionary
  children: React.ReactNode
}) {
  return (
    <TranslationContext.Provider value={dictionary}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}
