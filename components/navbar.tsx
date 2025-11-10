
'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Scissors, Home, History, BarChart3, LogOut, User, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const { data: session, status } = useSession() || {}
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || status === 'loading') {
    return (
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Scissors className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">THE BARBER</span>
              </div>
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>
    )
  }

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Scissors className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">THE BARBER</span>
            </Link>

            <div className="hidden md:flex space-x-4">
              <Link href="/">
                <Button 
                  variant={isActive('/') ? 'default' : 'ghost'}
                  className="flex items-center space-x-2"
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Link href="/historico">
                <Button 
                  variant={isActive('/historico') ? 'default' : 'ghost'}
                  className="flex items-center space-x-2"
                >
                  <History className="h-4 w-4" />
                  <span>Histórico</span>
                </Button>
              </Link>
              <Link href="/relatorios">
                <Button 
                  variant={isActive('/relatorios') ? 'default' : 'ghost'}
                  className="flex items-center space-x-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Relatórios</span>
                </Button>
              </Link>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2"
                aria-label="Menu do usuário"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{session?.user?.name || 'Usuário'}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
