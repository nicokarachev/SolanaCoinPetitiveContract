"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Button } from "./ui/button";

export function RadixAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <AlertDialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg max-w-md w-full">
          <AlertDialog.Title className="font-bold text-lg">
            {title}
          </AlertDialog.Title>
          {description && (
            <AlertDialog.Description className="mt-2 text-sm text-gray-700">
              {description}
            </AlertDialog.Description>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <AlertDialog.Cancel asChild>
              <Button variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button variant="destructive" onClick={onConfirm}>
                Confirm
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
