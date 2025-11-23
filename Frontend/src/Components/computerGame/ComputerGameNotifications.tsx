import React from "react";
import { useComputerGame } from "../../hooks/useComputerGame";

interface NotificationProps {
  notification: {
    id: string;
    type: "success" | "danger" | "warning" | "info";
    message: string;
    timestamp: number;
  };
  onRemove: (id: string) => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onRemove }) => {
  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success": return "bg-green-500";
      case "danger": return "bg-red-500";
      case "warning": return "bg-yellow-500";
      case "info": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return "✓";
      case "danger": return "✕";
      case "warning": return "⚠";
      case "info": return "ⓘ";
      default: return "•";
    }
  };

  return (
    <div
      className={`${getNotificationColor(notification.type)} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between mb-2 animate-slide-in`}
    >
      <div className="flex items-center space-x-2">
        <span className="font-bold text-lg">{getNotificationIcon(notification.type)}</span>
        <span className="text-sm font-medium">{notification.message}</span>
      </div>
      <button
        onClick={() => onRemove(notification.id)}
        className="text-white hover:text-gray-200 font-bold text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
};

export const ComputerGameNotifications: React.FC = () => {
  const { notifications, removeNotification } = useComputerGame();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};