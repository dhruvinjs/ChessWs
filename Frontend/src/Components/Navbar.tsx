import { useState, useEffect } from "react";
import { Menu, X, Crown, Moon, Sun, LogOut, User } from "lucide-react";
import { Button } from "../Components/Button";
import { useThemeStore } from "../stores/useThemeStore";
import { useNavigate, useLocation } from "react-router-dom";
import { useLogoutMutation } from "../hooks/useAuth";
import { useUserQuery } from "../hooks/useUserQuery";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode, initTheme, toggleDarkMode } = useThemeStore();
  const { data: user, isLoading } = useUserQuery();
  const nav = useNavigate();
  const location = useLocation();
  const { mutate: logout, isPending } = useLogoutMutation();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const showLandingLinks = location.pathname === "/";
  
  // Check if user is authenticated (not a guest)
  const isAuthenticated = user && !user.isGuest;

  const scrollToFooter = () => {
    const footer = document.getElementById("contact");
    if (footer) {
      footer.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-amber-100 dark:border-amber-800 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navbar */}
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => nav("/")}
          >
            <Crown className="h-7 w-7 text-amber-700 dark:text-amber-400" />
            <span className="text-lg sm:text-2xl font-bold text-amber-900 dark:text-amber-100">
              ChessMaster
            </span>
          </div>

          {/* Desktop Nav Links */}
          {showLandingLinks && (
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="nav-link">
                Features
              </a>
              <a onClick={scrollToFooter} className="nav-link cursor-pointer">
                Contact
              </a>
            </nav>
          )}

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              icon={
                isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )
              }
            />

            {/* Show different buttons based on authentication status */}
            {!isLoading && isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  text={user.name || "Profile"}
                  icon={<User className="h-5 w-5" />}
                  onClick={() => nav("/profile")}
                />
                <Button
                  variant="primary"
                  size="sm"
                  text={isPending ? "Logging out..." : "Logout"}
                  icon={<LogOut className="h-5 w-5" />}
                  loading={isPending}
                  onClick={handleLogout}
                />
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  text="Sign In"
                  onClick={() => nav("/login")}
                />
                <Button
                  variant="primary"
                  size="sm"
                  text="Quick Match"
                  onClick={() => nav("/game")}
                />
              </>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="outline"
              size="md"
              onClick={toggleDarkMode}
              icon={
                isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )
              }
            />
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              icon={
                isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )
              }
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-amber-100 dark:border-amber-800 py-4 transition-all duration-300">
            <div className="flex flex-col space-y-3 px-4">
              {showLandingLinks && (
                <>
                  <a href="#features" className="nav-link">
                    Features
                  </a>
                  <a onClick={scrollToFooter} className="nav-link cursor-pointer">
                    Contact
                  </a>
                  <hr className="border-amber-200 dark:border-amber-700" />
                </>
              )}

              {!isLoading && isAuthenticated ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    text={user.name || "Profile"}
                    icon={<User className="h-5 w-5" />}
                    onClick={() => {
                      nav("/profile");
                      setIsMenuOpen(false);
                    }}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    text={isPending ? "Logging out..." : "Logout"}
                    icon={<LogOut className="h-5 w-5" />}
                    loading={isPending}
                    onClick={handleLogout}
                  />
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    text="Sign In"
                    onClick={() => {
                      nav("/login");
                      setIsMenuOpen(false);
                    }}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    text="Start Playing"
                    onClick={() => {
                      nav("/game");
                      setIsMenuOpen(false);
                    }}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}