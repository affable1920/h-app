import { type PatientSignin, PatientSigninSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Stack } from "./ui/Stack";
import { Input } from "./ui/Input";
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
      await signin({
        route: "patient",
        data,
      });

      toast.message("logged in.");
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
        <Input.Group error={errors["email"]?.message}>
          <Input.Label htmlFor="email">email</Input.Label>
          <Input.Element
            id="email"
            autoFocus
            type="email"
            {...form.register("email")}
          />
        </Input.Group>

        <Input.Group error={errors["password"]?.message}>
          <Input.Label htmlFor="password">password</Input.Label>
          <Input.Element
            id="password"
            autoFocus
            type="password"
            {...form.register("password")}
          />
        </Input.Group>
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
