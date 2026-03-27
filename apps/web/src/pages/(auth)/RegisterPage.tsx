import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@shared/utils/schemas";
import { useNavigate } from "react-router-dom";
import AuthFormShell from "../../components/shared/AuthFormShell";
import FormField from "../../components/shared/FormField";
import { Alert } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../lib/errors";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    try {
      await registerUser(data.email, data.password);
      navigate("/");
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Registration failed"));
    }
  };

  return (
    <AuthFormShell
      footerCta="Sign in"
      footerHref="/login"
      footerLabel="Already have an account?"
      subtitle="Create your backend-linked account"
      title="Create Account"
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
              placeholder="Min 8 characters"
            />
          </FormField>
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </fieldset>
      </form>
    </AuthFormShell>
  );
}
