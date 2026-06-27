'use client'

import { useTheme } from 'next-themes'
import { Bell, Sun, Moon, Search } from 'lucide-react'
import { getInitials } from '@/lib/utils/helpers'
import type { Role } from '@prisma/client'

interface HeaderProps {
  user: { name: string; email: string; role: Role }
}

export function Header({ user }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      {/* Search */}
      <div className="relative hidden md:flex items-center">
        <Search className="absolute right-3 w-4 h-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="بحث سريع..."
          className="w-64 pr-9 pl-4 py-2 text-sm rounded-lg bg-muted border border-transparent focus:border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mr-auto">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <Sun className="w-4.5 h-4.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-4.5 h-4.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-card" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2 pr-2 border-r border-border mr-1">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
            {getInitials(user.name)}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-foreground leading-tight">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
