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
  const { data: user, isLoading, isFetching } = useUserQuery();
  const hasRedirected = useRef(false);

  // 🚫 If no user at all, redirect to login
  useEffect(() => {
    // Don't redirect while still loading/fetching
    if (isLoading || isFetching) return;

    if (!user && !hasRedirected.current) {
      hasRedirected.current = true;
      console.log("No user found, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [user, navigate, isLoading, isFetching]);

  // 🚫 If guest tries to access auth-only routes, show message and redirect
  useEffect(() => {
    // Don't run redirect logic while loading/fetching
    if (isLoading || isFetching) return;

    if (user?.isGuest && AUTH_ONLY_ROUTES.includes(location.pathname)) {
      if (!hasRedirected.current) {
        hasRedirected.current = true;

        // Show toast message for different protected routes
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
      // Reset redirect flag when user is authenticated or on allowed routes
      hasRedirected.current = false;
    }
  }, [user, location.pathname, navigate, isLoading, isFetching]);

  // ⏳ Show loading while checking auth OR while actively fetching
  if (isLoading || isFetching) {
    return <LoadingScreen />;
  }

  // If no user or guest on protected route, show nothing to prevent flash
  if (!user || (user.isGuest && AUTH_ONLY_ROUTES.includes(location.pathname))) {
    return null;
  }

  // Hide navbar on ALL game pages
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
