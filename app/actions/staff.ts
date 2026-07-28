'use server'

import { db } from '@/lib/db'
import { staff, staffPayments, transactions, categories } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { desc } from 'drizzle-orm'

const STAFF_PER_PAGE = 20

// Get ALL staff for reports and metrics (no pagination)
export async function getAllStaff(userId: string) {
  return db
    .select()
    .from(staff)
    .where(eq(staff.userId, userId))
    .orderBy(desc(staff.createdAt))
}

// Get paginated staff for UI display
export async function getStaff(userId: string, page: number = 1) {
  const offset = (page - 1) * STAFF_PER_PAGE
  return db
    .select()
    .from(staff)
    .where(eq(staff.userId, userId))
    .orderBy(desc(staff.createdAt))
    .limit(STAFF_PER_PAGE)
    .offset(offset)
}

export async function getStaffCount(userId: string) {
  const result = await db
    .select({ count: db.sql`count(*)` })
    .from(staff)
    .where(eq(staff.userId, userId))
  return parseInt(result[0].count as string, 10)
}

export async function getStaffPayments(userId: string, staffId: number) {
  return db
    .select()
    .from(staffPayments)
    .where(and(eq(staffPayments.userId, userId), eq(staffPayments.staffId, staffId)))
    .orderBy(desc(staffPayments.createdAt))
}

export async function createStaff(
  userId: string,
  data: {
    name: string
    age?: number | null
    shirtSize?: string
    sex?: string
    phone?: string
    church?: string
    category?: string
    totalAmount: number
    notes?: string
  }
) {
  await db.insert(staff).values({
    userId,
    name: data.name,
    age: data.age ?? null,
    shirtSize: data.shirtSize || null,
    sex: data.sex || null,
    phone: data.phone || '',
    church: data.church || '',
    category: data.category || '',
    totalAmount: parseFloat(data.totalAmount.toString()),
    amountPaid: 0,
    status: 'pending',
    notes: data.notes || '',
  })
}

export async function updateStaff(
  userId: string,
  staffId: number,
  data: Partial<{
    name: string
    age: number | null
    shirtSize: string
    sex: string
    phone: string
    church: string
    category: string
    totalAmount: number
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
    .update(staff)
    .set(updateData)
    .where(and(eq(staff.userId, userId), eq(staff.id, staffId)))
}

export async function toggleCheckIn(userId: string, staffId: number, checkedIn: boolean) {
  await db
    .update(staff)
    .set({ checkedIn, updatedAt: new Date() })
    .where(and(eq(staff.userId, userId), eq(staff.id, staffId)))
}

export async function deleteStaff(userId: string, staffId: number) {
  // Obtener el staff para conocer su nombre (necesario para borrar transacciones)
  const [staffMember] = await db
    .select()
    .from(staff)
    .where(and(eq(staff.userId, userId), eq(staff.id, staffId)))

  if (!staffMember) throw new Error('Staff no encontrado')

  // Obtener todos los pagos del staff
  const payments = await db
    .select()
    .from(staffPayments)
    .where(and(eq(staffPayments.userId, userId), eq(staffPayments.staffId, staffId)))

  // Borrar la transacción correspondiente a cada pago (por nombre + monto)
  for (const payment of payments) {
    await db
      .delete(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'income'),
          eq(transactions.amount, payment.amount),
          eq(transactions.description, `Pago de ${staffMember.name}`)
        )
      )
  }

  await db.delete(staffPayments).where(eq(staffPayments.staffId, staffId))
  await db.delete(staff).where(and(eq(staff.userId, userId), eq(staff.id, staffId)))
}

