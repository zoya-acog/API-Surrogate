

// import { NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';
// import { performSimilaritySearch } from '@/lib/similarity-search';
// import type { Prisma } from '@prisma/client';

// // Flexible type for compounds
// type CompoundAPIPubchemPayloadFlexible = {
//   id: number;
//   canonicalSMILES?: string | null;
//   name?: string | null;
//   iupacName?: string | null;
//   cas?: string | null;
//   pubChemCID_bigint?: bigint | null;
//   pubChemCID?: string;
//   molecularFormula?: string | null;
//   molecularWeight?: number | null;
//   isomericSMILES?: string | null;
//   inchi?: string | null;
//   inchiKey?: string | null;
//   xLogP?: number | null;
//   tpsa?: number | null;
//   similarityScore?: number;
// };

// const similarityCache = new Map<string, { results: Array<{ id: number; similarity: number }>; timestamp: number }>();

// // Cache for similarity search results (in production, use Redis or similar)
// let similarityResults: Array<{ id: number; similarity: number }>;
// const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// // Detect type of search input
// function detectInputType(query: string): 'name' | 'smiles' | 'inchi' | 'formula' | 'weight' {
//   if (/[$$$$=#[\]\\/\-+]/.test(query)) return 'smiles';
//   if (query.startsWith('InChI=')) return 'inchi';
//   if (/^([A-Z][a-z]?\d*)+$/.test(query)) return 'formula';
//   return 'name';
// }

// export async function GET(request: Request) {
//   try {
//     console.log(`[API DEBUG] Request URL: ${request.url}`);
//     const { searchParams } = new URL(request.url);
//     const query = searchParams.get('query') || '';
//     const isAdvancedSearch = searchParams.get('advanced') === 'true';
    
//     // Pagination parameters
//     const page = parseInt(searchParams.get('page') || '1');
//     const pageSize = parseInt(searchParams.get('pageSize') || '50');
//     const skip = (page - 1) * pageSize;
    
//     console.log(`[API DEBUG] Pagination: page=${page}, pageSize=${pageSize}, skip=${skip}`);
//     console.log(`[API DEBUG] isAdvancedSearch: ${isAdvancedSearch}`);

//     const mp_min = parseFloat(searchParams.get('mp_min') || '-50');
//     const mp_max = parseFloat(searchParams.get('mp_max') || '300');
//     console.log('[API DEBUG] Parsed melting point range:', { mp_min, mp_max });

//     const type = query ? detectInputType(query) : (isAdvancedSearch ? 'advanced' : 'name');

//     // Build where clause with melting point filter
//     const whereClause: Prisma.CompoundAPIIdentityWhereInput = {};
//     let meltingPointCids: bigint[] = [];
//     if (isAdvancedSearch && (mp_min !== -50 || mp_max !== 300)) {
//       console.log(`[API DEBUG] Applying melting point filter: mp_min=${mp_min}, mp_max=${mp_max}`);
//       const meltingPoints = await prisma.meltingPoint.findMany({
//         where: {
//           minmp: { gte: mp_min },
//           maxmp: { lte: mp_max },
//         },
//         select: { pubchemcid: true },
//       });
//       meltingPointCids = meltingPoints.map(mp => mp.pubchemcid);
//       console.log('[API DEBUG] Melting point CIDs:', meltingPointCids);

//       if (meltingPointCids.length === 0) {
//         console.log('[API DEBUG] No matching melting points—returning empty results');
//         return NextResponse.json({ results: [], total: 0 });
//       } else {
//         whereClause.pubchemcid = { in: meltingPointCids };
//       }
//     }
//     console.log('[API DEBUG] Where clause:', JSON.stringify(whereClause, (key, value) =>
//       typeof value === 'bigint' ? value.toString() : value
//     ));

//     let compounds: CompoundAPIPubchemPayloadFlexible[] = [];
//     let totalCount = 0;

//     switch (type) {
//       case 'name':
//         whereClause.OR = [
//           { name: { contains: query, mode: 'insensitive' } },
//           { iupacname: { contains: query, mode: 'insensitive' } },
//         ];
        
