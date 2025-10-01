// This file handles client-side RDKit initialization

import { RDKitLoader } from "@rdkit/rdkit"

// Define a global type for the RDKit instance
declare global {
  interface Window {
    initRDKitModule: RDKitLoader
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    RDKit: any
  }
}

// Function to load RDKit script
function loadRDKitScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (document.querySelector('script[src*="RDKit_minimal.js"]')) {
      resolve()
      return
    }

    const script = document.createElement("script")
    script.src = "/rdkit/RDKit_minimal.js" // Use the copy in public folder
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load RDKit script"))
    document.head.appendChild(script)
  })
}

// Initialize RDKit
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function initRDKit(): Promise<any> {
  // Only run in browser
  if (typeof window === "undefined") {
    throw new Error("RDKit client can only be initialized in browser environment")
  }

  // Return cached instance if available
  if (window.RDKit) {
    return window.RDKit
  }

  try {
    // Load the script if not already loaded
    await loadRDKitScript()

    // Initialize RDKit module
    const RDKit = await window.initRDKitModule()

    // Cache the instance
    window.RDKit = RDKit

    console.log("RDKit initialized successfully, version:", RDKit.version())
    return RDKit
  } catch (error) {
    console.error("Failed to initialize RDKit:", error)
    throw error
  }
}

// Helper function to get molecule SVG
export async function getMoleculeSvg(smiles: string, width = 250, height = 200): Promise<string> {
  const rdkit = await initRDKit()
  try {
    const mol = rdkit.get_mol(smiles)
    if (!mol) {
      return `<svg width="${width}" height="${height}"><text x="10" y="20" fill="red">Invalid SMILES</text></svg>`
    }
    const svg = mol.get_svg(width, height)
    mol.delete()
    return svg
  } catch (error) {
    console.error("Error generating molecule SVG:", error)
    return `<svg width="${width}" height="${height}"><text x="10" y="20" fill="red">Error rendering molecule</text></svg>`
  }
}
