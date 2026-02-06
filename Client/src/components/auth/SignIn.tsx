import { useNavigate } from "react-router-dom";

import Input from "@components/common/Input";
import Button from "@components/common/Button";

import { toast } from "sonner";

import { useSignin } from "@/hooks/auth";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { type LoginUser, LoginSchema } from "@/schemas";

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
    <div className="box gap-8 max-w-xs mx-auto">
      <h2 className="card-h2 text-xl text-center uppercase font-extrabold">
        Sign In
      </h2>
      <form
        className="flex flex-col gap-8"
        onSubmit={form.handleSubmit(submit)}
      >
        <article className="flex flex-col gap-8">
          <Input>
            <Input.Label>email</Input.Label>
            <Input.InputElement
              autoFocus
              type="email"
              {...form.register("email")}
            />
            {errors.email && <Input.Error msg={errors.email.message ?? ""} />}
          </Input>

          <Input>
            <Input.Label>password</Input.Label>
            <Input.InputElement
              type="password"
              {...form.register("password")}
            />
            {errors.password && (
              <Input.Error msg={errors.password.message ?? ""} />
            )}
          </Input>
        </article>

        <article className="flex flex-col gap-2">
          <Button size="md" type="submit" loading={signin.isPending}>
            sign in
          </Button>

          <article className="flex items-center justify-between text-sm">
            <p className="first-letter:capitalize font-bold">New here ?</p>
            <Button variant="link" to="/auth/register">
              sign up instead
            </Button>
          </article>
        </article>
      </form>
    </div>
  );
}

export default SignIn;
