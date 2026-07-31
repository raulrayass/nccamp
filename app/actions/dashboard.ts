'use server'

import { db } from '@/lib/db'
import { transactions, categories, games, gameScores, teams, attendees } from '@/lib/db/schema'
import { eq, and, desc, sum, count, sql } from 'drizzle-orm'

export async function getDashboardData(userId: string, eventId?: number | null) {
  try {
    // Build conditions for filtering by user and optional event
    const txConditions = [eq(transactions.userId, userId)]
    if (eventId !== undefined && eventId !== null) {
      txConditions.push(eq(transactions.eventId, eventId))
    }

    // Get all transactions for this user/event
    const allTransactions = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        date: transactions.date,
        description: transactions.description,
        paymentMethod: transactions.paymentMethod,
        categoryName: categories.name,
        categoryColor: categories.color,
        categoryIcon: categories.icon,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...(txConditions as any)))
      .orderBy(desc(transactions.date))

    // Calculate totals
    const totalsResult = await db
      .select({
        totalIncome: sum(
          sql`CASE WHEN ${transactions.type} = 'income' THEN CAST(${transactions.amount} AS DECIMAL) ELSE 0 END`
        ),
        totalExpense: sum(
          sql`CASE WHEN ${transactions.type} = 'expense' THEN CAST(${transactions.amount} AS DECIMAL) ELSE 0 END`
        ),
      })
      .from(transactions)
      .where(and(...(txConditions as any)))

    const totalIncome = Number(totalsResult[0]?.totalIncome ?? 0)
    const totalExpense = Number(totalsResult[0]?.totalExpense ?? 0)
    const balance = totalIncome - totalExpense

    // Get recent transactions (last 10)
    const recentTransactions = allTransactions.slice(0, 10)

    // Calculate monthly data
    const monthlyData: Record<string, { income: number; expense: number }> = {}
    for (const tx of allTransactions) {
      const date = new Date(tx.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 }
      }
      const amount = Number(tx.amount)
      if (tx.type === 'income') {
        monthlyData[monthKey].income += amount
      } else {
        monthlyData[monthKey].expense += amount
      }
    }

    const monthlyChartData = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
      }))
      .slice(-12)

    // Calculate category breakdown
    const expenseByCategory: Record<string, number> = {}
    const incomeByCategory: Record<string, number> = {}
    const categoryComparison: Array<{ name: string; income: number; expense: number }> = []

    for (const tx of allTransactions) {
      const catName = tx.categoryName || 'Sin categoría'
      const amount = Number(tx.amount)

      if (tx.type === 'income') {
        incomeByCategory[catName] = (incomeByCategory[catName] || 0) + amount
      } else {
        expenseByCategory[catName] = (expenseByCategory[catName] || 0) + amount
      }
    }

    const allCats = new Set([...Object.keys(incomeByCategory), ...Object.keys(expenseByCategory)])
    for (const cat of allCats) {
      categoryComparison.push({
        name: cat,
        income: incomeByCategory[cat] || 0,
        expense: expenseByCategory[cat] || 0,
      })
    }

    // Payment method breakdown
    const paymentMethodBreakdown: Record<string, { available: number }> = {
      cash: { available: 0 },
      transfer: { available: 0 },
      deposit: { available: 0 },
    }

    for (const tx of allTransactions) {
      if (tx.type === 'income' && tx.paymentMethod) {
        const method = tx.paymentMethod as keyof typeof paymentMethodBreakdown
        if (paymentMethodBreakdown[method]) {
          paymentMethodBreakdown[method].available += Number(tx.amount)
        }
      }
    }

    return {
      totalIncome,
      totalExpense,
      balance,
      monthlyData: monthlyChartData,
      expenseByCategory,
      incomeByCategory,
      categoryComparison,
      recentTransactions,
      paymentMethodBreakdown,
    }
  } catch (error) {
    console.error('[v0] Error in getDashboardData:', error)
    throw error
  }
}

export async function getGameActivityData(userId: string, eventId?: number | null) {
  try {
    // Get games and their scores for this user/event
    const gameConditions = [eq(games.userId, userId)]
    if (eventId !== undefined && eventId !== null) {
      gameConditions.push(eq(games.eventId, eventId))
    }

    const allGames = await db
      .select({
        id: games.id,
        name: games.name,
        gameDate: games.gameDate,
      })
      .from(games)
      .where(and(...(gameConditions as any)))
      .orderBy(desc(games.gameDate))

    // Get team scores grouped by game
    const scoreData: Record<number, Array<{ teamId: number; points: number; teamName: string }>> = {}

    const scoreConditions = [eq(gameScores.userId, userId)]
    if (eventId !== undefined && eventId !== null) {
      scoreConditions.push(eq(gameScores.eventId, eventId))
    }

    const allScores = await db
      .select({
        gameId: gameScores.gameId,
        teamId: gameScores.teamId,
        points: gameScores.points,
        teamName: teams.name,
      })
      .from(gameScores)
      .leftJoin(teams, eq(gameScores.teamId, teams.id))
      .where(and(...(scoreConditions as any)))

    for (const score of allScores) {
      if (!scoreData[score.gameId]) {
        scoreData[score.gameId] = []
      }
      scoreData[score.gameId].push({
        teamId: score.teamId,
        points: score.points,
        teamName: score.teamName || 'Sin equipo',
      })
    }

    return {
      games: allGames,
      scores: scoreData,
    }
  } catch (error) {
    console.error('[v0] Error in getGameActivityData:', error)
    throw error
  }
}