//         totalCount = await prisma.compoundAPIIdentity.count({ where: whereClause });
//         compounds = await prisma.compoundAPIIdentity.findMany({
//           where: whereClause,
//           skip,
//           take: pageSize,
//         }).then(results =>
//           results.map(r => ({
//             id: r.id,
//             name: r.name ?? r.iupacname,
//             iupacName: r.iupacname,
//             pubChemCID_bigint: r.pubchemcid,
//             pubChemCID: r.pubchemcid?.toString(),
//             canonicalSMILES: null,
//             molecularFormula: null,
//             molecularWeight: null,
//             isomericSMILES: null,
//             inchi: null,
//             inchiKey: null,
//             xLogP: null,
//             tpsa: null,
//             cas: r.cas,
//           }))
//         );
//         break;

//       case 'smiles': {
//         const cacheKey = `${query}-${JSON.stringify(whereClause)}`;
//         const cached = similarityCache.get(cacheKey);
//         if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
//           console.log('[API DEBUG] Using cached similarity results');
//           similarityResults = cached.results;
//         } else {
//           console.log('[API DEBUG] Computing similarity search...');
          
//           // FIX: Build the where clause for CompoundAPIPubchem separately
//           const smilesWhere: Prisma.CompoundAPIPubchemWhereInput = { 
//             canonicalsmiles: { not: null } 
//           };
          
//           // If we have melting point filters, apply them to the Pubchem table
//           if (isAdvancedSearch && meltingPointCids.length > 0) {
//             smilesWhere.pubchemcid = { in: meltingPointCids };
//           }

//           const batchSize = 1000;
//           let offset = 0;
//           const allCompounds: { id: number; smiles: string }[] = [];

//           while (true) {
//             const batch = await prisma.compoundAPIPubchem.findMany({
//               where: smilesWhere,
//               select: { id: true, canonicalsmiles: true },
//               skip: offset,
//               take: batchSize,
//             });
//             if (batch.length === 0) break;
//             allCompounds.push(...batch.map(c => ({ id: c.id, smiles: c.canonicalsmiles! })));
//             offset += batchSize;
//           }

//           similarityResults = await performSimilaritySearch(query, allCompounds, {
//             radius: 2,
//             nBits: 2048,
//           });

//           similarityCache.set(cacheKey, {
//             results: similarityResults,
//             timestamp: Date.now(),
//           });
          
//           console.log(`[API DEBUG] Similarity search complete: ${similarityResults.length} results`);
//         }

//         totalCount = similarityResults.length;
//         const paginatedSimilarityResults = similarityResults.slice(skip, skip + pageSize);

//         compounds = await prisma.compoundAPIPubchem.findMany({
//           where: { id: { in: paginatedSimilarityResults.map(r => r.id) } },
//           include: { identity: true },
//         }).then(results =>
//           results.map(r => {
//             const match = paginatedSimilarityResults.find(s => s.id === r.id);
//             return {
//               id: r.id,
//               name: r.identity?.name ?? r.identity?.iupacname,
//               iupacName: r.identity?.iupacname,
//               cas: r.identity?.cas,
//               pubChemCID_bigint: r.pubchemcid,
//               pubChemCID: r.pubchemcid?.toString(),
//               molecularFormula: r.molecularformula,
//               molecularWeight: r.molecularweight,
//               canonicalSMILES: r.canonicalsmiles,
//               isomericSMILES: r.isomericsmiles,
//               inchi: r.inchi,
//               inchiKey: r.inchikey,
//               xLogP: r.xlogp,
//               tpsa: r.tpsa,
//               similarityScore: match?.similarity ?? 0,
//             };
//           }),
//         );
//         break;
//       }

//       case 'formula':
//         whereClause.pubchem = { molecularformula: { contains: query } };
//         totalCount = await prisma.compoundAPIIdentity.count({ where: whereClause });
//         compounds = await prisma.compoundAPIIdentity.findMany({
//           where: whereClause,
//           skip,
//           take: pageSize,
//         }).then(results =>
//           results.map(r => ({
//             id: r.id,
//             name: r.name ?? r.iupacname,
//             iupacName: r.iupacname,
//             pubChemCID_bigint: r.pubchemcid,
//             pubChemCID: r.pubchemcid?.toString(),
//             canonicalSMILES: null,
//             molecularFormula: null,
//             molecularWeight: null,
//             isomericSMILES: null,
//             inchi: null,
//             inchiKey: null,
//             xLogP: null,
//             tpsa: null,
//             cas: r.cas,
//           })),
//         );
//         break;

