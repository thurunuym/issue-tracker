import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import cn from '../../utils/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isConfirmLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isConfirmLoading = false,
  variant = 'info',
  children,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-red-100 dark:bg-red-950/30',
          iconColor: 'text-red-650 dark:text-red-300',
          confirmBtn: 'danger' as const,
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-100 dark:bg-amber-950/30',
          iconColor: 'text-amber-650 dark:text-amber-300',
          confirmBtn: 'primary' as const, // primary maps to blue
        };
      case 'success':
        return {
          iconBg: 'bg-emerald-100 dark:bg-emerald-950/30',
          iconColor: 'text-emerald-650 dark:text-emerald-300',
          confirmBtn: 'success' as const,
        };
      default:
        return {
          iconBg: 'bg-blue-100 dark:bg-blue-950/30',
          iconColor: 'text-blue-650 dark:text-blue-300',
          confirmBtn: 'primary' as const,
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/55 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-md overflow-hidden rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-875 border border-gray-150 dark:border-gray-800 z-10"
          >
            <div className="flex items-start space-x-3.5">
              <div className={cn('p-2 rounded-full flex-shrink-0', styles.iconBg)}>
                {variant === 'danger' && (
                  <svg className={cn('h-5 w-5', styles.iconColor)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {variant === 'warning' && (
                  <svg className={cn('h-5 w-5', styles.iconColor)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {variant === 'success' && (
                  <svg className={cn('h-5 w-5', styles.iconColor)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {variant === 'info' && (
                  <svg className={cn('h-5 w-5', styles.iconColor)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1.5 leading-6">
                  {title}
                </h3>
                {description && (
                  <p className="text-sm text-gray-550 dark:text-gray-350">
                    {description}
                  </p>
                )}
                {children && <div className="mt-3.5">{children}</div>}
              </div>
            </div>

            <div className="mt-5.5 flex items-center justify-end space-x-2.5">
              <Button variant="outline" size="sm" onClick={onClose} disabled={isConfirmLoading}>
                {cancelText}
              </Button>
              {onConfirm && (
                <Button
                  variant={styles.confirmBtn}
                  size="sm"
                  onClick={onConfirm}
                  isLoading={isConfirmLoading}
                >
                  {confirmText}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
