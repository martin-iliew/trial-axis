"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import AuthFormShell from "@/components/common/AuthFormShell"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label, Caption } from "@/components/ui/typography"
import { cn } from "@/lib/utils"
import { registerSchema, type RegisterValues } from "@/features/auth/schemas"

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "sponsor" },
  })

  const selectedRole = watch("role")

  async function onSubmit(values: RegisterValues) {
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          role: values.role,
          first_name: values.firstName,
          last_name: values.lastName,
        },
      },
    })

    if (error) {
      toast.error(error.message)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        role: values.role,
        first_name: values.firstName,
        last_name: values.lastName,
      })
      if (profileError) {
        toast.error("Account created but profile setup failed. Please contact support.")
        return
      }
    }

    toast.success("Account created! Signing you in…")
    router.push(values.role === "sponsor" ? "/sponsor/projects" : "/clinic/profile")
    router.refresh()
  }

  return (
    <AuthFormShell
      title="Create account"
      subtitle="Join TrialMatch to connect trials with clinics"
      footerLabel="Already have an account?"
      footerCta="Sign in"
      footerHref="/login"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role picker */}
        <div className="space-y-1.5">
          <Label>I am a…</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["sponsor", "clinic_admin"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setValue("role", r)}
                className={cn(
                  "rounded-xl border px-4 py-2.5 text-body-small font-medium transition-colors",
                  selectedRole === r
                    ? "border-primary bg-surface-level-2 text-primary"
                    : "border-primary/30 text-secondary hover:border-primary"
                )}
              >
                {r === "sponsor" ? "Sponsor" : "Clinic Admin"}
              </button>
            ))}
          </div>
          {errors.role && (
            <Caption className="text-icon-status-danger">{errors.role.message}</Caption>
          )}
        </div>

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" placeholder="Alex" {...register("firstName")} />
            {errors.firstName && (
              <Caption className="text-icon-status-danger">{errors.firstName.message}</Caption>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" placeholder="Smith" {...register("lastName")} />
            {errors.lastName && (
              <Caption className="text-icon-status-danger">{errors.lastName.message}</Caption>
            )}
          </div>
        </div>

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
            <Caption className="text-icon-status-danger">{errors.email.message}</Caption>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && (
            <Caption className="text-icon-status-danger">{errors.password.message}</Caption>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthFormShell>
  )
}
