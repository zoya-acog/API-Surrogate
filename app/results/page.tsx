"use client"

import { Suspense } from "react"
import { TableSkeleton } from "@/components/TableSkeleton"
import { useSearchParams } from "next/navigation"
import ResultsDataTable from "@/components/ResultsDataTable"
// Create a separate component that uses useSearchParams
function ResultsContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("query")
  const type = searchParams.get("type") || "name"
  const drawn = searchParams.get("drawn") === "true"

  return (
    <div className="container mx-auto py-8 px-4">
      <ResultsDataTable query={query} type={type} drawn={drawn} />
    </div>
  )
}
// Main page component
export default function ResultsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Suspense
        fallback={
          <div className="container mx-auto py-8 px-4">
            <TableSkeleton />
          </div>
        }
      >
        <ResultsContent />
      </Suspense>
    </main>
  )
}