// app/drug/[id]/page.js
'use client';

import { useParams } from 'next/navigation';
import DrugDetails from '@/components/DrugDetails';

export default function DrugPage() {
  const params = useParams();
  const drugId = params.id;
  
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <DrugDetails drugId={drugId} />
      </div>
      
      <footer className="bg-gray-800 text-white p-4 mt-12">
        <div className="container mx-auto text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Aganitha</p>
        </div>
      </footer>
    </main>
  );
}