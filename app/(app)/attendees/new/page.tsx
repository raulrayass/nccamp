'use client'

import { AttendeeFormPage } from '@/components/attendee-form-page'
import { useUser } from '@/components/user-provider'
import { redirect } from 'next/navigation'

export default function NewAttendeePage() {
  const { user } = useUser()

  if (!user?.id) {
    redirect('/sign-in')
  }

  return <AttendeeFormPage userId={user.id} mode="create" />
}
