"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import AuthFormShell from "@/components/common/AuthFormShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label, Caption } from "@/components/ui/typography";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";

function isCRORole(role: string | undefined) {
  return role === "cro";
}

export default function LoginPage() {
  const supabase = createClient();
  const [demoLoading, setDemoLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const busy = isSubmitting || demoLoading;

  async function onSubmit(values: LoginValues) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    const role = data.user?.user_metadata.role as string;
    window.location.assign(isCRORole(role) ? "/cro/projects" : "/clinic/profile");
  }

  async function handleDemoLogin(email: string, password: string, redirectTo: string) {
    setDemoLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setDemoLoading(false);
      return;
    }
    window.location.assign(redirectTo);
  }

  return (
    <AuthFormShell
      title="Welcome back"
      subtitle="Sign in to your TrialAxis account"
      footerLabel="Don't have an account?"
      footerCta="Sign up"
      footerHref="/register"
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <Caption className="text-icon-status-danger">
              {errors.email.message}
            </Caption>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password">Password</Label>
            <Link
              className="body-small text-secondary transition-colors hover:text-primary"
              href="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && (
            <Caption className="text-icon-status-danger">
              {errors.password.message}
            </Caption>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={busy}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="mt-6 border-t border-subtle pt-6 space-y-2">
        <Caption className="text-secondary text-center block mb-3">Try a demo account</Caption>
        <Button
          variant="outline"
          className="w-full"
          disabled={busy}
          onClick={() => handleDemoLogin("sponsor@demo.com", "Demo1234!", "/cro/projects")}
        >
          {demoLoading ? "Signing in…" : "CRO Demo"}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          disabled={busy}
          onClick={() => handleDemoLogin("clinic1@demo.com", "Demo1234!", "/clinic/profile")}
        >
          {demoLoading ? "Signing in…" : "Clinic Admin Demo"}
        </Button>
      </div>
    </AuthFormShell>
  );
}
