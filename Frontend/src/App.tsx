import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Landing, Auth, Room, About, ChessGame } from "./Pages";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { useEffect } from "react";
import { SocketManager } from "./lib/socketManager"; // Import the SocketManager

export function App() {
  const { isLoading, error, checkAndInitGuest, user } = useUserStore();

  useEffect(() => {
    checkAndInitGuest();
  }, [checkAndInitGuest]);

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
        <Route path="/" element={<Landing />} />
        <Route
          path="/game"
          element={
            <div className="dark">
              <ChessGame />
            </div>
          }
        />
        <Route path="/login" element={<Auth />} />
        <Route path="/about" element={<About />} />
        <Route path="/room" element={<Room />} />
      </Routes>

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
