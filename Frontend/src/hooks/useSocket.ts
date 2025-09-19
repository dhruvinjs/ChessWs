// useSocket.ts
import { useUserStore } from "../stores/useUserStore";

let socket: WebSocket | null = null;

/**
 * Returns a singleton WebSocket instance.
 * Call this only from places like useGameStore or a top-level effect.
 */
export function useSocket(): WebSocket | null {
  const { user } = useUserStore.getState(); // ✅ get user without a React hook
  const ws_base_url = import.meta.env.VITE_WS_URL;

  if (!user?.id) {
    console.warn("⚠️ No user id available, cannot create WebSocket.");
    return null;
  }

  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  const ws_url = `${ws_base_url}/ws?guestId=${user.id}`;
  socket = new WebSocket(ws_url);

  socket.onopen = () => {
    console.log("✅ WebSocket connected:", ws_url);
  };

  socket.onclose = () => {
    console.log("🔌 WebSocket disconnected");
    socket = null; // allow reconnection later
  };

  socket.onerror = (err) => {
    console.error("❌ WebSocket error:", err);
  };

  return socket;
}
