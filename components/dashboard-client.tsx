'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (!eventId) {
      setData(null)
      setChurchData([])
      return
    }

    setIsLoading(true)
    Promise.all([
      getDashboardData(userId, eventId),
      getChurchDistribution(userId, eventId),
    ])
      .then(([dashData, churchDist]) => {
        setData(dashData)
        setChurchData(churchDist)
      })
      .finally(() => setIsLoading(false))
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

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-3 flex flex-col gap-3 max-w-7xl mx-auto w-full overflow-x-hidden">

      {/* ===== 1. Balance Total (héroe) — claymorphism ===== */}
      <Card className="clay-card p-5 sm:p-6 rounded-xl sm:rounded-2xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1">Balance Total</p>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mt-1 tabular-nums">{formatCurrency(balance)}</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center shrink-0 icon-glow">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
        </div>
        <div className="space-y-2 text-sm border-t border-border pt-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Efectivo disponible</span>
            <span className="font-semibold tabular-nums text-emerald-600">{formatCurrency(cashAvailable)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Banca Móvil disponible</span>
            <span className="font-semibold tabular-nums text-blue-600">{formatCurrency(bancaMovil)}</span>
          </div>
        </div>
      </Card>

      {/* ===== 2. Ingresos + Egresos — stat cards mejoradas ===== */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card className="stat-card p-4 sm:p-5 rounded-xl sm:rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1">Total Ingresos</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground tabular-nums">{formatCurrency(totalIncome)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Acumulado total</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-600/10 flex items-center justify-center shrink-0 ml-2 icon-glow">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
          </div>
        </Card>
        <Card className="stat-card p-4 sm:p-5 rounded-xl sm:rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1">Total Egresos</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground tabular-nums">{formatCurrency(totalExpense)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Acumulado total</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-orange-600/10 flex items-center justify-center shrink-0 ml-2 icon-glow">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* ===== 3. Disponible por método ===== */}
      {totalAvailable > 0 && (
        <Card className="clay-card p-5 sm:p-6 rounded-xl sm:rounded-2xl">
          <h2 className="font-semibold text-lg text-foreground mb-5">Disponible por método</h2>
          <div className="space-y-4">
            {methodBars.map((m) => {
              const Icon = m.icon
              const pctValue = pct(m.value)
              return (
                <div key={m.label}>
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
                    <div
                      className="h-full rounded-full transition-all duration-500 progress-glow"
                      style={{ width: `${pctValue}%`, backgroundColor: m.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* ===== 3B. Game Stats Cards ===== */}
      <div>
        <h2 className="font-semibold text-lg text-foreground mb-4 px-0.5">Actividad en Juegos</h2>
        <GameStatsCard />
      </div>

      {/* ===== 4. Movimientos recientes ===== */}
      <Card className="aurora-card p-5 sm:p-6 rounded-xl sm:rounded-2xl">
        <h2 className="font-semibold text-lg text-foreground mb-4">Movimientos recientes</h2>
        {recentTransactions.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No hay transacciones aun. Ve a Finanzas para agregar.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {recentTransactions.slice(0, 6).map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2 py-3 sm:py-4 min-w-0 hover:bg-muted/50 transition-colors px-2 -mx-2 rounded">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 icon-glow"
                    style={{ backgroundColor: (t.categoryColor ?? '#888') + '20' }}
                  >
                    {t.type === 'income'
                      ? <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: INCOME_COLOR }} />
                      : <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: EXPENSE_COLOR }} />
                    }
                  </div>
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
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ===== 5. Donuts: Ingresos y Egresos por categoría ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <Card className="clay-card p-5 sm:p-6 rounded-xl sm:rounded-2xl">
          <h2 className="font-semibold text-lg text-foreground mb-4">Ingresos por categoría</h2>
          {incomeByCategory.length > 0 ? (
            <DonutChart
              data={incomeByCategory.map((c) => ({ name: c.name, value: c.total, color: c.color }))}
              formatValue={formatCompact}
              centerLabel="Ingresos"
            />
          ) : (
            <EmptyChart text="No hay ingresos registrados aun." />
          )}
        </Card>

        <Card className="clay-card p-5 sm:p-6 rounded-xl sm:rounded-2xl">
          <h2 className="font-semibold text-lg text-foreground mb-4">Egresos por categoría</h2>
          {expenseByCategory.length > 0 ? (
            <DonutChart
              data={expenseByCategory.map((c) => ({ name: c.name, value: c.total, color: c.color }))}
              formatValue={formatCompact}
              centerLabel="Egresos"
            />
          ) : (
            <EmptyChart text="No hay egresos registrados aun." />
          )}
        </Card>
      </div>

      {/* ===== 6. Ingresos vs Egresos por mes ===== */}
      <Card className="clay-card p-5 sm:p-6 rounded-xl sm:rounded-2xl overflow-hidden">
        <h2 className="font-semibold text-lg text-foreground mb-4">Ingresos vs Egresos por mes</h2>
        {monthlyData.some(m => m.income > 0 || m.expense > 0) ? (
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
        ) : (
          <EmptyChart text="No hay datos aun. Agrega transacciones para ver la grafica." />
        )}
      </Card>

      {/* ===== 7. Comparativo por categoría ===== */}
      <Card className="clay-card p-5 sm:p-6 rounded-xl sm:rounded-2xl overflow-hidden">
        <h2 className="font-semibold text-lg text-foreground mb-1">Ingreso y Egreso por categoría</h2>
        <p className="text-xs text-muted-foreground mb-4">Comparativo de cada categoría del campamento</p>
        {hasAnyData && categoryComparison.length > 0 ? (
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
        ) : (
          <EmptyChart text="Agrega transacciones para ver el comparativo por categoria." />
        )}
      </Card>

      {/* ===== 8. Camperos por Iglesia ===== */}
      <Card className="clay-card p-5 sm:p-6 rounded-xl sm:rounded-2xl">
        <h2 className="font-semibold text-lg text-foreground mb-4">Camperos por Iglesia</h2>
        {churchData && churchData.length > 0 ? (
          <DonutChart
            data={churchData.map((c) => ({ name: c.name, value: c.value, color: c.color }))}
            formatValue={(v) => String(v)}
            centerLabel="Camperos"
          />
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No hay datos de iglesias. Verifica que los camperos tengan iglesia asignada.
          </div>
        )}
      </Card>
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
