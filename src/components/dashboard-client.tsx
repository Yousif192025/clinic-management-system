'use client'

import { Users, UserRound, Calendar, TrendingUp, Receipt, CheckCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts'
import { formatCurrency, formatDateTime, APPOINTMENT_STATUS_MAP } from '@/lib/utils/helpers'
import type { Role } from '@prisma/client'

interface Props {
  data: {
    stats: {
      totalPatients: number
      totalDoctors: number
      todayAppointments: number
      completedAppointments: number
      monthlyRevenue: number
      pendingInvoices: number
    }
    recentAppointments: Array<{
      id: string
      appointmentCode: string
      scheduledAt: Date
      status: string
      patient: { user: { name: string } }
      doctor: { user: { name: string }; specialization: string }
    }>
    monthlyStats: Array<{ month: string; count: bigint }>
  }
  user: { name: string; role: Role }
}

const SAMPLE_CHART_DATA = [
  { month: 'يناير', مواعيد: 45, إيرادات: 12000 },
  { month: 'فبراير', مواعيد: 52, إيرادات: 14500 },
  { month: 'مارس', مواعيد: 61, إيرادات: 17200 },
  { month: 'أبريل', مواعيد: 48, إيرادات: 13800 },
  { month: 'مايو', مواعيد: 70, إيرادات: 19600 },
  { month: 'يونيو', مواعيد: 65, إيرادات: 18300 },
]

export function DashboardClient({ data, user }: Props) {
  const { stats, recentAppointments } = data

  const statCards = [
    { label: 'إجمالي المرضى', value: stats.totalPatients.toLocaleString('ar'), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', change: '+12%' },
    { label: 'الأطباء النشطون', value: stats.totalDoctors.toLocaleString('ar'), icon: UserRound, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20', change: '+2%' },
    { label: 'مواعيد اليوم', value: stats.todayAppointments.toLocaleString('ar'), icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', change: '+5' },
    { label: 'الإيرادات الشهرية', value: formatCurrency(stats.monthlyRevenue), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', change: '+18%' },
    { label: 'مواعيد مكتملة', value: stats.completedAppointments.toLocaleString('ar'), icon: CheckCircle, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20', change: '+8%' },
    { label: 'فواتير معلقة', value: formatCurrency(stats.pendingInvoices), icon: Receipt, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', change: '-3%' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          أهلاً، {user.name.split(' ')[0]} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          هذا ملخص نشاط العيادة اليوم
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="stat-card group">
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  card.change.startsWith('+') ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-rose-600 bg-rose-50 dark:bg-rose-900/20'
                }`}>
                  {card.change}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Appointments Chart */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">المواعيد الشهرية</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={SAMPLE_CHART_DATA} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="مواعيد" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">الإيرادات الشهرية</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={SAMPLE_CHART_DATA}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value: number) => [formatCurrency(value), 'الإيرادات']}
              />
              <Area type="monotone" dataKey="إيرادات" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="data-table-container">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">آخر المواعيد</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['رقم الموعد', 'المريض', 'الطبيب', 'التخصص', 'الوقت', 'الحالة'].map(h => (
                  <th key={h} className="text-right px-5 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentAppointments.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">لا توجد مواعيد</td></tr>
              ) : (
                recentAppointments.map(appt => {
                  const statusInfo = APPOINTMENT_STATUS_MAP[appt.status] || { label: appt.status, color: 'bg-gray-100 text-gray-700' }
                  return (
                    <tr key={appt.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-primary">{appt.appointmentCode}</td>
                      <td className="px-5 py-3 text-foreground">{appt.patient.user.name}</td>
                      <td className="px-5 py-3 text-foreground">{appt.doctor.user.name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{appt.doctor.specialization}</td>
                      <td className="px-5 py-3 text-muted-foreground" dir="ltr">{formatDateTime(appt.scheduledAt)}</td>
                      <td className="px-5 py-3">
                        <span className={`status-badge ${statusInfo.color}`}>{statusInfo.label}</span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
