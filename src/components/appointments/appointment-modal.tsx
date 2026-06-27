'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2, Save } from 'lucide-react'
import { appointmentSchema, type AppointmentInput } from '@/lib/validations/schemas'
import { format } from 'date-fns'

interface Doctor { id: string; specialization: string; user: { name: string } }
interface Patient { id: string; patientCode: string; user: { name: string } }
interface Appointment {
  id: string
  scheduledAt: Date
  status: string
  type: string
  reason?: string | null
  patient: { user: { name: string } }
  doctor: { user: { name: string } }
}

interface Props {
  appointment: Appointment | null
  doctors: Doctor[]
  patients: Patient[]
  onClose: () => void
  onSuccess: () => void
}

export function AppointmentModal({ appointment, doctors, patients, onClose, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: appointment ? {
      scheduledAt: format(new Date(appointment.scheduledAt), "yyyy-MM-dd'T'HH:mm"),
      type: appointment.type,
      reason: appointment.reason || '',
      duration: 30,
    } : { type: 'CONSULTATION', duration: 30 },
  })

  async function onSubmit(data: AppointmentInput) {
    setIsLoading(true)
    setError('')
    try {
      const url = appointment ? `/api/appointments/${appointment.id}` : '/api/appointments'
      const method = appointment ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">{appointment ? 'تعديل الموعد' : 'إنشاء موعد جديد'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6">
          {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} id="appt-form" className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>تاريخ ووقت الموعد *</label>
                <input {...register('scheduledAt')} type="datetime-local" className={inputClass} dir="ltr" />
                {errors.scheduledAt && <p className="text-xs text-destructive mt-0.5">{errors.scheduledAt.message}</p>}
              </div>
              <div>
                <label className={labelClass}>المدة (دقيقة)</label>
                <select {...register('duration')} className={inputClass}>
                  <option value={15}>15 دقيقة</option>
                  <option value={30}>30 دقيقة</option>
                  <option value={45}>45 دقيقة</option>
                  <option value={60}>ساعة</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>نوع الزيارة</label>
              <select {...register('type')} className={inputClass}>
                <option value="CONSULTATION">استشارة</option>
                <option value="FOLLOW_UP">متابعة</option>
                <option value="CHECKUP">فحص دوري</option>
                <option value="EMERGENCY">طوارئ</option>
                <option value="PROCEDURE">إجراء طبي</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>سبب الزيارة</label>
              <textarea {...register('reason')} rows={2} className={inputClass} placeholder="صداع، ألم في البطن..." />
            </div>

            <div>
              <label className={labelClass}>ملاحظات</label>
              <textarea {...register('notes')} rows={2} className={inputClass} placeholder="أي ملاحظات إضافية..." />
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-input hover:bg-muted transition-colors">إلغاء</button>
          <button form="appt-form" type="submit" disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60">
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isLoading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
      </div>
    </div>
  )
}
