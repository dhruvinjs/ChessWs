import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Landing, Room, About, ChessGame, Login, Home } from "./Pages";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { useEffect } from "react";
import { SocketManager } from "./lib/socketManager"; // Import the SocketManager
import { Register } from "./Pages/Register";
import { PublicLayout } from "./Layout/PublicLayout";
import { ProtectedLayout } from "./Layout/ProtectedLayout";
import { Profile } from "./Pages/Profile";

export function App() {
  const { isLoading, error, checkAndInitUser, user } = useUserStore();

  
useEffect(() => {
  checkAndInitUser();
}, [checkAndInitUser]);

  // Initialize socket connection once the user is available
  useEffect(() => {
    // The user object from useUserStore likely has the guest ID.
    // We'll assume it's on a property like `id` or `guestId`.
    if (user && user.id) {
      SocketManager.getInstance().init(user.id);
    }


     return () => {
      SocketManager.getInstance().closeSocket();
    };
  }, [user]);

  // Loading / error handling
  if (isLoading) return <p>Loading guest and connecting...</p>;
  if (error) return <p>Error fetching guest. Refresh the page.</p>;

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

        {/* Landing page (can be public or own layout) */}
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#333", color: "#fff" },
        }}
      />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
    </BrowserRouter>
  );
}
