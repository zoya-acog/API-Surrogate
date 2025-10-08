// app/api/drug/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest, 
  props: RouteParams
) {
  try {
    const params = await props.params;
    const { id } = params;
    console.log(`[API] Received drug ID: ${id}`);

    const drug = await prisma.drugFormulation.findUnique({
      where: { id: id },
      include: {
        ingredients: {
          include: {
            compound: {
              include: {
                pubchem: true,
              },
            },
          },
        },
      },
    });

    if (!drug) {
      console.log(`[API] Drug with ID ${id} not found.`);
      return NextResponse.json({ error: 'Drug not found' }, { status: 404 });
    }

    console.log(`[API] Found drug:`, drug.brandname);

    const compounds = drug.ingredients.map(ingredient => ({
      id: ingredient.compound.id,
      name: ingredient.compound.name,
      canonicalSMILES: ingredient.compound.pubchem?.canonicalsmiles,
      molecularFormula: ingredient.compound.pubchem?.molecularformula,
      molecularWeight: ingredient.compound.pubchem?.molecularweight,
      inchiKey: ingredient.compound.pubchem?.inchikey,
      iupacName: ingredient.compound.iupacname,
    }));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ingredients, ...rest } = drug;

    const formattedDrug = {
      id: rest.id,
      brandName: rest.brandname,
      genericName: rest.genericname,
      manufacturerName: rest.manufacturername,
      allActiveIngredients: rest.allactiveingredients,
      inactiveIngredients: rest.inactiveingredients,
      dosageForm: rest.dosageform,
      dosageAndAdmin: rest.dosageandadmin,
      indicationsAndUsage: rest.indicationsandusage,
      contraindications: rest.contraindications,
      warnings: rest.warnings,
      precautions: rest.precautions,
      adverseReactions: rest.adversereactions,
      drugInteractions: rest.druginteractions,
      howSupplied: rest.howsupplied,
      storageAndHandling: rest.storageandhandling,
      routeOfAdministration: rest.routeofadministration,
      // Add other fields as needed, ensuring camelCase
    };

    console.log(`[API] Formatted drug details:`, formattedDrug);
    console.log(`[API] Returning drug details for: ${formattedDrug.brandName}`);
    return NextResponse.json({ drug: formattedDrug, compounds });
  } catch (error) {
    console.error('Drug API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}