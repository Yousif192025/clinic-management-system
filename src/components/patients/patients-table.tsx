'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  UserRound,
} from 'lucide-react'

interface Patient {
  id: string
  patientCode: string
  nationalId: string
  name: string
  email: string
  gender: string | null
  phone: string
  city: string
  bloodType: string | null
  isActive: boolean
  createdAt: string
}

interface Props {
  patients: Patient[]
}

const genderMap: Record<string, string> = {
  MALE: 'ذكر',
  FEMALE: 'أنثى',
}

export function PatientsTable({ patients }: Props) {
  const [search, setSearch] = useState('')

  const filteredPatients = useMemo(() => {
    const q = search.toLowerCase()

    return patients.filter((patient) => {
      return (
        patient.name.toLowerCase().includes(q) ||
        patient.patientCode.toLowerCase().includes(q) ||
        patient.email.toLowerCase().includes(q) ||
        patient.phone.toLowerCase().includes(q) ||
        patient.city.toLowerCase().includes(q) ||
        patient.nationalId.toLowerCase().includes(q)
      )
    })
  }, [patients, search])

  return (
    <div className="space-y-5">

      {/* Header */}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

        <div className="relative w-full md:max-w-md">

          <Search
            className="absolute right-3 top-3 h-4 w-4 text-muted-foreground"
          />

          <input
            type="text"
            placeholder="بحث باسم المريض أو رقم الملف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border bg-background py-2.5 pr-10 pl-4 outline-none focus:ring-2 focus:ring-primary"
          />

        </div>

        <Link
          href="/patients/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-primary-foreground hover:opacity-90"
        >
          <Plus size={18} />
          إضافة مريض
        </Link>

      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-xl border bg-card">

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-muted/50">

              <tr>

                <th className="px-4 py-3 text-right text-sm">
                  رقم الملف
                </th>

                <th className="px-4 py-3 text-right text-sm">
                  المريض
                </th>

                <th className="px-4 py-3 text-right text-sm">
                  الهوية
                </th>

                <th className="px-4 py-3 text-right text-sm">
                  الهاتف
                </th>

                <th className="px-4 py-3 text-right text-sm">
                  المدينة
                </th>

                <th className="px-4 py-3 text-right text-sm">
                  فصيلة الدم
                </th>

                <th className="px-4 py-3 text-right text-sm">
                  الحالة
                </th>

                <th className="px-4 py-3 text-center text-sm">
                  العمليات
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredPatients.length === 0 ? (

                <tr>

                  <td
                    colSpan={8}
                    className="py-12 text-center text-muted-foreground"
                  >

                    لا توجد بيانات

                  </td>

                </tr>

              ) : (

                filteredPatients.map((patient) => (

                  <tr
                    key={patient.id}
                    className="border-t hover:bg-muted/30 transition"
                  >

                    <td className="px-4 py-4 font-medium">
                      {patient.patientCode}
                    </td>

                    <td className="px-4 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">

                          <UserRound
                            className="h-5 w-5 text-primary"
                          />

                        </div>

                        <div>

                          <div className="font-medium">
                            {patient.name}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {patient.email}
                          </div>

                        </div>

                      </div>

                    </td>

                    <td className="px-4 py-4">
                      {patient.nationalId || '-'}
                    </td>

                    <td className="px-4 py-4">
                      {patient.phone || '-'}
                    </td>

                    <td className="px-4 py-4">
                      {patient.city || '-'}
                    </td>

                    <td className="px-4 py-4">
                      {patient.bloodType ?? '-'}
                    </td>

                    <td className="px-4 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          patient.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {patient.isActive ? 'نشط' : 'موقوف'}
                      </span>

                    </td>

                    <td className="px-4 py-4">

                      <div className="flex items-center justify-center gap-2">

                        <Link
                          href={`/patients/${patient.id}`}
                          className="rounded-lg border p-2 hover:bg-muted"
                        >
                          <Eye size={18} />
                        </Link>

                        <Link
                          href={`/patients/${patient.id}/edit`}
                          className="rounded-lg border p-2 hover:bg-muted"
                        >
                          <Pencil size={18} />
                        </Link>

                        <button
                          className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      <div className="text-sm text-muted-foreground">

        إجمالي المرضى: <strong>{filteredPatients.length}</strong>

      </div>

    </div>
  )
}
