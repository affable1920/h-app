import { type PatientSignin, PatientSigninSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Stack } from "./ui/Stack";
import Input from "./ui/Input";
import Button from "./ui/Button";
import { useSignin } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { APIError } from "@/types/http";

export function PatientSignin() {
  const { mutateAsync: signin, isPending } = useSignin();
  const navigate = useNavigate();

  const form = useForm<PatientSignin>({
    resolver: zodResolver(PatientSigninSchema),
  });

  const { errors } = form.formState;

  async function submit(data: PatientSignin) {
    try {
      signin({
        route: "patient",
        data,
      });

      toast.message("Account successfully created.");
      navigate("/view/idx/doctors", {
        replace: true,
      });
    } catch (exc) {
      const ex = exc as unknown as APIError;
      toast.error(ex.code, {
        description() {
          return ex.message;
        },
      });
    }
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
          loading={isPending}
        >
          sign in
        </Button>
      </Stack>
    </form>
  );
}
