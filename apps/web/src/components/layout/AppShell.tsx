import type { ReactNode } from "react";
import Navbar from "./Navbar";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-default">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 px-6 py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
