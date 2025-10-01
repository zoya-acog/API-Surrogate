
"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import Link from "next/link"
import { TableSkeleton } from "./TableSkeleton"
import FormulaDisplay from "./FormulaDisplay"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, Home, Settings } from "lucide-react"
import { getFormattedDate } from "@/lib/export-utils"
import * as XLSX from "xlsx"

// AG-Grid imports
import { AgGridReact } from "ag-grid-react"
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 
import type {
  ColDef,
  GridReadyEvent,
  ICellRendererParams,
  ValueFormatterParams,
  FilterChangedEvent,
} from "ag-grid-community"

ModuleRegistry.registerModules([AllCommunityModule]);

// Define the types for our data
type Drug = {
  id: string
  brandName: string
  inactiveIngredients: string
  dosageForm: string
  dosageAndAdmin: string
}

type Compound = {
  id: string
  name: string
  canonicalSMILES: string
  molecularWeight: number
  cas: string
  pubChemCID: string
  tpsa: number
  xLogP: number
  iupacName: string
  molecularFormula: string
  inchiKey: string
  drugs: Drug[]
  similarityScore: number
}


// Custom cell renderer for brand name with link
const BrandNameRenderer = (props: ICellRendererParams) => {
  const { value, data } = props
  if (!value) return <div>N/A</div>
  return (
    <Link
      href={`/drug/${data.drug.id}`}
      className="text-blue-600 font-medium hover:text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
    >
      {value}
    </Link>
  )
}

// Custom cell renderer for molecular formula
const FormulaRenderer = (props: ICellRendererParams) => {
  return <FormulaDisplay formula={props.value} />
}

// Custom cell renderer for SMILES with tooltip
const SmilesRenderer = (props: ICellRendererParams) => {
  if (!props.value) return <div>N/A</div>
  return (
    <div className="max-w-xs overflow-hidden">
      <p className="font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap" title={props.value}>
        {props.value}
      </p>
    </div>
  )
}

