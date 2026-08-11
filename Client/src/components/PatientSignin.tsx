import { type PatientSignin, PatientSigninSchema } from "@/schemas";
import { type APIError } from "@/types/http";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Stack } from "./ui/Stack";
import Input from "./ui/Input";
import Button from "./ui/Button";
import { useSignin } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function PatientSignin() {
  const signin = useSignin();
  const navigate = useNavigate();

  const form = useForm<PatientSignin>({
    resolver: zodResolver(PatientSigninSchema),
  });

  const { errors } = form.formState;

  async function submit(data: PatientSignin) {
    await signin.mutateAsync(
      { route: "patient", data },
      {
        onSuccess() {
          toast.message("Account successfully created.");
          navigate("/view/idx/doctors", {
            replace: true,
          });
        },

        onError(ex) {
          const msg = (ex as unknown as APIError).msg;

          const field = msg.includes("email")
            ? "email"
            : msg.includes("password")
              ? "password"
              : "root";

          form.setError(
            field,
            {
              message: msg,
            },
            {
              shouldFocus: true,
            },
          );
        },
      },
    );
  }

  return (
    <form onSubmit={form.handleSubmit(submit)}>
      <Stack gap="md" orientation="V">
        <Input
          {...form.register("email")}
          type="email"
          id="email"
          label="email"
          error={errors["email"]}
          autoFocus
        />
        <Input
          label="password"
          type="password"
          error={errors["password"]}
          {...form.register("password")}
          id="password"
        />
      </Stack>
      <Stack orientation="V" className="mt-4">
        <div className="text-red-400 text-center">
          {errors["root"] && errors["root"].message}
        </div>
        <Button
          type="submit"
          className="w-full"
          color="white"
          loading={signin.isPending}
        >
          sign in
        </Button>
      </Stack>
    </form>
  );
}
