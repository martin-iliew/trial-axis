import type { ReactNode } from "react";
import { Caption, Label } from "@/components/ui/typography";

type FormFieldProps = {
  children: ReactNode;
  error?: string;
  htmlFor: string;
  label: string;
};

export default function FormField({
  children,
  error,
  htmlFor,
  label,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <Caption className="text-accent">{error}</Caption> : null}
    </div>
  );
}
