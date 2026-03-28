import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

async function logout() {
  "use server";
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  const { redirect } = await import("next/navigation");
  redirect("/login");
}

export default async function Navbar() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = user?.user_metadata.role as string | undefined;

  return (
    <nav className="border-b border-primary bg-surface-level-1 px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="heading-7 text-primary">
          TrialMatch
        </Link>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
          {role === "clinic_admin" ? (
            <>
              <Link href="/clinic/profile">
                <Button variant="outline" size="sm">My Profile</Button>
              </Link>
              <Link href="/clinic/inquiries">
                <Button variant="outline" size="sm">Inquiries</Button>
              </Link>
            </>
          ) : (
            <Link href="/clinics" className="hidden sm:block">
              <Button variant="outline" size="sm">Clinics</Button>
            </Link>
          )}
          {role === "sponsor" && (
            <Link href="/sponsor/projects">
              <Button variant="outline" size="sm">My Projects</Button>
            </Link>
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
      </div>
    </nav>
  );
}
