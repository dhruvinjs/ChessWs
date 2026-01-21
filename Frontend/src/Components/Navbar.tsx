import { useState} from "react";
import { Menu, X, Crown, Moon, Sun, LogOut, User, ArrowLeft } from "lucide-react";
import { Button } from "../Components/Button";
import { useThemeStore } from "../stores/useThemeStore";
import { useNavigate, useLocation } from "react-router-dom";
import { useLogoutMutation } from "../hooks/useAuth";
import { useUserQuery } from "../hooks/useUserQuery";
import { ConfirmDialog } from "../Components/ConfirmDialog";
import { useComputerGameStore } from "../stores/useComputerGameStore";
import { computerSocketManager } from "../lib/ComputerSocketManager";

// 🎯 FIX: Define a prop interface/type for better readability and safety (optional but good practice)
interface NavbarProps {
    variant?: 'about'; // Assuming you only pass 'about' or nothing
}

// 🎯 FIX: The component now accepts the 'variant' prop
export function Navbar({ variant }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBackDialog, setShowBackDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false); 
  
  // initTheme is intentionally removed, as requested
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { data: user, isLoading } = useUserQuery();
  const gameData = useComputerGameStore((state) => state.gameData);
  const gameStatus = useComputerGameStore((state) => state.gameStatus);
  const nav = useNavigate();
  const location = useLocation();
  const { mutate: logout, isPending } = useLogoutMutation();

  // useEffect hook is intentionally removed, as requested

  // Links only show up on the root landing page (/)
  // This ensures no Features/Contact links show on /about
  const showLandingLinks = location.pathname === "/"; 
  const isAuthenticated = user && !user.isGuest;

  // 🎯 FIX: Updated logic to include the 'variant' prop check.
  // The back button is shown if variant="about" OR if on a nested path.
  const showBackButton =
    variant === "about" ||
    (isAuthenticated &&
    location.pathname !== "/" &&
    location.pathname !== "/home" &&
    location.pathname !== "/login" &&
    location.pathname !== "/register" && 
    location.pathname !== "/computer/game"
  
  );

  const scrollToFooter = () => {
    const footer = document.getElementById("contact");
    if (footer) {
      footer.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  const handleLogoutClick = () => {
    if (location.pathname === "/computer" && gameData && gameStatus === "active") {
      setShowLogoutDialog(true);
    } else {
      handleLogoutConfirm();
    }
    setIsMenuOpen(false);
  };

  const handleLogoutConfirm = () => {
    if (gameData && location.pathname === "/computer") {
      computerSocketManager.quitGame(gameData.computerGameId);
    }
    logout();
    setShowLogoutDialog(false);
    setIsMenuOpen(false);
  };

  const handleBackClick = () => {
    if (location.pathname === "/computer" && gameData && gameStatus === "active") {
      setShowBackDialog(true);
    } 
    // 🎯 FIX: If on the "about" page, navigate to the appropriate home route
    else if (variant === "about") {
        nav(isAuthenticated ? "/home" : "/");
    }
    else {
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
    <>
      {/* NAVBAR */}
      <header className="fixed top-0 w-full bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 backdrop-blur-sm border-b-2 border-amber-300 dark:border-amber-600 z-40 transition-all duration-300 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* LEFT SECTION: LOGO + BACK BUTTON */}
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <button
                  onClick={handleBackClick}
                  className="flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg
                             bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600
                             text-white font-medium text-sm transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden lg:inline">Back</span>
                </button>
              )}

              <div
                className="flex items-center space-x-2 cursor-pointer"
              >
                <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600 dark:text-amber-400 drop-shadow-lg" />
                <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700 dark:from-amber-400 dark:via-orange-400 dark:to-amber-400 bg-clip-text text-transparent whitespace-nowrap">
                  ChessVerse
                </span>
              </div>
            </div>

            {/* CENTER LINKS */}
            {/* showLandingLinks is false on /about, so links are hidden here */}
            {showLandingLinks && (
              <nav className="hidden md:flex items-center space-x-8 lg:space-x-12 absolute left-1/2 -translate-x-1/2">
                <a 
                  href="#features"
                  className="font-medium text-amber-700 dark:text-amber-400 hover:text-orange-600 dark:hover:text-orange-400
                             transition-all relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5
                             after:bg-gradient-to-r after:from-orange-500 after:to-amber-500 hover:after:w-full"
                >
                  Features
                </a>
                <a 
                  onClick={scrollToFooter}
                  className="font-medium cursor-pointer text-amber-700 dark:text-amber-400 hover:text-orange-600 dark:hover:text-orange-400
                             transition-all relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5
                             after:bg-gradient-to-r after:from-orange-500 after:to-amber-500 hover:after:w-full"
                >
                  Contact
                </a>
              </nav>
            )}

            {/* RIGHT SECTION */}
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleDarkMode}
                  icon={isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                />

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
                      onClick={handleLogoutClick}
                    />
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" text="Sign In" onClick={() => nav("/login")} />
                    <Button variant="primary" size="sm" text="Quick Match" onClick={() => nav("/game")} />
                  </>
                )}
              </div>

              {/* MOBILE MENU TOGGLE */}
              <div className="md:hidden flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  icon={isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                />
              </div>
            </div>
          </div>

          {/* MOBILE MENU */}
          {isMenuOpen && (
            <div className="md:hidden bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 border-t border-amber-200 dark:border-amber-700 py-6 shadow-lg">
              <div className="flex flex-col space-y-4 px-4">

                {/* Theme Toggle */}
                <div className="flex items-center justify-between pb-3 border-b border-amber-200 dark:border-amber-700">
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Theme</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleDarkMode}
                    icon={isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  />
                </div>

                {/* Landing Links (Hidden on /about) */}
                {showLandingLinks && (
                  <>
                    <a
                      href="#features"
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-2.5 px-4 rounded-lg font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-gray-700"
                    >
                      Features
                    </a>

                    <a
                      onClick={() => {
                        scrollToFooter();
                        setIsMenuOpen(false);
                      }}
                      className="block py-2.5 px-4 rounded-lg font-medium cursor-pointer text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-gray-700"
                    >
                      Contact
                    </a>

                    <hr className="border-amber-200 dark:border-amber-700" />
                  </>
                )}

                {/* Back Button */}
                {showBackButton && (
                  <>
                    <button
                      onClick={() => {
                        handleBackClick();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center justify-center space-x-2 px-4 py-3 rounded-lg w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105 shadow-md"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Home</span>
                    </button>
                    <hr className="border-amber-200 dark:border-amber-700" />
                  </>
                )}

                {/* Auth Buttons */}
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
                        onClick={handleLogoutClick}
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
      </header>

      {/* CONFIRM DIALOGS — moved OUTSIDE navbar, with highest z-index */}
      <div className="relative z-[9999]">
        <ConfirmDialog
          isOpen={showBackDialog}
          onClose={() => setShowBackDialog(false)}
          onConfirm={handleBackConfirm}
          title="Quit Current Game?"
          message="You have an active game against the computer. Leaving will quit the game and count as a loss. Continue?"
          confirmText="Leave & Quit"
          cancelText="Stay"
        />

        <ConfirmDialog
          isOpen={showLogoutDialog}
          onClose={() => setShowLogoutDialog(false)}
          onConfirm={handleLogoutConfirm}
          title="Logout & Quit Game?"
          message="You have an active game. Logging out will quit the game and count as a loss. Logout?"
          confirmText="Yes, Logout"
          cancelText="Cancel"
        />
      </div>
    </>
  );
}