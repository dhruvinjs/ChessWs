import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "../Components/Navbar";
import { useEffect, useRef } from "react";
import { useUserQuery } from "../hooks/useUserQuery";
import { LoadingScreen } from "../Components/LoadingScreen";
import { showMessage } from "../Components/ToastMessages";

const AUTH_ONLY_ROUTES = ["/profile", "/home", "/room"];

export function ProtectedLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Optimization: Removed 'isFetching' from the UI condition.
  // This prevents the LoadingScreen from flickering on every background refresh.
  const { data: user, isLoading } = useUserQuery();
  const hasRedirected = useRef(false);

  // 🚫 Handle redirection for unauthenticated users
  useEffect(() => {
    if (isLoading) return;

    if (!user && !hasRedirected.current) {
      hasRedirected.current = true;
      console.log("No user found, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [user, navigate, isLoading]);

  // 🚫 Handle redirection for guests trying to access restricted areas
  useEffect(() => {
    if (isLoading) return;

    if (user?.isGuest && AUTH_ONLY_ROUTES.includes(location.pathname)) {
      if (!hasRedirected.current) {
        hasRedirected.current = true;

        const messages: Record<string, { title: string; message: string }> = {
          "/room": {
            title: "Access Denied",
            message: "Create an account to access Room Games!",
          },
          "/profile": {
            title: "Access Denied",
            message: "Create an account to access your Profile!",
          },
          "/home": {
            title: "Access Denied",
            message: "Create an account to access the Dashboard!",
          },
        };

        const msg = messages[location.pathname] || {
          title: "Access Denied",
          message: "Create an account to access this page!",
        };

        showMessage(msg.title, msg.message, {
          type: "error",
          position: "top-right",
          duration: 4000,
        });

        navigate("/", { replace: true });
      }
    } else {
      // Reset flag if they move to a safe route or log in
      hasRedirected.current = false;
    }
  }, [user, location.pathname, navigate, isLoading]);

  // ⏳ Performance fix: Only show LoadingScreen on initial mount (isLoading).
  // Background updates will happen silently without blocking the UI.
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Prevent UI flash if we are about to redirect
  if (!user || (user.isGuest && AUTH_ONLY_ROUTES.includes(location.pathname))) {
    return null;
  }

  // Determine if we should hide the Navbar (e.g., in active matches)
  const isGamePage =
    location.pathname === "/game" ||
    location.pathname === "/computer/game" ||
    location.pathname.startsWith("/room/");

  return (
    <>
      {!isGamePage && <Navbar />}
      <main className={isGamePage ? "" : "pt-16"}>
        <Outlet />
      </main>
    </>
  );
}
