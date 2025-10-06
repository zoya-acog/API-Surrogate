// app/api/search/route.ts
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
  pubChemCID_bigint?: bigint | null;
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
  if (/[$$$$=#[\]\/\-+]/.test(query)) return 'smiles';
  if (query.startsWith('InChI=')) return 'inchi';
  if (/^([A-Z][a-z]?\d*)+$/.test(query)) return 'formula';
  return 'name';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const isAdvancedSearch = searchParams.get('advanced') === 'true';

    const mw_min = parseFloat(searchParams.get('mw_min') || '0');
    const mw_max = parseFloat(searchParams.get('mw_max') || '2000');
    const logd_min = parseFloat(searchParams.get('logd_min') || '-10');
    const logd_max = parseFloat(searchParams.get('logd_max') || '10');

    const type = query ? detectInputType(query) : 'advanced';

    if (!query && !isAdvancedSearch) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Advanced search filters
    const whereClause: Prisma.CompoundAPIPubchemWhereInput = {};
    if (isAdvancedSearch) {
      whereClause.molecularweight = { gte: mw_min, lte: mw_max };
      whereClause.xlogp = { gte: logd_min, lte: logd_max };
    }

    // Container for results
    let compounds: CompoundAPIPubchemPayloadFlexible[] = [];

    switch (type) {
      case 'name':
        compounds = await prisma.compoundAPIIdentity.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { iupacname: { contains: query, mode: 'insensitive' } },
            ],
          },
          include: { pubchem: true },
          take: 50,
        }).then(results =>
          results.map(r => ({
            id: r.id,
            name: r.name ?? r.iupacname,
            iupacName: r.iupacname,
            pubChemCID_bigint: r.pubchemcid,
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
        const batchSize = 1000;
        let offset = 0;
        const allCompounds: { id: number; smiles: string }[] = [];

        while (true) {
          const batch = await prisma.compoundAPIPubchem.findMany({
            where: { canonicalsmiles: { not: null } },
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
                pubChemCID_bigint: r.pubchemcid,
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
        compounds = await prisma.compoundAPIIdentity.findMany({
          where: {
            pubchem: {
              molecularformula: { contains: query },
            },
          },
          include: { pubchem: true },
          take: 50,
        }).then(results =>
          results.map(r => ({
            id: r.id,
            name: r.name ?? r.iupacname,
            iupacName: r.iupacname,
            pubChemCID_bigint: r.pubchemcid,
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

        compounds = await prisma.compoundAPIIdentity.findMany({
          where: {
            pubchem: {
              molecularweight: { gte: weight - 0.5, lte: weight + 0.5 },
            },
          },
          include: { pubchem: true },
          take: 50,
        }).then(results =>
          results.map(r => ({
            id: r.id,
            name: r.name ?? r.iupacname,
            iupacName: r.iupacname,
            pubChemCID_bigint: r.pubchemcid,
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
        if (isAdvancedSearch) {
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
              pubChemCID_bigint: r.pubchemcid,
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
        } else {
          return NextResponse.json({ error: 'Invalid search parameters' }, { status: 400 });
        }
        break;

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
        console.log(`[API LOG] Checking melting point for pubchemcid: ${compound.pubChemCID_bigint}`);
        if (compound.pubChemCID_bigint) {
            try {
                const mp = await prisma.meltingPoint.findUnique({
                    where: { pubchemcid: compound.pubChemCID_bigint },
                });
                console.log(`[API LOG] Melting point query result:`, mp);
                if (mp) {
                    meltingPointData = { min: mp.minmp, max: mp.maxmp };
                }
            } catch (e) {
                console.error(`[API ERROR] Could not fetch melting point for pubchemcid: ${compound.pubChemCID_bigint}`, e);
            }
        }
        console.log(`[API LOG] Final meltingPointData:`, meltingPointData);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { pubChemCID_bigint, ...compoundForFrontend } = compound;

        return {
          ...compoundForFrontend,
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
