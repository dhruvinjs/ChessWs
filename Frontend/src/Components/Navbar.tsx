import  { useState } from "react"
import {Link} from "react-router-dom"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  // const [user,setUser]=useState()
  return (
    <nav className="bg-brown-900 text-[#5D4037] text-cream sticky top-0 z-50 border-b border-brown-700">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-serif text-2xl font-bold">♟ ChessMasters</span>
        </Link>

       <div className="hidden items-center space-x-6 md:flex">
        <Link
        to={"/game"}
        className="inline-block bg-amber-900 p-2 px-5 text-white rounded-md hover:text-gold-500 transition-all"
        >Play </Link>
        <Link
        to={"/register"}
        className="inline-block bg-amber-900 p-2 px-5 text-white rounded-md hover:text-gold-500 transition-all"
        >Register </Link>

       </div>

        <button
          className="md:hidden"
          onClick={() => setIsOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-brown-800 border-t border-brown-700">
          {["Play", "Learn", "Sign Up"].map((label) => (
            <Link
              key={label}
              to={label === "Sign Up" ? "#signup" : `#${label.toLowerCase()}`}
              className="block px-6 py-3 hover:bg-brown-700 transition"
              onClick={() => setIsOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
