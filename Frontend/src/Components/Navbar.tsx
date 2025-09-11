import { useState, useEffect } from "react";
import { Menu, X, Crown, Moon, Sun } from "lucide-react";
import { Button } from "../Components/Button";
import { useThemeStore } from "../stores/useThemeStore";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode, initTheme, toggleDarkMode } = useThemeStore();

  useEffect(() => {
    initTheme(); // check localStorage + system preference
  }, [initTheme]);

  return (
    <header className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-amber-100 dark:border-amber-800 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Crown className="h-8 w-8 text-amber-700 dark:text-amber-400" />
            <span className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              ChessMaster
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>

          {/* Desktop CTA + Dark Mode Toggle */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              text=""
              icon={isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            />
            <Button variant="outline" size="sm" onClick={() => {}} text="Sign In" />
            <Button variant="primary" size="sm" onClick={() => {}} text="Start Playing" />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              text=""
              icon={isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              text=""
              icon={isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            />
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-amber-100 dark:border-amber-800 py-4 transition-colors duration-300">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="nav-link px-4">Features</a>
              <a href="#pricing" className="nav-link px-4">Pricing</a>
              <a href="#about" className="nav-link px-4">About</a>
              <a href="#contact" className="nav-link px-4">Contact</a>
              <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-amber-100 dark:border-amber-800">
                <Button variant="outline" size="sm" onClick={() => {}} text="Sign In" />
                <Button variant="primary" size="sm" onClick={() => {}} text="Start Playing" />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