export async function addStaffPayment(
  userId: string,
  staffId: number,
  amount: number,
  paymentDate: string,
  paymentMethod: string = 'cash',
  notes?: string
) {
  const [staffMember] = await db
    .select()
    .from(staff)
    .where(and(eq(staff.userId, userId), eq(staff.id, staffId)))

  if (!staffMember) throw new Error('Staff no encontrado')

  // Validate payment doesn't exceed remaining amount
  const originalTotal = parseFloat(staffMember.totalAmount as string)
  const discount = staffMember.discount || 0
  const totalAmount = originalTotal * (1 - discount / 100)
  const alreadyPaid = parseFloat(staffMember.amountPaid as string)
  const remaining = totalAmount - alreadyPaid

  if (amount > remaining) {
    throw new Error(
      `El monto excede lo faltante. Debe: $${remaining.toFixed(2)} de $${totalAmount.toFixed(2)}`
    )
  }

  // Create payment record
  await db.insert(staffPayments).values({
    staffId,
    userId,
    amount,
    paymentMethod,
    paymentDate,
    notes: notes || '',
  })

  // Update staff paid amount and status
  const newPaidAmount = alreadyPaid + amount
  const newStatus = newPaidAmount >= totalAmount ? 'paid' : newPaidAmount > 0 ? 'partial' : 'pending'

  await db
    .update(staff)
    .set({
      amountPaid: newPaidAmount,
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(and(eq(staff.userId, userId), eq(staff.id, staffId)))

  // Determine category name based on payment method
  const categoryNameMap: Record<string, string> = {
    'cash': 'Pago de Staff - Efectivo',
    'transfer': 'Pago de Staff - Transferencia/Depósito',
    'deposit': 'Pago de Staff - Transferencia/Depósito',
    'mobile': 'Pago de Staff - Transferencia/Depósito',
  }
  const categoryName = categoryNameMap[paymentMethod] || 'Pago de Staff - Efectivo'

  // Find or create category based on payment method
  let [staffPaymentCat] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.name, categoryName)))

  if (!staffPaymentCat) {
    const colorMap: Record<string, string> = {
      'Pago de Staff - Efectivo': '#22c55e', // green
      'Pago de Staff - Transferencia/Depósito': '#3b82f6', // blue
    }
    const [newCat] = await db
      .insert(categories)
      .values({
        userId,
        name: categoryName,
        type: 'income',
        color: colorMap[categoryName] || '#22c55e',
        icon: 'briefcase',
      })
      .returning()
    staffPaymentCat = newCat
  }

  // Create transaction for this payment with payment method
  await db.insert(transactions).values({
    userId,
    categoryId: staffPaymentCat!.id,
    type: 'income',
    amount,
    description: `Pago de ${staffMember.name}`,
    date: paymentDate,
    paymentMethod,
  })
}

export async function deleteStaffPayment(userId: string, paymentId: number) {
  const [payment] = await db
    .select()
    .from(staffPayments)
    .where(and(eq(staffPayments.userId, userId), eq(staffPayments.id, paymentId)))

  if (!payment) throw new Error('Pago no encontrado')

  const [staffMember] = await db
    .select()
    .from(staff)
    .where(eq(staff.id, payment.staffId))

  if (!staffMember) throw new Error('Staff no encontrado')

  // Delete corresponding transaction
  await db
    .delete(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'income'),
        eq(transactions.amount, payment.amount),
        eq(transactions.description, `Pago de ${staffMember.name}`)
      )
    )

  // Update staff paid amount
  const newPaidAmount = Math.max(0, parseFloat(staffMember.amountPaid as string) - parseFloat(payment.amount as string))
  const originalTotal = parseFloat(staffMember.totalAmount as string)
  const discount = staffMember.discount || 0
  const totalAmount = originalTotal * (1 - discount / 100)
  const newStatus = newPaidAmount >= totalAmount ? 'paid' : newPaidAmount > 0 ? 'partial' : 'pending'

  await db
    .update(staff)
    .set({
      amountPaid: newPaidAmount,
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(staff.id, payment.staffId))

  // Delete payment
  await db.delete(staffPayments).where(eq(staffPayments.id, paymentId))
}

