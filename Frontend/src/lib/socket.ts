// lib/SocketManager.ts
import { SocketMessage } from "../types/socket";

export class SocketManager {
  private static instance: SocketManager;
  private socket: WebSocket | null = null;
  private isConnecting = false;
  private wsBaseUrl = import.meta.env.VITE_WS_URL;

  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public init(userId: string): WebSocket | null {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return this.socket;
    }

    if (this.isConnecting) return this.socket;

    if (!userId) {
      console.warn("⚠️ Cannot initialize socket without userId.");
      return null;
    }

    const wsUrl = `${this.wsBaseUrl}/ws?guestId=${userId}`;
    console.log(`Attempting to connect to ${wsUrl}`);
    this.isConnecting = true;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log("✅ WebSocket connected:", wsUrl);
        this.isConnecting = false;
      };

      this.socket.onclose = (event) => {
        console.log("🔌 WebSocket disconnected", event.reason);
        this.socket = null;
        this.isConnecting = false;
      };

      this.socket.onerror = (err) => {
        console.error("❌ WebSocket error:", err);
        this.socket = null;
        this.isConnecting = false;
      };

      return this.socket;
    } catch (error) {
      console.error("❌ WebSocket creation failed:", error);
      this.socket = null;
      this.isConnecting = false;
      return null;
    }
  }

  public getSocket(): WebSocket | null {
    return this.socket;
  }

  public closeSocket() {
    if (this.socket) {
      console.log("Closing WebSocket connection.");
      this.socket.close();
      this.socket = null;
    }
  }

  public send(message: SocketMessage) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error("Cannot send message, socket is not open.", {
        readyState: this.socket?.readyState,
      });
    }
  }
}
