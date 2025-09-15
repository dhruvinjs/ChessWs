import toast, { Toaster } from "react-hot-toast";

export function ChessGameMessage() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#333",
          color: "#fff",
        },
      }}
    />
  );
}

// When you want a BIG centered toast:
export function showGameMessage(message: string) {
  toast(message, {
    duration: 3000,
    position: "top-center", // 👈 overrides default
    style: {
      background: "#111",
      color: "#fff",
      fontSize: "24px",
      padding: "20px 30px",
      borderRadius: "12px",
      textAlign: "center",
    },
  });
}
