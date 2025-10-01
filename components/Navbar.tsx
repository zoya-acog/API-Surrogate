
import Image from "next/image"

const Navbar = () => {
  return (
    <nav className="bg-secondary shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Image src="/aganitha-logo.png" alt="Logo" width={150} height={150} />
            {/* <span className="ml-2 text-xl font-bold text-primary">API Surrogate Search</span> */}
          </div>
          {/* <div className="flex items-center">
            <Link href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            <Link
              href="/sample"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Visuals
            </Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              About
            </Link>
          </div> */}
        </div>
      </div>
    </nav>
  )
}

export default Navbar