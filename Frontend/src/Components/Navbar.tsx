import  { useState, useEffect } from 'react';
import { Menu, X, Crown, Moon, Sun } from 'lucide-react';

export function Navbar  ()  {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-amber-100 dark:border-amber-800 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Crown className="h-8 w-8 text-amber-700 dark:text-amber-400" />
            <span className="text-2xl font-bold text-amber-900 dark:text-amber-100">ChessMaster</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-medium transition-colors">
              Features
            </a>
            <a href="#about" className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-medium transition-colors">
              About
            </a>
            <a href="#contact" className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-medium transition-colors">
              Contact
            </a>
          </nav>

          {/* Desktop CTA Buttons and Dark Mode Toggle */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800/30"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-medium transition-colors">
              Sign In
            </button>
            <button className="bg-gradient-to-r from-amber-700 to-amber-800 dark:from-amber-600 dark:to-amber-700 text-white px-6 py-2 rounded-lg hover:from-amber-800 hover:to-amber-900 dark:hover:from-amber-700 dark:hover:to-amber-800 transition-all transform hover:scale-105 font-medium shadow-lg">
              Start Playing
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800/30"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-amber-100 dark:border-amber-800 py-4 transition-colors duration-300">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-medium transition-colors px-4">
                Features
              </a>
              <a href="#pricing" className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-medium transition-colors px-4">
                Pricing
              </a>
              <a href="#about" className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-medium transition-colors px-4">
                About
              </a>
              <a href="#contact" className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-medium transition-colors px-4">
                Contact
              </a>
              <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-amber-100 dark:border-amber-800">
                <button className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-medium transition-colors text-left">
                  Sign In
                </button>
                <button className="bg-gradient-to-r from-amber-700 to-amber-800 dark:from-amber-600 dark:to-amber-700 text-white px-6 py-2 rounded-lg hover:from-amber-800 hover:to-amber-900 dark:hover:from-amber-700 dark:hover:to-amber-800 transition-all font-medium shadow-lg">
                  Start Playing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

