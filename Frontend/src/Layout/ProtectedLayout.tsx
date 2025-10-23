// layouts/ProtectedLayout.tsx
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "../Components/Navbar";
import { useEffect } from "react";
import { useThemeStore } from "../stores/useThemeStore";
import { useUserQuery } from "../hooks/useUserQuery";
import { LoadingScreen } from "../Components/LoadingScreen";

// Routes that require authentication (no guests allowed)
const AUTH_ONLY_ROUTES = ["/profile", "/home"];

export function ProtectedLayout() {
  const { initTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user, isLoading, isError } = useUserQuery();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // ⏳ Show loading while checking auth
  if (isLoading) {
    return <LoadingScreen />;
  }

  // 🚫 If no user at all or error, redirect to login
  if (isError || !user) {
    navigate("/login");
    return null;
  }

  // 🚫 If guest tries to access auth-only routes, redirect to landing page
  useEffect(() => {
    if (user.isGuest && AUTH_ONLY_ROUTES.includes(location.pathname)) {
      console.log("THis is the culprit")
    }
  }, [user.isGuest, location.pathname, navigate]);

  // ✅ Allow guests to access other protected routes like /game, /room
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
    </div>
  );
}