import type { Metadata } from 'next'
import { auth } from '@/lib/auth/config'
import { SettingsClient } from '@/components/settings/settings-client'

export const metadata: Metadata = { title: 'الإعدادات' }

export default async function SettingsPage() {
  const session = await auth()
  return <SettingsClient user={session!.user} />
}
