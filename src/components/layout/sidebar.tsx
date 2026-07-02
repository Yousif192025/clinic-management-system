'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import {
  LayoutDashboard, Users, UserRound, Calendar, FileText,
  Receipt, BarChart3, Settings, LogOut, Heart, ChevronLeft,
  Shield, Menu, X
} from 'lucide-react'
import { cn, getInitials, ROLE_MAP } from '@/lib/utils/helpers'
import type { Role } from '@prisma/client'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles: Role[]
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, roles: ['ADMIN','DOCTOR','NURSE','RECEPTIONIST','PATIENT'] },
  { href: '/patients', label: 'المرضى', icon: Users, roles: ['ADMIN','DOCTOR','NURSE','RECEPTIONIST'] },
  { href: '/doctors', label: 'الأطباء', icon: UserRound, roles: ['ADMIN','RECEPTIONIST'] },
  { href: '/appointments', label: 'المواعيد', icon: Calendar, roles: ['ADMIN','DOCTOR','NURSE','RECEPTIONIST','PATIENT'] },
  { href: '/medical-records', label: 'السجلات الطبية', icon: FileText, roles: ['ADMIN','DOCTOR','NURSE'] },
  { href: '/invoices', label: 'الفواتير', icon: Receipt, roles: ['ADMIN','RECEPTIONIST','PATIENT'] },
  { href: '/reports', label: 'التقارير', icon: BarChart3, roles: ['ADMIN'] },
  { href: '/users', label: 'المستخدمون', icon: Shield, roles: ['ADMIN'] },
  { href: '/settings', label: 'الإعدادات', icon: Settings, roles: ['ADMIN','DOCTOR','NURSE','RECEPTIONIST','PATIENT'] },
]

interface SidebarProps {
  user: { name: string; email: string; role: Role }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const visibleItems = navItems.filter(item => item.roles.includes(user.role))

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-sidebar-foreground leading-tight">نظام إدارة</p>
            <p className="text-xs text-sidebar-foreground/50">العيادات الطبية</p>
          </div>
        </div>
        {/* Close button on mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn('sidebar-item', isActive && 'active')}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
              {isActive && <ChevronLeft className="w-3.5 h-3.5 mr-auto opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* User Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center flex-shrink-0 text-sidebar-primary text-xs font-bold">
            {getInitials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">{ROLE_MAP[user.role]}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full sidebar-item text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-sidebar text-sidebar-foreground shadow-lg border border-sidebar-border"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-sidebar flex-col border-l border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <aside className={cn(
        'md:hidden fixed top-0 right-0 z-50 h-full w-72 bg-sidebar flex flex-col border-l border-sidebar-border transition-transform duration-300',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        <SidebarContent />
      </aside>
    </>
  )
}
