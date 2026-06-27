'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Search, Edit2, Trash2, Archive, MoreHorizontal, User, Phone, Droplets } from 'lucide-react'
import { formatDate, GENDER_MAP, BLOOD_TYPE_MAP, getInitials } from '@/lib/utils/helpers'
import { PatientModal } from './patient-modal'
import type { PatientWithUser } from '@/types'

interface Props {
  patients: PatientWithUser[]
  total: number
  page: number
  perPage: number
  search: string
  archived: boolean
  canEdit: boolean
}

export function PatientsClient({ patients, total, page, perPage, search, archived, canEdit }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showModal, setShowModal] = useState(false)
  const [editingPatient, setEditingPatient] = useState<PatientWithUser | null>(null)
  const [searchValue, setSearchValue] = useState(search)

  const totalPages = Math.ceil(total / perPage)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    startTransition(() => {
      router.push(`/patients?q=${searchValue}`)
    })
  }

  function openEdit(patient: PatientWithUser) {
    setEditingPatient(patient)
    setShowModal(true)
  }

  function openNew() {
    setEditingPatient(null)
    setShowModal(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المريض؟')) return
    const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
  }

  async function handleArchive(id: string, archive: boolean) {
    await fetch(`/api/patients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isArchived: archive }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">المرضى</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{total.toLocaleString('ar')} مريض مسجل</p>
        </div>
        {canEdit && (
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
            <Plus className="w-4 h-4" />
            إضافة مريض
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder="بحث بالاسم أو الكود أو الجوال..."
            className="w-full pr-9 pl-4 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </form>
        <button
          onClick={() => router.push(`/patients?archived=${!archived}`)}
          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${archived ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-background hover:bg-muted'}`}
        >
          {archived ? 'الأرشيف' : 'النشطون'}
        </button>
      </div>

      {/* Table */}
      <div className="data-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['المريض', 'الكود', 'الجنس', 'فصيلة الدم', 'الجوال', 'تاريخ التسجيل', 'الإجراءات'].map(h => (
                  <th key={h} className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    <User className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    لا يوجد مرضى
                  </td>
                </tr>
              ) : (
                patients.map(patient => (
                  <tr key={patient.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {getInitials(patient.user.name)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{patient.user.name}</p>
                          <p className="text-xs text-muted-foreground">{patient.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-primary text-xs">{patient.patientCode}</td>
                    <td className="px-4 py-3 text-muted-foreground">{patient.gender ? GENDER_MAP[patient.gender] : '—'}</td>
                    <td className="px-4 py-3">
                      {patient.bloodType && patient.bloodType !== 'UNKNOWN' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium">
                          <Droplets className="w-3 h-3 text-red-500" />
                          {BLOOD_TYPE_MAP[patient.bloodType]}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground" dir="ltr">{patient.phone || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(patient.createdAt)}</td>
                    <td className="px-4 py-3">
                      {canEdit && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(patient)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition-colors" title="تعديل">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleArchive(patient.id, !patient.isArchived)} className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 transition-colors" title="أرشفة">
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(patient.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors" title="حذف">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              عرض {((page - 1) * perPage) + 1}–{Math.min(page * perPage, total)} من {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => router.push(`/patients?q=${search}&page=${page - 1}`)}
                disabled={page <= 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-input hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                السابق
              </button>
              <span className="px-3 py-1.5 text-xs text-muted-foreground">{page} / {totalPages}</span>
              <button
                onClick={() => router.push(`/patients?q=${search}&page=${page + 1}`)}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-xs rounded-lg border border-input hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <PatientModal
          patient={editingPatient}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); router.refresh() }}
        />
      )}
    </div>
  )
}
