// app/search/draw/page.js
"use client"
import DrawingTool from '@/components/DrawingTool';


export default function DrawSearchPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      
      <div className="container mx-auto py-8 px-4">
        <DrawingTool />
      </div>
    </main>
  );
}