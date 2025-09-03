import { X, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

export function ConfirmDialog ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText
}:ConfirmDialogProps){
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 pt-0">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            text={cancelText}
          />
          <Button
            variant="primary"
            size="md"
            onClick={onConfirm}
            text={confirmText}
          />
        </div>
      </div>
    </div>
  );
};