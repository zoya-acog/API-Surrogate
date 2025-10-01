export const TableSkeleton = ()=>{
    return(
        <div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-100">
      <tr>
      <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b">Brand Name</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b">Active Ingredients</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b">Inactive Ingredients</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b">SMILES OF ACTIVE INGREDIENT</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b">Molecular Weight(g/mol)</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b">CAS ID</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b">PubChem CID</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b">TPSA</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b">XLogP</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b">IUPAC Name</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b">Molecular Formula</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b">InChIKey</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b">Dosage Form</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b">Dosage & Administration</th>
      </tr>
    </thead>
    <tbody className="animate-pulse divide-y divide-gray-200">
      {Array.from({ length: 10 }).map((_, idx) => (
        <tr key={idx}>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
    )
}