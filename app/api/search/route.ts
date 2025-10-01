// app/api/search/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { performSimilaritySearch } from '@/lib/similarity-search';
import type { Prisma } from '@prisma/client';

// Flexible type for compounds
type CompoundAPIPubchemPayloadFlexible = {
  id: number;
  canonicalsmiles?: string;
  name?: string;
  pubchemcid?: bigint | string;
  molecularformula?: string;
  molecularweight?: number;
  isomericsmiles?: string;
  inchi?: string;
  inchikey?: string;
  xlogp?: number;
  tpsa?: number;
  cas?: string;
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
            pubchemcid: r.pubchemcid?.toString(),
            canonicalsmiles: r.pubchem?.canonicalsmiles,
            molecularformula: r.pubchem?.molecularformula,
            molecularweight: r.pubchem?.molecularweight,
            isomericsmiles: r.pubchem?.isomericsmiles,
            inchi: r.pubchem?.inchi,
            inchikey: r.pubchem?.inchikey,
            xlogp: r.pubchem?.xlogp,
            tpsa: r.pubchem?.tpsa,
            cas: r.cas,
          }))
        );
        break;

      case 'smiles': {
        // Fetch all compounds in batches for similarity search
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

        compounds = await prisma.compoundAPIPubchem.findMany({
          where: { id: { in: similarityResults.map(r => r.id) } },
          include: { identity: true },
        }).then(results =>
          results.map(r => {
            const match = similarityResults.find(s => s.id === r.id);
            return {
              id: r.id,
              canonicalsmiles: r.canonicalsmiles,
              molecularformula: r.molecularformula,
              molecularweight: r.molecularweight,
              isomericsmiles: r.isomericsmiles,
              inchi: r.inchi,
              inchikey: r.inchikey,
              xlogp: r.xlogp,
              tpsa: r.tpsa,
              pubchemcid: r.pubchemcid?.toString(),
              name: r.identity?.name ?? r.identity?.iupacname,
              cas: r.identity?.cas,
              similarityScore: match?.similarity ?? 0,
            };
          })
        );

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
            pubchemcid: r.pubchemcid?.toString(),
            canonicalsmiles: r.pubchem?.canonicalsmiles,
            molecularformula: r.pubchem?.molecularformula,
            molecularweight: r.pubchem?.molecularweight,
            isomericsmiles: r.pubchem?.isomericsmiles,
            inchi: r.pubchem?.inchi,
            inchikey: r.pubchem?.inchikey,
            xlogp: r.pubchem?.xlogp,
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
            pubchemcid: r.pubchemcid?.toString(),
            canonicalsmiles: r.pubchem?.canonicalsmiles,
            molecularformula: r.pubchem?.molecularformula,
            molecularweight: r.pubchem?.molecularweight,
            isomericsmiles: r.pubchem?.isomericsmiles,
            inchi: r.pubchem?.inchi,
            inchikey: r.pubchem?.inchikey,
            xlogp: r.pubchem?.xlogp,
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
              canonicalsmiles: r.canonicalsmiles,
              molecularformula: r.molecularformula,
              molecularweight: r.molecularweight,
              isomericsmiles: r.isomericsmiles,
              inchi: r.inchi,
              inchikey: r.inchikey,
              xlogp: r.xlogp,
              tpsa: r.tpsa,
              pubchemcid: r.pubchemcid?.toString(),
              name: r.identity?.name ?? r.identity?.iupacname,
              cas: r.identity?.cas,
            }))
          );
        } else {
          return NextResponse.json({ error: 'Invalid search parameters' }, { status: 400 });
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid search type' }, { status: 400 });
    }

    // Fetch associated drugs for each compound
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

        const drugs = drugIngredients.map((di) => di.drug);

        return {
          ...compound,
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
