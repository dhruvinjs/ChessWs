import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "../Components/Navbar";
import { useEffect } from "react";
import { useUserQuery } from "../hooks/useUserQuery";
import { LoadingScreen } from "../Components/LoadingScreen";
import { showMessage } from "../Components/ToastMessages";

const AUTH_ONLY_ROUTES = ["/profile", "/home", "/room"];

export function ProtectedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user, isLoading } = useUserQuery();

  
  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // console.log("No user found, redirecting to login");
      navigate("/login", { replace: true });
      return;
    }

    // Redirect guests trying to access restricted areas
    if (user.isGuest && AUTH_ONLY_ROUTES.includes(location.pathname)) {
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
        duration: 3000,
      });

      navigate("/", { replace: true });
    }
  }, [user, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }


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
