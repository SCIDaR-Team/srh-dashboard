/**
 * BreakdownMetric — a MetricCard that opens a per-state breakdown popover
 * on click. Equivalent to the Power BI dashboard's hover-tooltip pages,
 * which surfaced "X by state" detail across ~40 cards.
 *
 * Pass the same data + measure you'd use on the page; the popover lazily
 * computes the per-state bar chart only when opened.
 */

import { useMemo, useState } from 'react'
import {
  MetricCard,
  type SubtitleColor,
  type MetricSize,
  type MetricVariant,
  type MetricTone,
} from './MetricCard'
import { StateBreakdownTooltip } from './StateBreakdownTooltip'
import { breakdownByState, type Measure } from '../../lib/measures'
import type { ODKSubmission } from '../../lib/types'

interface BreakdownMetricProps {
  // MetricCard props (kept identical so this is a drop-in replacement)
  title: string
  value: string | number
  subtitle?: string
  subtitleColor?: SubtitleColor
  format?: 'number' | 'raw'
  size?: MetricSize
  variant?: MetricVariant
  tone?: MetricTone
  icon?: React.ReactNode

  // Breakdown wiring
  allData: ODKSubmission[]
  measure: Measure
  /** Title shown in the popover; defaults to the card's title. */
  breakdownTitle?: string
}

export function BreakdownMetric({
  allData,
  measure,
  breakdownTitle,
  ...metricProps
}: BreakdownMetricProps) {
  const [open, setOpen] = useState(false)

  // Compute the breakdown only when the popover is opened (cheap, but
  // saves work on the common case of a page with 10 such cards).
  const data = useMemo(
    () => (open ? breakdownByState(allData, measure) : []),
    [open, allData, measure],
  )

  return (
    <>
      <MetricCard {...metricProps} onClick={() => setOpen(true)} />
      <StateBreakdownTooltip
        isOpen={open}
        onClose={() => setOpen(false)}
        title={breakdownTitle ?? metricProps.title}
        data={data}
      />
    </>
  )
}
