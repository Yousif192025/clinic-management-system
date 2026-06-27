import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, pattern = 'dd/MM/yyyy') {
  return format(new Date(date), pattern, { locale: ar })
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), 'dd/MM/yyyy - hh:mm a', { locale: ar })
}

export function formatRelativeTime(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ar })
}

export function formatCurrency(amount: number | string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
  }).format(num)
}

export function generateCode(prefix: string, count: number) {
  return `${prefix}-${String(count + 1).padStart(6, '0')}`
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export const APPOINTMENT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: 'مجدول', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  CONFIRMED: { label: 'مؤكد', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  COMPLETED: { label: 'مكتمل', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  CANCELLED: { label: 'ملغي', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  NO_SHOW: { label: 'لم يحضر', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
}

export const INVOICE_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PAID: { label: 'مدفوع', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  PENDING: { label: 'معلق', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  PARTIAL: { label: 'جزئي', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  CANCELLED: { label: 'ملغي', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

export const GENDER_MAP: Record<string, string> = {
  MALE: 'ذكر',
  FEMALE: 'أنثى',
}

export const BLOOD_TYPE_MAP: Record<string, string> = {
  A_POSITIVE: 'A+', A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+', B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+', AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+', O_NEGATIVE: 'O-',
  UNKNOWN: 'غير معروف',
}

export const ROLE_MAP: Record<string, string> = {
  ADMIN: 'مدير النظام',
  DOCTOR: 'طبيب',
  NURSE: 'ممرضة',
  RECEPTIONIST: 'موظف استقبال',
  PATIENT: 'مريض',
}
