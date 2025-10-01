// This script copies RDKit WASM files to the public directory
const fs = require("fs")
const path = require("path")

// Source directory (node_modules)
const sourceDir = path.join(__dirname, "..", "node_modules", "@rdkit", "rdkit", "dist")

// Destination directory (public)
const destDir = path.join(__dirname, "..", "public", "rdkit")

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true })
}

// Files to copy
const filesToCopy = ["RDKit_minimal.wasm", "RDKit_minimal.js"]

// Copy files
filesToCopy.forEach((file) => {
  const sourcePath = path.join(sourceDir, file)
  const destPath = path.join(destDir, file)

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath)
    console.log(`Copied ${file} to public/rdkit/`)
  } else {
    console.error(`Source file not found: ${sourcePath}`)
  }
})

console.log("RDKit WASM files copied successfully!")
