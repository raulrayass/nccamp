'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileJson } from 'lucide-react'

interface ReportsBuilderProps {
  data: any[]
  filename: string
  title: string
  onExportCSV?: () => void
  onExportJSON?: () => void
}

export function ReportsBuilder({
  data,
  filename,
  title,
  onExportCSV,
  onExportJSON,
}: ReportsBuilderProps) {
  const handleExportCSV = () => {
    if (onExportCSV) {
      onExportCSV()
      return
    }

    // Default CSV export
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csv = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header]
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`
          }
          return value ?? ''
        }).join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportJSON = () => {
    if (onExportJSON) {
      onExportJSON()
      return
    }

    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{data.length} registros</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="gap-2"
          >
            <FileJson className="w-4 h-4" />
            Exportar JSON
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {data.length > 0 && Object.keys(data[0]).map((header) => (
                <th key={header} className="text-left py-2 px-2 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 5).map((row, idx) => (
              <tr key={idx} className="border-b hover:bg-muted/50">
                {Object.values(row).map((value, i) => (
                  <td key={i} className="py-2 px-2 text-muted-foreground">
                    {String(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 5 && (
          <p className="text-xs text-muted-foreground mt-2">
            ... y {data.length - 5} más registros
          </p>
        )}
      </div>
    </Card>
  )
}
