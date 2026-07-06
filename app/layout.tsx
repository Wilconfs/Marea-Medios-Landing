import { DM_Sans, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler'
import { AuthProvider } from '@/components/auth-provider'
import { ConditionalChrome } from '@/components/conditional-chrome'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const jakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const dynamic = 'force-dynamic'

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:3000'),
  title: 'CRM Marea Medios',
  description: 'CRM Marea Medios, gestión de clientes',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'CRM Marea Medios',
    description: 'CRM Marea Medios, gestión de clientes',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" async></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Open+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${dmSans.variable} ${jakartaSans.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen overflow-x-hidden antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
          <ConditionalChrome>{children}</ConditionalChrome>
          <Toaster richColors position="top-right" duration={2000} /> 
          </AuthProvider>
          <ChunkLoadErrorHandler />
        </ThemeProvider>
      </body>
    </html>
  )
}
