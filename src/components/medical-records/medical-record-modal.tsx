'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2, Save, Plus, Trash2 } from 'lucide-react'
import { medicalRecordSchema, type MedicalRecordInput } from '@/lib/validations/schemas'
import { format } from 'date-fns'

interface Doctor { id: string; specialization: string; user: { name: string } }
interface Patient { id: string; patientCode: string; user: { name: string } }

interface Props {
  doctors: Doctor[]
  patients: Patient[]
  onClose: () => void
  onSuccess: () => void
}

export function MedicalRecordModal({ doctors, patients, onClose, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'basic' | 'vitals' | 'prescriptions'>('basic')

  const { register, handleSubmit, control, formState: { errors } } = useForm<MedicalRecordInput>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      visitDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  })

  const { fields: rxFields, append: appendRx, remove: removeRx } = useFieldArray({
    control,
    name: 'prescriptions' as never,
  })

  async function onSubmit(data: MedicalRecordInput) {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/medical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'حدث خطأ')
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = 'w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring'
  const labelClass = 'block text-xs font-medium text-muted-foreground mb-1'
  const tabClass = (active: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">إضافة سجل طبي جديد</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-4">
          <button type="button" onClick={() => setTab('basic')} className={tabClass(tab === 'basic')}>البيانات الأساسية</button>
          <button type="button" onClick={() => setTab('vitals')} className={tabClass(tab === 'vitals')}>العلامات الحيوية</button>
          <button type="button" onClick={() => setTab('prescriptions')} className={tabClass(tab === 'prescriptions')}>الوصفة الطبية</button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-10rem)] p-6">
          {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} id="mr-form">
            {tab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>المريض *</label>
                    <select {...register('patientId')} className={inputClass}>
                      <option value="">اختر المريض</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.user.name} ({p.patientCode})</option>)}
                    </select>
                    {errors.patientId && <p className="text-xs text-destructive mt-0.5">{errors.patientId.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>الطبيب *</label>
                    <select {...register('doctorId')} className={inputClass}>
                      <option value="">اختر الطبيب</option>
                      {doctors.map(d => <option key={d.id} value={d.id}>{d.user.name} - {d.specialization}</option>)}
                    </select>
                    {errors.doctorId && <p className="text-xs text-destructive mt-0.5">{errors.doctorId.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>تاريخ الزيارة *</label>
                    <input {...register('visitDate')} type="datetime-local" className={inputClass} dir="ltr" />
                  </div>
                  <div>
                    <label className={labelClass}>موعد المتابعة</label>
                    <input {...register('followUpDate')} type="date" className={inputClass} dir="ltr" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>الشكوى الرئيسية</label>
                  <input {...register('chiefComplaint')} className={inputClass} placeholder="ما يشكو منه المريض..." />
                </div>

                <div>
                  <label className={labelClass}>الأعراض</label>
                  <textarea {...register('symptoms')} rows={2} className={inputClass} placeholder="صف الأعراض بالتفصيل..." />
                </div>

                <div>
                  <label className={labelClass}>التشخيص</label>
                  <textarea {...register('diagnosis')} rows={2} className={inputClass} placeholder="التشخيص الطبي..." />
                </div>

                <div>
                  <label className={labelClass}>العلاج</label>
                  <textarea {...register('treatment')} rows={2} className={inputClass} placeholder="خطة العلاج..." />
                </div>

                <div>
                  <label className={labelClass}>ملاحظات إضافية</label>
                  <textarea {...register('notes')} rows={2} className={inputClass} placeholder="أي ملاحظات أخرى..." />
                </div>
              </div>
            )}

            {tab === 'vitals' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">سجّل العلامات الحيوية للمريض (اختياري)</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'temperature', label: 'درجة الحرارة (°م)', placeholder: '37.0' },
                    { name: 'heartRate', label: 'معدل نبضات القلب (bpm)', placeholder: '80' },
                    { name: 'oxygenSaturation', label: 'تشبع الأكسجين (%)', placeholder: '98' },
                    { name: 'weight', label: 'الوزن (كغ)', placeholder: '70' },
                    { name: 'height', label: 'الطول (سم)', placeholder: '170' },
                    { name: 'bloodPressureSystolic', label: 'ضغط الدم الانقباضي', placeholder: '120' },
                    { name: 'bloodPressureDiastolic', label: 'ضغط الدم الانبساطي', placeholder: '80' },
                    { name: 'respiratoryRate', label: 'معدل التنفس', placeholder: '16' },
                  ].map(field => (
                    <div key={field.name}>
                      <label className={labelClass}>{field.label}</label>
                      <input
                        {...register(`vitals.${field.name}` as never)}
                        type="number"
                        step="0.1"
                        placeholder={field.placeholder}
                        className={inputClass}
                        dir="ltr"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'prescriptions' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">أضف الأدوية والجرعات</p>
                  <button
                    type="button"
                    onClick={() => appendRx({ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' } as never)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Plus className="w-3 h-3" /> إضافة دواء
                  </button>
                </div>

                {rxFields.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
                    لا توجد أدوية بعد — اضغط "إضافة دواء"
                  </div>
                )}

                {rxFields.map((field, idx) => (
                  <div key={field.id} className="border border-border rounded-xl p-4 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeRx(idx)}
                      className="absolute top-3 left-3 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-xs font-semibold text-muted-foreground">دواء {idx + 1}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>اسم الدواء</label>
                        <input {...register(`prescriptions.${idx}.medicationName` as never)} className={inputClass} placeholder="باراسيتامول" />
                      </div>
                      <div>
                        <label className={labelClass}>الجرعة</label>
                        <input {...register(`prescriptions.${idx}.dosage` as never)} className={inputClass} placeholder="500 ملغ" />
                      </div>
                      <div>
                        <label className={labelClass}>التكرار</label>
                        <input {...register(`prescriptions.${idx}.frequency` as never)} className={inputClass} placeholder="3 مرات يومياً" />
                      </div>
                      <div>
                        <label className={labelClass}>المدة</label>
                        <input {...register(`prescriptions.${idx}.duration` as never)} className={inputClass} placeholder="5 أيام" />
                      </div>
                      <div className="col-span-2">
                        <label className={labelClass}>تعليمات</label>
                        <input {...register(`prescriptions.${idx}.instructions` as never)} className={inputClass} placeholder="بعد الأكل..." />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-input hover:bg-muted transition-colors">إلغاء</button>
          <button form="mr-form" type="submit" disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60">
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isLoading ? 'جاري الحفظ...' : 'حفظ السجل'}
          </button>
        </div>
      </div>
    </div>
  )
}
