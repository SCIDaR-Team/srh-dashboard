import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { TreeRow } from '../../lib/types'

export interface TreeColumn {
  key: string
  label: string
  /** format a raw numeric value for display */
  format?: (v: number) => string
  /** optional cell colour based on value */
  color?: (v: number) => string | undefined
  align?: 'left' | 'right'
}

interface TreeTableProps {
  rows: TreeRow[]
  columns: TreeColumn[]
  /** label for the first (hierarchy) column */
  rowHeader?: string
  defaultExpanded?: boolean
}

/**
 * Expandable matrix table (region → facility), the React equivalent of a
 * Power BI matrix visual. Parent rows can be collapsed/expanded.
 */
export function TreeTable({
  rows,
  columns,
  rowHeader = 'Name',
  defaultExpanded = false,
}: TreeTableProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    defaultExpanded
      ? Object.fromEntries(rows.map((r) => [r.id, true]))
      : {},
  )

  const toggle = (id: string) =>
    setExpanded((e) => ({ ...e, [id]: !e[id] }))

  const renderCells = (row: TreeRow) =>
    columns.map((c) => {
      const v = row.values[c.key] ?? 0
      return (
        <td
          key={c.key}
          className="px-4 py-2.5 tabular-nums"
          style={{
            textAlign: c.align ?? 'right',
            color: c.color?.(v),
            fontWeight: c.color?.(v) ? 600 : undefined,
          }}
        >
          {c.format ? c.format(v) : v.toLocaleString()}
        </td>
      )
    })

  // Recursively flatten the (expanded) tree into <tr> rows so any depth
  // renders — State → LGA → Facility. Indentation + a deepening tint encode
  // the level; only nodes with children get an expand toggle.
  const renderRows = (nodes: TreeRow[], depth = 0): React.ReactNode[] =>
    nodes.flatMap((row) => {
      const hasChildren = !!row.children?.length
      const isOpen = expanded[row.id]
      const tr = (
        <tr
          key={row.id}
          className="border-b border-slate-100 hover:bg-slate-100/60"
          style={depth > 0 ? { backgroundColor: 'rgba(248,250,252,0.6)' } : undefined}
        >
          <td className="py-2.5 pr-4">
            <button
              type="button"
              onClick={() => hasChildren && toggle(row.id)}
              className="flex items-center gap-1.5 text-left font-medium text-ink disabled:cursor-default"
              style={{ paddingLeft: 16 + depth * 18 }}
              disabled={!hasChildren}
            >
              {hasChildren ? (
                isOpen ? (
                  <ChevronDown size={15} className="shrink-0 text-muted" />
                ) : (
                  <ChevronRight size={15} className="shrink-0 text-muted" />
                )
              ) : (
                <span className="inline-block w-[15px] shrink-0" />
              )}
              <span className={depth > 0 ? 'text-muted' : undefined}>{row.label}</span>
            </button>
          </td>
          {renderCells(row)}
        </tr>
      )
      return hasChildren && isOpen ? [tr, ...renderRows(row.children!, depth + 1)] : [tr]
    })

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-label text-muted">
            <th className="px-4 py-2.5 font-semibold">{rowHeader}</th>
            {columns.map((c) => (
              <th
                key={c.key}
                className="px-4 py-2.5 font-semibold"
                style={{ textAlign: c.align ?? 'right' }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{renderRows(rows)}</tbody>
      </table>
    </div>
  )
}
