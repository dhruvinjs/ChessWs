import { useState, useEffect } from "react";
import { Menu, X, Crown, Moon, Sun, LogOut, User, ArrowLeft } from "lucide-react";
import { Button } from "../Components/Button";
import { useThemeStore } from "../stores/useThemeStore";
import { useNavigate, useLocation } from "react-router-dom";
import { useLogoutMutation } from "../hooks/useAuth";
import { useUserQuery } from "../hooks/useUserQuery";
import { ConfirmDialog } from "../Components/ConfirmDialog";
import { useComputerGame } from "../hooks/useComputerGame";
import { computerSocketManager } from "../lib/computerGame/ComputerSocketManager";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBackDialog, setShowBackDialog] = useState(false);
  const { isDarkMode, initTheme, toggleDarkMode } = useThemeStore();
  const { data: user, isLoading } = useUserQuery();
  const { gameData, gameStatus } = useComputerGame();
  const nav = useNavigate();
  const location = useLocation();
  const { mutate: logout, isPending } = useLogoutMutation();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const showLandingLinks = location.pathname === "/";
  
  // Check if user is authenticated (not a guest)
  const isAuthenticated = user && !user.isGuest;
  
  // Show back button on non-home protected routes
  const showBackButton = isAuthenticated && 
                        location.pathname !== "/" && 
                        location.pathname !== "/home" &&
                        location.pathname !== "/login" &&
                        location.pathname !== "/register";

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

  const handleBackClick = () => {
    // Check if on computer game page with active game
    if (location.pathname === "/computer" && gameData && gameStatus === "active") {
      setShowBackDialog(true);
    } else {
      nav("/home");
    }
  };

  const handleBackConfirm = () => {
    if (gameData && location.pathname === "/computer") {
      computerSocketManager.quitGame(gameData.computerGameId);
    }
    setShowBackDialog(false);
    nav("/home");
  };

  return (
    <header className="fixed top-0 w-full bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 backdrop-blur-sm border-b-2 border-amber-300 dark:border-amber-600 z-50 transition-all duration-300 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navbar */}
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Logo and Back Button */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={handleBackClick}
                className="flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg
                         bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600
                         text-white font-medium text-sm
                         transform hover:scale-105 transition-all duration-200
                         shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden lg:inline">Back</span>
              </button>
            )}
            
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => nav("/")}
            >
              <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600 dark:text-amber-400 drop-shadow-lg" />
              <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700 dark:from-amber-400 dark:via-orange-400 dark:to-amber-400 bg-clip-text text-transparent whitespace-nowrap">
                ChessMasters
              </span>
            </div>
          </div>

          {/* Center Section: Navigation Links */}
          {showLandingLinks && (
            <nav className="hidden md:flex items-center space-x-8 lg:space-x-12 absolute left-1/2 transform -translate-x-1/2">
              <a 
                href="#features" 
                className="font-medium text-amber-700 dark:text-amber-400 hover:text-orange-600 dark:hover:text-orange-400 
                         transition-all duration-200 text-base lg:text-lg cursor-pointer
                         relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 
                         after:bg-gradient-to-r after:from-orange-500 after:to-amber-500 
                         after:transition-all after:duration-300 hover:after:w-full"
              >
                Features
              </a>
              <a 
                onClick={scrollToFooter} 
                className="font-medium text-amber-700 dark:text-amber-400 hover:text-orange-600 dark:hover:text-orange-400 
                         transition-all duration-200 text-base lg:text-lg cursor-pointer
                         relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 
                         after:bg-gradient-to-r after:from-orange-500 after:to-amber-500 
                         after:transition-all after:duration-300 hover:after:w-full"
              >
                Contact
              </a>
            </nav>
          )}

          {/* Right Section: Action Buttons */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* Desktop Controls */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
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

              {/* Authentication Buttons */}
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

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <Button
                variant="outline"
                size="sm"
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
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 border-t border-amber-200 dark:border-amber-700 py-6 transition-all duration-300 shadow-lg">
            <div className="flex flex-col space-y-4 px-4">
              {/* Mobile Theme Toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-amber-200 dark:border-amber-700">
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Theme</span>
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
              </div>
              
              {/* Mobile Navigation Links */}
              {showLandingLinks && (
                <>
                  <div className="space-y-2">
                    <a 
                      href="#features" 
                      className="block py-2.5 px-4 rounded-lg font-medium text-amber-700 dark:text-amber-400 
                               hover:text-orange-600 dark:hover:text-orange-400 hover:bg-amber-100 dark:hover:bg-gray-700
                               transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Features
                    </a>
                    <a 
                      onClick={() => {
                        scrollToFooter();
                        setIsMenuOpen(false);
                      }} 
                      className="block py-2.5 px-4 rounded-lg cursor-pointer font-medium text-amber-700 dark:text-amber-400 
                               hover:text-orange-600 dark:hover:text-orange-400 hover:bg-amber-100 dark:hover:bg-gray-700
                               transition-all duration-200"
                    >
                      Contact
                    </a>
                  </div>
                  <hr className="border-amber-200 dark:border-amber-700" />
                </>
              )}

              {/* Mobile Back Button */}
              {showBackButton && (
                <>
                  <button
                    onClick={() => {
                      nav("/home");
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-center space-x-2 px-4 py-3 rounded-lg w-full
                             bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600
                             text-white font-semibold
                             transform hover:scale-105 transition-all duration-200
                             shadow-md hover:shadow-lg"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="font-medium">Back to Home</span>
                  </button>
                  <hr className="border-amber-200 dark:border-amber-700" />
                </>
              )}

              {/* Mobile Auth Buttons */}
              <div className="space-y-3">
                {!isLoading && isAuthenticated ? (
                  <>
                    <Button
                      variant="outline"
                      size="md"
                      text={user.name || "Profile"}
                      icon={<User className="h-5 w-5" />}
                      onClick={() => {
                        nav("/profile");
                        setIsMenuOpen(false);
                      }}
                    />
                    <Button
                      variant="primary"
                      size="md"
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
                      size="md"
                      text="Sign In"
                      onClick={() => {
                        nav("/login");
                        setIsMenuOpen(false);
                      }}
                    />
                    <Button
                      variant="primary"
                      size="md"
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
          </div>
        )}
      </div>

      {/* Confirm Dialog for Back Button */}
      <ConfirmDialog
        isOpen={showBackDialog}
        onClose={() => setShowBackDialog(false)}
        onConfirm={handleBackConfirm}
        title="Leave Game"
        message="You have an active game. Leaving will quit the game and count as a loss. Do you want to continue?"
        confirmText="Leave & Quit"
        cancelText="Stay"
      />
    </header>
  );
}