import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { I18nProvider } from '@/components/i18n-provider'
import NextTopLoader from 'nextjs-toploader'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clavio — Creator Ops',
  description: 'Bilingual creator operations system',
}

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <I18nProvider>
            <NextTopLoader color="#3b82f6" showSpinner={false} />
            {children}
            <Toaster richColors position="bottom-right" />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
