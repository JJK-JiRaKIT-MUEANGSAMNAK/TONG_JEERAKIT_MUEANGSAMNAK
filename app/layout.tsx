import type { Metadata, Viewport } from 'next'
import { Prompt } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { TopHeader } from '@/components/TopHeader'
import { AuthShell } from '@/components/auth/AuthShell'
import { ToastProvider } from '@/components/common/Toast'
import { ThemeProvider } from '@/lib/contexts/ThemeContext'
import { DynamicFavicon } from '@/components/common/DynamicFavicon'
import { RouteContainer } from '@/components/common/RouteContainer'
import { AuthProvider } from '@/lib/contexts/AuthContext'
import { AppLockProvider } from '@/lib/contexts/AppLockContext'
import { SystemSettingsProvider } from '@/lib/contexts/SystemSettingsContext'

const promptFont = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-prompt',
})

export const metadata: Metadata = {
  title: 'Rental POS',
  description: 'ระบบ POS สำหรับธุรกิจเช่าอุปกรณ์และสินค้า',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#07111f',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className={`dark ${promptFont.variable} font-sans`} suppressHydrationWarning>
      <body className="bg-slate-100 dark:bg-[#07111f] text-slate-900 dark:text-slate-100 flex flex-col xl:flex-row h-dvh max-h-dvh min-h-0 w-full overflow-hidden">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('rental_pos_theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <ThemeProvider>
          <ToastProvider>
            <DynamicFavicon />
            <SystemSettingsProvider>
              <AuthProvider>
                <AppLockProvider>
                  <AuthShell>
                    <Sidebar />
                    <main className="flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-hidden">
                      <TopHeader />
                      <RouteContainer>
                        {children}
                      </RouteContainer>
                    </main>
                  </AuthShell>
                </AppLockProvider>
              </AuthProvider>
            </SystemSettingsProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
