
'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { ReactNode, useEffect, useState } from 'react'

interface ProvidersProps {
  children: ReactNode
  session: any
}

export default function Providers({ children, session }: ProvidersProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>{children}</div>
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <SessionProvider session={session}>
        {children}
      </SessionProvider>
      <Toaster />
    </ThemeProvider>
  )
}
