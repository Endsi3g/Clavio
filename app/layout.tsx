import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { I18nProvider } from '@/components/providers/i18n-provider'
import NextTopLoader from 'nextjs-toploader'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clavio — The AI Content OS',
  description: 'From idea to published — automatically. The AI Content OS for creators and agencies.',
  openGraph: {
    title: 'Clavio — The AI Content OS',
    description: 'From idea to published — automatically. The AI Content OS for creators and agencies.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clavio — The AI Content OS',
    description: 'From idea to published — automatically.',
  },
}

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
