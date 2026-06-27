'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2, Save } from 'lucide-react'
import { patientSchema, type PatientInput } from '@/lib/validations/schemas'
import type { PatientWithUser } from '@/types'

interface Props {
  patient: PatientWithUser | null
  onClose: () => void
  onSuccess: () => void
}

export function PatientModal({ patient, onClose, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: patient ? {
      name: patient.user.name,
      email: patient.user.email,
      phone: patient.phone || '',
      nationalId: patient.nationalId || '',
      gender: (patient.gender as 'MALE' | 'FEMALE') || undefined,
      bloodType: patient.bloodType as PatientInput['bloodType'],
      city: patient.city || '',
      notes: '',
    } : { bloodType: 'UNKNOWN', maritalStatus: 'SINGLE' },
  })

  async function onSubmit(data: PatientInput) {
    setIsLoading(true)
    setError('')
    try {
      const url = patient ? `/api/patients/${patient.id}` : '/api/patients'
      const method = patient ? 'PUT' : 'POST'
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
  const errorClass = 'text-xs text-destructive mt-0.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">{patient ? 'تعديل بيانات المريض' : 'إضافة مريض جديد'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-8rem)] p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} id="patient-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>الاسم الكامل *</label>
                <input {...register('name')} className={inputClass} placeholder="محمد أحمد السالم" />
                {errors.name && <p className={errorClass}>{errors.name.message}</p>}
              </div>

              <div>
                <label className={labelClass}>البريد الإلكتروني</label>
                <input {...register('email')} type="email" className={inputClass} placeholder="patient@gmail.com" dir="ltr" />
                {errors.email && <p className={errorClass}>{errors.email.message}</p>}
              </div>

              <div>
                <label className={labelClass}>رقم الجوال</label>
                <input {...register('phone')} className={inputClass} placeholder="0501234567" dir="ltr" />
                {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
              </div>

              <div>
                <label className={labelClass}>رقم الهوية</label>
                <input {...register('nationalId')} className={inputClass} placeholder="1234567890" dir="ltr" />
              </div>

              <div>
                <label className={labelClass}>تاريخ الميلاد</label>
                <input {...register('dateOfBirth')} type="date" className={inputClass} dir="ltr" />
              </div>

              <div>
                <label className={labelClass}>الجنس</label>
                <select {...register('gender')} className={inputClass}>
                  <option value="">اختر الجنس</option>
                  <option value="MALE">ذكر</option>
                  <option value="FEMALE">أنثى</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>فصيلة الدم</label>
                <select {...register('bloodType')} className={inputClass}>
                  {[['UNKNOWN','غير معروف'],['A_POSITIVE','A+'],['A_NEGATIVE','A-'],['B_POSITIVE','B+'],['B_NEGATIVE','B-'],['AB_POSITIVE','AB+'],['AB_NEGATIVE','AB-'],['O_POSITIVE','O+'],['O_NEGATIVE','O-']].map(([v,l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>الحالة الاجتماعية</label>
                <select {...register('maritalStatus')} className={inputClass}>
                  <option value="SINGLE">أعزب</option>
                  <option value="MARRIED">متزوج</option>
                  <option value="DIVORCED">مطلق</option>
                  <option value="WIDOWED">أرمل</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>المدينة</label>
                <input {...register('city')} className={inputClass} placeholder="الرياض" />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>العنوان</label>
                <input {...register('address')} className={inputClass} placeholder="حي النخيل، شارع الملك فهد" />
              </div>

              <div>
                <label className={labelClass}>اسم جهة الاتصال الطارئة</label>
                <input {...register('emergencyName')} className={inputClass} placeholder="اسم الشخص" />
              </div>

              <div>
                <label className={labelClass}>جوال الطوارئ</label>
                <input {...register('emergencyPhone')} className={inputClass} placeholder="0501234567" dir="ltr" />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>الحساسيات</label>
                <input {...register('allergies')} className={inputClass} placeholder="حساسية من البنسلين، الغبار..." />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>ملاحظات</label>
                <textarea {...register('notes')} rows={3} className={inputClass} placeholder="أي ملاحظات إضافية..." />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-input hover:bg-muted transition-colors">
            إلغاء
          </button>
          <button
            form="patient-form"
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isLoading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
      </div>
    </div>
  )
}
