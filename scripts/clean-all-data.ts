import { db } from '@/lib/db'
import { attendees, attendeePayments, categories, churches, teams, rooms, games, gameScores, transactions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function cleanAllData() {
  try {
    console.log('🧹 Iniciando limpieza total de base de datos...\n')

    // Collect all unique user IDs from all tables
    const [
      allTransactions,
      allAttendees,
      allAttendeePayments,
      allGames,
      allCategories,
      allChurches,
      allTeams,
      allRooms,
      allGameScores,
    ] = await Promise.all([
      db.select().from(transactions),
      db.select().from(attendees),
      db.select().from(attendeePayments),
      db.select().from(games),
      db.select().from(categories),
      db.select().from(churches),
      db.select().from(teams),
      db.select().from(rooms),
      db.select().from(gameScores),
    ])

    const userIds = new Set([
      ...allTransactions.map((t) => t.userId),
      ...allAttendees.map((a) => a.userId),
      ...allAttendeePayments.map((ap) => ap.userId),
      ...allGames.map((g) => g.userId),
      ...allCategories.map((c) => c.userId),
      ...allChurches.map((c) => c.userId),
      ...allTeams.map((t) => t.userId),
      ...allRooms.map((r) => r.userId),
      ...allGameScores.map((gs) => gs.userId),
    ].filter(Boolean))

    if (userIds.size === 0) {
      console.log('ℹ️  Base de datos ya está vacía')
      return
    }

    console.log(`Encontrados ${userIds.size} usuario(s) para limpiar\n`)

    for (const userId of userIds) {
      console.log(`Limpiando datos del usuario: ${userId}`)

      // Delete in order of dependencies (foreign keys first)
      await db.delete(gameScores).where(eq(gameScores.userId, userId))
      console.log('  ✓ Game scores eliminados')

      await db.delete(attendeePayments).where(eq(attendeePayments.userId, userId))
      console.log('  ✓ Pagos de camperos eliminados')

      await db.delete(attendees).where(eq(attendees.userId, userId))
      console.log('  ✓ Camperos eliminados')

      await db.delete(transactions).where(eq(transactions.userId, userId))
      console.log('  ✓ Transacciones eliminadas')

      await db.delete(games).where(eq(games.userId, userId))
      console.log('  ✓ Juegos eliminados')

      await db.delete(categories).where(eq(categories.userId, userId))
      console.log('  ✓ Categorías eliminadas')

      await db.delete(churches).where(eq(churches.userId, userId))
      console.log('  ✓ Iglesias eliminadas')

      await db.delete(teams).where(eq(teams.userId, userId))
      console.log('  ✓ Equipos eliminados')

      await db.delete(rooms).where(eq(rooms.userId, userId))
      console.log('  ✓ Habitaciones eliminadas')

      console.log('')
    }

    console.log('✅ Base de datos completamente limpiada')
    console.log('📋 La app está lista con todas las tablas vacías')
  } catch (error) {
    console.error('❌ Error al limpiar datos:', error)
    process.exit(1)
  }
}

cleanAllData()
