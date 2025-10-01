// Import both client and server RDKit initialization methods
import { initRDKit } from "./rdkit-client"
import * as path from "path"

export interface CompoundWithSimilarity {
  id: number
  similarity: number
}

/**
 * Performs a Tanimoto similarity search on a list of compounds
 *
 * @param querySmiles - The SMILES string to compare against
 * @param compounds - Array of compounds with SMILES strings
 * @param options - Configuration options
 * @returns Array of compounds sorted by similarity (descending)
 */
export async function performSimilaritySearch(
  querySmiles: string,
  compounds: Array<{ id: number; smiles: string | null }>,
  options: {
    radius?: number
    nBits?: number
    threshold?: number
    limit?: number
  } = {},
): Promise<CompoundWithSimilarity[]> {
  // Default options
  const threshold = options.threshold || 0
  const limit = options.limit || 10

  try {
    // Initialize RDKit - works in both client and server
    let rdkit

    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      rdkit = await initRDKit()
    } else {
      // Server-side initialization
      const RDKitModule = await import("@rdkit/rdkit")
      // @ts-expect-error - RDKit module structure is not properly typed
      rdkit = await RDKitModule.default({
        locateFile: (file) => {
          return path.join(process.cwd(), "public", "rdkit", file)
        },
      })
    }

    console.log("RDKit initialized successfully, version:", rdkit.version())

    // Create query molecule
    const queryMol = rdkit.get_mol(querySmiles)
    if (!queryMol) {
      throw new Error("Invalid query SMILES")
    }

    // Generate Morgan fingerprint for query molecule (ECFP4)
    const queryFp = queryMol[`get_morgan_fp`]()

    // Calculate similarity for each compound
    const results: CompoundWithSimilarity[] = []

    for (const compound of compounds) {
      try {
        if (!compound.smiles) continue

        const mol = rdkit.get_mol(compound.smiles)
        if (!mol) continue

        const fp = mol[`get_morgan_fp`]()
        const similarity = calculateTanimotoSimilarity(queryFp,fp)
        // Only include compounds above threshold
        if (similarity >= threshold) {
          results.push({
            id: compound.id,
            similarity,
          })
        }

        // Clean up RDKit objects
        mol.delete()
  
      } catch (e) {
        console.error(`Error processing compound ${compound.id}:`, e)
      }
    }

    // Clean up query objects
  

    // Sort by similarity (descending) and limit results
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, limit)
  } catch (error) {
    console.error("Similarity search error:", error)
    throw error
  }
}
function calculateTanimotoSimilarity(fp1: string, fp2: string): number {
    if (fp1.length !== fp2.length) {
      throw new Error("Fingerprints must be of the same length")
    }
    
    let intersectionCount = 0
    let union = 0
    
    // Count bits in both fingerprints
    for (let i = 0; i < fp1.length; i++) {
      const bit1 = fp1[i] === '1'
      const bit2 = fp2[i] === '1'
      
      if (bit1 && bit2) {
        intersectionCount++
      }
      
      if (bit1 || bit2) {
        union++
      }
    }
    
    // Tanimoto coefficient = intersection / union
    return union === 0 ? 0 : intersectionCount / union
  }