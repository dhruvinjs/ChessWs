import toast from "react-hot-toast";

interface MessageOptions {
  type: "success" | "error" | "info" | "warning";
  position?: "top-center" | "top-right" | "top-left" | "bottom-center" | "bottom-right" | "bottom-left";
  duration?: number;
}

export const showMessage = (
  title: string,
  message: string,
  options: MessageOptions
) => {
  const baseStyle = {
    borderRadius: "10px",
    padding: "16px 20px",
    fontSize: "16px",
    fontWeight: 600,
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    color: "#fff",
    maxWidth: "500px",
    textAlign: "center" as const,
  };

  const toastOptions = {
    duration: options.duration || 5000,
    position: options.position || "top-center" as const,
    style: {
      ...baseStyle,
      background:
        options.type === "success"
          ? "#28a745"
          : options.type === "error"
          ? "#dc3545"
          : options.type === "info"
          ? "#17a2b8"
          : "#ffc107",
      color: options.type === "warning" ? "#000" : "#fff",
    },
    icon:
      options.type === "success"
        ? "✅"
        : options.type === "error"
        ? "❌"
        : options.type === "info"
        ? "ℹ️"
        : "⚠️",
  };

  toast(`${title}: ${message}`, toastOptions);
};
