// components/DrugDetails.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FormulaDisplay from './FormulaDisplay';

// interface Drug {
//   id: string
//   brandName: string
//   genericName: string
//   manufacturerName: string
//   dosageForm: string
//   dosageAndAdmin: string
//   indicationsAndUsage: string
//   warnings: string
//   precautions: string
//   contraindications: string
//   inactiveIngredients: string
// }

// interface Compound {
//   id: number
//   name: string
//   canonicalSMILES: string
//   molecularFormula: string
//   molecularWeight: number
//   // Add other compound properties as needed
// }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DrugDetails({ drugId}:{drugId:any}) {
  const [drug, setDrug] = useState(null);
  const [compounds, setCompounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDrugDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/drug/${drugId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch drug details');
        }
        
        const data = await response.json();
        setDrug(data.drug);
        setCompounds(data.compounds);
        console.log(data);
        
      } catch (err) {
        console.error('Error fetching drug details:', err);
        setError('Failed to load drug information. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (drugId) {
      fetchDrugDetails();
    }
  }, [drugId]);

  if (loading) {
    return <div className="flex justify-center p-8"><div className="loader">Loading...</div></div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>;
  }

  if (!drug) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">Drug Not Found</h3>
        <p className="text-gray-600">
          We couldn`&apos;` find information for this drug.
        </p>
        <Link href="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Return to Search
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-black">
      <h2 className="text-2xl font-bold mb-2">Brand name: {drug.brandName || "Unnamed Drug"}</h2>
      {drug.genericName && <p className="text-xl text-gray-700 mb-6">Generic name: {drug.genericName}</p>}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-2">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drug.manufacturerName && (
                <div>
                  <h4 className="font-medium text-gray-700">Manufacturer</h4>
                  <p>{drug.manufacturerName}</p>
                </div>
              )}
              {drug.dosageForm && (
                <div>
                  <h4 className="font-medium text-gray-700">Dosage Form</h4>
                  <p>{drug.dosageForm}</p>
                </div>
              )}
              {drug.routeOfAdministration && (
                <div>
                  <h4 className="font-medium text-gray-700">Administration Route</h4>
                  <p>{drug.routeOfAdministration}</p>
                </div>
              )}
              {drug.deaSchedule && (
                <div>
                  <h4 className="font-medium text-gray-700">DEA Schedule</h4>
                  <p>{drug.deaSchedule}</p>
                </div>
              )}
            </div>
          </section>

          {drug.allActiveIngredients && (
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-2">Active ingredients with strength</h3>
              <ol className="list-decimal list-inside space-y-1">
              {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              drug.allActiveIngredients.split(';').map((item:any, index:any) => (
                <li key={index}>{item.trim()}</li>
              ))}
            </ol>
          </section>
          )}
          {drug.inactiveIngredients && (
            <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-2">Inactive Ingredients</h3>
            <ol className="list-decimal list-inside space-y-1">
              {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              drug.inactiveIngredients.split(';').map((item:any, index:any) => (
                <li key={index}>{item.trim()}</li>
              ))}
            </ol>
          </section>
          )}
          {drug.indicationsAndUsage && (
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-2">Indications & Usage</h3>
              <p className="whitespace-pre-line">{drug.indicationsAndUsage}</p>
            </section>
          )}
          
          {drug.dosageAndAdmin && (
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-2">Dosage & Administration</h3>
              <p className="whitespace-pre-line">{drug.dosageAndAdmin}</p>
            </section>
          )}
          
          {drug.warnings && (
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-2">Warnings</h3>
              <p className="whitespace-pre-line">{drug.warnings}</p>
            </section>
          )}
          
          {drug.adverseReactions && (
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-2">Adverse Reactions</h3>
              <p className="whitespace-pre-line">{drug.adverseReactions}</p>
            </section>
          )}
          {(drug.storageAndHandling || drug.howSupplied) && (
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-2">Storage & Supply</h3>
              {drug.storageAndHandling && (
                <div className="mb-3">
                  <h4 className="font-medium text-gray-700">Storage & Handling</h4>
                  <p className="text-sm whitespace-pre-line">{drug.storageAndHandling}</p>
                </div>
              )}
              {drug.howSupplied && (
                <div>
                  <h4 className="font-medium text-gray-700">How Supplied</h4>
                  <p className="text-sm whitespace-pre-line">{drug.howSupplied}</p>
                </div>
              )}
            </section>
          )}
        </div>
        
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-semibold border-b pb-2 mb-2">Active Ingredients</h3>
            {compounds.length > 0 ? (
              <ul className="space-y-4">
                {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                compounds.map((compound:any) => (
                  <li key={compound.id} className="bg-gray-50 p-3 rounded-md">
                    <h4 className="font-medium">{compound.name}</h4>
                    {compound.molecularFormula && (
                      <div className="text-sm">
                        <span className="font-semibold text-gray-700">Formula:</span> <div className='text-xl'><FormulaDisplay formula={compound.molecularFormula} /></div>
                      </div>
                    )}

                    {compound.molecularWeight && (
                      <p className="text-sm">
                        <span className="font-semibold text-gray-700">MW:</span> {compound.molecularWeight.toFixed(2)} g/mol
                      </p>
                    )}

                    {compound.canonicalSMILES && (
                      <p className="text-sm">
                        <span className="font-semibold text-gray-700">Canonical SMILES:</span>
                        <span className="font-mono break-all overflow-hidden block mt-1">{compound.canonicalSMILES}</span>
                      </p>
                    )}

                    {compound.inchiKey && (
                      <p className="text-sm">
                        <span className="font-semibold text-gray-700">Inchi Key:</span> {compound.inchiKey}
                      </p>
                    )}

                    {compound.iupacName && (
                      <p className="text-sm">
                        <span className="font-semibold text-gray-700">IUPAC Name:</span> {compound.iupacName}
                      </p>
                    )}



                    {/* <Link 
                      href={`/results?query=${encodeURIComponent(compound.name)}&type=name`}
                      className="text-sm text-blue-600 hover:underline mt-1 block"
                    >
                      View compound details
                    </Link> */}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No active ingredients information available.</p>
            )}
          </section>
          
          
          
        </div>
      </div>
    </div>
  );
}