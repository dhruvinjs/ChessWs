/* eslint-disable react-refresh/only-export-components */
import toast, { Toaster } from 'react-hot-toast';

interface MessageOptions {
  type:
    | 'success'
    | 'error'
    | 'info'
    | 'warning'
    | 'check'
    | 'victory'
    | 'defeat';
  position?:
    | 'top-center'
    | 'top-right'
    | 'top-left'
    | 'bottom-center'
    | 'bottom-right'
    | 'bottom-left';
  duration?: number;
}

export const showMessage = (
  title: string,
  message: string,
  options: MessageOptions
) => {
  // Enhanced gradient color mapping for different message types
  const colorMap = {
    success: {
      bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      text: '#fff',
      icon: '✅',
    },
    error: {
      bg: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
      text: '#fff',
      icon: '❌',
    },
    info: {
      bg: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
      text: '#fff',
      icon: 'ℹ️',
    },
    warning: {
      bg: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
      text: '#000',
      icon: '⚠️',
    },
    check: {
      bg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      text: '#000',
      icon: '⚡',
    },
    victory: {
      bg: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 50%, #e17055 100%)',
      text: '#000',
      icon: '🏆',
    },
    defeat: {
      bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      text: '#fff',
      icon: '💔',
    },
  };

  const colors = colorMap[options.type];

  const toastOptions = {
    duration: options.duration || 4000,
    position: options.position || ('top-right' as const),
    style: {
      borderRadius: '16px',
      padding: '18px 24px',
      fontSize: '16px',
      fontWeight: 600,
      boxShadow:
        '0 12px 30px -8px rgba(0, 0, 0, 0.4), 0 6px 8px -4px rgba(0, 0, 0, 0.2)',
      minWidth: '320px',
      maxWidth: '500px',
      background: colors.bg,
      color: colors.text,
      backdropFilter: 'blur(10px)',
    },
    icon: colors.icon,
  };

  toast(`${title}: ${message}`, toastOptions);
};

// Specialized toast functions for chess-specific events
export const showCheckToast = (isPlayer: boolean) => {
  const message = isPlayer
    ? 'You put the computer in check!'
    : 'Computer put you in check!';

  const style = isPlayer
    ? {
        background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        color: '#000',
        fontWeight: '700' as const,
        fontSize: '17px',
        border: '3px solid #f59e0b',
        boxShadow: '0 0 25px rgba(245, 158, 11, 0.6)',
        borderRadius: '16px',
        padding: '18px 24px',
      }
    : {
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
        color: '#fff',
        fontWeight: '700' as const,
        fontSize: '17px',
        border: '3px solid #dc2626',
        boxShadow: '0 0 25px rgba(220, 38, 38, 0.6)',
        borderRadius: '16px',
        padding: '18px 24px',
      };

  toast(message, {
    icon: isPlayer ? '⚡' : '🔥',
    duration: 3000,
    style,
  });
};

export const showVictoryToast = (message: string) => {
  toast.success(message, {
    icon: '🏆',
    duration: 6000,
    style: {
      background:
        'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 50%, #e17055 100%)',
      color: '#000',
      fontWeight: '800',
      fontSize: '19px',
      border: '4px solid #fdcb6e',
      boxShadow: '0 0 35px rgba(253, 203, 110, 0.9)',
      borderRadius: '16px',
      padding: '20px 28px',
    },
  });
};

export const showDefeatToast = (message: string) => {
  toast.error(message, {
    icon: '💔',
    duration: 5000,
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      fontWeight: '700',
      fontSize: '18px',
      borderRadius: '16px',
      padding: '18px 24px',
      boxShadow: '0 0 25px rgba(118, 75, 162, 0.6)',
    },
  });
};

export const showDrawToast = (message: string) => {
  toast(message, {
    icon: '🤝',
    duration: 5000,
    style: {
      background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
      color: '#000',
      fontWeight: '700',
      fontSize: '18px',
      borderRadius: '16px',
      padding: '18px 24px',
    },
  });
};

// ✅ Centralized Toaster component with enhanced styling
export const ToastProvider = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      // Default fallback styles for direct toast() calls
      style: {
        background: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
        color: '#fff',
        fontSize: '16px',
        fontWeight: '600',
        padding: '18px 24px',
        minWidth: '320px',
        maxWidth: '500px',
        borderRadius: '16px',
        boxShadow:
          '0 12px 30px -8px rgba(0, 0, 0, 0.5), 0 6px 8px -4px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
      },
      duration: 4000,
      // Enhanced icon themes for better visibility
      success: {
        iconTheme: {
          primary: '#10b981',
          secondary: '#fff',
        },
        style: {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        },
      },
      error: {
        iconTheme: {
          primary: '#ef4444',
          secondary: '#fff',
        },
        style: {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        },
      },
      loading: {
        iconTheme: {
          primary: '#3b82f6',
          secondary: '#fff',
        },
        style: {
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        },
      },
    }}
  />
);
