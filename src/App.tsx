/**
 * App root.
 *
 *   ErrorBoundary
 *     └─ DataProvider          fetches each source once
 *          └─ BrowserRouter
 *               └─ <PageShell>
 *                    └─ Suspense   shows PageSkeleton while a lazy route loads
 *                         └─ <Routes>  each route's page is React.lazy'd
 *
 * Code-splitting the pages keeps the initial Recharts payload off the
 * first paint — only the route the user lands on pulls in the chart code.
 */

import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PageShell } from './components/layout/PageShell'
import { DataProvider } from './state/DataProvider'
import { ErrorBoundary, PageSkeleton } from './components/ui'

const HomePage = lazy(() => import('./pages/HomePage'))
const OverviewPage = lazy(() => import('./pages/OverviewPage'))
const ServiceDeliveryPage = lazy(() => import('./pages/ServiceDeliveryPage'))
const DemandGenerationPage = lazy(() => import('./pages/DemandGenerationPage'))
const FacilityFunctionalityPage = lazy(
  () => import('./pages/FacilityFunctionalityPage'),
)
const GovernancePage = lazy(() => import('./pages/GovernancePage'))
const TrendAnalysisPage = lazy(() => import('./pages/TrendAnalysisPage'))
const FacilityDeepDivePage = lazy(() => import('./pages/FacilityDeepDivePage'))

export default function App() {
  return (
    <ErrorBoundary>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PageShell />}>
              <Route
                index
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <HomePage />
                  </Suspense>
                }
              />
              <Route
                path="/overview"
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <OverviewPage />
                  </Suspense>
                }
              />
              <Route
                path="/service-delivery"
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <ServiceDeliveryPage />
                  </Suspense>
                }
              />
              <Route
                path="/demand-generation"
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <DemandGenerationPage />
                  </Suspense>
                }
              />
              <Route
                path="/facility-functionality"
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <FacilityFunctionalityPage />
                  </Suspense>
                }
              />
              <Route
                path="/governance"
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <GovernancePage />
                  </Suspense>
                }
              />
              <Route
                path="/trend-analysis"
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <TrendAnalysisPage />
                  </Suspense>
                }
              />
              <Route
                path="/facility-deepdive"
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <FacilityDeepDivePage />
                  </Suspense>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </ErrorBoundary>
  )
}
