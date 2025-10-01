
"use client"

import type React from "react"
import { useEffect, useRef, useState, useMemo } from "react"

interface JSMEEditorProps {
  width?: number
  height?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: Record<string, any>
  onChange?: (smiles: string) => void
  initialSmiles?: string
}

const JSMEEditor: React.FC<JSMEEditorProps> = ({
  width = 500,
  height = 300,
  options = {},
  onChange,
  initialSmiles = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsmeRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const initialSmilesRef = useRef(initialSmiles)

  // Memoize the options to prevent unnecessary re-renders
  const defaultOptions = useMemo(
    () => ({
      atmTooltips: true,
      colorAtoms: true,
      implicitHydrogen: true,
      useBonds: true,
      explicitHydrogen: false,
      showDummyAtoms: false,
      borderColor: "#3b3b3b",
      enhancedStereoLabels: true,
      infoBox: false,
      useServiceWorker: false,
      ...options,
    }),
    [options],
  )

  // Dynamically load the script
  useEffect(() => {
    const loadScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.JSME) {
          resolve()
          return
        }

        const script = document.createElement("script")
        script.src = "https://jsme-editor.github.io/dist/jsme/jsme.nocache.js"
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error("Failed to load JSME script"))
        document.body.appendChild(script)
      })
    }

    // Set the global onload for JSME
    window.jsmeOnLoad = () => {
      setIsLoaded(true)
    }

    loadScript().catch((err) => {
      console.error("Failed to load JSME script:", err)
    })

    return () => {
      window.jsmeOnLoad = undefined
    }
  }, [])

  useEffect(() => {
    if (isLoaded && containerRef.current && !jsmeRef.current) {
      try {
        jsmeRef.current = new window.JSApplet.JSME(containerRef.current.id, `${width}px`, `${height}px`)

        for (const [key, value] of Object.entries(defaultOptions)) {
          jsmeRef.current.options(key, value)
        }

        if (initialSmilesRef.current) {
          jsmeRef.current.readGenericMolecularInput(initialSmilesRef.current)
        }

        if (onChange) {
          jsmeRef.current.setCallBack("AfterStructureModified", () => {
            const smiles = jsmeRef.current.smiles()
            onChange(smiles)
          })
        }
      } catch (error) {
        console.error("Error initializing JSME:", error)
      }
    }
  }, [isLoaded, width, height, onChange, defaultOptions])

  useEffect(() => {
    if (jsmeRef.current && initialSmiles !== initialSmilesRef.current && initialSmiles) {
      initialSmilesRef.current = initialSmiles
      const currentSmiles = jsmeRef.current.smiles()
      if (currentSmiles !== initialSmiles) {
        jsmeRef.current.readGenericMolecularInput(initialSmiles)
      }
    }
  }, [initialSmiles])

  useEffect(() => {
    return () => {
      jsmeRef.current = null
    }
  }, [])

  return (
    <div>
      <div ref={containerRef} id="jsme_container" style={{ width: `${width}px`, height: `${height}px` }}></div>
    </div>
  )
}

export default JSMEEditor


