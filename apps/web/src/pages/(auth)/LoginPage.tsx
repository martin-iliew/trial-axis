import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@shared/utils/schemas";
import { useNavigate } from "react-router-dom";
import AuthFormShell from "../../components/shared/AuthFormShell";
import FormField from "../../components/shared/FormField";
import { Alert } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../lib/errors";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    try {
      await login(data.email, data.password);
      navigate("/");
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Invalid email or password"));
    }
  };

  return (
    <AuthFormShell
      footerCta="Sign up"
      footerHref="/register"
      footerLabel="Don't have an account?"
      subtitle="Sign in to your account"
      title="Welcome Back"
    >
      {error ? <Alert className="mb-4">{error}</Alert> : null}
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <fieldset className="space-y-4" disabled={isSubmitting}>
          <FormField error={errors.email?.message} htmlFor="email" label="Email">
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="you@example.com"
            />
          </FormField>
          <FormField
            error={errors.password?.message}
            htmlFor="password"
            label="Password"
          >
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="••••••••"
            />
          </FormField>
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </fieldset>
      </form>
    </AuthFormShell>
  );
}