//       case 'weight':
//         const weight = parseFloat(query);
//         if (isNaN(weight)) return NextResponse.json({ error: 'Invalid molecular weight' }, { status: 400 });
//         whereClause.pubchem = { molecularweight: { gte: weight - 0.5, lte: weight + 0.5 } };
//         totalCount = await prisma.compoundAPIIdentity.count({ where: whereClause });
//         compounds = await prisma.compoundAPIIdentity.findMany({
//           where: whereClause,
//           skip,
//           take: pageSize,
//         }).then(results =>
//           results.map(r => ({
//             id: r.id,
//             name: r.name ?? r.iupacname,
//             iupacName: r.iupacname,
//             pubChemCID_bigint: r.pubchemcid,
//             pubChemCID: r.pubchemcid?.toString(),
//             canonicalSMILES: null,
//             molecularFormula: null,
//             molecularWeight: null,
//             isomericSMILES: null,
//             inchi: null,
//             inchiKey: null,
//             xLogP: null,
//             tpsa: null,
//             cas: r.cas,
//           })),
//         );
//         break;

//       case 'advanced':
//         totalCount = await prisma.compoundAPIIdentity.count({ where: whereClause });
//         compounds = await prisma.compoundAPIIdentity.findMany({
//           where: whereClause,
//           skip,
//           take: pageSize,
//         }).then(results =>
//           results.map(r => ({
//             id: r.id,
//             name: r.name ?? r.iupacname,
//             iupacName: r.iupacname,
//             pubChemCID_bigint: r.pubchemcid,
//             pubChemCID: r.pubchemcid?.toString(),
//             canonicalSMILES: null,
//             molecularFormula: null,
//             molecularWeight: null,
//             isomericSMILES: null,
//             inchi: null,
//             inchiKey: null,
//             xLogP: null,
//             tpsa: null,
//             cas: r.cas,
//           })),
//         );
//         break;

//       case 'inchi':
//         return NextResponse.json({ error: 'InChI search not implemented' }, { status: 400 });

//       default:
//         return NextResponse.json({ error: 'Invalid search type' }, { status: 400 });
//     }

//     const results = await Promise.all(
//       compounds.map(async (compound) => {
//         const drugIngredients = await prisma.drugIngredient.findMany({
//           where: { compoundid: compound.id },
//           include: {
//             drug: {
//               select: {
//                 id: true,
//                 brandname: true,
//                 genericname: true,
//                 manufacturername: true,
//                 dosageform: true,
//                 dosageandadmin: true,
//                 indicationsandusage: true,
//                 warnings: true,
//                 precautions: true,
//                 contraindications: true,
//                 inactiveingredients: true,
//                 allactiveingredients: true,
//               },
//             },
//           },
//         });

//         const drugs = drugIngredients.map(di => ({
//           id: di.drug.id,
//           brandName: di.drug.brandname,
//           genericName: di.drug.genericname,
//           manufacturerName: di.drug.manufacturername,
//           dosageForm: di.drug.dosageform,
//           dosageAndAdmin: di.drug.dosageandadmin,
//           indicationsAndUsage: di.drug.indicationsandusage,
//           warnings: di.drug.warnings,
//           precautions: di.drug.precautions,
//           contraindications: di.drug.contraindications,
//           inactiveIngredients: di.drug.inactiveingredients,
//           allActiveIngredients: di.drug.allactiveingredients,
//         }));

//         let meltingPointData = null;
//         if (compound.pubChemCID_bigint) {
//           try {
//             const mp = await prisma.meltingPoint.findUnique({
//               where: { pubchemcid: compound.pubChemCID_bigint },
//             });
//             if (mp) {
//               meltingPointData = { min: mp.minmp, max: mp.maxmp };
//             }
//           } catch (e) {
//             console.error(`[API ERROR] Could not fetch melting point for pubchemcid: ${compound.pubChemCID_bigint}`, e);
//           }
//         }