export default function ResultsDataTable({ query, type, drawn = false }) {
  const gridRef = useRef<AgGridReact>(null)
  const [results, setResults] = useState<Compound[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rowData, setRowData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [activeFilterCount, setActiveFilterCount] = useState(0)

  const [columnVisibility, setColumnVisibility] = useState({
    "compound.structure": false,
    "drug.brandName": true,
    "drug.allActiveIngredients":true,
    "drug.inactiveIngredients": true,
    "compound.name": true,
    // "compound.similarityScore": true,
    "compound.canonicalSMILES": false,
    "compound.molecularWeight": false,
    "compound.molecularFormula": false,
    "compound.cas": false,
    "compound.pubChemCID": false,
    "compound.tpsa": false,
    "compound.xLogP": false,
    "compound.iupacName": false,
    "compound.inchiKey": false,
    "drug.dosageForm": true,
    "drug.dosageAndAdmin": true,
  })

  
  

  // Define column definitions for AG-Grid
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Brand Name",
        field: "drug.brandName",
        cellRenderer: BrandNameRenderer,
        filter: "agTextColumnFilter",
        sortable: true,
        resizable: true,
        minWidth: 150,
        filterParams: {
          filterOptions: ["contains", "notContains", "startsWith", "endsWith", "equals", "notEqual"],
          debounceMs: 200,
        },
      },
      {
        headerName: "API",
        field: "compound.name",
        filter: "agTextColumnFilter",
        sortable: true,
        resizable: true,
        minWidth: 180,
        filterParams: {
          filterOptions: ["contains", "notContains", "startsWith", "endsWith", "equals", "notEqual"],
          debounceMs: 200,
        },
      },
      {
        headerName: "All active ingredients",
        field: "drug.allActiveIngredients",
        filter: "agTextColumnFilter",
        sortable: true,
        resizable: true,
        minWidth: 180,
        filterParams: {
          filterOptions: ["contains", "notContains", "startsWith", "endsWith", "equals", "notEqual"],
          debounceMs: 200,
        },
      },
      {
        headerName: "Inactive Ingredients",
        field: "drug.inactiveIngredients",
        filter: "agTextColumnFilter",
        sortable: true,
        resizable: true,
        minWidth: 200,
        filterParams: {
          filterOptions: ["contains", "notContains", "startsWith", "endsWith", "equals", "notEqual"],
          debounceMs: 200,
        },
      },
    //   {
    //     headerName: "Similarity",
    //     field: "compound.similarityScore",
    //     filter: "agNumberColumnFilter",
    //     sortable: true,
    //     resizable: true,
    //     width: 120,
    //     valueFormatter: (params: ValueFormatterParams) => {
    //       return params.value !== undefined ? `${(params.value * 100).toFixed(1)}%` : "N/A"
    //     },
    //     filterParams: {
    //       filterOptions: ["equals", "notEqual", "greaterThan", "greaterThanOrEqual", "lessThan", "lessThanOrEqual"],
    //       debounceMs: 200,
    //     },
    //   },
      {
        headerName: "SMILES",
        field: "compound.canonicalSMILES",
        cellRenderer: SmilesRenderer,
        filter: "agTextColumnFilter",
        sortable: true,
        resizable: true,
        minWidth: 200,
        filterParams: {
          filterOptions: ["contains", "notContains", "startsWith", "endsWith", "equals", "notEqual"],
          debounceMs: 200,
        },
      },
      {
        headerName: "Molecular Weight",
        field: "compound.molecularWeight",
        filter: "agNumberColumnFilter",
        sortable: true,
        resizable: true,
        width: 150,
        valueFormatter: (params: ValueFormatterParams) => {
          return params.value ? params.value.toFixed(2) : "N/A"
        },
        filterParams: {
          filterOptions: ["equals", "notEqual", "greaterThan", "greaterThanOrEqual", "lessThan", "lessThanOrEqual"],
          debounceMs: 200,
        },
      },
      {
        headerName: "Molecular Formula",
        field: "compound.molecularFormula",
        cellRenderer: FormulaRenderer,
        filter: "agTextColumnFilter",
        sortable: true,
        resizable: true,
        minWidth: 150,
        filterParams: {
          filterOptions: ["contains", "notContains", "startsWith", "endsWith", "equals", "notEqual"],
          debounceMs: 200,
        },
      },
      {
        headerName: "CAS ID",
        field: "compound.cas",
        filter: "agTextColumnFilter",
        sortable: true,
        resizable: true,
        width: 150,
        filterParams: {
          filterOptions: ["contains", "notContains", "startsWith", "endsWith", "equals", "notEqual"],
          debounceMs: 200,
        },
      },
      {
        headerName: "PubChem CID",
        field: "compound.pubChemCID",
        filter: "agTextColumnFilter",
        sortable: true,
        resizable: true,
        width: 150,
        filterParams: {
          filterOptions: ["contains", "notContains", "startsWith", "endsWith", "equals", "notEqual"],
          debounceMs: 200,
        },
      },
      {
        headerName: "TPSA",
        field: "compound.tpsa",
        filter: "agNumberColumnFilter",
        sortable: true,
        resizable: true,
        width: 120,
        valueFormatter: (params: ValueFormatterParams) => {
          return params.value ? params.value.toFixed(2) : "N/A"
        },
        filterParams: {
          filterOptions: ["equals", "notEqual", "greaterThan", "greaterThanOrEqual", "lessThan", "lessThanOrEqual"],
          debounceMs: 200,
        },
      },
      {
        headerName: "XLogP",
        field: "compound.xLogP",
        filter: "agNumberColumnFilter",
        sortable: true,
        resizable: true,
        width: 120,
        valueFormatter: (params: ValueFormatterParams) => {
          return params.value !== null ? params.value.toFixed(2) : "N/A"
        },
        filterParams: {
          filterOptions: ["equals", "notEqual", "greaterThan", "greaterThanOrEqual", "lessThan", "lessThanOrEqual"],
          debounceMs: 200,
        },
      },
      {
        headerName: "IUPAC Name",
        field: "compound.iupacName",
        filter: "agTextColumnFilter",
        sortable: true,
        resizable: true,
        minWidth: 200,
        filterParams: {
          filterOptions: ["contains", "notContains", "startsWith", "endsWith", "equals", "notEqual"],
          debounceMs: 200,
        },
      },
      {
        headerName: "InChIKey",
        field: "compound.inchiKey",
        filter: "agTextColumnFilter",
        sortable: true,
        resizable: true,
        minWidth: 180,
        cellClass: "font-mono text-xs",
        filterParams: {
          filterOptions: ["contains", "notContains", "startsWith", "endsWith", "equals", "notEqual"],
          debounceMs: 200,
        },
      },
      {
        headerName: "Dosage Form",
        field: "drug.dosageForm",
        filter: "agTextColumnFilter",
        sortable: true,
        resizable: true,
        minWidth: 150,
        filterParams: {
          filterOptions: ["contains", "notContains", "startsWith", "endsWith", "equals", "notEqual"],
          debounceMs: 200,
        },
      },
      
      {
        headerName: "Dosage & Administration",
        field: "drug.dosageAndAdmin",
        filter: "agTextColumnFilter",
        sortable: true,
        resizable: true,
        minWidth: 200,
        filterParams: {
          filterOptions: ["contains", "notContains", "startsWith", "endsWith", "equals", "notEqual"],
          debounceMs: 200,
        },
      },
    ],
    [],
  )

  // Default column definitions
  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      minWidth: 100,
      filter: true,
      floatingFilter: true,
      sortable: true,
      resizable: true,
    }
  }, [])

  // Fetch data
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        let response

        if (drawn) {
          // If this is from the drawing tool
          response = await fetch("/api/draw-search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ smiles: query }),
          })
        } else {
          // Regular search
          response = await fetch(`/api/search?query=${encodeURIComponent(query)}&type=${type}`)
        }

        if (!response.ok) {
          throw new Error("Failed to fetch results")
        }

        const data = await response.json()
        setResults(data.results)
      } catch (err) {
        console.error("Error fetching results:", err)
        setError("Failed to load results. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (query) {
      fetchResults()
    }
  }, [query, type, drawn])

  // Flatten the results for AG-Grid
  useEffect(() => {
    if (results.length > 0) {
      const flattenedResults = results.flatMap((compound) =>
        compound.drugs.map((drug) => ({
          compound,
          drug,
        })),
      )
      setRowData(flattenedResults)
    }
  }, [results])

  // Handle filter changes
  const onFilterChanged = useCallback((event: FilterChangedEvent) => {
    const api = event.api
    const activeFilters = api.getFilterModel()
    setActiveFilterCount(Object.keys(activeFilters).length)
    console.log(activeFilterCount);
    
  },[activeFilterCount])

  // Handle grid ready event
  const onGridReady = useCallback((params: GridReadyEvent) => {
    // Auto-size columns on initial load
    params.api.sizeColumnsToFit()
  }, [])

  // Handle XLSX export
  const handleExportXLSX = async () => {
    if (!gridRef.current) return

    try {
      setIsExporting(true)

      // Use all columns from columnDefs, not just visible ones
      // Only exclude the structure column which can't be exported properly
      const exportColumns = columnDefs
        .filter((col) => col.field !== "compound.structure")
        .map((col) => ({
          id: col.field || "",
          header: col.headerName || "",
        }))

      // Get filtered data from AG-Grid
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filteredData: any[] = []
      gridRef.current.api.forEachNodeAfterFilter((node) => {
        if (node.data) {
          filteredData.push(node.data)
        }
      })

      // Prepare data for XLSX export
      const worksheet = []

      // Add header row
      worksheet.push(exportColumns.map((col) => col.header))

      // Add data rows
      filteredData.forEach((row) => {
        const dataRow = exportColumns.map((column) => {
          // Get the value based on the column id (handling nested properties)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let value:any = ""
          const [objectKey, propertyKey] = column.id.split(".")

          if (propertyKey) {
            value = row[objectKey]?.[propertyKey] ?? ""
          } else {
            value = row[objectKey] ?? ""
          }

          // Format specific column values
          if (column.id === "compound.similarityScore" && value !== "") {
            value = `${(value * 100).toFixed(1)}%`
          } else if (
            (column.id === "compound.molecularWeight" ||
              column.id === "compound.tpsa" ||
              column.id === "compound.xLogP") &&
            value !== ""
          ) {
            value = Number(value).toFixed(2)
          }

          // Handle special cases like objects or arrays
          if (typeof value === "object") {
            value = JSON.stringify(value)
          }

          return value
        })

        worksheet.push(dataRow)
      })

      // Convert to XLSX format
      const ws = XLSX.utils.aoa_to_sheet(worksheet)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Results")

      // Generate XLSX file
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
      const fileName = `API-Suroogate-${query}-results-${getFormattedDate()}.xlsx`

      // Create Blob and trigger download
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      link.click()

      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(`Error exporting data as XLSX:`, err)
      alert(`Failed to export data as XLSX. Please try again.`)
    } finally {
      setIsExporting(false)
    }
  }