export async function bulkCreateStaff(
  userId: string,
  staffList: Array<{
    name: string
    age?: number
    sex?: string
    shirtSize?: string
    phone?: string
    church?: string
    category?: string
    totalAmount: number
    initialPayment?: number
    notes?: string
  }>
) {
  if (staffList.length === 0) return

  // Insert staff
  const createdStaff = await db
    .insert(staff)
    .values(
      staffList.map((s) => ({
        userId,
        name: s.name.trim(),
        age: s.age ?? null,
        sex: s.sex || null,
        shirtSize: s.shirtSize || null,
        phone: (s.phone || '').trim(),
        church: (s.church || '').trim(),
        category: (s.category || '').trim() || 'Sin ministerio',
        totalAmount: parseFloat(s.totalAmount.toString()),
        amountPaid: parseFloat((s.initialPayment || 0).toString()),
        discount: 0,
        checkedIn: false,
        status:
          s.initialPayment && s.initialPayment > 0
            ? s.initialPayment >= s.totalAmount
              ? 'paid'
              : 'partial'
            : 'pending',
        notes: (s.notes || '').trim(),
      }))
    )
    .returning()

  // Get or create category for payments
  let staffPaymentCat = await db.query.categories.findFirst({
    where: (c) => and(eq(c.userId, userId), eq(c.name, 'Pago de Staff')),
  })

  if (!staffPaymentCat) {
    const created = await db
      .insert(categories)
      .values({
        userId,
        name: 'Pago de Staff',
        type: 'income',
        color: '#3b82f6',
        icon: 'users',
      })
      .returning()
    staffPaymentCat = created[0]
  }

  // Create staff_payments records AND transactions for initial payments
  const paymentsToInsert: any[] = []
  const transactionsToInsert: any[] = []
  const today = new Date().toISOString().split('T')[0]

  for (let i = 0; i < createdStaff.length; i++) {
    const initialPayment = parseFloat((staffList[i].initialPayment || 0).toString())
    if (initialPayment > 0) {
      // Registro en staff_payments (esto es lo que faltaba y causaba transacciones huérfanas)
      paymentsToInsert.push({
        staffId: createdStaff[i].id,
        userId,
        amount: initialPayment,
        paymentMethod: 'cash',
        paymentDate: today,
        notes: 'Pago inicial (importación)',
      })
      // Transacción correspondiente (misma descripción que usa deleteStaff)
      transactionsToInsert.push({
        userId,
        categoryId: staffPaymentCat.id,
        type: 'income',
        amount: initialPayment,
        description: `Pago de ${staffList[i].name}`,
        date: today,
        paymentMethod: 'cash',
      })
    }
  }

  if (paymentsToInsert.length > 0) {
    await db.insert(staffPayments).values(paymentsToInsert)
  }
  if (transactionsToInsert.length > 0) {
    await db.insert(transactions).values(transactionsToInsert)
  }
}

export async function getCategoryDistribution(userId: string) {
  try {
    // Get all staff with categories/ministries
    const allStaff = await db.query.staff.findMany({
      where: eq(staff.userId, userId),
      columns: {
        category: true,
      },
    })

    // Group and count by category
    const categoryMap = new Map<string | null, number>()
    for (const member of allStaff) {
      const category = member.category || 'Sin ministerio asignado'
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
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

    const result = Array.from(categoryMap.entries())
      .map(([name, count], index) => ({
        name: name || 'Sin ministerio asignado',
        value: count,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value)

    return result
  } catch (error) {
    console.error('[v0] Error fetching category distribution:', error)
    return []
  }
}

export async function generateExcelTemplate() {
  // Returns data for creating an Excel template file
  return {
    columns: ['Nombre', 'Sexo', 'Talla Camisa', 'Teléfono', 'Iglesia', 'Ministerio', 'Monto Total ($)', 'Pagado ($)', 'Estado', 'Check-in', 'Notas'],
    data: [
      ['Enrique Medina', 'H', 'M', '3334001726', 'NC Zapopan', 'Pastor', 1200, 100, 'Pendiente', 'No', ''],
      ['Raul Rayas', 'H', 'L', '5551234567', 'Masai Guadalajara', 'Deportes', 1500, 1500, 'Pagado', 'Sí', ''],
      ['Javier Insunza', 'M', 'S', '5559876543', 'NC Tlajo', 'Cocina', 800, 400, 'Parcial', 'No', ''],
    ],
  }
}