//         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//         const { pubChemCID_bigint, ...compoundForFrontend } = compound;

//         return {
//           ...compoundForFrontend,
//           drugs,
//           meltingPoint: meltingPointData,
//         };
//       }),
//     );

//     return NextResponse.json({ 
//       results, 
//       total: totalCount,
//     });
//   } catch (error) {
//     console.error('Search error:', error);
//     return NextResponse.json(
//       { error: 'Error processing search: ' + (error instanceof Error ? error.message : error) },
//       { status: 500 },
//     );
//   }
// }

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { performSimilaritySearch } from '@/lib/similarity-search';
import type { Prisma } from '@prisma/client';

// Flexible type for compounds
type CompoundAPIPubchemPayloadFlexible = {
  id: number;
  canonicalSMILES?: string | null;
  name?: string | null;
  iupacName?: string | null;
  cas?: string | null;
  pubChemCID?: string;
  molecularFormula?: string | null;
  molecularWeight?: number | null;
  isomericSMILES?: string | null;
  inchi?: string | null;
  inchiKey?: string | null;
  xLogP?: number | null;
  tpsa?: number | null;
  similarityScore?: number;
};

// Detect type of search input
function detectInputType(query: string): 'name' | 'smiles' | 'inchi' | 'formula' | 'weight' {
  if (/[$$$$=#[\]\\/\-+]/.test(query)) return 'smiles';
  if (query.startsWith('InChI=')) return 'inchi';
  if (/^([A-Z][a-z]?\d*)+$/.test(query)) return 'formula';
  return 'name';
}

export async function GET(request: Request) {
  try {
    console.log(`[API DEBUG] Request URL: ${request.url}`);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const isAdvancedSearch = searchParams.get('advanced') === 'true';
    console.log(`[API DEBUG] isAdvancedSearch: ${isAdvancedSearch}`);

    const mp_min = parseFloat(searchParams.get('mp_min') || '-50');
    const mp_max = parseFloat(searchParams.get('mp_max') || '300');
    console.log('[API DEBUG] Parsed melting point range:', { mp_min, mp_max });

    // Validate mp_min <= mp_max
    if (mp_min > mp_max) {
      return NextResponse.json({ error: 'Invalid melting point range: min > max' }, { status: 400 });
    }

    // Determine search type based on query, default to 'advanced' if no query and advanced search is enabled
    const type = query ? detectInputType(query) : (isAdvancedSearch ? 'advanced' : 'name');

    // Build where clause with melting point filter if advanced search is enabled
    const whereClause: Prisma.CompoundAPIPubchemWhereInput = {};
    let meltingPointCids: bigint[] = [];
    if (isAdvancedSearch) {
      console.log(`[API DEBUG] Applying melting point filter: mp_min=${mp_min}, mp_max=${mp_max}`);
      const meltingPoints = await prisma.meltingPoint.findMany({
        where: {
          minmp: { gte: mp_min },
          maxmp: { lte: mp_max },
        },
        select: { pubchemcid: true },
      });
      meltingPointCids = meltingPoints.map(mp => mp.pubchemcid);
      console.log('[API DEBUG] Melting point CIDs:', meltingPointCids);

      if (meltingPointCids.length === 0) {
        console.log('[API DEBUG] No matching melting points—returning empty results');
        whereClause.pubchemcid = { in: [] };
      } else {
        whereClause.pubchemcid = { in: meltingPointCids };
      }
    }
    console.log('[API DEBUG] Where clause:', JSON.stringify(whereClause, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    // Container for results
    let compounds: CompoundAPIPubchemPayloadFlexible[] = [];

    // Base where clause for query-based searches
    let baseWhere: Prisma.CompoundAPIIdentityWhereInput | Prisma.CompoundAPIPubchemWhereInput = {};

    switch (type) {
      case 'name':
        baseWhere = {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { iupacname: { contains: query, mode: 'insensitive' } },
          ],
        };
        compounds = await prisma.compoundAPIIdentity.findMany({
          where: {
            ...baseWhere,
            ...(isAdvancedSearch ? { pubchem: whereClause } : {}),
          },
          include: { pubchem: true },
          take: 50,
        }).then(results =>
          results.map(r => ({
            id: r.id,
            name: r.name ?? r.iupacname,
            iupacName: r.iupacname,
            pubChemCID: r.pubchemcid?.toString(),
            canonicalSMILES: r.pubchem?.canonicalsmiles,
            molecularFormula: r.pubchem?.molecularformula,
            molecularWeight: r.pubchem?.molecularweight,
            isomericSMILES: r.pubchem?.isomericsmiles,
            inchi: r.pubchem?.inchi,
            inchiKey: r.pubchem?.inchikey,
            xLogP: r.pubchem?.xlogp,
            tpsa: r.pubchem?.tpsa,
            cas: r.cas,
          }))
        );
        break;

      case 'smiles': {
        let smilesWhere: Prisma.CompoundAPIPubchemWhereInput = { canonicalsmiles: { not: null } };
        if (isAdvancedSearch) {
          smilesWhere = { ...smilesWhere, ...whereClause };
        }

        const batchSize = 1000;
        let offset = 0;
        const allCompounds: { id: number; smiles: string }[] = [];

        while (true) {
          const batch = await prisma.compoundAPIPubchem.findMany({
            where: smilesWhere,
            select: { id: true, canonicalsmiles: true },
            skip: offset,
            take: batchSize,
          });
          if (batch.length === 0) break;
          allCompounds.push(...batch.map(c => ({ id: c.id, smiles: c.canonicalsmiles! })));
          offset += batchSize;
        }

        const similarityResults = await performSimilaritySearch(query, allCompounds, {
          radius: 2,
          nBits: 2048,
        });

        const compoundsFromDb = await prisma.compoundAPIPubchem.findMany({
          where: { id: { in: similarityResults.map(r => r.id) } },
          include: { identity: true },
        });

        compounds = compoundsFromDb.map(r => {
          const match = similarityResults.find(s => s.id === r.id);
          return {
            id: r.id,
            name: r.identity?.name ?? r.identity?.iupacname,
            iupacName: r.identity?.iupacname,
            cas: r.identity?.cas,
            pubChemCID: r.pubchemcid?.toString(),
            molecularFormula: r.molecularformula,
            molecularWeight: r.molecularweight,
            canonicalSMILES: r.canonicalsmiles,
            isomericSMILES: r.isomericsmiles,
            inchi: r.inchi,
            inchiKey: r.inchikey,
            xLogP: r.xlogp,
            tpsa: r.tpsa,
            similarityScore: match?.similarity ?? 0,
          };
        });

        compounds.sort((a, b) => (b.similarityScore ?? 0) - (a.similarityScore ?? 0));
        break;
      }

      case 'formula':
        baseWhere = {
          pubchem: {
            molecularformula: { contains: query },
          },
        };
        compounds = await prisma.compoundAPIIdentity.findMany({
          where: {
            ...baseWhere,
            ...(isAdvancedSearch ? { pubchem: whereClause } : {}),
          },
          include: { pubchem: true },
          take: 50,
        }).then(results =>
          results.map(r => ({
            id: r.id,
            name: r.name ?? r.iupacname,
            iupacName: r.iupacname,
            pubChemCID: r.pubchemcid?.toString(),
            canonicalSMILES: r.pubchem?.canonicalsmiles,
            molecularFormula: r.pubchem?.molecularformula,
            molecularWeight: r.pubchem?.molecularweight,
            isomericSMILES: r.pubchem?.isomericsmiles,
            inchi: r.pubchem?.inchi,
            inchiKey: r.pubchem?.inchikey,
            xLogP: r.pubchem?.xlogp,
            tpsa: r.pubchem?.tpsa,
            cas: r.cas,
          }))
        );
        break;

      case 'weight': {
        const weight = parseFloat(query);
        if (isNaN(weight)) return NextResponse.json({ error: 'Invalid molecular weight' }, { status: 400 });

        baseWhere = {
          pubchem: {
            molecularweight: { gte: weight - 0.5, lte: weight + 0.5 },
          },
        };
        compounds = await prisma.compoundAPIIdentity.findMany({
          where: {
            ...baseWhere,
            ...(isAdvancedSearch ? { pubchem: whereClause } : {}),
          },
          include: { pubchem: true },
          take: 50,
        }).then(results =>
          results.map(r => ({
            id: r.id,
            name: r.name ?? r.iupacname,
            iupacName: r.iupacname,
            pubChemCID: r.pubchemcid?.toString(),
            canonicalSMILES: r.pubchem?.canonicalsmiles,
            molecularFormula: r.pubchem?.molecularformula,
            molecularWeight: r.pubchem?.molecularweight,
            isomericSMILES: r.pubchem?.isomericsmiles,
            inchi: r.pubchem?.inchi,
            inchiKey: r.pubchem?.inchikey,
            xLogP: r.pubchem?.xlogp,
            tpsa: r.pubchem?.tpsa,
            cas: r.cas,
          }))
        );
        break;
      }

      case 'advanced':
        compounds = await prisma.compoundAPIPubchem.findMany({
          where: whereClause,
          include: { identity: true },
          take: 50,
        }).then(results =>
          results.map(r => ({
            id: r.id,
            name: r.identity?.name ?? r.identity?.iupacname,
            iupacName: r.identity?.iupacname,
            cas: r.identity?.cas,
            pubChemCID: r.pubchemcid?.toString(),
            molecularFormula: r.molecularformula,
            molecularWeight: r.molecularweight,
            canonicalSMILES: r.canonicalsmiles,
            isomericSMILES: r.isomericsmiles,
            inchi: r.inchi,
            inchiKey: r.inchikey,
            xLogP: r.xlogp,
            tpsa: r.tpsa,
          }))
        );
        break;

      case 'inchi':
        return NextResponse.json({ error: 'InChI search not implemented' }, { status: 400 });

      default:
        return NextResponse.json({ error: 'Invalid search type' }, { status: 400 });
    }

    // Fetch associated drugs and melting points for each compound
    const results = await Promise.all(
      compounds.map(async (compound) => {
        const drugIngredients = await prisma.drugIngredient.findMany({
          where: { compoundid: compound.id },
          include: {
            drug: {
              select: {
                id: true,
                brandname: true,
                genericname: true,
                manufacturername: true,
                dosageform: true,
                dosageandadmin: true,
                indicationsandusage: true,
                warnings: true,
                precautions: true,
                contraindications: true,
                inactiveingredients: true,
                allactiveingredients: true,
              },
            },
          },
        });

        const drugs = drugIngredients.map(di => ({
          id: di.drug.id,
          brandName: di.drug.brandname,
          genericName: di.drug.genericname,
          manufacturerName: di.drug.manufacturername,
          dosageForm: di.drug.dosageform,
          dosageAndAdmin: di.drug.dosageandadmin,
          indicationsAndUsage: di.drug.indicationsandusage,
          warnings: di.drug.warnings,
          precautions: di.drug.precautions,
          contraindications: di.drug.contraindications,
          inactiveIngredients: di.drug.inactiveingredients,
          allActiveIngredients: di.drug.allactiveingredients,
        }));

        let meltingPointData = null;
        if (compound.pubChemCID) {
          try {
            const mp = await prisma.meltingPoint.findUnique({
              where: { pubchemcid: BigInt(compound.pubChemCID) },
            });
            console.log(`[API LOG] Melting point query result:`, mp);
            if (mp) {
              meltingPointData = { min: mp.minmp, max: mp.maxmp };
            }
          } catch (e) {
            console.error(`[API ERROR] Could not fetch melting point for pubchemcid: ${compound.pubChemCID}`, e);
          }
        }
        console.log(`[API LOG] Final meltingPointData:`, meltingPointData);

        return {
          ...compound,
          drugs,
          meltingPoint: meltingPointData,
        };
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Error processing search: ' + (error instanceof Error ? error.message : error) },
      { status: 500 }
    );
  }
}