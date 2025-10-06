// app/api/draw-search/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { performSimilaritySearch } from '@/lib/similarity-search';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { smiles } = body;

    if (!smiles) {
      return NextResponse.json({ error: 'SMILES string is required' }, { status: 400 });
    }

    // 1. Fetch all compounds for similarity search
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

    // 2. Perform similarity search
    const similarityResults = await performSimilaritySearch(smiles, allCompounds, {
      radius: 2,
      nBits: 2048,
    });

    // 3. Fetch full compound data for the results
    const compoundsFromDb = await prisma.compoundAPIPubchem.findMany({
      where: { id: { in: similarityResults.map(r => r.id) } },
      include: { identity: true },
    });

    const compounds = compoundsFromDb.map(r => {
        const match = similarityResults.find(s => s.id === r.id);
        return {
          id: r.id,
          name: r.identity?.name ?? r.identity?.iupacname,
          iupacName: r.identity?.iupacname,
          cas: r.identity?.cas,
          pubChemCID_bigint: r.pubchemcid, // Keep as BigInt for internal use
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
      })
    compounds.sort((a, b) => (b.similarityScore ?? 0) - (a.similarityScore ?? 0));


    // 4. Fetch associated drugs and melting points
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
    console.error('Draw search error:', error);
    return NextResponse.json(
      { error: 'Error processing draw search: ' + (error instanceof Error ? error.message : error) },
      { status: 500 }
    );
  }
}