import { Link, useNavigate } from "react-router-dom";

import Input from "@components/common/Input";
import Button from "@components/common/Button";

import { toast } from "sonner";

import { useSignin } from "@/hooks/auth";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { type LoginUser, LoginSchema } from "@/schemas";
import Text from "../common/Label";

function SignIn() {
  const signin = useSignin();
  const navigate = useNavigate();

  const form = useForm<LoginUser>({ resolver: zodResolver(LoginSchema) });

  const {
    formState: { errors },
  } = form;

  async function submit(user: LoginUser) {
    const validation = LoginSchema.parse(user);

    await signin.mutateAsync(validation, {
      onSuccess() {
        navigate("/");
        toast.info("Signed in successfully!");
      },

      onError(ex) {
        toast.error(ex.name ?? "Sign in failed", { description: ex.message });
      },
    });
  }

  return (
    <div className="max-w-sm mx-auto bg-transparent border-2 border-slate-200/75 p-8 px-12 rounded-xl shadow-xl shadow-secondary/20">
      <h2 className="text-xl text-center uppercase font-extrabold mb-8">
        Sign In
      </h2>
      <form
        className="flex flex-col gap-8"
        onSubmit={form.handleSubmit(submit)}
      >
        <article className="flex flex-col gap-8">
          <Input
            autoFocus
            label="email"
            type="email"
            id="email"
            {...form.register("email")}
            error={errors?.email?.message}
          />

          <Input
            id="password"
            label="password"
            type="password"
            error={errors?.password?.message}
            {...form.register("password")}
          />
        </article>

        <article className="flex flex-col gap-2">
          <Button
            size="md"
            color="accent"
            type="submit"
            loading={signin.isPending}
          >
            sign in
          </Button>

          <article className="flex items-center text-xs justify-between capitalize font-semibold">
            <Text>New here ?</Text>
            <Link className="underline underline-offset-2" to="/auth/register">
              sign up instead
            </Link>
          </article>
        </article>
      </form>
    </div>
  );
}

export default SignIn;
