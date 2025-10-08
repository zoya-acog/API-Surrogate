// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { Search, ChevronDown, ChevronUp, PenLine } from "lucide-react"
// import { Slider } from "@/components/ui/slider"

// export default function SearchForm() {
//   const router = useRouter()
//   const [query, setQuery] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [showPropertySearch, setShowPropertySearch] = useState(false)
//   // const [molecularWeight, setMolecularWeight] = useState([0, 1000])
//   // const [logD, setLogD] = useState([-3, 5])
//   const [meltingPoint, setMeltingPoint] = useState([-50, 300]) // Default range for melting point
//   const [isSmiles, setIsSmiles] = useState(false)

//   // Detect if the query looks like a SMILES string
//   useEffect(() => {
//     const detectSmiles = (input: string) => {
//       return /[$$$$=#[\]\\/\-+]/.test(input)
//     }

//     setIsSmiles(detectSmiles(query))
//   }, [query])

//   const handleSearch = async (e: React.FormEvent) => {
//     e.preventDefault()

//     // Don't allow empty searches unless advanced search is enabled
//     if (!query.trim() && (!showPropertySearch || (meltingPoint[0] === -50 && meltingPoint[1] === 300))) return

//     setIsLoading(true)

//     // Build the query parameters
//     const params = new URLSearchParams()

//     // If we have a query, add it
//     if (query.trim()) {
//       params.append("query", query)
//     }

//     // Add advanced search parameters if that section is open and we're not using SMILES
//     if (showPropertySearch && !isSmiles) {
//       params.append("advanced", "true")
//       // params.append("mw_min", molecularWeight[0].toString())
//       // params.append("mw_max", molecularWeight[1].toString())
//       // params.append("logd_min", logD[0].toString())
//       // params.append("logd_max", logD[1].toString())
//       params.append("mp_min", meltingPoint[0].toString())
//       params.append("mp_max", meltingPoint[1].toString())
//     }

//     router.push(`/results?${params.toString()}`)
//   }

//   const handleDrawStructure = () => {
//     router.push("/search/draw")
//   }

//   const exampleSearches = ["Ritonavir", "C1=CC=C(C=C1)C=O"]

//   return (
//     <div className="w-full max-w-4xl mx-auto">
//       <form onSubmit={handleSearch} className="space-y-4">
//         <div className="relative">
//           <input
//             type="text"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search by API names, SMILES, properties or Draw structures to derive SMILES"
//             className="w-full px-4 py-3 pr-12 text-foreground bg-background text-lg rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
//           />
//           <button
//             type="submit"
//             className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
//             aria-label="Search"
//           >
//             <Search size={24} />
//           </button>
//         </div>

//         <div className="flex flex-wrap gap-2 text-sm">
//           <span className="text-white/80">Try:</span>
//           {exampleSearches.map((term, index) => (
//             <button
//               key={index}
//               type="button"
//               onClick={() => {
//                 setQuery(term)
//               }}
//               className="text-white hover:underline"
//             >
//               {term}
//             </button>
//           ))}
//         </div>

//         <div className={`bg-white/10 rounded-md p-4 `}>
//           <button
//             type="button"
//             onClick={() => setShowPropertySearch(!showPropertySearch)}
//             className={`w-full flex items-center justify-between text-primary-foreground/90 hover:text-primary-foreground font-medium hover:text-primary-foreground`}
//           >
//             <span>Advanced search {isSmiles && ""}</span>
//             {showPropertySearch ? (
//               <ChevronUp size={20} className="ml-1" />
//             ) : (
//               <ChevronDown size={20} className="ml-1" />
//             )}
//           </button>

//           {showPropertySearch && (
//             <div className="mt-4 p-4 bg-card/10 rounded-md border border-border/20">
//               <div className="space-y-6 px-4">
//                 {/* <div>
//                   <h4 className="text-sm font-medium mb-2">M.W</h4>
//                   <Slider
//                     defaultValue={[0, 1000]}
//                     max={2000}
//                     step={1}
//                     value={molecularWeight}
//                     onValueChange={setMolecularWeight}
//                     className="mb-2"
//                   />
//                   <div className="flex justify-between text-sm">
//                     <span>Min: {molecularWeight[0]} g/mol</span>
//                     <span>Max: {molecularWeight[1]} g/mol</span>
//                   </div>
//                 </div>

//                 <div>
//                   <h4 className="text-sm font-medium mb-2">LogD</h4>
//                   <Slider
//                     defaultValue={[-3, 5]}
//                     min={-10}
//                     max={10}
//                     step={0.1}
//                     value={logD}
//                     onValueChange={setLogD}
//                     className="mb-2"
//                   />
//                   <div className="flex justify-between text-sm">
//                     <span>Min: {logD[0]}</span>
//                     <span>Max: {logD[1]}</span>
//                   </div>
//                 </div> */}

