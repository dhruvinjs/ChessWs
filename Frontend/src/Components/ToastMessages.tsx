import toast, { Toaster } from "react-hot-toast";

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
  // Color mapping for different message types
  const colorMap = {
    success: { bg: "#10b981", text: "#fff" },
    error: { bg: "#ef4444", text: "#fff" },
    info: { bg: "#3b82f6", text: "#fff" },
    warning: { bg: "#f59e0b", text: "#000" }
  };

  // Icon mapping
  const iconMap = {
    success: "✅",
    error: "❌", 
    info: "ℹ️",
    warning: "⚠️"
  };

  const colors = colorMap[options.type];

  const toastOptions = {
    duration: options.duration || 4000,
    position: options.position || "top-right" as const,
    style: {
      borderRadius: "12px",
      padding: "16px 20px",
      fontSize: "16px",
      fontWeight: 500,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)",
      minWidth: "300px",
      maxWidth: "500px",
      background: colors.bg,
      color: colors.text,
    },
    icon: iconMap[options.type],
  };

  toast(`${title}: ${message}`, toastOptions);
};

// ✅ Centralized Toaster component with enhanced styling
export const ToastProvider = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      // Default fallback styles for direct toast() calls
      style: { 
        background: "#333", 
        color: "#fff",
        fontSize: "16px",
        fontWeight: "500",
        padding: "16px 20px",
        minWidth: "300px",
        maxWidth: "500px",
        borderRadius: "12px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)",
      },
      duration: 4000,
      // Enhanced icon themes for better visibility
      success: {
        iconTheme: {
          primary: "#fff",
          secondary: "#10b981",
        },
      },
      error: {
        iconTheme: {
          primary: "#fff",
          secondary: "#ef4444",
        },
      },
    }}
  />
);
