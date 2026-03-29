import type { ReactNode } from "react";
import Link from "next/link";
import { BodySmall } from "@/components/ui/typography";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthFormShellProps = {
  children: ReactNode;
  footerCta: string;
  footerHref: string;
  footerLabel: string;
  subtitle: string;
  title: string;
};

export default function AuthFormShell({
  children,
  footerCta,
  footerHref,
  footerLabel,
  subtitle,
  title,
}: AuthFormShellProps) {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-20 py-16">
      <Card className="w-full max-w-md bg-surface-level-1">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-section-title">{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
        <CardFooter className="justify-center text-center">
          <BodySmall>
            {footerLabel}{" "}
            <Link
              className="text-primary no-underline hover:text-secondary"
              href={footerHref}
            >
              {footerCta}
            </Link>
          </BodySmall>
        </CardFooter>
      </Card>
    </div>
  );
}
