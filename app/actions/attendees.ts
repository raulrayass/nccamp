'use server'

import { db } from '@/lib/db'
import { attendees, attendeePayments, transactions, categories } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { desc } from 'drizzle-orm'

const ATTENDEES_PER_PAGE = 20

// Get ALL attendees for reports and metrics (no pagination)
export async function getAllAttendees(userId: string) {
  return db
    .select()
    .from(attendees)
    .where(eq(attendees.userId, userId))
    .orderBy(desc(attendees.createdAt))
}

// Get paginated attendees for UI display
export async function getAttendees(userId: string, page: number = 1) {
  const offset = (page - 1) * ATTENDEES_PER_PAGE
  return db
    .select()
    .from(attendees)
    .where(eq(attendees.userId, userId))
    .orderBy(desc(attendees.createdAt))
    .limit(ATTENDEES_PER_PAGE)
    .offset(offset)
}

export async function getAttendeesCount(userId: string) {
  const result = await db
    .select({ count: db.sql`count(*)` })
    .from(attendees)
    .where(eq(attendees.userId, userId))
  return parseInt(result[0].count as string, 10)
}

export async function getAttendeePayments(userId: string, attendeeId: number) {
  return db
    .select()
    .from(attendeePayments)
    .where(and(eq(attendeePayments.userId, userId), eq(attendeePayments.attendeeId, attendeeId)))
    .orderBy(desc(attendeePayments.createdAt))
}

export async function createAttendee(
  userId: string,
  data: {
    name: string
    age?: number | null
    shirtSize?: string
    sex?: string
    phone?: string
    church?: string
    emergencyContactName?: string
    emergencyContactPhone?: string
    emergencyContactName2?: string
    emergencyContactPhone2?: string
    allergies?: string
    roomId?: number | null
    teamId?: number | null
    totalAmount: number
    discount?: number // 0, 10, 20, 30
    notes?: string
  }
) {
  await db.insert(attendees).values({
    userId,
    name: data.name,
    age: data.age ?? null,
    shirtSize: data.shirtSize || null,
    sex: data.sex || null,
    phone: data.phone || '',
    church: data.church || '',
    emergencyContactName: data.emergencyContactName || '',
    emergencyContactPhone: data.emergencyContactPhone || '',
    emergencyContactName2: data.emergencyContactName2 || '',
    emergencyContactPhone2: data.emergencyContactPhone2 || '',
    allergies: data.allergies || '',
    roomId: data.roomId ?? null,
    teamId: data.teamId ?? null,
    totalAmount: parseFloat(data.totalAmount.toString()),
    discount: data.discount ?? 0,
    status: 'pending',
    notes: data.notes || '',
  })
}

export async function updateAttendee(
  userId: string,
  attendeeId: number,
  data: Partial<{
    name: string
    age: number | null
    shirtSize: string
    sex: string
    phone: string
    church: string
    emergencyContactName: string
    emergencyContactPhone: string
    emergencyContactName2: string
    emergencyContactPhone2: string
    allergies: string
    roomId: number | null
    teamId: number | null
    totalAmount: number
    discount: number
    notes: string
  }>
) {
  const updateData: any = {
    ...data,
    updatedAt: new Date(),
  }
  if (data.totalAmount !== undefined) {
    updateData.totalAmount = parseFloat(data.totalAmount.toString())
  }
  await db
    .update(attendees)
    .set(updateData)
    .where(and(eq(attendees.userId, userId), eq(attendees.id, attendeeId)))
}

export async function toggleCheckIn(userId: string, attendeeId: number, checkedIn: boolean) {
  await db
    .update(attendees)
    .set({ checkedIn, updatedAt: new Date() })
    .where(and(eq(attendees.userId, userId), eq(attendees.id, attendeeId)))
}

export async function deleteAttendee(userId: string, attendeeId: number) {
  // Obtener el campero para conocer su nombre (necesario para borrar transacciones)
  const [attendee] = await db
    .select()
    .from(attendees)
    .where(and(eq(attendees.userId, userId), eq(attendees.id, attendeeId)))

  if (!attendee) throw new Error('Campero no encontrado')

  // Obtener todos los pagos del campero
  const payments = await db
    .select()
    .from(attendeePayments)
    .where(and(eq(attendeePayments.userId, userId), eq(attendeePayments.attendeeId, attendeeId)))

  // Borrar la transacción correspondiente a cada pago (por nombre + monto)
  for (const payment of payments) {
    await db
      .delete(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'income'),
          eq(transactions.amount, payment.amount),
          eq(transactions.description, `Pago de ${attendee.name}`)
        )
      )
  }

  await db.delete(attendeePayments).where(eq(attendeePayments.attendeeId, attendeeId))
  await db.delete(attendees).where(and(eq(attendees.userId, userId), eq(attendees.id, attendeeId)))
}

