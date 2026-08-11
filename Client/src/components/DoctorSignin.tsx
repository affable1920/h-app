import { DrLoginSchema, type DoctorLogin } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldError } from "react-hook-form";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { Stack } from "./ui/Stack";
import { useState, useCallback, forwardRef } from "react";
import { useSignin } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { APIError } from "@/types/http";
import { useLocation, useNavigate } from "react-router-dom";

type MultiInputProps = {
  methodA: string;
  methodB: string;
  type: string;
  error?: FieldError;
  changeMethod: () => void;
};

const MultiInput = forwardRef<HTMLInputElement, MultiInputProps>(
  function MultiInput(
    { methodA, methodB, type, changeMethod, error, ...rest },
    ref,
  ) {
    return (
      <Stack orientation="V" gap={12}>
        <Stack className="text-sm" justify="between" align="center">
          <label className="capitalize px-1" htmlFor="email">
            {methodA}
          </label>
          <span
            tabIndex={0}
            onClick={changeMethod}
            onKeyDown={function (ev) {
              if (ev.key.toLowerCase() === "enter") {
                changeMethod();
              }
            }}
            className="text-text-normal capitalize cursor-pointer hover:text-white focus:underline 
            underline-offset-4 focus:outline-none focus:text-white"
          >
            {methodB}
          </span>
        </Stack>

        <input
          ref={ref}
          className="border-2 border-border-strong rounded-md outline-none w-full font-semibold 
        placeholder:italic hover:border-border-strong placeholder:capitalize transition-colors px-3
        bg-layout-raised p-2 focus:ring-4 focus:ring-brand/20"
          type={type}
          id="email"
          autoFocus
          {...rest}
        />

        {error && <p className="text-red-400 text-sm px-1">{error.message}</p>}
      </Stack>
    );
  },
);

export function DrSignin() {
  const signin = useSignin();
  const navigate = useNavigate();

  const { state = {} } = useLocation();
  const [loginMethod, setLoginMethod] = useState<"App id" | "email">("email");

  const form = useForm<DoctorLogin>({
    resolver: zodResolver(DrLoginSchema),
  });

  const {
    formState: { errors },
  } = form;

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

  const changemethod = useCallback(function () {
    setLoginMethod(function (p) {
      const unreg = p === "App id" ? "id" : "email";
      form.unregister(unreg);
      return p === "email" ? "App id" : "email";
    });
  }, []);

  return (
    <form onSubmit={form.handleSubmit(submit)}>
      <Stack gap="md" orientation="V">
        <MultiInput
          changeMethod={changemethod}
          methodA={loginMethod}
          methodB={"use " + (loginMethod === "email" ? "App Id" : "email")}
          type={loginMethod === "email" ? "email" : "text"}
          {...form.register(loginMethod === "email" ? "email" : "id", {
            shouldUnregister: true,
          })}
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
