import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

export const patientSchema = z.object({
  name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  phone: z.string().min(9, 'رقم الجوال غير صحيح').optional().or(z.literal('')),
  nationalId: z.string().optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  bloodType: z.enum(['A_POSITIVE','A_NEGATIVE','B_POSITIVE','B_NEGATIVE','AB_POSITIVE','AB_NEGATIVE','O_POSITIVE','O_NEGATIVE','UNKNOWN']).default('UNKNOWN'),
  maritalStatus: z.enum(['SINGLE','MARRIED','DIVORCED','WIDOWED']).default('SINGLE'),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  emergencyName: z.string().optional().or(z.literal('')),
  emergencyPhone: z.string().optional().or(z.literal('')),
  allergies: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export const doctorSchema = z.object({
  name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  specialization: z.string().min(2, 'التخصص مطلوب'),
  licenseNumber: z.string().min(3, 'رقم الترخيص مطلوب'),
  phone: z.string().optional().or(z.literal('')),
  consultationFee: z.coerce.number().min(0, 'رسوم الاستشارة يجب أن تكون أكبر من أو تساوي 0'),
  bio: z.string().optional().or(z.literal('')),
})

export const appointmentSchema = z.object({
  patientId: z.string().min(1, 'اختر المريض'),
  doctorId: z.string().min(1, 'اختر الطبيب'),
  scheduledAt: z.string().min(1, 'حدد وقت الموعد'),
  type: z.string().default('CONSULTATION'),
  reason: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  duration: z.coerce.number().default(30),
})

export const medicalRecordSchema = z.object({
  patientId: z.string().min(1, 'اختر المريض'),
  doctorId: z.string().min(1, 'اختر الطبيب'),
  appointmentId: z.string().optional().or(z.literal('')),
  visitDate: z.string().min(1, 'حدد تاريخ الزيارة'),
  chiefComplaint: z.string().optional().or(z.literal('')),
  symptoms: z.string().optional().or(z.literal('')),
  diagnosis: z.string().optional().or(z.literal('')),
  treatment: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  followUpDate: z.string().optional().or(z.literal('')),
})

export const invoiceSchema = z.object({
  patientId: z.string().min(1, 'اختر المريض'),
  dueDate: z.string().optional().or(z.literal('')),
  taxRate: z.coerce.number().min(0).max(100).default(15),
  discount: z.coerce.number().min(0).default(0),
  notes: z.string().optional().or(z.literal('')),
  items: z.array(z.object({
    description: z.string().min(1, 'وصف الخدمة مطلوب'),
    quantity: z.coerce.number().min(1),
    unitPrice: z.coerce.number().min(0),
  })).min(1, 'أضف خدمة واحدة على الأقل'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type PatientInput = z.infer<typeof patientSchema>
export type DoctorInput = z.infer<typeof doctorSchema>
export type AppointmentInput = z.infer<typeof appointmentSchema>
export type MedicalRecordInput = z.infer<typeof medicalRecordSchema>
export type InvoiceInput = z.infer<typeof invoiceSchema>
