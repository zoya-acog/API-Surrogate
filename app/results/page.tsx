"use client"

import { Suspense } from "react"
import {LoadingSpinner} from "@/components/LoadingSpinner"
import { useSearchParams } from "next/navigation"
import ResultsDataTable from "@/components/ResultsDataTable"
// Create a separate component that uses useSearchParams
function ResultsContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("query")
  const type = searchParams.get("type") || "name"
  const drawn = searchParams.get("drawn") === "true"
  const isAdvancedSearch = searchParams.get("advanced") === "true"
  const mp_min = searchParams.get("mp_min")
  const mp_max = searchParams.get("mp_max")

  return (
    <div className="container mx-auto py-8 px-4">
      <ResultsDataTable
        query={query}
        type={type}
        drawn={drawn}
        isAdvancedSearch={isAdvancedSearch}
        mp_min={mp_min}
        mp_max={mp_max}
      />
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
            <LoadingSpinner />
          </div>
        }
      >
        <ResultsContent />
      </Suspense>
    </main>
  )
}