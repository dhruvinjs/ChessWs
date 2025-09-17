
import toast from "react-hot-toast";

interface MessageOptions {
  type: "success" | "error" | "info" | "warning";
}

export const showGameMessage = (
  title: string,
  message: string,
  options: MessageOptions
) => {
  const toastOptions = {
    duration: 5000,
    position: "top-center" as const,
    style: {
      background: "#333",
      color: "#fff",
    },
  };

  switch (options.type) {
    case "success":
      toast.success(message, toastOptions);
      break;
    case "error":
      toast.error(message, toastOptions);
      break;
    case "info":
      toast(message, toastOptions);
      break;
    case "warning":
      toast(message, { ...toastOptions, icon: "⚠️" });
      break;
    default:
      toast(message, toastOptions);
  }
};
