'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2, Save } from 'lucide-react'
import { doctorSchema, type DoctorInput } from '@/lib/validations/schemas'
import type { DoctorWithUser } from '@/types'

const SPECIALIZATIONS = [
  'طب باطني', 'طب الأطفال', 'جراحة عامة', 'أمراض جلدية', 'طب عظام',
  'طب نساء وتوليد', 'طب أسنان', 'طب عيون', 'طب أنف وأذن وحنجرة',
  'أمراض قلب', 'طب نفسي', 'طب طوارئ', 'تخدير', 'أشعة', 'مختبر',
]

interface Props {
  doctor: DoctorWithUser | null
  onClose: () => void
  onSuccess: () => void
}

export function DoctorModal({ doctor, onClose, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<DoctorInput>({
    resolver: zodResolver(doctorSchema),
    defaultValues: doctor ? {
      name: doctor.user.name,
      email: doctor.user.email,
      specialization: doctor.specialization,
      licenseNumber: doctor.licenseNumber,
      consultationFee: Number(doctor.consultationFee),
      bio: '',
    } : { consultationFee: 0 },
  })

  async function onSubmit(data: DoctorInput) {
    setIsLoading(true)
    setError('')
    try {
      const url = doctor ? `/api/doctors/${doctor.id}` : '/api/doctors'
      const method = doctor ? 'PUT' : 'POST'
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

  const inputClass = 'w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all'
  const labelClass = 'block text-xs font-medium text-muted-foreground mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">{doctor ? 'تعديل بيانات الطبيب' : 'إضافة طبيب جديد'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6">
          {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} id="doctor-form" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>الاسم الكامل *</label>
              <input {...register('name')} className={inputClass} placeholder="د. أحمد محمد" />
              {errors.name && <p className="text-xs text-destructive mt-0.5">{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelClass}>البريد الإلكتروني *</label>
              <input {...register('email')} type="email" className={inputClass} dir="ltr" placeholder="dr@clinic.com" />
              {errors.email && <p className="text-xs text-destructive mt-0.5">{errors.email.message}</p>}
            </div>
            <div>
              <label className={labelClass}>رقم الجوال</label>
              <input {...register('phone')} className={inputClass} dir="ltr" placeholder="0501234567" />
            </div>
            <div>
              <label className={labelClass}>التخصص *</label>
              <select {...register('specialization')} className={inputClass}>
                <option value="">اختر التخصص</option>
                {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.specialization && <p className="text-xs text-destructive mt-0.5">{errors.specialization.message}</p>}
            </div>
            <div>
              <label className={labelClass}>رقم الترخيص *</label>
              <input {...register('licenseNumber')} className={inputClass} dir="ltr" placeholder="SA-001234" />
              {errors.licenseNumber && <p className="text-xs text-destructive mt-0.5">{errors.licenseNumber.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>رسوم الاستشارة (ريال)</label>
              <input {...register('consultationFee')} type="number" min="0" className={inputClass} placeholder="200" />
              {errors.consultationFee && <p className="text-xs text-destructive mt-0.5">{errors.consultationFee.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>نبذة تعريفية</label>
              <textarea {...register('bio')} rows={3} className={inputClass} placeholder="خبرة الطبيب وتخصصاته..." />
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-input hover:bg-muted transition-colors">إلغاء</button>
          <button form="doctor-form" type="submit" disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60">
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isLoading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
      </div>
    </div>
  )
}
