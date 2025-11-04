// layouts/PublicLayout.tsx
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "../Components/Navbar";
import { useUserQuery } from "../hooks/useUserQuery";
import { LoadingScreen } from "../Components/LoadingScreen";

export function PublicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user, isLoading } = useUserQuery();


  if (isLoading) {
    return <LoadingScreen />;
  }

  // ✅ Redirect ONLY authenticated (non-guest) users away from /login or /register
  useEffect(() => {
    if (user && !user.isGuest && ["/login", "/register"].includes(location.pathname)) {
      navigate("/home", { replace: true });
      console.log("This is the culprit");
    }
  }, [isLoading,user?.isGuest, location.pathname, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
    </div>
  );
}