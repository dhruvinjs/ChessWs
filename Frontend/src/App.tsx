import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Landing, Auth, Room, About, ChessGame } from "./Pages";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { useEffect } from "react";

export function App() {
  const { isLoading, error, checkAndInitGuest } = useUserStore();

  useEffect(() => {
    checkAndInitGuest();
  }, [checkAndInitGuest]);

  // Loading / error handling
  if (isLoading) return <p>Loading guest and connecting...</p>;
  if (error) return <p>Error fetching guest. Refresh the page.</p>;

  // At this point, guestId is already in Zustand
  // socket is already initialized elsewhere via your singleton
 
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
              }
            }}
          />

    </BrowserRouter>
  );
}

