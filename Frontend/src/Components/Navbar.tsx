import  { useState } from "react"
import {Link} from "react-router-dom"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-brown-900 text-cream sticky top-0 z-50 border-b border-brown-700">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-serif text-2xl font-bold">♟ ChessMasters</span>
        </Link>

        {/* desktop links */}
        <div className="hidden md:flex items-center space-x-6">
          {["Play", "Tournaments", "Learn", "About"].map((label) => (
            <Link
              key={label}
              to={`#${label.toLowerCase()}`}
              className="hover:text-gold-400 transition"
            >
              {label}
            </Link>
          ))}
          <Link to="#signup">
            <button className="bg-gold-500 text-brown-900 px-4 py-2 rounded-md font-semibold hover:bg-gold-600 transition">
              Sign Up
            </button>
          </Link>
        </div>

        {/* mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-brown-800 border-t border-brown-700">
          {["Play", "Tournaments", "Learn", "About", "Sign Up"].map((label) => (
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
