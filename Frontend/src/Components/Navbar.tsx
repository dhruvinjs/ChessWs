import { useState } from "react";
import { Link } from "react-router-dom";
import { IoMdMenu } from "react-icons/io";
import { ImCross } from "react-icons/im";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navbarItems = [
    { name: "Features", href: "#features" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];
  
  return (
    <>
      <div className="navbar bg-[#EFEBE9] shadow-sm text-4xl">
 
        <div className="navbar-start">
          <Link to="/" className=" font-serif text-2xl">
             ♟️ ChessMasters
          </Link>
        </div>

        <div className="navbar-center hidden lg:flex font-semibold">
          <ul className="menu menu-horizontal px-2">
            {navbarItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className="hover:scale-110 hover:font-bold transition-all duration-200 text-2xl"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="navbar-end flex items-center gap-2">
          <a
            className="btn bg-[#7a574a] text-xl border-none text-white hover:bg-[#5D4037] hidden md:inline-flex"
            href="/register"
          >
            Register
          </a>

          {/* Hamburger / Close */}
          <button
            className="lg:hidden text-2xl p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <ImCross /> : <IoMdMenu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="lg:hidden absolute top-[64px] left-0 w-full bg-[#EFEBE9] shadow-md z-50">
          
          <ul className="menu flex flex-col items-center  space-y-2">
            {navbarItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className="hover:font-bold text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </a>
              </li>
            ))}
            <li>
             <a
                href={"/register"}
                className="font-semibold text-lg"
                onClick={() => setIsOpen(false)}
                >
                  {"Register"}
                </a>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
