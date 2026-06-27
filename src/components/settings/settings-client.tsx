'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Loader2, Save, Sun, Moon, Monitor, Lock, User } from 'lucide-react'
import { getInitials, ROLE_MAP } from '@/lib/utils/helpers'
import type { Role } from '@prisma/client'

interface Props {
  user: { id: string; name: string; email: string; role: Role }
}

export function SettingsClient({ user }: Props) {
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance'>('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [name, setName] = useState(user.name)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  async function handleProfileSave() {
    setIsLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('فشل تحديث البيانات')
      setSuccess('تم تحديث البيانات بنجاح')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'حدث خطأ')
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePasswordChange() {
    if (newPassword !== confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      return
    }
    if (newPassword.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }
    setIsLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'فشل تغيير كلمة المرور')
      setSuccess('تم تغيير كلمة المرور بنجاح')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'حدث خطأ')
    } finally {
      setIsLoading(false)
    }
  }

  const tabClass = (t: string) =>
    `flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors w-full text-right ${activeTab === t
      ? 'bg-primary/10 text-primary'
      : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`

  const inputClass = 'w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all'
  const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5'

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">الإعدادات</h1>
        <p className="text-muted-foreground text-sm mt-0.5">إدارة حسابك وتفضيلاتك</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0 space-y-1">
          <button onClick={() => setActiveTab('profile')} className={tabClass('profile')}>
            <User className="w-4 h-4" /> الملف الشخصي
          </button>
          <button onClick={() => setActiveTab('security')} className={tabClass('security')}>
            <Lock className="w-4 h-4" /> الأمان
          </button>
          <button onClick={() => setActiveTab('appearance')} className={tabClass('appearance')}>
            <Sun className="w-4 h-4" /> المظهر
          </button>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {(success || error) && (
            <div className={`mb-4 p-3 rounded-lg text-sm border ${success ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
              {success || error}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-5">
              <h2 className="font-semibold text-foreground">الملف الشخصي</h2>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                  {getInitials(user.name)}
                </div>
                <div>
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{ROLE_MAP[user.role]}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>الاسم الكامل</label>
                  <input value={name} onChange={e => setName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>البريد الإلكتروني</label>
                  <input value={user.email} disabled className={inputClass + ' opacity-60 cursor-not-allowed'} dir="ltr" />
                </div>
                <div>
                  <label className={labelClass}>الدور الوظيفي</label>
                  <input value={ROLE_MAP[user.role]} disabled className={inputClass + ' opacity-60 cursor-not-allowed'} />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleProfileSave}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  حفظ التغييرات
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-5">
              <h2 className="font-semibold text-foreground">تغيير كلمة المرور</h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className={labelClass}>كلمة المرور الحالية</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={inputClass} dir="ltr" placeholder="••••••••" />
                </div>
                <div>
                  <label className={labelClass}>كلمة المرور الجديدة</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClass} dir="ltr" placeholder="••••••••" />
                </div>
                <div>
                  <label className={labelClass}>تأكيد كلمة المرور</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} dir="ltr" placeholder="••••••••" />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handlePasswordChange}
                  disabled={isLoading || !currentPassword || !newPassword}
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                  تغيير كلمة المرور
                </button>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-5">
              <h2 className="font-semibold text-foreground">تفضيلات المظهر</h2>
              <div>
                <label className={labelClass}>وضع العرض</label>
                <div className="grid grid-cols-3 gap-3 max-w-sm">
                  {[
                    { value: 'light', label: 'فاتح', icon: Sun },
                    { value: 'dark', label: 'داكن', icon: Moon },
                    { value: 'system', label: 'تلقائي', icon: Monitor },
                  ].map(opt => {
                    const Icon = opt.icon
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setTheme(opt.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-border/60 hover:bg-muted/40'}`}
                      >
                        <Icon className={`w-5 h-5 ${theme === opt.value ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`text-xs font-medium ${theme === opt.value ? 'text-primary' : 'text-muted-foreground'}`}>{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