export async function addAttendeePayment(
  userId: string,
  attendeeId: number,
  amount: number,
  paymentDate: string,
  paymentMethod: string = 'cash',
  notes?: string
) {
  const [attendee] = await db
    .select()
    .from(attendees)
    .where(and(eq(attendees.userId, userId), eq(attendees.id, attendeeId)))

  if (!attendee) throw new Error('Campero no encontrado')

  // Validate payment doesn't exceed remaining amount
  const originalTotal = parseFloat(attendee.totalAmount as string)
  const discount = attendee.discount || 0
  const totalAmount = originalTotal * (1 - discount / 100)
  const alreadyPaid = parseFloat(attendee.amountPaid as string)
  const remaining = totalAmount - alreadyPaid

  if (amount > remaining) {
    throw new Error(
      `El monto excede lo faltante. Debe: $${remaining.toFixed(2)} de $${totalAmount.toFixed(2)}`
    )
  }

  // Create payment record
  await db.insert(attendeePayments).values({
    attendeeId,
    userId,
    amount,
    paymentMethod,
    paymentDate,
    notes: notes || '',
  })

  // Update attendee paid amount and status
  const newPaidAmount = alreadyPaid + amount
  const newStatus = newPaidAmount >= totalAmount ? 'paid' : newPaidAmount > 0 ? 'partial' : 'pending'

  await db
    .update(attendees)
    .set({
      amountPaid: newPaidAmount,
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(and(eq(attendees.userId, userId), eq(attendees.id, attendeeId)))

  // Determine category name based on payment method
  const categoryNameMap: Record<string, string> = {
    'cash': 'Pago de Camperos - Efectivo',
    'transfer': 'Pago de Camperos - Transferencia/Depósito',
    'deposit': 'Pago de Camperos - Transferencia/Depósito',
    'mobile': 'Pago de Camperos - Transferencia/Depósito',
  }
  const categoryName = categoryNameMap[paymentMethod] || 'Pago de Camperos - Efectivo'

  // Find or create category based on payment method
  let [campPaymentCat] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.name, categoryName)))

  if (!campPaymentCat) {
    const colorMap: Record<string, string> = {
      'Pago de Camperos - Efectivo': '#22c55e', // green
      'Pago de Camperos - Transferencia/Depósito': '#3b82f6', // blue
    }
    const [newCat] = await db
      .insert(categories)
      .values({
        userId,
        name: categoryName,
        type: 'income',
        color: colorMap[categoryName] || '#22c55e',
        icon: 'users',
      })
      .returning()
    campPaymentCat = newCat
  }

  // Create transaction for this payment with payment method
  await db.insert(transactions).values({
    userId,
    categoryId: campPaymentCat!.id,
    type: 'income',
    amount,
    description: `Pago de ${attendee.name}`,
    date: paymentDate,
    paymentMethod,
  })
}

export async function deleteAttendeePayment(userId: string, paymentId: number) {
  const [payment] = await db
    .select()
    .from(attendeePayments)
    .where(and(eq(attendeePayments.userId, userId), eq(attendeePayments.id, paymentId)))

  if (!payment) throw new Error('Pago no encontrado')

  const [attendee] = await db
    .select()
    .from(attendees)
    .where(eq(attendees.id, payment.attendeeId))

  if (!attendee) throw new Error('Campero no encontrado')

  // Delete corresponding transaction
  await db
    .delete(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'income'),
        eq(transactions.amount, payment.amount),
        eq(transactions.description, `Pago de ${attendee.name}`)
      )
    )

  // Update attendee paid amount
  const newPaidAmount = Math.max(0, parseFloat(attendee.amountPaid as string) - parseFloat(payment.amount as string))
  const originalTotal = parseFloat(attendee.totalAmount as string)
  const discount = attendee.discount || 0
  const totalAmount = originalTotal * (1 - discount / 100)
  const newStatus = newPaidAmount >= totalAmount ? 'paid' : newPaidAmount > 0 ? 'partial' : 'pending'

  await db
    .update(attendees)
    .set({
      amountPaid: newPaidAmount,
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(attendees.id, payment.attendeeId))

  // Delete payment
  await db.delete(attendeePayments).where(eq(attendeePayments.id, paymentId))
}

