'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getDashboardData, getGameActivityData } from '@/app/actions/dashboard'
import { getChurchDistribution } from '@/app/actions/attendees'
import { Card } from '@/components/ui/card'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
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

const INCOME_COLOR = 'var(--income)'
const EXPENSE_COLOR = 'var(--expense)'

export function DashboardClient({ userId, eventId }: { userId: string; eventId: number | null }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [churchData, setChurchData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

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
    // Limpiar datos viejos cuando eventId cambia
    setData(null)
    setChurchData([])
    // Luego cargar datos nuevos
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

  // Pull-to-refresh: detect cuando llega al tope de la página
  useEffect(() => {
    let lastScrollTop = 0
    
    const handleScroll = () => {
      const scrollTop = window.scrollY
      
      // Si está en el tope (scrollY === 0) y acaba de scrollear hacia arriba, recargar
      if (scrollTop === 0 && lastScrollTop > 0 && !isLoading && !isRefreshing) {
        setIsRefreshing(true)
        loadData().finally(() => setIsRefreshing(false))
      }
      
      lastScrollTop = scrollTop
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [eventId, userId, isLoading, isRefreshing])

  if (!data) {
    return <DashboardSkeleton />
  }

  const {
    totalIncome, totalExpense, balance,
    monthlyData, expenseByCategory, incomeByCategory,
    categoryComparison, recentTransactions, paymentMethodBreakdown, shirtSizes,
  } = data

  const hasAnyData = totalIncome > 0 || totalExpense > 0

  const cashAvailable = paymentMethodBreakdown?.cash?.available ?? 0
  const bancaMovil = (paymentMethodBreakdown?.transfer?.available ?? 0) + (paymentMethodBreakdown?.deposit?.available ?? 0)
  const totalAvailable = cashAvailable + bancaMovil
  const totalAbsolute = Math.abs(cashAvailable) + Math.abs(bancaMovil)
  const pct = (v: number) => {
    if (totalAbsolute === 0) return 0
    return Math.round((Math.abs(v) / totalAbsolute) * 100)
  }

  const methodBars = [
    { label: 'Efectivo', value: cashAvailable, color: INCOME_COLOR, icon: Banknote },
    { label: 'Banca Móvil', value: bancaMovil, color: 'var(--chart-2)', icon: Smartphone },
  ]

  // Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
}

const tapTransition = { type: 'spring' as const, stiffness: 400, damping: 25 }

  const pulseVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  }

  return (
    <div className="dashboard-ios mx-auto flex w-full max-w-7xl flex-col gap-5 overflow-x-hidden px-4 py-5 sm:gap-6 sm:px-6 sm:py-7">
      <header className="dashboard-welcome flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Tu evento</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Resumen</h1>
          <p className="mt-1 text-sm text-muted-foreground">Todo lo importante, de un vistazo.</p>
        </div>
        <div className="hidden rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary sm:block">En vivo</div>
      </header>

      {/* Balance total */}
      <motion.div variants={itemVariants} whileTap={{ scale: 0.95 }} className="cursor-pointer">
        <Card className="dashboard-ios-card finance-surface-strong p-5 sm:p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <motion.p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                Saldo total
              </motion.p>
              <motion.p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mt-1 tabular-nums" key={balance} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                {formatCurrency(balance)}
              </motion.p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center shrink-0 icon-glow">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ===== 2. Ingresos + Egresos — animated stat cards ===== */}
      <motion.div className="grid grid-cols-2 gap-3 sm:gap-4" variants={itemVariants}>
        <motion.div variants={itemVariants} whileTap={{ scale: 0.95 }} className="cursor-pointer">
          <Card className="dashboard-ios-card finance-surface p-4 sm:p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1">Total de ingresos</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground tabular-nums">
                  {formatCurrency(totalIncome)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Acumulado total</p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-600/20 flex items-center justify-center shrink-0 ml-2 icon-glow">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants} whileTap={{ scale: 0.95 }} className="cursor-pointer">
          <Card className="dashboard-ios-card finance-surface p-4 sm:p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1">Total de egresos</p>
                <p className="text-lg sm:text-2xl font-bold text-foreground tabular-nums">
                  {formatCurrency(totalExpense)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Acumulado total</p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-orange-600/20 flex items-center justify-center shrink-0 ml-2 icon-glow">
                <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* ===== 3. Disponible por método ===== */}
      {(totalAbsolute > 0) && (
        <motion.div variants={itemVariants}>
          <motion.h2 className="text-base font-semibold tracking-tight text-foreground mb-3 px-0.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            Disponible por método
          </motion.h2>
<Card className="dashboard-ios-card finance-surface-strong p-5 sm:p-6">
            <div className="space-y-4 sm:space-y-5">
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
                          style={{ backgroundColor: m.value < 0 ? '#ef445515' : m.color + '15' }}
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: m.value < 0 ? '#ef4455' : m.color }} />
                        </div>
                        <span className="text-sm sm:text-base font-medium text-foreground">{m.label}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className={`text-sm sm:text-base font-bold tabular-nums ${m.value < 0 ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                          {formatCurrency(m.value)}
                        </span>
                        <span className="text-xs text-muted-foreground w-10 text-right font-medium tabular-nums">
                          {pctValue}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 sm:h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full progress-glow"
                        style={{ 
                          width: `${pctValue}%`,
                          backgroundColor: m.value < 0 ? '#ef4455' : m.color,
                          transition: 'width 0.2s ease-out'
                        }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* ===== 3B. Últimas actividades ===== */}
      <motion.div variants={itemVariants}>
        <motion.h2 className="text-base font-semibold tracking-tight text-foreground mb-3 px-0.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
Actividad reciente
        </motion.h2>
        <Card className="dashboard-ios-card finance-surface p-5 sm:p-6">
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

      {/* ===== 4. Game Stats Cards ===== */}
      <motion.div variants={itemVariants}>
        <motion.h2 className="text-base font-semibold tracking-tight text-foreground mb-3 px-0.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          Actividad en juegos
        </motion.h2>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, type: 'spring', stiffness: 100, damping: 15 }}>
          <GameStatsCard />
        </motion.div>
      </motion.div>

      {/* ===== 5. Donuts: Ingresos y Egresos por categoría ===== */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5" variants={itemVariants}>
        <motion.div variants={itemVariants}>
          <motion.h2 className="font-semibold text-lg text-foreground mb-3 px-0.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            Ingresos
          </motion.h2>
          <Card className="dashboard-ios-card finance-surface p-4 sm:p-5">
            {incomeByCategory.length > 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.75, type: 'spring', stiffness: 100, damping: 15 }}>
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

        <motion.div variants={itemVariants}>
          <motion.h2 className="font-semibold text-lg text-foreground mb-3 px-0.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            Egresos
          </motion.h2>
          <Card className="dashboard-ios-card finance-surface p-4 sm:p-5">
            {expenseByCategory.length > 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.85, type: 'spring', stiffness: 100, damping: 15 }}>
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
        <motion.h2 className="text-base font-semibold tracking-tight text-foreground mb-3 px-0.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
Ingresos y egresos por mes
        </motion.h2>
        <Card className="dashboard-ios-card dashboard-ios-chart finance-surface overflow-hidden p-3 sm:p-4">
          {monthlyData.some(m => m.income > 0 || m.expense > 0) ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }} className="w-full">
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

      {/* ===== 6B. Distribución de tallas ===== */}
      <motion.div variants={itemVariants}>
        <motion.h2 className="text-base font-semibold tracking-tight text-foreground mb-3 px-0.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }}>
Tallas registradas
        </motion.h2>
        <Card className="dashboard-ios-card finance-surface p-4 sm:p-5">
          {shirtSizes && shirtSizes.length > 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.0, type: 'spring', stiffness: 100, damping: 15 }}>
              <DonutChart
                data={shirtSizes.map((s, i) => ({
                  name: s.name,
                  value: s.value,
                  color: ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--primary)'][i % 6],
                }))}
                formatValue={(v) => `${v} persona${v > 1 ? 's' : ''}`}
                centerLabel="Tallas"
                height={200}
              />
            </motion.div>
          ) : (
            <EmptyChart text="No hay datos de tallas aun. Agrega camperos para ver la distribucion." />
          )}
        </Card>
      </motion.div>

      {/* ===== 7. Comparativo por categoría ===== */}
      <motion.div variants={itemVariants}>
        <motion.h2 className="text-base font-semibold tracking-tight text-foreground mb-3 px-0.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
          Ingresos vs Egresos por categoría
        </motion.h2>
        <Card className="dashboard-ios-card dashboard-ios-chart finance-surface overflow-hidden p-3 sm:p-4">
          {hasAnyData && categoryComparison.length > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.05 }} className="w-full">
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
        <Card className="finance-surface-strong p-5 sm:p-6">
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
    </div>
  )
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm text-center px-4">
      {text}
    </div>
  )
}
