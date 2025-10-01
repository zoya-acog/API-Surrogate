"use client"
import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Copy, Check } from "lucide-react"
import JSMEEditor from "@/components/JSMEditor"

export default function DrawingTool() {
  const router = useRouter()
  const [smiles, setSmiles] = useState("CC(=O)OC1=CC=CC=C1C(=O)O") // Default to Aspirin
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Use useCallback to memoize the onChange handler
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMoleculeChange = useCallback((newSmiles: any) => {
    console.log("Molecule changed:", newSmiles)
    setSmiles(newSmiles)
  }, [])

  const handleSearch = async () => {
    if (!smiles.trim()) {
      setError("Please draw a structure first")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/draw-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ smiles }),
      })

      if (!response.ok) {
        throw new Error("Search failed")
      }

      // Redirect to results page with the search results
      router.push(`/results?query=${encodeURIComponent(smiles)}&type=smiles&drawn=true`)
    } catch (error) {
      console.error("Search error:", error)
      setError("Failed to search with the drawn structure")
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (inputRef.current) {
      // Select the text
      inputRef.current.select()

      // Copy to clipboard
      navigator.clipboard
        .writeText(smiles)
        .then(() => {
          // Show success state
          setCopied(true)

          // Reset after 2 seconds
          setTimeout(() => {
            setCopied(false)
          }, 2000)
        })
        .catch((err) => {
          console.error("Failed to copy: ", err)
          setError("Failed to copy SMILES to clipboard")
        })
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Draw molecule</h2>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">SMILES string</label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={smiles}
            readOnly
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
          />
          <button
            onClick={copyToClipboard}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Copy SMILES to clipboard"
            title="Copy SMILES to clipboard"
          >
            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">This value is automatically generated from your drawing</p>
      </div>

      <div className="mb-4 border border-gray-300 rounded-md">
        <JSMEEditor
          width={740}
          height={400}
          onChange={handleMoleculeChange}
          initialSmiles={smiles}
          options={{
            colorAtoms: true,
            implicitHydrogen: true,
            useServiceWorker: false,
            bondThickness: 2,
            enhancedStereoLabels: true,
          }}
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Home
        </button>

        <button
          onClick={handleSearch}
          disabled={isLoading || !smiles.trim()}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
            isLoading || !smiles.trim() ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Searching..." : "Search with structure"}
        </button>
      </div>
    </div>
  )
}