//                 <div>
//                   <h4 className="text-sm font-medium mb-2">Melting Point</h4>
//                   <Slider
//                     defaultValue={[-50, 300]}
//                     min={-300}
//                     max={500}
//                     step={1}
//                     value={meltingPoint}
//                     onValueChange={setMeltingPoint}
//                     className="mb-2"
//                   />
//                   <div className="flex justify-between text-sm">
//                     <span>Min: {meltingPoint[0]} °C</span>
//                     <span>Max: {meltingPoint[1]} °C</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="flex justify-center gap-4 mt-6">
//           <button
//             type="submit"
//             disabled={isLoading || (!query.trim() && !showPropertySearch)}
//             className={`px-6 py-3 bg-primary text-primary-foreground rounded-md ${
//               isLoading || (!query.trim() && !showPropertySearch)
//                 ? "opacity-70 cursor-not-allowed"
//                 : "hover:bg-primary/90"
//             }`}
//           >
//             {isLoading ? "Searching..." : "Search"}
//           </button>

//           <button
//             type="button"
//             onClick={handleDrawStructure}
//             className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 flex items-center"
//           >
//             <PenLine className="mr-2 h-5 w-5" />
//             Draw
//           </button>
//         </div>
//       </form>
//     </div>
//   )
// }



"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, ChevronDown, ChevronUp, PenLine } from "lucide-react"
import { Slider } from "@/components/ui/slider"

export default function SearchForm() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPropertySearch, setShowPropertySearch] = useState(false)
  const [meltingPoint, setMeltingPoint] = useState([-50, 300]) // Default range for melting point
  const [isSmiles, setIsSmiles] = useState(false)

  // Detect if the query looks like a SMILES string
  useEffect(() => {
    const detectSmiles = (input: string) => {
      return /[$$$$=#[\]\\/\-+]/.test(input)
    }

    setIsSmiles(detectSmiles(query))
  }, [query])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    // Don't allow empty searches unless advanced search is enabled with non-default MP
    if (!query.trim() && !showPropertySearch) return
    if (showPropertySearch && meltingPoint[0] === -50 && meltingPoint[1] === 300) return

    setIsLoading(true)

    // Build the query parameters
    const params = new URLSearchParams()

    // If we have a query, add it
    if (query.trim()) {
      params.append("query", query)
    }

    // Add advanced search parameters if that section is open and we're not using SMILES
    if (showPropertySearch && !isSmiles) {
      params.append("advanced", "true")
      params.append("mp_min", meltingPoint[0].toString())
      params.append("mp_max", meltingPoint[1].toString())
    }

    router.push(`/results?${params.toString()}`)
  }

  const handleDrawStructure = () => {
    router.push("/search/draw")
  }

  const exampleSearches = ["Ritonavir", "C1=CC=C(C=C1)C=O"]

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by API names, SMILES, properties or Draw structures to derive SMILES"
            className="w-full px-4 py-3 pr-12 text-foreground bg-background text-lg rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Search"
          >
            <Search size={24} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-white/80">Try:</span>
          {exampleSearches.map((term, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setQuery(term)
              }}
              className="text-white hover:underline"
            >
              {term}
            </button>
          ))}
        </div>

        <div className={`bg-white/10 rounded-md p-4 `}>
          <button
            type="button"
            onClick={() => setShowPropertySearch(!showPropertySearch)}
            className={`w-full flex items-center justify-between text-primary-foreground/90 hover:text-primary-foreground font-medium hover:text-primary-foreground`}
          >
            <span>Advanced search {isSmiles && ""}</span>
            {showPropertySearch ? (
              <ChevronUp size={20} className="ml-1" />
            ) : (
              <ChevronDown size={20} className="ml-1" />
            )}
          </button>

          {showPropertySearch && (
            <div className="mt-4 p-4 bg-card/10 rounded-md border border-border/20">
              <div className="space-y-6 px-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Melting Point</h4>
                  <Slider
                    defaultValue={[-50, 300]}
                    min={-300}
                    max={500}
                    step={1}
                    value={meltingPoint}
                    onValueChange={setMeltingPoint}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm">
                    <span>Min: {meltingPoint[0]} °C</span>
                    <span>Max: {meltingPoint[1]} °C</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            type="submit"
            disabled={isLoading || (!query.trim() && !showPropertySearch) || (showPropertySearch && meltingPoint[0] === -50 && meltingPoint[1] === 300)}
            className={`px-6 py-3 bg-primary text-primary-foreground rounded-md ${
              isLoading || (!query.trim() && !showPropertySearch) || (showPropertySearch && meltingPoint[0] === -50 && meltingPoint[1] === 300)
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-primary/90"
            }`}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>

          <button
            type="button"
            onClick={handleDrawStructure}
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 flex items-center"
          >
            <PenLine className="mr-2 h-5 w-5" />
            Draw
          </button>
        </div>
      </form>
    </div>
  )
}
