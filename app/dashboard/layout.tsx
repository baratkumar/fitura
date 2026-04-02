import { Suspense } from 'react'
import PageLoader from '@/components/PageLoader'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-10">
          <PageLoader message="Loading dashboard…" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
