import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  return (
    <nav className="bg-secondary shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Image src="/aganitha-logo.png" alt="Logo" width={150} height={150} />
          </div>
          <div className="flex items-center">
  <DropdownMenu>
    <DropdownMenuTrigger className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded text-sm font-medium flex items-center gap-2 outline-none shadow-sm">
      <span>About</span>
      <ChevronDown className="h-4 w-4 fill-current" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-64 mr-4">
      <DropdownMenuItem className="hover:bg-transparent cursor-default focus:bg-transparent p-0">
        <Link href="/About_API_surrogate_search_app.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-gray-900 font-bold hover:text-blue-400 hover:bg-gray-100 px-2 py-1.5 rounded transition-colors block">
          1. Introduction
        </Link>
      </DropdownMenuItem>
      
      <DropdownMenuItem className="hover:bg-transparent cursor-default focus:bg-transparent p-0">
        <Link href="/Quick_launch_user_manual.mp4" target="_blank" rel="noopener noreferrer" className="w-full text-gray-900 font-bold hover:text-blue-400 hover:bg-gray-100 px-2 py-1.5 rounded transition-colors block">
          2. Quick Launch User Manual
        </Link>
      </DropdownMenuItem>
      
      <DropdownMenuItem className="hover:bg-transparent cursor-default focus:bg-transparent p-0">
        <span className="w-full text-gray-900 font-bold hover:text-blue-400 hover:bg-gray-100 px-2 py-1.5 rounded transition-colors block cursor-default">
          3. Data Curation
        </span>
      </DropdownMenuItem>
      
      <DropdownMenuItem className="hover:bg-transparent cursor-default focus:bg-transparent p-0">
        <Link href="/Formulation_and_API.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-gray-900 font-bold hover:text-blue-400 hover:bg-gray-100 px-2 py-1.5 rounded transition-colors block pl-6">
          3.1. Formulations details
        </Link>
      </DropdownMenuItem>
      
      <DropdownMenuItem className="hover:bg-transparent cursor-default focus:bg-transparent p-0">
        <Link href="/Calculated_properties.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-gray-900 font-bold hover:text-blue-400 hover:bg-gray-100 px-2 py-1.5 rounded transition-colors block pl-6">
          3.2. Calculated properties
        </Link>
      </DropdownMenuItem>
      
      <DropdownMenuItem className="hover:bg-transparent cursor-default focus:bg-transparent p-0">
        <span className="w-full text-gray-900 font-bold hover:text-blue-400 hover:bg-gray-100 px-2 py-1.5 rounded transition-colors block pl-6 cursor-default">
          3.3 Experimental Properties
        </span>
      </DropdownMenuItem>
      
      <DropdownMenuItem className="hover:bg-transparent cursor-default focus:bg-transparent p-0">
        <Link href="/Melting_Point.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-gray-900 font-bold hover:text-blue-400 hover:bg-gray-100 px-2 py-1.5 rounded transition-colors block pl-12">
          3.3.1. Melting Point
        </Link>
      </DropdownMenuItem>
      
      <DropdownMenuItem className="hover:bg-transparent cursor-default focus:bg-transparent p-0">
        <Link href="/pdfs" target="_blank" rel="noopener noreferrer" className="w-full text-gray-900 font-bold hover:text-blue-400 hover:bg-gray-100 px-2 py-1.5 rounded transition-colors block pl-12">
          3.3.2. Enthalpy of fusion
        </Link>
      </DropdownMenuItem>
      
      <DropdownMenuItem className="hover:bg-transparent cursor-default focus:bg-transparent p-0">
        <Link href="/pdfs/pka.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-gray-900 font-bold hover:text-blue-400 hover:bg-gray-100 px-2 py-1.5 rounded transition-colors block pl-12">
          3.3.3. pKa
        </Link>
      </DropdownMenuItem>
      
      <DropdownMenuItem className="hover:bg-transparent cursor-default focus:bg-transparent p-0">
        <Link href="/pdfs/peff.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-gray-900 font-bold hover:text-blue-400 hover:bg-gray-100 px-2 py-1.5 rounded transition-colors block pl-12">
          3.3.4. Peff
        </Link>
      </DropdownMenuItem>
      
      <DropdownMenuItem className="hover:bg-transparent cursor-default focus:bg-transparent p-0">
        <Link href="/pdfs/solubility.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-gray-900 font-bold hover:text-blue-400 hover:bg-gray-100 px-2 py-1.5 rounded transition-colors block pl-12">
          3.3.5. Solubility
        </Link>
      </DropdownMenuItem>
      
      <DropdownMenuItem className="hover:bg-transparent cursor-default focus:bg-transparent p-0">
        <Link href="/pdfs/logd.pdf" target="_blank" rel="noopener noreferrer" className="w-full text-gray-900 font-bold hover:text-blue-400 hover:bg-gray-100 px-2 py-1.5 rounded transition-colors block pl-12">
          3.3.6. LogD
        </Link>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;