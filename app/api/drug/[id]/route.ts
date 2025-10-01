// app/api/drug/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Extract the 'id' from the URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop(); // Last part of the path

    if (!id) {
      return NextResponse.json({ error: 'Invalid formulation ID' }, { status: 400 });
    }

    // Fetch the drug formulation
    const formulation = await prisma.drugFormulation.findUnique({
      where: { id },
    });

    if (!formulation) {
      return NextResponse.json({ error: 'Formulation not found' }, { status: 404 });
    }

    // Fetch associated compounds
    const formulationIngredients = await prisma.drugIngredient.findMany({
      where: { drugid: id },
      include: { compound: true },
    });

    const compounds = formulationIngredients.map((di) => di.compound);

    return NextResponse.json({ formulation, compounds });
  } catch (error) {
    console.error('Error fetching formulation details:', error);
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    );
  }
}
