import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "../Components/Navbar";
import { useEffect, useRef } from "react";
import { useUserQuery } from "../hooks/useUserQuery";
import { LoadingScreen } from "../Components/LoadingScreen";
import { showMessage } from "../Components/ToastMessages";

const AUTH_ONLY_ROUTES = ["/profile", "/home", "/room"];
const GUEST_ALLOWED_ROUTES = ["/game"];

export function ProtectedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user, isLoading, isError } = useUserQuery();
  const lastToastRoute = useRef<string | null>(null);

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
      // Prevent duplicate toasts for the same route
      if (lastToastRoute.current === location.pathname) {
        navigate("/");
        return;
      }
      
      lastToastRoute.current = location.pathname;
      console.log("Guest user trying to access protected route, redirecting to landing");
      
      // Show toast message for different protected routes
      if (location.pathname === "/room") {
        showMessage(
          "Access Denied",
          "Create an account to access Room Games!",
          {
            type: "error",
            position: "top-right",
            duration: 4000,
          }
        );
      } else if (location.pathname === "/profile") {
        showMessage(
          "Access Denied",
          "Create an account to access your Profile!",
          {
            type: "error",
            position: "top-right",
            duration: 4000,
          }
        );
      } else if (location.pathname === "/home") {
        showMessage(
          "Access Denied",
          "Create an account to access the Dashboard!",
          {
            type: "error",
            position: "top-right",
            duration: 4000,
          }
        );
      } else {
        showMessage(
          "Access Denied",
          "Create an account to access this page!",
          {
            type: "error",
            position: "top-right",
            duration: 4000,
          }
        );
      }
      
      navigate("/");
      return;
    }

    // 🚫 If authenticated user tries to access guest-only routes, redirect to home
    if (!user.isGuest && GUEST_ALLOWED_ROUTES.includes(location.pathname)) {
      // Prevent duplicate toasts for the same route
      if (lastToastRoute.current === location.pathname) {
        navigate("/home");
        return;
      }
      
      lastToastRoute.current = location.pathname;
      console.log("Authenticated user accessing guest route, redirecting to home");
      showMessage(
        "Welcome",
        "You have access to all features now!",
        {
          type: "success",
          position: "top-right",
          duration: 3000,
        }
      );
      navigate("/home");
      return;
    }

    // Reset the ref when accessing allowed routes
    lastToastRoute.current = null;
  }, [user.isGuest, location.pathname, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
    </div>
  );
}