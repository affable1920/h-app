import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "./lib/button/Button";
import { Input } from "./ui/Input";
import { Stack } from "./ui/Stack";
import { useForm } from "react-hook-form";
import { type PatientCreate, PatientCreateSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignin, useSignup } from "@/hooks/use-auth";
import { ToggledPasswordInput } from "./lib/button/ToggledPasswordInput";

export const PatientRegister = memo(function () {
  const useRegister = useSignup(
    {
      route: "patient",
    },
    () => [["auth", "me"]],
  );

  const { mutate: create, isPending } = useRegister();
  const { mutate: signin } = useSignin();

  const form = useForm<PatientCreate>({
    resolver: zodResolver(PatientCreateSchema),
  });

  const navigate = useNavigate();

  const {
    formState: { errors },
  } = form;

  async function submit(data: PatientCreate) {
    create(data, {
      onSuccess(res, variables) {
        if (typeof res.data === "string") {
          toast.info(res.data, {
            duration: 4000,
            dismissible: true,
            action: {
              label: "login",
              onClick: function () {
                signin(
                  {
                    route: "patient",
                    data: {
                      email: variables.email,
                      password: variables.password,
                    },
                  },
                  {
                    onSuccess: function () {
                      navigate("/app/index/doctors");
                    },
                  },
                );
              },
            },
            description: "Go to the login page to re-login..",
          });

          return;
        }

        navigate("/app/index/doctors");
      },

      onError(error) {
        toast.error(error.code, {
          description: error.message,
        });
      },
    });
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
              <ToggledPasswordInput
                id="password"
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
