/**
 * Skeleton — gray pulsing placeholder for content that hasn't loaded yet.
 *
 * Used directly for individual placeholders and via PageSkeleton for the
 * Suspense fallback while a lazy-loaded route is fetching its chunk.
 */

interface SkeletonProps {
  variant?: 'card' | 'chart' | 'text' | 'gauge' | 'bar'
  className?: string
  /** Index for staggered fade-in. */
  index?: number
}

const VARIANT_HEIGHT: Record<NonNullable<SkeletonProps['variant']>, string> = {
  card: 'h-32',
  chart: 'h-64',
  text: 'h-4',
  gauge: 'h-40',
  bar: 'h-48',
}

export function Skeleton({ variant = 'card', className = '', index = 0 }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-gray-100 ${VARIANT_HEIGHT[variant]} ${className}`}
      style={{ animationDelay: `${index * 80}ms` }}
      aria-hidden="true"
    />
  )
}

/** A page-shaped skeleton used as the Suspense fallback in App.tsx. */
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} variant="card" index={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton variant="chart" index={4} />
        <Skeleton variant="chart" index={5} />
      </div>
      <Skeleton variant="chart" index={6} className="h-72" />
    </div>
  )
}