export async function bulkCreateAttendees(
  userId: string,
  attendeesList: Array<{
    name: string
    age?: number
    sex?: string
    shirtSize?: string
    phone?: string
    church?: string
    emergencyContactName?: string
    emergencyContactPhone?: string
    emergencyContactName2?: string
    emergencyContactPhone2?: string
    allergies?: string
    totalAmount: number
    initialPayment?: number
    notes?: string
  }>
) {
  if (attendeesList.length === 0) return

  // Insert attendees
  const createdAttendees = await db
    .insert(attendees)
    .values(
      attendeesList.map((a) => ({
        userId,
        name: a.name.trim(),
        age: a.age ?? null,
        sex: a.sex || null,
        shirtSize: a.shirtSize || null,
        phone: (a.phone || '').trim(),
        church: (a.church || '').trim(),
        emergencyContactName: (a.emergencyContactName || '').trim(),
        emergencyContactPhone: (a.emergencyContactPhone || '').trim(),
        emergencyContactName2: (a.emergencyContactName2 || '').trim(),
        emergencyContactPhone2: (a.emergencyContactPhone2 || '').trim(),
        allergies: (a.allergies || '').trim(),
        totalAmount: parseFloat(a.totalAmount.toString()),
        amountPaid: parseFloat((a.initialPayment || 0).toString()),
        status:
          a.initialPayment && a.initialPayment > 0
            ? a.initialPayment >= a.totalAmount
              ? 'paid'
              : 'partial'
            : 'pending',
        notes: (a.notes || '').trim(),
      }))
    )
    .returning()

  // Get or create category for payments (nombre correcto y consistente con addAttendeePayment)
  const categoryName = 'Pago de Camperos - Efectivo'
  let campPaymentCat = await db.query.categories.findFirst({
    where: (c) => and(eq(c.userId, userId), eq(c.name, categoryName)),
  })

  if (!campPaymentCat) {
    const created = await db
      .insert(categories)
      .values({
        userId,
        name: categoryName,
        type: 'income',
        color: '#22c55e',
        icon: 'users',
      })
      .returning()
    campPaymentCat = created[0]
  }

  // Create attendee_payments records AND transactions for initial payments
  const paymentsToInsert: any[] = []
  const transactionsToInsert: any[] = []
  const today = new Date().toISOString().split('T')[0]

  for (let i = 0; i < createdAttendees.length; i++) {
    const initialPayment = parseFloat((attendeesList[i].initialPayment || 0).toString())
    if (initialPayment > 0) {
      // Registro en attendee_payments (esto es lo que faltaba y causaba transacciones huérfanas)
      paymentsToInsert.push({
        attendeeId: createdAttendees[i].id,
        userId,
        amount: initialPayment,
        paymentMethod: 'cash',
        paymentDate: today,
        notes: 'Pago inicial (importación)',
      })
      // Transacción correspondiente (misma descripción que usa deleteAttendee)
      transactionsToInsert.push({
        userId,
        categoryId: campPaymentCat.id,
        type: 'income',
        amount: initialPayment,
        description: `Pago de ${attendeesList[i].name}`,
        date: today,
        paymentMethod: 'cash',
      })
    }
  }

  if (paymentsToInsert.length > 0) {
    await db.insert(attendeePayments).values(paymentsToInsert)
  }
  if (transactionsToInsert.length > 0) {
    await db.insert(transactions).values(transactionsToInsert)
  }
}

export async function getChurchDistribution(userId: string) {
  try {
    // Get all attendees with churches
    const allAttendees = await db.query.attendees.findMany({
      where: eq(attendees.userId, userId),
      columns: {
        church: true,
      },
    })

    // Group and count by church
    const churchMap = new Map<string | null, number>()
    for (const attendee of allAttendees) {
      const church = attendee.church || 'Sin iglesia asignada'
      churchMap.set(church, (churchMap.get(church) || 0) + 1)
    }

    const colors = [
      '#3b82f6',
      '#ef4444',
      '#10b981',
      '#f59e0b',
      '#8b5cf6',
      '#ec4899',
      '#14b8a6',
      '#f97316',
      '#06b6d4',
      '#84cc16',
    ]

    const result = Array.from(churchMap.entries())
      .map(([name, count], index) => ({
        name: name || 'Sin iglesia asignada',
        value: count,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value)

    return result
  } catch (error) {
    console.error('[v0] Error fetching church distribution:', error)
    return []
  }
}

export async function generateExcelTemplate() {
  // Returns data for creating an Excel template file
  return {
    columns: ['Nombre', 'Correo', 'Teléfono', 'Monto Total ($)', 'Notas'],
    data: [
      ['Juan García', 'juan@email.com', '5551234567', 2000, 'Joven participante'],
      ['María López', 'maria@email.com', '5559876543', 1800, ''],
      ['Carlos Sánchez', 'carlos@email.com', '5552222222', 2500, 'Campista'],
    ],
  }
}
