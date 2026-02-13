'use client';

import { Button } from './button';
import { Card } from './card';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'warning' | 'danger';
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = 'Continue',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning',
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const iconColor = variant === 'danger' ? 'text-red-600' : 'text-orange-600';
  const iconBg = variant === 'danger' ? 'bg-red-100' : 'bg-orange-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <Card className="relative z-10 w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon */}
          <div className={`${iconBg} ${iconColor} rounded-full p-3`}>
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{message}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full pt-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1"
              variant={variant === 'danger' ? 'destructive' : 'default'}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
