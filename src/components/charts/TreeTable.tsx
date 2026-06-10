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

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-muted">
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
        <tbody>
          {rows.map((row) => {
            const hasChildren = !!row.children?.length
            const isOpen = expanded[row.id]
            return (
              <FragmentRows key={row.id}>
                <tr className="border-b border-black/5 hover:bg-light-green/40">
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => hasChildren && toggle(row.id)}
                      className="flex items-center gap-1.5 font-medium text-ink disabled:cursor-default"
                      disabled={!hasChildren}
                    >
                      {hasChildren ? (
                        isOpen ? (
                          <ChevronDown size={15} className="text-muted" />
                        ) : (
                          <ChevronRight size={15} className="text-muted" />
                        )
                      ) : (
                        <span className="inline-block w-[15px]" />
                      )}
                      {row.label}
                    </button>
                  </td>
                  {renderCells(row)}
                </tr>
                {hasChildren &&
                  isOpen &&
                  row.children!.map((child) => (
                    <tr
                      key={child.id}
                      className="border-b border-black/5 bg-light-green/20 hover:bg-light-green/50"
                    >
                      <td className="py-2 pl-10 pr-4 text-muted">{child.label}</td>
                      {renderCells(child)}
                    </tr>
                  ))}
              </FragmentRows>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Small helper so each parent+children group is a single JSX expression.
function FragmentRows({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
