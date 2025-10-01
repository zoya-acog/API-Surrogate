// app/api/search/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { performSimilaritySearch } from '@/lib/similarity-search';
import type { Prisma } from '@prisma/client';

// Type for compounds with optional similarity score and joined identity info
type CompoundWithIdentity = {
  id: number;
  canonicalsmiles?: string;
  pubchemcid?: bigint | string;
  molecularformula?: string;
  molecularweight?: number;
  isomericsmiles?: string;
  inchi?: string;
  inchikey?: string;
  xlogp?: number;
  tpsa?: number;
  similarityScore?: number;
  identity?: {
    name?: string;
    iupacname?: string;
    cas?: string;
  };
};

function detectInputType(query: string): 'name' | 'smiles' | 'inchi' | 'formula' | 'weight' {
  if (/[$$$$=#[\]\\/\-+]/.test(query)) return 'smiles';
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

    // Build advanced filters for compoundAPIPubchem
    const whereClause: Prisma.CompoundAPIPubchemWhereInput = {};
    if (isAdvancedSearch) {
      whereClause.molecularweight = { gte: mw_min, lte: mw_max };
      whereClause.xlogp = { gte: logd_min, lte: logd_max };
    }

    let compounds: CompoundWithIdentity[] = [];

    switch (type) {
      case 'name':
        // Name search uses compoundAPIIdentity
        compounds = await prisma.compoundAPIIdentity.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { iupacname: { contains: query, mode: 'insensitive' } },
            ],
          },
          include: {
            pubchem: { // relation to compoundAPIPubchem
              where: whereClause,
            },
          },
          take: 50,
        }).then(results =>
          results.map(r => ({
            id: r.pubchem?.id ?? 0,
            canonicalsmiles: r.pubchem?.canonicalsmiles,
            pubchemcid: r.pubchem?.pubchemcid?.toString(),
            molecularformula: r.pubchem?.molecularformula,
            molecularweight: r.pubchem?.molecularweight,
            isomericsmiles: r.pubchem?.isomericsmiles,
            inchi: r.pubchem?.inchi,
            inchikey: r.pubchem?.inchikey,
            xlogp: r.pubchem?.xlogp,
            tpsa: r.pubchem?.tpsa,
            identity: {
              name: r.name,
              iupacname: r.iupacname,
              cas: r.cas,
            },
          }))
        );
        break;

      case 'smiles': {
        // Fetch all compounds for similarity search
        const batchSize = 1000;
        let offset = 0;
        const allCompounds: { id: number; canonicalsmiles: string }[] = [];

        while (true) {
          const batch = await prisma.compoundAPIPubchem.findMany({
            where: { canonicalsmiles: { not: null } },
            select: { id: true, canonicalsmiles: true },
            skip: offset,
            take: batchSize,
          });
          if (batch.length === 0) break;
          allCompounds.push(...batch);
          offset += batchSize;
        }

        const compoundsForSearch = allCompounds.map(c => ({
          id: c.id,
          smiles: c.canonicalsmiles,
        }));

        const similarityResults = await performSimilaritySearch(query, compoundsForSearch, {
          radius: 2,
          nBits: 2048,
        });

        // Fetch compounds with joined identity
        compounds = await prisma.compoundAPIPubchem.findMany({
          where: { id: { in: similarityResults.map(r => r.id) } },
          include: {
            identity: { select: { name: true, iupacname: true, cas: true } },
          },
        }).then(results =>
          results.map(c => {
            const match = similarityResults.find(r => r.id === c.id);
            return {
              ...c,
              similarityScore: match?.similarity ?? 0,
            };
          })
        );

        // Sort by similarity
        compounds.sort((a, b) => (b.similarityScore ?? 0) - (a.similarityScore ?? 0));
        break;
      }

      case 'formula':
        compounds = await prisma.compoundAPIPubchem.findMany({
          where: { molecularformula: { contains: query } },
          include: { identity: { select: { name: true, iupacname: true, cas: true } } },
          take: 50,
        });
        break;

      case 'weight': {
        const weight = parseFloat(query);
        if (isNaN(weight))
          return NextResponse.json({ error: 'Invalid molecular weight' }, { status: 400 });

        compounds = await prisma.compoundAPIPubchem.findMany({
          where: { molecularweight: { gte: weight - 0.5, lte: weight + 0.5 } },
          include: { identity: { select: { name: true, iupacname: true, cas: true } } },
          take: 50,
        });
        break;
      }

      case 'advanced':
        if (isAdvancedSearch) {
          compounds = await prisma.compoundAPIPubchem.findMany({
            where: whereClause,
            include: { identity: { select: { name: true, iupacname: true, cas: true } } },
            take: 50,
          });
        } else {
          return NextResponse.json({ error: 'Invalid search parameters' }, { status: 400 });
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid search type' }, { status: 400 });
    }

    // Fetch associated drugs
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

        const drugs = drugIngredients.map(di => di.drug);

        return {
          id: compound.id,
          name: compound.identity?.name,
          iupacName: compound.identity?.iupacname,
          cas: compound.identity?.cas,
          similarityScore: compound.similarityScore ?? 0,
          pubChemCID: compound.pubchemcid?.toString(),
          molecularFormula: compound.molecularformula,
          molecularWeight: compound.molecularweight,
          canonicalSMILES: compound.canonicalsmiles,
          isomericSMILES: compound.isomericsmiles,
          inchi: compound.inchi,
          inchiKey: compound.inchikey,
          xLogP: compound.xlogp,
          tpsa: compound.tpsa,
          drugs,
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
