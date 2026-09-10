import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { Stack } from "./ui/Stack";
import { useForm } from "react-hook-form";
import { type PatientCreate, PatientCreateSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignup } from "@/hooks/use-auth";
import type { APIError } from "@/types/http";

const useRegister = useSignup(
  {
    route: "patient",
  },
  () => [["auth", "me"]],
);

export const PatientRegister = memo(function () {
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
            <Input
              id="email"
              autoFocus
              label="email"
              type="email"
              {...form.register("email")}
              error={errors["email"]}
            />

            <Input
              id="password"
              type="password"
              label="password"
              {...form.register("password")}
              error={errors["password"]}
            />

            <Input
              id="username"
              label="username"
              {...form.register("username")}
              error={errors["username"]}
            />
          </Stack>
          <Button type="submit" color="white" loading={isPending}>
            sign up
          </Button>
        </Stack>
      </form>
    </>
  );
});
