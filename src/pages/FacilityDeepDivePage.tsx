/**
 * Facility Deepdive — State → LGA → Facility hierarchical matrix.
 *
 * Renders the four "deepdive indicators" per node (Assessed Facilities,
 * BEmONCs with 4+ SBAs, Clients Accessing BEmONC / CEmONC Care) and a
 * totals row at the bottom.
 */

import { SectionCard } from '../components/ui'
import { TreeTable, type TreeColumn } from '../components/charts'
import { useODKData } from '../hooks/useODKData'
import { useFilteredData } from '../hooks/useFilteredData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { computeDeepDiveData, formatK } from '../lib/measures'
import { DEEP_DIVE_INDICATORS } from '../lib/constants'

const fmt = (v: number) => v.toLocaleString()

export default function FacilityDeepDivePage() {
  useDocumentTitle('Facility Deepdive')
  const { data: raw } = useODKData()
  const { data } = useFilteredData(raw)

  const { rows, totals } = computeDeepDiveData(data)

  const columns: TreeColumn[] = DEEP_DIVE_INDICATORS.map((key) => ({
    key,
    label: key,
    format: fmt,
    align: 'right',
  }))

  return (
    <div className="space-y-6">
      {/* Totals strip — sticky summary above the matrix. */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {DEEP_DIVE_INDICATORS.map((key) => (
          <div
            key={key}
            className="rounded-xl border border-gray-100 bg-card p-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {key}
            </p>
            <p className="mt-1 font-heading text-2xl font-bold text-ink tabular-nums">
              {formatK(totals[key] ?? 0)}
            </p>
          </div>
        ))}
      </div>

      <SectionCard title="State → LGA → Facility matrix">
        {rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">
            No facilities in scope. Adjust filters or load data via the
            Netlify functions.
          </p>
        ) : (
          <TreeTable rows={rows} columns={columns} rowHeader="State / LGA / Facility" />
        )}
      </SectionCard>
    </div>
  )
}
