import { initRDKit } from "./rdkit-client"

/**
 * Test function to check RDKit API
 */
export async function testRDKitAPI() {
  try {
    // Initialize RDKit
    const rdkit = await initRDKit()
    console.log("RDKit initialized successfully, version:", rdkit.version())

    // Test molecule creation
    const smiles = "CC(=O)Oc1ccccc1C(=O)O" // Aspirin
    const mol = rdkit.get_mol(smiles)

    if (!mol) {
      console.error("Failed to create molecule from SMILES")
      return
    }

    console.log("Successfully created molecule from SMILES")

    // Check available methods on molecule
    console.log("Available methods on molecule:", Object.getOwnPropertyNames(Object.getPrototypeOf(mol)))

    // Test fingerprint generation with different parameters
    try {
      const fp1 = mol.get_morgan_fp(2) // Just radius
      console.log("Successfully created fingerprint with radius only")
      fp1.delete()
    } catch (e) {
      console.error("Error creating fingerprint with radius only:", e)
    }

    // Clean up
    mol.delete()

    return "RDKit API test completed"
  } catch (error) {
    console.error("RDKit API test error:", error)
    throw error
  }
}

testRDKitAPI();