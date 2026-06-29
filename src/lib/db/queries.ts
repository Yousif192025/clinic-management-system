import { prisma } from './prisma'

export async function getDashboardStats() {

  const [
    patients,
    doctors,
    appointments,
    invoices,
  ] = await Promise.all([

    prisma.patient.count(),

    prisma.doctor.count(),

    prisma.appointment.count(),

    prisma.invoice.count(),

  ])

  return {
    patients,
    doctors,
    appointments,
    invoices,
  }
}
