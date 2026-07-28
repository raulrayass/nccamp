import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export async function POST() {
  try {
    console.log('[v0] Starting database migration...')

    // Add paymentMethod column to transactions
    await db.execute(
      sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "paymentMethod" text DEFAULT 'cash'`
    )
    console.log('[v0] Added paymentMethod to transactions')

    // Add paymentMethod column to attendee_payments
    await db.execute(
      sql`ALTER TABLE attendee_payments ADD COLUMN IF NOT EXISTS "paymentMethod" text DEFAULT 'cash'`
    )
    console.log('[v0] Added paymentMethod to attendee_payments')

    // Update existing records
    await db.execute(sql`UPDATE transactions SET "paymentMethod" = 'cash' WHERE "paymentMethod" IS NULL`)
    await db.execute(sql`UPDATE attendee_payments SET "paymentMethod" = 'cash' WHERE "paymentMethod" IS NULL`)
    console.log('[v0] Updated existing records to have cash as payment method')

    return Response.json({
      success: true,
      message: 'Database migration completed successfully',
    })
  } catch (error) {
    console.error('[v0] Migration error:', error)
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
