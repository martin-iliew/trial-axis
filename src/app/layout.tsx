import type { Metadata } from "next";
import "./globals.css";
import SmoothScrolling from "@/components/common/smooth-scrolling";
import { mpexSans, mpexSansRounded } from "@/lib/fonts";
import { Providers } from "@/lib/providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "TrialMatch — Clinical Trial Site Matching",
  description: "Match the right clinics to your clinical trial in minutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${mpexSans.variable} ${mpexSansRounded.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-default text-primary antialiased">
        <Providers>
          <SmoothScrolling>{children}</SmoothScrolling>
        </Providers>
        <Toaster
          position="top-right"
          toastOptions={{
            className:
              "!bg-surface-level-1 !border !border-primary !text-primary !shadow-xs !rounded-xl body-small",
            descriptionClassName: "!text-secondary",
            error: {
              className:
                "!bg-surface-status-danger !border !border-status-danger !text-primary !shadow-xs !rounded-xl body-small",
            },
            success: {
              className:
                "!bg-surface-status-success !border !border-status-success !text-primary !shadow-xs !rounded-xl body-small",
            },
            warning: {
              className:
                "!bg-surface-status-warning !border !border-status-warning !text-primary !shadow-xs !rounded-xl body-small",
            },
            info: {
              className:
                "!bg-surface-status-info !border !border-status-info !text-primary !shadow-xs !rounded-xl body-small",
            },
          }}
        />
      </body>
    </html>
  );
}
