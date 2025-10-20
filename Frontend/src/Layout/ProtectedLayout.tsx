import { Outlet, useNavigate } from "react-router-dom";
import { Navbar } from "../Components";
import { useEffect } from "react";
import { useThemeStore } from "../stores/useThemeStore";
import { useUserStore } from "../stores/useUserStore";

export function ProtectedLayout() {
  const { initTheme } = useThemeStore();
  const { user, initialized, isGuest } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    initTheme();

    // Wait until store initialization is done
    if (!initialized) return;

    // Redirect if no user OR user is a guest
    if (user || !isGuest) return
    navigate("/login");
  }, [initTheme, user, isGuest, initialized, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
    </div>
  );
}