// Toggle column visibility function - following the reference implementation
const toggleColumnVisibility = (field: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <TableSkeleton />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 bg-destructive/10 text-destructive rounded-md">{error}</div>
  }

  if (results.length === 0) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
        <p className="text-muted-foreground">
          No compounds found for {type}: <span className="font-mono">{query}</span>
        </p>
        <Link
          href="/"
          className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Another Search
        </Link>
      </div>
    )
  }

  const totalDrugs = results.reduce((total, item) => total + (item.drugs?.length || 0), 0)
  const components = results.length;
  const maxSimilarity = results.reduce((max,item)=> Math.max(max,item.similarityScore),-Infinity)
  const minSimilarity = results.reduce((max,item)=> Math.min(max,item.similarityScore),Infinity)

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
      <h2 className="text-2xl font-bold flex items-center gap-2">
            Search Results for :{" "}
            <div className="relative group">
              <span className="font-mono inline-block max-w-[300px] truncate" title={query}>
                {query && query.length > 30 ? `${query.substring(0, 30)}...` : query}
              </span>
            </div>
          </h2>
          {results[0].similarityScore
          ?<div>
            <p>Top-10 similar APIs (Tanimoto similarity range: {maxSimilarity.toFixed(2)}-{minSimilarity.toFixed(2)}) found</p>
            <p className="text-muted-foreground">{totalDrugs} Approved formulations found for {components} API(s)</p>
          </div>
          : <p className="text-muted-foreground">{totalDrugs} Approved formulations found for {components} API(s)</p>
          }
        </div>


        <div className="flex items-center gap-2">
          <Link
            href="/"
            className=""
          >
            <Button variant={"outline"}>
            <Home className="h-4 w-4" />
            Home
            </Button>
            
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columnDefs.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.field}
                  checked={columnVisibility[column.field || ""]}
                  onCheckedChange={() => toggleColumnVisibility(column.field || "")}
                >
                  {column.headerName}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                disabled={isExporting || results.length === 0}
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Download"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExportXLSX()}>Download as XLSX</DropdownMenuItem>
              {/* <DropdownMenuItem onClick={() => handleExport("json")}>Download as JSON</DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
          
        </div>
      </div>

      <div className="ag-theme-alpine w-full h-[600px] rounded-md border shadow-sm overflow-hidden">
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs.filter((col) => columnVisibility[col.field || ""])}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={10}
          onGridReady={onGridReady}
          onFilterChanged={onFilterChanged}
          suppressMovableColumns={false}
          animateRows={true}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          enableCellTextSelection={true}
          suppressCellFocus={false}
          domLayout="normal"
        />
      </div>
    </div>
  )
}
