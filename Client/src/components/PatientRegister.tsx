import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "./lib/button/Button";
import { Input } from "./ui/Input";
import { Stack } from "./ui/Stack";
import { useForm } from "react-hook-form";
import { type PatientCreate, PatientCreateSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignup } from "@/hooks/use-auth";
import type { APIError } from "@/types/http";

export const PatientRegister = memo(function () {
  const useRegister = useSignup(
    {
      route: "patient",
    },
    () => [["auth", "me"]],
  );

  const { mutateAsync: create, isPending } = useRegister();
  const form = useForm<PatientCreate>({
    resolver: zodResolver(PatientCreateSchema),
  });

  const navigate = useNavigate();

  const {
    formState: { errors },
  } = form;

  async function submit(data: PatientCreate) {
    try {
      await create(data);
      navigate("/view/idx/doctors");
    } catch (exc) {
      toast.error((exc as unknown as APIError).message);
    }
  }

  return (
    <>
      <header className="text-center uppercase mb-8 font-extrabold text-xl">
        <h1>sign up</h1>
      </header>
      <form onSubmit={form.handleSubmit(submit)}>
        <Stack orientation="V" gap="md">
          <Stack orientation="V" gap="md">
            <Input.Group error={errors["email"]?.message}>
              <Input.Label htmlFor="email">email</Input.Label>
              <Input.Element
                id="email"
                type="email"
                {...form.register("email")}
              />
            </Input.Group>

            <Input.Group error={errors["password"]?.message}>
              <Input.Label htmlFor="password">password</Input.Label>
              <Input.Element
                id="password"
                type="password"
                {...form.register("password")}
              />
            </Input.Group>

            <Input.Group error={errors["username"]?.message}>
              <Input.Label htmlFor="username">username</Input.Label>
              <Input.Element id="username" {...form.register("username")} />
            </Input.Group>
          </Stack>
          <Button type="submit" color="white" loading={isPending}>
            sign up
          </Button>
        </Stack>
      </form>
    </>
  );
});
