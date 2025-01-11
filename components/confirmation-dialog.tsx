import { useEffect } from "react";
import { Button } from "./ui/button";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: (e?: any) => void;
  onConfirm: (e?: any) => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-foreground/30" />

      {/* Dialog */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-background rounded-lg p-6 max-w-md w-full shadow-xl"
          >
            {/* Title */}
            <h2 className="text-xl font-semibold text-foreground/90 mb-3">
              {title}
            </h2>

            {/* Message */}
            <p className="text-base text-foreground/60 mb-6">{message}</p>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                variant={"secondary"}
                onClick={onClose}
                className="ransition-colors duration-150"
              >
                {cancelText}
              </Button>
              <Button
                variant={"destructive"}
                onClick={onConfirm}
                className="transition-colors duration-150"
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
