"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const baseToastClassName =
  "body-small rounded-xl border border-primary bg-surface-level-1 text-primary shadow-xs";
const statusToastClassName =
  "body-small rounded-xl border text-primary shadow-xs";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--border-radius": "var(--radius-xl)",
        } as React.CSSProperties
      }
      toastOptions={{
        ...props.toastOptions,
        classNames: {
          toast: baseToastClassName,
          title: "body-small text-primary",
          description: "body-small text-secondary",
          content: "gap-1",
          icon: "text-icon-secondary",
          closeButton:
            "border border-primary bg-surface-level-0 text-icon-secondary",
          actionButton: "body-small bg-inverse text-inverse",
          cancelButton:
            "body-small border border-primary bg-surface-level-0 text-secondary",
          success: `${statusToastClassName} border-status-success bg-surface-status-success`,
          warning: `${statusToastClassName} border-status-warning bg-surface-status-warning`,
          info: `${statusToastClassName} border-status-info bg-surface-status-info`,
          error: `${statusToastClassName} border-status-danger bg-surface-status-danger`,
          loading: baseToastClassName,
          ...props.toastOptions?.classNames,
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
