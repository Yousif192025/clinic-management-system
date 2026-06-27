'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Power, Trash2, Shield } from 'lucide-react'
import { formatDate, getInitials, ROLE_MAP } from '@/lib/utils/helpers'

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: Date
  image?: string | null
}

interface Props {
  users: User[]
  total: number
  page: number
  perPage: number
  search: string
  role: string
}

const ROLES = [
  { value: '', label: 'جميع الأدوار' },
  { value: 'ADMIN', label: 'مدير النظام' },
  { value: 'DOCTOR', label: 'طبيب' },
  { value: 'NURSE', label: 'ممرضة' },
  { value: 'RECEPTIONIST', label: 'استقبال' },
  { value: 'PATIENT', label: 'مريض' },
]

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  DOCTOR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  NURSE: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  RECEPTIONIST: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  PATIENT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

export function UsersClient({ users, total, page, perPage, search, role }: Props) {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState(search)
  const totalPages = Math.ceil(total / perPage)

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams({ q: search, page: String(page), role, ...overrides })
    return `/users?${params}`
  }

  async function handleToggle(id: string, isActive: boolean) {
    await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">المستخدمون</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{total.toLocaleString('ar')} مستخدم مسجل</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <form onSubmit={e => { e.preventDefault(); router.push(buildUrl({ q: searchValue, page: '1' })) }} className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder="بحث بالاسم أو البريد..."
            className="pr-9 pl-4 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring w-60"
          />
        </form>
        <div className="flex items-center gap-1.5 flex-wrap">
          {ROLES.map(r => (
            <button
              key={r.value}
              onClick={() => router.push(buildUrl({ role: r.value, page: '1' }))}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${role === r.value ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-muted'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="data-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['المستخدم', 'البريد الإلكتروني', 'الدور', 'الحالة', 'تاريخ التسجيل', 'الإجراءات'].map(h => (
                  <th key={h} className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    <Shield className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    لا يوجد مستخدمون
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {getInitials(user.name)}
                        </div>
                        <span className="font-medium text-foreground">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs" dir="ltr">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700'}`}>
                        {ROLE_MAP[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${user.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                        {user.isActive ? 'نشط' : 'موقف'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggle(user.id, user.isActive)}
                          className={`p-1.5 rounded-lg transition-colors ${user.isActive ? 'hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600' : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600'}`}
                          title={user.isActive ? 'إيقاف الحساب' : 'تفعيل الحساب'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              عرض {((page - 1) * perPage) + 1}–{Math.min(page * perPage, total)} من {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => router.push(buildUrl({ page: String(page - 1) }))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-input hover:bg-muted disabled:opacity-40 transition-colors"
              >السابق</button>
              <span className="px-2 text-xs text-muted-foreground">{page} / {totalPages}</span>
              <button
                onClick={() => router.push(buildUrl({ page: String(page + 1) }))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-xs rounded-lg border border-input hover:bg-muted disabled:opacity-40 transition-colors"
              >التالي</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
