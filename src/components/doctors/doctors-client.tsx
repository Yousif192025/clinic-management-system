'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Edit2, Trash2, Power, Stethoscope } from 'lucide-react'
import { formatCurrency, getInitials } from '@/lib/utils/helpers'
import { DoctorModal } from './doctor-modal'
import type { DoctorWithUser } from '@/types'

interface Props {
  doctors: DoctorWithUser[]
  total: number
  page: number
  perPage: number
  search: string
  canEdit: boolean
}

export function DoctorsClient({ doctors, total, page, perPage, search, canEdit }: Props) {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState(search)
  const [showModal, setShowModal] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<DoctorWithUser | null>(null)
  const totalPages = Math.ceil(total / perPage)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/doctors?q=${searchValue}`)
  }

  async function handleToggle(id: string, isActive: boolean) {
    await fetch(`/api/doctors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا الطبيب؟')) return
    const res = await fetch(`/api/doctors/${id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">الأطباء</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{total} طبيب مسجل</p>
        </div>
        {canEdit && (
          <button onClick={() => { setEditingDoctor(null); setShowModal(true) }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
            <Plus className="w-4 h-4" /> إضافة طبيب
          </button>
        )}
      </div>

      <form onSubmit={handleSearch} className="relative max-w-xs">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={searchValue} onChange={e => setSearchValue(e.target.value)}
          placeholder="بحث بالاسم أو التخصص..."
          className="w-full pr-9 pl-4 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-muted-foreground">
            <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-20" />
            لا يوجد أطباء
          </div>
        ) : (
          doctors.map(doctor => (
            <div key={doctor.id} className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    {getInitials(doctor.user.name)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{doctor.user.name}</h3>
                    <p className="text-xs text-muted-foreground">{doctor.specialization}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${doctor.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                  {doctor.isActive ? 'نشط' : 'موقف'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                <div className="flex justify-between"><span>كود الطبيب</span><span className="font-mono text-primary">{doctor.doctorCode}</span></div>
                <div className="flex justify-between"><span>رقم الترخيص</span><span dir="ltr">{doctor.licenseNumber}</span></div>
                <div className="flex justify-between"><span>رسوم الاستشارة</span><span className="text-foreground font-medium">{formatCurrency(Number(doctor.consultationFee))}</span></div>
              </div>

              {canEdit && (
                <div className="flex items-center gap-1 pt-3 border-t border-border">
                  <button onClick={() => { setEditingDoctor(doctor); setShowModal(true) }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition-colors">
                    <Edit2 className="w-3 h-3" /> تعديل
                  </button>
                  <button onClick={() => handleToggle(doctor.id, doctor.isActive)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-lg transition-colors ${doctor.isActive ? 'hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600' : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600'}`}>
                    <Power className="w-3 h-3" /> {doctor.isActive ? 'إيقاف' : 'تفعيل'}
                  </button>
                  <button onClick={() => handleDelete(doctor.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                    <Trash2 className="w-3 h-3" /> حذف
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => router.push(`/doctors?q=${search}&page=${page - 1}`)} disabled={page <= 1}
            className="px-3 py-1.5 text-xs rounded-lg border border-input hover:bg-muted disabled:opacity-40 transition-colors">السابق</button>
          <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
          <button onClick={() => router.push(`/doctors?q=${search}&page=${page + 1}`)} disabled={page >= totalPages}
            className="px-3 py-1.5 text-xs rounded-lg border border-input hover:bg-muted disabled:opacity-40 transition-colors">التالي</button>
        </div>
      )}

      {showModal && (
        <DoctorModal doctor={editingDoctor} onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); router.refresh() }} />
      )}
    </div>
  )
}
