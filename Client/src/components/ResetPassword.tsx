import { ChevronRight } from "lucide-react";
import Button from "./lib/button/Button";
import { ToggledPasswordInput } from "./lib/button/ToggledPasswordInput";
import { Input } from "./ui/Input";
import { Stack } from "./ui/Stack";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageLayout } from "./routes/PageLayout";
import { useResetPassword } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { APIError } from "@/types/http";
import { useNavigate, useSearchParams } from "react-router-dom";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(12, "A password must be at least 12 characters long .."),
    confirmPassword: z.string(),
  })
  .refine(
    function (data) {
      return data.password === data.confirmPassword;
    },
    {
      error: "Passwords must match",
      path: ["confirmPassword"],
    },
  );

type ResetSchema = z.infer<typeof resetSchema>;

export function ResetPassword() {
  const [params] = useSearchParams();

  const { register, ...form } = useForm<ResetSchema>({
    resolver: zodResolver(resetSchema),
  });

  const navigate = useNavigate();
  const { mutateAsync: reset, isPending } = useResetPassword();

  const token = params.get("token");

  async function submit(data: ResetSchema) {
    try {
      await reset({
        token: token!,
        ...data,
      });

      toast.success(
        "Password reset successful, you can now login with your new password",
        {
          action: (
            <>
              <Button
                onClick={function () {
                  navigate("/auth");
                }}
              >
                sign in
              </Button>
            </>
          ),
        },
      );
    } catch (ex) {
      const error = ex as APIError;
      toast.error(error.code, {
        description: error.message,
      });
    }
  }

  return (
    <PageLayout>
      {token ? (
        <section className="form-box w-sm max-w-full mx-auto p-8 py-6">
          <header className="mb-8">
            <h2 className="text-md uppercase text-center">
              Reset your password
            </h2>
          </header>

          <form onSubmit={form.handleSubmit(submit)}>
            <Stack gap={28} orientation="V">
              <Input.Group
                error={form.formState.errors["password"]?.message}
                gap="xs"
              >
                <Input.Label htmlFor="password" required>
                  Password
                </Input.Label>

                <ToggledPasswordInput
                  autoComplete="off"
                  aria-autocomplete="none"
                  {...register("password")}
                  size="xs"
                  id="password"
                />
              </Input.Group>

              <Input.Group
                error={form.formState.errors["confirmPassword"]?.message}
                gap={"xs"}
              >
                <Input.Label htmlFor="confirm" required>
                  Confirm Password
                </Input.Label>

                <ToggledPasswordInput
                  autoComplete="off"
                  aria-autocomplete="none"
                  {...register("confirmPassword")}
                  size="xs"
                  id="confirmPassword"
                />
              </Input.Group>
            </Stack>

            <div className="mt-6 flex items-center justify-end">
              <Button type="submit" size="xs" color="white" loading={isPending}>
                Confirm reset <ChevronRight strokeWidth={5} />
              </Button>
            </div>
          </form>
        </section>
      ) : (
        <div className="text-center">
          The link has either expired or can't be used. Please generate another
          link
        </div>
      )}
    </PageLayout>
  );
}
