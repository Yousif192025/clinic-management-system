'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, FileText, Trash2, ChevronDown, ChevronUp, Pill } from 'lucide-react'
import { formatDate } from '@/lib/utils/helpers'
import { MedicalRecordModal } from './medical-record-modal'

interface Doctor { id: string; specialization: string; user: { name: string } }
interface Patient { id: string; patientCode: string; user: { name: string } }
interface Prescription { id: string; medicationName: string; dosage: string; frequency: string; duration: string; instructions?: string | null }
interface VitalSign { temperature?: number | null; bloodPressureSystolic?: number | null; bloodPressureDiastolic?: number | null; heartRate?: number | null; weight?: number | null; height?: number | null }
interface MedicalRecord {
  id: string
  recordCode: string
  visitDate: Date
  chiefComplaint?: string | null
  symptoms?: string | null
  diagnosis?: string | null
  treatment?: string | null
  notes?: string | null
  patient: { user: { name: string } }
  doctor: { user: { name: string }; specialization: string }
  prescriptions: Prescription[]
  vitalSigns?: VitalSign | null
}

interface Props {
  records: MedicalRecord[]
  total: number
  page: number
  perPage: number
  search: string
  doctors: Doctor[]
  patients: Patient[]
  canEdit: boolean
}

export function MedicalRecordsClient({ records, total, page, perPage, search, doctors, patients, canEdit }: Props) {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState(search)
  const [showModal, setShowModal] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const totalPages = Math.ceil(total / perPage)

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا السجل الطبي؟')) return
    const res = await fetch(`/api/medical-records/${id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">السجلات الطبية</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{total.toLocaleString('ar')} سجل طبي</p>
        </div>
        {canEdit && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
            <Plus className="w-4 h-4" /> سجل جديد
          </button>
        )}
      </div>

      <form onSubmit={e => { e.preventDefault(); router.push(`/medical-records?q=${searchValue}`) }} className="relative max-w-xs">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={searchValue} onChange={e => setSearchValue(e.target.value)}
          placeholder="بحث بالاسم أو التشخيص..."
          className="w-full pr-9 pl-4 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
      </form>

      <div className="space-y-3">
        {records.length === 0 ? (
          <div className="data-table-container text-center py-12 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
            لا توجد سجلات طبية
          </div>
        ) : (
          records.map(record => {
            const isExpanded = expandedId === record.id
            return (
              <div key={record.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                {/* Header Row */}
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : record.id)}
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-primary">{record.recordCode}</span>
                      <span className="text-foreground font-medium text-sm">{record.patient.user.name}</span>
                      <span className="text-muted-foreground text-xs">·</span>
                      <span className="text-muted-foreground text-xs">{record.doctor.user.name}</span>
                    </div>
                    {record.diagnosis && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{record.diagnosis}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">{formatDate(record.visitDate)}</span>
                    {record.prescriptions.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                        <Pill className="w-3 h-3" /> {record.prescriptions.length}
                      </span>
                    )}
                    {canEdit && (
                      <button onClick={e => { e.stopPropagation(); handleDelete(record.id) }}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-border px-5 py-4 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: 'الشكوى الرئيسية', value: record.chiefComplaint },
                        { label: 'الأعراض', value: record.symptoms },
                        { label: 'التشخيص', value: record.diagnosis },
                        { label: 'العلاج', value: record.treatment },
                      ].map(item => item.value && (
                        <div key={item.label}>
                          <p className="text-xs font-medium text-muted-foreground mb-1">{item.label}</p>
                          <p className="text-sm text-foreground bg-muted/40 rounded-lg px-3 py-2">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Vital Signs */}
                    {record.vitalSigns && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">العلامات الحيوية</p>
                        <div className="flex flex-wrap gap-2">
                          {record.vitalSigns.temperature && (
                            <span className="text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2.5 py-1 rounded-full">
                              🌡 {record.vitalSigns.temperature.toFixed(1)}°م
                            </span>
                          )}
                          {record.vitalSigns.bloodPressureSystolic && (
                            <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full">
                              💉 {record.vitalSigns.bloodPressureSystolic}/{record.vitalSigns.bloodPressureDiastolic} mmHg
                            </span>
                          )}
                          {record.vitalSigns.heartRate && (
                            <span className="text-xs bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 px-2.5 py-1 rounded-full">
                              ❤️ {record.vitalSigns.heartRate} bpm
                            </span>
                          )}
                          {record.vitalSigns.weight && (
                            <span className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full">
                              ⚖️ {record.vitalSigns.weight} كغ
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Prescriptions */}
                    {record.prescriptions.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">الوصفة الطبية</p>
                        <div className="space-y-2">
                          {record.prescriptions.map(rx => (
                            <div key={rx.id} className="flex items-start gap-3 text-xs bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-lg px-3 py-2">
                              <Pill className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-foreground">{rx.medicationName}</span>
                                <span className="text-muted-foreground"> — {rx.dosage} · {rx.frequency} · {rx.duration}</span>
                                {rx.instructions && <p className="text-muted-foreground mt-0.5">{rx.instructions}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => router.push(`/medical-records?q=${search}&page=${page - 1}`)} disabled={page <= 1}
            className="px-3 py-1.5 text-xs rounded-lg border border-input hover:bg-muted disabled:opacity-40 transition-colors">السابق</button>
          <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
          <button onClick={() => router.push(`/medical-records?q=${search}&page=${page + 1}`)} disabled={page >= totalPages}
            className="px-3 py-1.5 text-xs rounded-lg border border-input hover:bg-muted disabled:opacity-40 transition-colors">التالي</button>
        </div>
      )}

      {showModal && (
        <MedicalRecordModal
          doctors={doctors}
          patients={patients}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); router.refresh() }}
        />
      )}
    </div>
  )
}
