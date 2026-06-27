'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Edit2, Trash2, Calendar, Clock } from 'lucide-react'
import { formatDateTime, APPOINTMENT_STATUS_MAP } from '@/lib/utils/helpers'
import { AppointmentModal } from './appointment-modal'

interface Doctor { id: string; specialization: string; user: { name: string } }
interface Patient { id: string; patientCode: string; user: { name: string } }
interface Appointment {
  id: string
  appointmentCode: string
  scheduledAt: Date
  status: string
  type: string
  reason?: string | null
  patient: { user: { name: string } }
  doctor: { user: { name: string }; specialization: string }
}

interface Props {
  appointments: Appointment[]
  total: number
  page: number
  perPage: number
  search: string
  status: string
  doctors: Doctor[]
  patients: Patient[]
  canEdit: boolean
}

const STATUSES = [
  { value: '', label: 'جميع الحالات' },
  { value: 'SCHEDULED', label: 'مجدول' },
  { value: 'CONFIRMED', label: 'مؤكد' },
  { value: 'COMPLETED', label: 'مكتمل' },
  { value: 'CANCELLED', label: 'ملغي' },
  { value: 'NO_SHOW', label: 'لم يحضر' },
]

export function AppointmentsClient({ appointments, total, page, perPage, search, status, doctors, patients, canEdit }: Props) {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState(search)
  const [showModal, setShowModal] = useState(false)
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null)
  const totalPages = Math.ceil(total / perPage)

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams({ q: search, page: String(page), status, ...overrides })
    return `/appointments?${params}`
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا الموعد؟')) return
    const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
  }

  async function handleStatusChange(id: string, newStatus: string) {
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">المواعيد</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{total.toLocaleString('ar')} موعد</p>
        </div>
        {canEdit && (
          <button onClick={() => { setEditingAppt(null); setShowModal(true) }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
            <Plus className="w-4 h-4" /> موعد جديد
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <form onSubmit={e => { e.preventDefault(); router.push(buildUrl({ q: searchValue, page: '1' })) }} className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={searchValue} onChange={e => setSearchValue(e.target.value)}
            placeholder="بحث بالاسم أو الكود..."
            className="pr-9 pl-4 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring w-60" />
        </form>
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUSES.map(s => (
            <button key={s.value}
              onClick={() => router.push(buildUrl({ status: s.value, page: '1' }))}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${status === s.value ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-muted'}`}>
              {s.label}
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
                {['الكود', 'المريض', 'الطبيب', 'التخصص', 'الموعد', 'الحالة', 'الإجراءات'].map(h => (
                  <th key={h} className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-20" />لا توجد مواعيد
                </td></tr>
              ) : (
                appointments.map(appt => {
                  const statusInfo = APPOINTMENT_STATUS_MAP[appt.status] || { label: appt.status, color: 'bg-gray-100 text-gray-700' }
                  return (
                    <tr key={appt.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-primary">{appt.appointmentCode}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{appt.patient.user.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{appt.doctor.user.name}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{appt.doctor.specialization}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground" dir="ltr">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(appt.scheduledAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {canEdit ? (
                          <select
                            value={appt.status}
                            onChange={e => handleStatusChange(appt.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer focus:ring-2 focus:ring-ring ${statusInfo.color}`}
                          >
                            {STATUSES.filter(s => s.value).map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`status-badge ${statusInfo.color}`}>{statusInfo.label}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {canEdit && (
                          <div className="flex items-center gap-1">
                            <button onClick={() => { setEditingAppt(appt); setShowModal(true) }}
                              className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(appt.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">عرض {((page - 1) * perPage) + 1}–{Math.min(page * perPage, total)} من {total}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => router.push(buildUrl({ page: String(page - 1) }))} disabled={page <= 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-input hover:bg-muted disabled:opacity-40 transition-colors">السابق</button>
              <span className="px-2 text-xs text-muted-foreground">{page} / {totalPages}</span>
              <button onClick={() => router.push(buildUrl({ page: String(page + 1) }))} disabled={page >= totalPages}
                className="px-3 py-1.5 text-xs rounded-lg border border-input hover:bg-muted disabled:opacity-40 transition-colors">التالي</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <AppointmentModal
          appointment={editingAppt}
          doctors={doctors}
          patients={patients}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); router.refresh() }}
        />
      )}
    </div>
  )
}
