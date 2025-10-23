import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Landing, Room, About, ChessGame, Login, Home } from "./Pages";
import { Toaster } from "react-hot-toast";
import { SocketManager } from "./lib/socketManager";
import { Register } from "./Pages/Register";
import { PublicLayout } from "./Layout/PublicLayout";
import { ProtectedLayout } from "./Layout/ProtectedLayout";
import { Profile } from "./Pages/Profile";
import { useUserQuery } from "./hooks/useUserQuery"; 
import { useEffect } from "react";
import { LoadingScreen } from "./Components/LoadingScreen";

export function App() {
  // Fetch either logged-in user or guest
  const { data: user, isLoading, isError, error } = useUserQuery();
  // console.log("useUserQuery() data:", user, "isLoading:", isLoading, "isError:", isError);

  // Initialize socket connection once the user/guest is available
  useEffect(() => {
    if (user?.id) {
      // console.log(user.id)
      SocketManager.getInstance().init(user.id);
    }

    return () => {
      SocketManager.getInstance().closeSocket();
    };
  }, [user]);

  // Loading state
  if (isLoading) return <LoadingScreen />;
  
  // Error state - show error message with retry option
  // Error state - show error message with retry option
if (isError) {
  return (
    <div
      className="flex flex-col items-center justify-center h-screen gap-4 
                 bg-gradient-to-b from-slate-50 to-white 
                 dark:from-slate-900 dark:to-slate-800 
                 border-t border-slate-200 dark:border-slate-700"
    >
      <p className="text-slate-800 dark:text-slate-100 text-lg font-semibold">
        Error fetching user: {error?.message || "Unknown error"}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 
                   text-white font-medium transition-colors duration-150"
      >
        Retry
      </button>
    </div>
  );
}


  // No user (should not happen with the updated query, but keep as safeguard)
  if (!user) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Layout */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/" element={<Landing />} />
        </Route>

        {/* Protected Layout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/game" element={<ChessGame />} />
          <Route path="/room" element={<Room />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#333", color: "#fff" },
        }}
      />
    </BrowserRouter>
  );
}