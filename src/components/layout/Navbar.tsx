import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import MobileMenu from "@/components/layout/MobileMenu";
import type { UserRole } from "@/types";

async function logout() {
  "use server";
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function Navbar() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = user?.user_metadata.role as UserRole | undefined;

  return (
    <nav className="border-b border-primary bg-surface-level-1 px-3 py-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo.svg" alt="TrialAxis" width={120} height={39} priority />
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2">
          {role === "cro" && (
            <>
              <Link href="/cro/projects">
                <Button variant="outline" size="sm">
                  Study Portfolio
                </Button>
              </Link>
              <Link href="/cro/projects/new">
                <Button variant="outline" size="sm">
                  New Study
                </Button>
              </Link>
            </>
          )}
          {role === "clinic_admin" && (
            <>
              <Link href="/clinic/profile">
                <Button variant="outline" size="sm">
                  My Profile
                </Button>
              </Link>
              <Link href="/clinic/inquiries">
                <Button variant="outline" size="sm">
                  Inquiries
                </Button>
              </Link>
            </>
          )}
          {user ? (
            <form action={logout}>
              <Button variant="outline" size="sm" type="submit">
                Log out
              </Button>
            </form>
          ) : (
            <Link href="/login">
              <Button size="sm">Log in</Button>
            </Link>
          )}
        </div>

        {/* Mobile nav */}
        <MobileMenu role={role} isLoggedIn={!!user} logoutAction={logout} />
      </div>
    </nav>
  );
}
