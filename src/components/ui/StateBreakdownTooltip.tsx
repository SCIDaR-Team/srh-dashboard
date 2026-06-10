/**
 * StateBreakdownTooltip — modal popover used when the user clicks a
 * metric card to see the value broken down by state.
 *
 * Rendered in a React portal attached to document.body so the modal
 * escapes any ancestor `overflow:hidden` / `transform` (the parent
 * SectionCard uses both, which would otherwise clip the modal and hide
 * the close button).
 *
 * Replaces the ~40 hover-only tooltip pages from the original Power BI
 * dashboard with a click-to-drill interaction that's friendlier on touch.
 */

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
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

  if (!isOpen || typeof document === 'undefined') return null

  const chartData = data.map((d) => ({ name: d.state, value: d.value }))

  return createPortal(
    <div
      className="srh-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-card p-4 shadow-card-hover"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="state-breakdown-title"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3
            id="state-breakdown-title"
            className="font-heading text-sm font-semibold text-ink"
          >
            {title} <span className="text-muted">by state</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-muted hover:bg-slate-100 hover:text-ink"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <HBarChart data={chartData} height={220} showValues />
        </div>
      </div>
    </div>,
    document.body,
  )
}
