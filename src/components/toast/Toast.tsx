"use client";

import React from "react";
import { toast } from "sonner";

import { CheckCircle, XCircle, Info, AlertTriangle, XIcon } from "lucide-react";
import { ReactNode } from "react";

export type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastProps {
  id: string | number;
  variant?: ToastVariant;
  children: ReactNode;
  className?: string;
}

const iconMap = {
  success: <CheckCircle className="text-green-600" size={20} />,
  error: <XCircle className="text-red-600" size={20} />,
  info: <Info className="text-blue-500" size={20} />,
  warning: <AlertTriangle className="text-yellow-600" size={20} />,
};

export function Toast({
  id,
  variant = "info",
  children,
}: React.PropsWithChildren<ToastProps>) {
  return (
    <div className="relative flex items-center justify-between gap-2 bg-white shadow-lg rounded-lg w-full sm:w-80 md:max-w-sm p-4 outline outline-gray-200">
      <div className="font-openSans text-secondary-950 flex items-start gap-3">
        {iconMap[variant]}
        <div className="flex flex-col gap-1">{children}</div>
      </div>
      <button
        onClick={() => toast.dismiss(id)}
        className="hover:text-gray-600 dark:hover:text-gray-300 self-baseline text-gray-400"
      >
        <XIcon size={20} className="mt-0.5" />
      </button>
    </div>
  );
}
