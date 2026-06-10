/**
 * StateBreakdownTooltip — modal popover used when the user clicks a
 * metric card to see the value broken down by state.
 *
 * Replaces the ~40 hover-only tooltip pages from the original Power BI
 * dashboard with a click-to-drill interaction that's friendlier on touch.
 */

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { HBarChart } from '../charts/HBarChart'

interface StateBreakdownTooltipProps {
  data: { state: string; value: number }[]
  title: string
  isOpen: boolean
  onClose: () => void
}

export function StateBreakdownTooltip({
  data,
  title,
  isOpen,
  onClose,
}: StateBreakdownTooltipProps) {
  // Esc-to-close.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const chartData = data.map((d) => ({ name: d.state, value: d.value }))

  return (
    <div
      className="srh-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg rounded-xl bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="state-breakdown-title"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3
            id="state-breakdown-title"
            className="font-heading text-base font-semibold text-ink"
          >
            {title} <span className="text-muted">by state</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted hover:bg-light-green hover:text-primary"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <HBarChart data={chartData} showValues />
      </div>
    </div>
  )
}
