import type { Role } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: Role
      image?: string | null
    }
  }
  interface User {
    role: Role
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
  }
}

export type { Role }

export interface DashboardStats {
  totalPatients: number
  totalDoctors: number
  todayAppointments: number
  monthlyRevenue: number
  pendingInvoices: number
  completedAppointments: number
}

export interface AppointmentWithRelations {
  id: string
  appointmentCode: string
  scheduledAt: Date
  status: string
  type: string
  reason?: string | null
  patient: { id: string; patientCode: string; user: { name: string } }
  doctor: { id: string; doctorCode: string; specialization: string; user: { name: string } }
}

export interface PatientWithUser {
  id: string
  patientCode: string
  nationalId?: string | null
  gender?: string | null
  dateOfBirth?: Date | null
  phone?: string | null
  bloodType: string
  city?: string | null
  isArchived: boolean
  createdAt: Date
  user: { name: string; email: string; image?: string | null }
}

export interface DoctorWithUser {
  id: string
  doctorCode: string
  specialization: string
  licenseNumber: string
  consultationFee: number | string
  isActive: boolean
  createdAt: Date
  user: { name: string; email: string; image?: string | null }
}

export interface InvoiceWithPatient {
  id: string
  invoiceCode: string
  status: string
  total: number | string
  paidAmount: number | string
  issueDate: Date
  dueDate?: Date | null
  patient: { patientCode: string; user: { name: string } }
}
