// /**
//  * Convert data to CSV format
//  * @param data Array of objects to convert
//  * @param columns Column definitions with headers
//  * @returns CSV string
//  */

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export function convertToCSV(data: any[], columns: { id: string; header: string }[]): string {
//     // Create header row
//     const header = columns.map((col) => `"${col.header}"`).join(",")
  
//     // Create data rows
//     const rows = data
//       .map((row) => {
//         return columns
//           .map((column) => {
//             // Get the value based on the column id (handling nested properties)
//             let value = ""
//             const [objectKey, propertyKey] = column.id.split(".")
  
//             if (propertyKey) {
//               value = row[objectKey]?.[propertyKey] ?? ""
//             } else {
//               value = row[objectKey] ?? ""
//             }
  
//             // Handle special cases like objects or arrays
//             if (typeof value === "object") {
//               value = JSON.stringify(value)
//             }
  
//             // Escape quotes and wrap in quotes
//             return `"${String(value).replace(/"/g, '""')}"`
//           })
//           .join(",")
//       })
//       .join("\n")
  
//     return `${header}\n${rows}`
//   }
  
//   /**
//    * Convert data to JSON format
//    * @param data Array of objects to convert
//    * @param columns Column definitions with headers
//    * @returns Formatted JSON string
//    */
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   export function convertToJSON(data: any[], columns: { id: string; header: string }[]): string {
//     // Create a new array with only the selected columns
//     const formattedData = data.map((row) => {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const newRow: Record<string, any> = {}
  
//       columns.forEach((column) => {
//         const [objectKey, propertyKey] = column.id.split(".")
  
//         if (propertyKey) {
//           if (!newRow[objectKey]) {
//             newRow[objectKey] = {}
//           }
//           newRow[objectKey][propertyKey] = row[objectKey]?.[propertyKey] ?? null
//         } else {
//           newRow[column.header] = row[objectKey] ?? null
//         }
//       })
  
//       return newRow
//     })
  
//     return JSON.stringify(formattedData, null, 2)
//   }
  
//   /**
//    * Trigger a file download in the browser
//    * @param content Content to download
//    * @param fileName Name of the file
//    * @param contentType MIME type of the file
//    */
//   export function downloadFile(content: string, fileName: string, contentType: string): void {
//     const blob = new Blob([content], { type: contentType })
//     const url = URL.createObjectURL(blob)
  
//     const link = document.createElement("a")
//     link.href = url
//     link.download = fileName
//     link.click()
  
//     URL.revokeObjectURL(url)
//   }
  
//   /**
//    * Format a date for use in filenames
//    * @returns Formatted date string (YYYY-MM-DD)
//    */
//   export function getFormattedDate(): string {
//     const date = new Date()
//     return date.toISOString().split("T")[0]
//   }
  /**
 * Convert data to CSV format
 * @param data Array of objects to convert
 * @param columns Column definitions with headers
 * @returns CSV string
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertToCSV(data: any[], columns: { id: string; header: string }[]): string {
    // Create header row
    const header = columns.map((col) => `"${col.header}"`).join(",")
  
    // Create data rows
    const rows = data
      .map((row) => {
        return columns
          .map((column) => {
            // Get the value based on the column id (handling nested properties)
            let value = ""
            const [objectKey, propertyKey] = column.id.split(".")
  
            if (propertyKey) {
              value = row[objectKey]?.[propertyKey] ?? ""
            } else {
              value = row[objectKey] ?? ""
            }
  
            // Handle special cases like objects or arrays
            if (typeof value === "object") {
              value = JSON.stringify(value)
            }
  
            // Escape quotes and wrap in quotes
            return `"${String(value).replace(/"/g, '""')}"`
          })
          .join(",")
      })
      .join("\n")
  
    return `${header}\n${rows}`
  }
  
  /**
   * Convert data to JSON format
   * @param data Array of objects to convert
   * @param columns Column definitions with headers
   * @returns Formatted JSON string
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function convertToJSON(data: any[], columns: { id: string; header: string }[]): string {
    // Create a new array with only the selected columns
    const formattedData = data.map((row) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newRow: Record<string, any> = {}
  
      columns.forEach((column) => {
        const [objectKey, propertyKey] = column.id.split(".")
  
        if (propertyKey) {
          if (!newRow[objectKey]) {
            newRow[objectKey] = {}
          }
          newRow[objectKey][propertyKey] = row[objectKey]?.[propertyKey] ?? null
        } else {
          newRow[column.header] = row[objectKey] ?? null
        }
      })
  
      return newRow
    })
  
    return JSON.stringify(formattedData, null, 2)
  }
  
  /**
   * Format a date for use in filenames
   * @returns Formatted date string (YYYY-MM-DD)
   */
  export function getFormattedDate(): string {
    const date = new Date()
    return date.toISOString().split("T")[0]
  }
  
  /**
   * Trigger a file download in the browser
   * @param content Content to download
   * @param fileName Name of the file
   * @param contentType MIME type of the file
   */
  export function downloadFile(content: string | ArrayBuffer, fileName: string, contentType: string): void {
    const blob = new Blob([content], { type: contentType })
    const url = URL.createObjectURL(blob)
  
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    link.click()
  
    URL.revokeObjectURL(url)
  }
  