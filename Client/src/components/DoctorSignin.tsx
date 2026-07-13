import { DrLoginSchema, type DoctorLogin } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldError } from "react-hook-form";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { Stack } from "./ui/Stack";
import { useState, memo, useCallback } from "react";
import { useSignin } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { APIError } from "@/types/http";
import { useLocation, useNavigate } from "react-router-dom";

const MultiInput = memo(function MultiInput({
  methodA,
  methodB,
  changeMethod,
  error,
  ...rest
}: {
  methodA: string;
  methodB: string;
  error?: FieldError;
  changeMethod: () => void;
}) {
  return (
    <Stack orientation="V" gap="xs">
      <Stack className="text-sm" justify="between" align="center">
        <label className="capitalize px-1" htmlFor="email">
          {methodA}
        </label>
        <span
          onClick={changeMethod}
          className="text-text-normal capitalize cursor-pointer hover:text-white"
        >
          {methodB}
        </span>
      </Stack>

      <input
        className="border-2 border-border-strong rounded-md outline-none w-full font-semibold 
        placeholder:italic hover:border-border-strong placeholder:capitalize transition-colors px-3
        bg-layout-raised p-2"
        type="email"
        id="email"
        autoFocus
        {...rest}
      />

      {error && <p className="text-red-400 text-sm px-1">{error.message}</p>}
    </Stack>
  );
});

export function DrSignin() {
  const form = useForm<DoctorLogin>({ resolver: zodResolver(DrLoginSchema) });
  const signin = useSignin();

  const { state = {} } = useLocation();

  const [loginMethod, setLoginMethod] = useState<"App id" | "email">("email");
  const {
    formState: { errors },
  } = form;

  const navigate = useNavigate();

  async function submit(data: DoctorLogin) {
    await signin.mutateAsync(
      { route: "doctor", data },
      {
        onError(error) {
          toast.message((error as unknown as APIError).msg);
        },
        onSuccess() {
          toast.message("You're signed in.");
          navigate(state?.moveTo ?? "/view/idx/doctors");
        },
      },
    );
  }

  const changemethod = useCallback(function changeLoginMethod() {
    setLoginMethod((p) => (p === "email" ? "App id" : "email"));
  }, []);

  return (
    <form onSubmit={form.handleSubmit(submit)}>
      <Stack gap="md" orientation="V">
        <MultiInput
          changeMethod={changemethod}
          methodA={loginMethod}
          methodB={"use " + (loginMethod === "email" ? "App Id" : "email")}
          {...form.register(loginMethod === "email" ? "email" : "id")}
          error={errors[loginMethod !== "email" ? "id" : "email"]}
        />
        <Input
          label="password"
          type="password"
          {...form.register("password")}
          id="password"
        />
      </Stack>
      <Button
        className="mt-6 w-full"
        color="white"
        type="submit"
        loading={signin.isPending}
      >
        sign in
      </Button>
    </form>
  );
}
