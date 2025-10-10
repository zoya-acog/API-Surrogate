// // 


// // searchform.tsx
// "use client"

// import type React from "react"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { Search, PenLine } from "lucide-react"
// import { Slider } from "@/components/ui/slider"

// export default function SearchForm() {
//   const router = useRouter()
//   const [query, setQuery] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [meltingPoint, setMeltingPoint] = useState([-50, 300]) // Default range for melting point
//   const [hasModifiedSlider, setHasModifiedSlider] = useState(false)

//   const handleSearch = async (e: React.FormEvent) => {
//     e.preventDefault()

//     setIsLoading(true)

//     // Build the query parameters
//     const params = new URLSearchParams()

//     // If we have a query, add it
//     if (query.trim()) {
//       params.append("query", query)
//     } else {
//       // Always enable advanced for no-query case (slider intent)
//       params.append("advanced", "true")
//       params.append("mp_min", meltingPoint[0].toString())
//       params.append("mp_max", meltingPoint[1].toString())
//     }

//     router.push(`/results?${params.toString()}`)
//   }

//   const handleDrawStructure = () => {
//     router.push("/search/draw")
//   }

//   const handleSliderChange = (value: number[]) => {
//     setMeltingPoint(value)
//     // Mark slider as modified if it's different from default
//     if (value[0] !== -50 || value[1] !== 300) {
//       setHasModifiedSlider(true)
//     } else {
//       setHasModifiedSlider(false)
//     }
//   }

//   const exampleSearches = ["Ritonavir", "C1=CC=C(C=C1)C=O"]

//   const isTextSearchActive = query.trim().length > 0
//   const isSliderSearchActive = hasModifiedSlider

//   return (
//     <div className="w-full max-w-4xl mx-auto">
//       <form onSubmit={handleSearch} className="space-y-4">
//         <div className="relative">
//           <input
//             type="text"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search by API names, SMILES, properties or Draw structures to derive SMILES"
//             className="w-full px-4 py-3 pr-12 text-foreground bg-background text-lg rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
//             disabled={isSliderSearchActive}
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
//               className="text-white hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
//               disabled={isSliderSearchActive}
//             >
//               {term}
//             </button>
//           ))}
//         </div>

//         <div className="flex items-center justify-center my-4">
//           <div className="flex-grow border-t border-white/20"></div>
//           <span className="px-4 text-white/80 font-medium">OR</span>
//           <div className="flex-grow border-t border-white/20"></div>
//         </div>

//         <div className="bg-white/10 rounded-md p-4">
//           <h3 className="text-primary-foreground/90 font-medium mb-4">Property Search</h3>
          
//           <div className={`p-4 bg-card/10 rounded-md border border-border/20 ${isTextSearchActive ? 'opacity-50 pointer-events-none' : ''}`}>
//             <div className="space-y-6 px-4">
//               <div>
//                 <h4 className="text-sm font-medium mb-2">Melting Point</h4>
//                 <Slider
//                   defaultValue={[-50, 300]}
//                   min={-300}
//                   max={500}
//                   step={1}
//                   value={meltingPoint}
//                   onValueChange={handleSliderChange}
//                   className="mb-2"
//                   disabled={isTextSearchActive}
//                 />
//                 <div className="flex justify-between text-sm">
//                   <span>Min: {meltingPoint[0]} °C</span>
//                   <span>Max: {meltingPoint[1]} °C</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-center gap-4 mt-6">
//           <button
//             type="submit"
//             disabled={isLoading || (!query.trim() && !hasModifiedSlider)}
//             className={`px-6 py-3 bg-primary text-primary-foreground rounded-md ${
//               isLoading || (!query.trim() && !hasModifiedSlider)
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
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, PenLine } from "lucide-react"
import { Slider } from "@/components/ui/slider"

export default function SearchForm() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [meltingPoint, setMeltingPoint] = useState([-50, 300])
  const [hasModifiedSlider, setHasModifiedSlider] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const params = new URLSearchParams()
    if (query.trim()) {
      params.append("query", query)
    } else {
      params.append("advanced", "true")
      params.append("mp_min", meltingPoint[0].toString())
      params.append("mp_max", meltingPoint[1].toString())
    }
    router.push(`/results?${params.toString()}`)
  }

  const handleDrawStructure = () => {
    router.push("/search/draw")
  }

  const handleSliderChange = (value: number[]) => {
    setMeltingPoint(value)
    if (value[0] !== -50 || value[1] !== 300) {
      setHasModifiedSlider(true)
    } else {
      setHasModifiedSlider(false)
    }
  }

  const exampleSearches = ["Ritonavir", "C1=CC=C(C=C1)C=O"]
  const isTextSearchActive = query.trim().length > 0
  const isSliderSearchActive = hasModifiedSlider

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by API names, SMILES, properties or Draw structures to derive SMILES"
            className="w-full px-4 py-3 pr-12 text-foreground bg-background text-lg rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSliderSearchActive}
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
              onClick={() => setQuery(term)}
              className="text-white hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSliderSearchActive}
            >
              {term}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center my-4">
          <div className="flex-grow border-t border-white/20"></div>
          <span className="px-4 text-white/80 font-medium">OR</span>
          <div className="flex-grow border-t border-white/20"></div>
        </div>

        <div className="bg-white/10 rounded-md p-4">
          <h3 className="text-primary-foreground/90 font-medium mb-4">Property Search</h3>
          <div className={`p-4 bg-card/10 rounded-md border border-border/20 ${isTextSearchActive ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="space-y-6 px-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Melting Point</h4>
                <Slider
                  defaultValue={[-50, 300]}
                  min={-300}
                  max={500}
                  step={1}
                  value={meltingPoint}
                  onValueChange={handleSliderChange}
                  className="mb-2"
                  disabled={isTextSearchActive}
                />
                <div className="flex justify-between text-sm">
                  <span>Min: {meltingPoint[0]} °C</span>
                  <span>Max: {meltingPoint[1]} °C</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-3 bg-primary text-primary-foreground rounded-md ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-primary/90"}`}
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