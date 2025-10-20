import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "../Components/Navbar";
import { useThemeStore } from "../stores/useThemeStore";
import { useUserStore } from "../stores/useUserStore";

export function PublicLayout() {
  const { initTheme } = useThemeStore();
  const { user, initialized, isGuest } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Redirect only real users (non-guests) away from public pages
  useEffect(() => {
    if (
      initialized &&
      user &&
      !isGuest && // ✅ Only redirect if not a guest
      ["/login", "/register"].includes(location.pathname)
    ) {
      navigate("/home");
    }
  }, [initialized, user, isGuest, location.pathname, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
    </div>
  );
}
