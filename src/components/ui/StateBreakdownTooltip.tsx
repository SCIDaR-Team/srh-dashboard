/**
 * StateBreakdownTooltip — anchored popover used when the user clicks a
 * metric card to see the value broken down by state.
 *
 * Rendered in a React portal attached to document.body so the popover
 * escapes any ancestor `overflow:hidden` / `transform` (the parent
 * SectionCard uses both, which would otherwise clip the popover and hide
 * the close button).
 *
 * Position is computed from `anchorRect` — the trigger element's
 * bounding rect at the moment of the click. The popover prefers to sit
 * below the trigger; if there isn't room, it flips above. Horizontally
 * it aligns with the trigger's left edge and clamps to the viewport.
 */

import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { HBarChart } from '../charts/HBarChart'

interface StateBreakdownTooltipProps {
  data: { state: string; value: number }[]
  title: string
  isOpen: boolean
  onClose: () => void
  /** Bounding rect of the clicked card. The popover positions itself
   *  relative to this rather than sitting in the centre of the viewport. */
  anchorRect: DOMRect | null
}

const POPOVER_WIDTH = 360
// Approximate height used only for the above/below flip decision. The
// actual rendered popover is sized by its content (title + 220px chart).
const ESTIMATED_HEIGHT = 320
const GAP = 8
const VIEWPORT_PAD = 8

function computePosition(rect: DOMRect): { top: number; left: number } {
  const vw = window.innerWidth
  const vh = window.innerHeight

  // Always position below the trigger. If the viewport is too short for
  // the popover to fit fully below, pull it up just enough to stay
  // reachable — but never flip above the trigger.
  let top = rect.bottom + GAP
  const maxTop = vh - ESTIMATED_HEIGHT - VIEWPORT_PAD
  if (top > maxTop) top = Math.max(VIEWPORT_PAD, maxTop)

  // Align with the trigger's left edge; clamp to viewport on both sides.
  let left = rect.left
  if (left + POPOVER_WIDTH > vw - VIEWPORT_PAD) {
    left = vw - POPOVER_WIDTH - VIEWPORT_PAD
  }
  if (left < VIEWPORT_PAD) left = VIEWPORT_PAD

  return { top, left }
}

export function StateBreakdownTooltip({
  data,
  title,
  isOpen,
  onClose,
  anchorRect,
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

  // Close on scroll — the anchor would otherwise drift away from the popover.
  useEffect(() => {
    if (!isOpen) return
    const onScroll = () => onClose()
    window.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => window.removeEventListener('scroll', onScroll, { capture: true })
  }, [isOpen, onClose])

  const position = useMemo(
    () => (anchorRect ? computePosition(anchorRect) : null),
    [anchorRect],
  )

  if (!isOpen || !position || typeof document === 'undefined') return null

  const chartData = data.map((d) => ({ name: d.state, value: d.value }))

  return createPortal(
    // Transparent click-outside catcher — no dark wash, so the chart
    // underneath stays visible.
    <div
      className="fixed inset-0 z-50"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="srh-fade-in absolute flex max-h-[90vh] flex-col overflow-hidden rounded-xl border border-slate-200 bg-card p-4 shadow-card-hover"
        style={{ top: position.top, left: position.left, width: POPOVER_WIDTH }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
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
