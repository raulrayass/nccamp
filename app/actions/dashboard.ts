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
    const expenseByCategoryMap: Record<string, { total: number; color: string }> = {}
    const incomeByCategoryMap: Record<string, { total: number; color: string }> = {}
    const categoryComparison: Array<{ name: string; income: number; expense: number }> = []

    for (const tx of allTransactions) {
      const catName = tx.categoryName || 'Sin categoría'
      const amount = Number(tx.amount)
      const color = tx.categoryColor || '#888888'

      if (tx.type === 'income') {
        if (!incomeByCategoryMap[catName]) {
          incomeByCategoryMap[catName] = { total: 0, color }
        }
        incomeByCategoryMap[catName].total += amount
      } else {
        if (!expenseByCategoryMap[catName]) {
          expenseByCategoryMap[catName] = { total: 0, color }
        }
        expenseByCategoryMap[catName].total += amount
      }
    }

    // Convert to arrays for frontend
    const expenseByCategory = Object.entries(expenseByCategoryMap).map(([name, data]) => ({
      name,
      total: data.total,
      color: data.color,
    }))

    const incomeByCategory = Object.entries(incomeByCategoryMap).map(([name, data]) => ({
      name,
      total: data.total,
      color: data.color,
    }))

    const allCats = new Set([...Object.keys(incomeByCategoryMap), ...Object.keys(expenseByCategoryMap)])
    for (const cat of allCats) {
      categoryComparison.push({
        name: cat,
        income: incomeByCategoryMap[cat]?.total || 0,
        expense: expenseByCategoryMap[cat]?.total || 0,
      })
    }

    // Payment method breakdown (income - expenses = available)
    const paymentMethodBreakdown: Record<string, { available: number }> = {
      cash: { available: 0 },
      transfer: { available: 0 },
      deposit: { available: 0 },
    }

    for (const tx of allTransactions) {
      if (tx.paymentMethod) {
        const method = tx.paymentMethod as keyof typeof paymentMethodBreakdown
        if (paymentMethodBreakdown[method]) {
          const amount = Number(tx.amount)
          if (tx.type === 'income') {
            paymentMethodBreakdown[method].available += amount
          } else {
            paymentMethodBreakdown[method].available -= amount
          }
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
