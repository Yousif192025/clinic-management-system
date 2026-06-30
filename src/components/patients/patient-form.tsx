'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, X } from 'lucide-react'

interface PatientFormProps {
  patient?: {
    id: string
    name: string
    nationalId?: string | null
    phone?: string | null
    city?: string | null
    gender?: string | null
    bloodType?: string | null
    dateOfBirth?: Date | null
  }
}

export function PatientForm({ patient }: PatientFormProps) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: patient?.name ?? '',
    nationalId: patient?.nationalId ?? '',
    phone: patient?.phone ?? '',
    city: patient?.city ?? '',
    gender: patient?.gender ?? 'MALE',
    bloodType: patient?.bloodType ?? 'UNKNOWN',
    dateOfBirth: patient?.dateOfBirth
      ? new Date(patient.dateOfBirth).toISOString().substring(0, 10)
      : '',
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)

    try {
      const url = patient
        ? `/api/patients/${patient.id}`
        : '/api/patients'

      const method = patient ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        throw new Error()
      }

      router.push('/patients')
      router.refresh()
    } catch {
      alert('حدث خطأ أثناء حفظ البيانات')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-card border border-border rounded-xl p-6"
    >
      <div>
        <h2 className="text-xl font-bold">
          {patient ? 'تعديل بيانات المريض' : 'إضافة مريض جديد'}
        </h2>

        <p className="text-sm text-muted-foreground mt-1">
          قم بإدخال بيانات المريض.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">

        <div>
          <label className="block mb-2 text-sm font-medium">
            الاسم الكامل
          </label>

          <input
            required
            name="name"
            value={form.name}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            الهوية الوطنية
          </label>

          <input
            name="nationalId"
            value={form.nationalId}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            رقم الجوال
          </label>

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            المدينة
          </label>

          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            الجنس
          </label>

          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="input"
          >
            <option value="MALE">ذكر</option>
            <option value="FEMALE">أنثى</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            فصيلة الدم
          </label>

          <select
            name="bloodType"
            value={form.bloodType}
            onChange={handleChange}
            className="input"
          >
            <option value="UNKNOWN">غير معروف</option>
            <option value="A_POSITIVE">A+</option>
            <option value="A_NEGATIVE">A-</option>
            <option value="B_POSITIVE">B+</option>
            <option value="B_NEGATIVE">B-</option>
            <option value="AB_POSITIVE">AB+</option>
            <option value="AB_NEGATIVE">AB-</option>
            <option value="O_POSITIVE">O+</option>
            <option value="O_NEGATIVE">O-</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            تاريخ الميلاد
          </label>

          <input
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
            className="input"
          />
        </div>

      </div>

      <div className="flex gap-3">

        <button
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}

          {patient ? 'حفظ التعديلات' : 'إضافة المريض'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          إلغاء
        </button>

      </div>
    </form>
  )
}
