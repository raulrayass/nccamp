'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getDashboardData, getGameActivityData } from '@/app/actions/dashboard'
import { getChurchDistribution } from '@/app/actions/attendees'
import { Card } from '@/components/ui/card'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Banknote, Smartphone } from 'lucide-react'
import { DonutChart } from '@/components/donut-chart'
import { GameStatsCard } from '@/components/dashboard/game-stats-card'
import { DashboardSkeleton } from '@/components/dashboard-skeleton'

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

function formatCompact(value: number) {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return `$${value.toFixed(0)}`
}

const INCOME_COLOR = '#22c55e'
const EXPENSE_COLOR = '#f97316'

export function DashboardClient({ userId, eventId }: { userId: string; eventId: number | null }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [churchData, setChurchData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Función para cargar datos
  const loadData = async () => {
    if (!eventId) {
      setData(null)
      setChurchData([])
      return
    }

    setIsLoading(true)
    try {
      const [dashData, churchDist] = await Promise.all([
        getDashboardData(userId, eventId),
        getChurchDistribution(userId, eventId),
      ])
      setData(dashData)
      setChurchData(churchDist)
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos cuando userId o eventId cambian
  useEffect(() => {
    loadData()
  }, [userId, eventId])

  // Polling automático cada 10 segundos para reflejar cambios en tiempo real
  useEffect(() => {
    if (!eventId) return

    const interval = setInterval(() => {
      loadData()
    }, 10000)

    return () => clearInterval(interval)
  }, [userId, eventId])

  if (!data) {
    return <DashboardSkeleton />
  }

  const {
    totalIncome, totalExpense, balance,
    monthlyData, expenseByCategory, incomeByCategory,
    categoryComparison, recentTransactions, paymentMethodBreakdown,
  } = data

  const hasAnyData = totalIncome > 0 || totalExpense > 0

  const cashAvailable = paymentMethodBreakdown?.cash?.available ?? 0
  const bancaMovil = (paymentMethodBreakdown?.transfer?.available ?? 0) + (paymentMethodBreakdown?.deposit?.available ?? 0)
  const totalAvailable = cashAvailable + bancaMovil
  const pct = (v: number) => (totalAvailable > 0 ? Math.round((v / totalAvailable) * 100) : 0)

  const methodBars = [
    { label: 'Efectivo', value: cashAvailable, color: INCOME_COLOR, icon: Banknote },
    { label: 'Banca Móvil', value: bancaMovil, color: '#3b82f6', icon: Smartphone },
  ]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  }

  const pulseVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  }

  return (
    <motion.div
      className="px-3 sm:px-4 lg:px-6 py-3 flex flex-col gap-3 max-w-7xl mx-auto w-full overflow-x-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >

      {/* ===== 1. Balance Total (héroe) — animated count-up ===== */}
      <motion.div variants={itemVariants} whileTap={{ scale: 0.95 }} className="cursor-pointer">
        <Card className="clay-card p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <motion.p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                Balance Total
              </motion.p>
              <motion.p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mt-1 tabular-nums" key={balance} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                {formatCurrency(balance)}
              </motion.p>
            </div>
            <motion.div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center shrink-0 icon-glow"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </motion.div>
          </div>
          <motion.div className="space-y-2 text-sm border-t border-primary/20 pt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Efectivo disponible</span>
              <span className="font-semibold tabular-nums text-emerald-600">{formatCurrency(cashAvailable)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Banca Móvil disponible</span>
              <span className="font-semibold tabular-nums text-blue-600">{formatCurrency(bancaMovil)}</span>
            </div>
          </motion.div>
        </Card>
      </motion.div>

      {/* ===== 2. Ingresos + Egresos — animated stat cards ===== */}
      <motion.div className="grid grid-cols-2 gap-3 sm:gap-4" variants={itemVariants}>
        <motion.div variants={itemVariants} whileTap={{ scale: 0.95 }} className="cursor-pointer">
          <Card className="stat-card p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 border-emerald-200/30">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1">Total Ingresos</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground tabular-nums">
                  {formatCurrency(totalIncome)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Acumulado total</p>
              </div>
              <motion.div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-600/20 flex items-center justify-center shrink-0 ml-2 icon-glow"
                animate={{ rotate: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </motion.div>
            </div>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants} whileTap={{ scale: 0.95 }} className="cursor-pointer">
          <Card className="stat-card p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500/5 to-orange-600/10 border-orange-200/30">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1">Total Egresos</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground tabular-nums">
                  {formatCurrency(totalExpense)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Acumulado total</p>
              </div>
              <motion.div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-orange-600/20 flex items-center justify-center shrink-0 ml-2 icon-glow"
                animate={{ rotate: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* ===== 3. Disponible por método ===== */}
      {totalAvailable > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="clay-card p-5 sm:p-6 rounded-xl sm:rounded-2xl">
            <h2 className="font-semibold text-lg text-foreground mb-5">Disponible por método</h2>
            <div className="space-y-4">
              {methodBars.map((m, idx) => {
                const Icon = m.icon
                const pctValue = pct(m.value)
                return (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1, type: 'spring', stiffness: 100, damping: 15 }}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 icon-glow"
                          style={{ backgroundColor: m.color + '15' }}
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: m.color }} />
                        </div>
                        <span className="text-sm sm:text-base font-medium text-foreground">{m.label}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-sm sm:text-base font-bold text-foreground tabular-nums">
                          {formatCurrency(m.value)}
                        </span>
                        <span className="text-xs text-muted-foreground w-10 text-right font-medium tabular-nums">
                          {pctValue}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 sm:h-3 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full progress-glow"
                        initial={{ width: 0 }}
                        animate={{ width: `${pctValue}%` }}
                        transition={{ delay: 0.4 + idx * 0.1, duration: 1.5, type: 'spring', stiffness: 60, damping: 20 }}
                        style={{ backgroundColor: m.color }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* ===== 3B. Game Stats Cards ===== */}
      <motion.div variants={itemVariants}>
        <motion.h2 className="font-semibold text-lg text-foreground mb-4 px-0.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          Actividad en Juegos
        </motion.h2>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, type: 'spring', stiffness: 100, damping: 15 }}>
          <GameStatsCard />
        </motion.div>
      </motion.div>

      {/* ===== 4. Movimientos recientes ===== */}
      <motion.div variants={itemVariants}>
        <Card className="aurora-card p-5 sm:p-6 rounded-xl sm:rounded-2xl">
          <motion.h2 className="font-semibold text-lg text-foreground mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            Movimientos recientes
          </motion.h2>
          {recentTransactions.length === 0 ? (
            <motion.p className="text-muted-foreground text-sm text-center py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              No hay transacciones aun. Ve a Finanzas para agregar.
            </motion.p>
          ) : (
            <motion.div className="flex flex-col divide-y divide-border" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.05, delayChildren: 0.7 }}>
              {recentTransactions.slice(0, 6).map((t, idx) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.05, type: 'spring', stiffness: 100, damping: 15 }}
                  whileTap={{ scale: 0.98, backgroundColor: 'rgba(0,0,0,0.02)' }}
                  className="flex items-center justify-between gap-2 py-3 sm:py-4 min-w-0 cursor-pointer px-2 -mx-2 rounded"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <motion.div
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 icon-glow"
                      style={{ backgroundColor: (t.categoryColor ?? '#888') + '20' }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {t.type === 'income'
                        ? <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: INCOME_COLOR }} />
                        : <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: EXPENSE_COLOR }} />
                      }
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-medium text-foreground truncate">{t.description}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {t.categoryName ?? 'Sin categoria'} · {t.date}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-sm sm:text-base font-bold shrink-0 tabular-nums"
                    style={{ color: t.type === 'income' ? INCOME_COLOR : EXPENSE_COLOR }}
                  >
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(t.amount as string))}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* ===== 5. Donuts: Ingresos y Egresos por categoría ===== */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5" variants={itemVariants}>
        <motion.div variants={itemVariants} whileHover={{ y: -2 }}>
          <Card className="clay-card p-5 sm:p-6 rounded-xl sm:rounded-2xl">
            <motion.h2 className="font-semibold text-lg text-foreground mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
              Ingresos por categoría
            </motion.h2>
            {incomeByCategory.length > 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.95, type: 'spring', stiffness: 100, damping: 15 }}>
                <DonutChart
                  data={incomeByCategory.map((c) => ({ name: c.name, value: c.total, color: c.color }))}
                  formatValue={formatCompact}
                  centerLabel="Ingresos"
                />
              </motion.div>
            ) : (
              <EmptyChart text="No hay ingresos registrados aun." />
            )}
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -2 }}>
          <Card className="clay-card p-5 sm:p-6 rounded-xl sm:rounded-2xl">
            <motion.h2 className="font-semibold text-lg text-foreground mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              Egresos por categoría
            </motion.h2>
            {expenseByCategory.length > 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.05, type: 'spring', stiffness: 100, damping: 15 }}>
                <DonutChart
                  data={expenseByCategory.map((c) => ({ name: c.name, value: c.total, color: c.color }))}
                  formatValue={formatCompact}
                  centerLabel="Egresos"
                />
              </motion.div>
            ) : (
              <EmptyChart text="No hay egresos registrados aun." />
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* ===== 6. Ingresos vs Egresos por mes ===== */}
      <motion.div variants={itemVariants}>
        <Card className="clay-card p-5 sm:p-6 rounded-xl sm:rounded-2xl overflow-hidden w-full">
          <motion.h2 className="font-semibold text-lg text-foreground mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
            Ingresos vs Egresos por mes
          </motion.h2>
          {monthlyData.some(m => m.income > 0 || m.expense > 0) ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.15 }} className="w-full">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                    contentStyle={{ borderRadius: '12px', fontSize: '13px', border: '1px solid var(--border)', background: 'var(--card)', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                  <Bar dataKey="income" name="Ingresos" fill={INCOME_COLOR} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expense" name="Egresos" fill={EXPENSE_COLOR} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <EmptyChart text="No hay datos aun. Agrega transacciones para ver la grafica." />
          )}
        </Card>
      </motion.div>

      {/* ===== 7. Comparativo por categoría ===== */}
      <motion.div variants={itemVariants}>
        <Card className="clay-card p-5 sm:p-6 rounded-xl sm:rounded-2xl overflow-hidden w-full">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
            <h2 className="font-semibold text-lg text-foreground mb-1">Ingreso y Egreso por categoría</h2>
            <p className="text-xs text-muted-foreground mb-4">Comparativo de cada categoría del campamento</p>
          </motion.div>
          {hasAnyData && categoryComparison.length > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.25 }} className="w-full">
              <ResponsiveContainer width="100%" height={Math.max(240, categoryComparison.length * 56)}>
                <BarChart
                  data={categoryComparison}
                  layout="vertical"
                  margin={{ left: 20, right: 8 }}
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                    contentStyle={{ borderRadius: '12px', fontSize: '13px', border: '1px solid var(--border)', background: 'var(--card)', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                  <Bar dataKey="income" name="Ingresos" fill={INCOME_COLOR} radius={[0, 8, 8, 0]} barSize={16} />
                  <Bar dataKey="expense" name="Egresos" fill={EXPENSE_COLOR} radius={[0, 8, 8, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <EmptyChart text="Agrega transacciones para ver el comparativo por categoria." />
          )}
        </Card>
      </motion.div>

      {/* ===== 8. Camperos por Iglesia ===== */}
      <motion.div variants={itemVariants}>
        <Card className="clay-card p-5 sm:p-6 rounded-xl sm:rounded-2xl">
          <motion.h2 className="font-semibold text-lg text-foreground mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
            Camperos por Iglesia
          </motion.h2>
          {churchData && churchData.length > 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.35, type: 'spring', stiffness: 100, damping: 15 }}>
              <DonutChart
                data={churchData.map((c) => ({ name: c.name, value: c.value, color: c.color }))}
                formatValue={(v) => String(v)}
                centerLabel="Camperos"
              />
            </motion.div>
          ) : (
            <motion.div className="text-center py-12 text-muted-foreground text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.35 }}>
              No hay datos de iglesias. Verifica que los camperos tengan iglesia asignada.
            </motion.div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  )
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm text-center px-4">
      {text}
    </div>
  )
}
