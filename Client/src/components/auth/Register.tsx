import { useNavigate } from "react-router-dom";

import { toast } from "sonner";
import Input from "@components/common/Input";
import Button from "@components/common/Button";

import { useSignup } from "@/hooks/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type CreateUser, UserSchema } from "@/schemas";

function Register() {
  const register = useSignup();
  const navigate = useNavigate();

  const form = useForm<CreateUser>({ resolver: zodResolver(UserSchema) });
  const {
    formState: { errors },
  } = form;

  async function submit(user: CreateUser) {
    const validation = UserSchema.parse(user);

    await register.mutateAsync(validation, {
      successFn() {
        navigate("/");
        toast.info("Successfully registered!");
      },

      onError(ex) {
        console.log(ex);

        toast.error(ex.name, {
          description: ex.message,
        });
      },
    });
  }

  return (
    <section className="max-w-sm mx-auto bg-transparent border-2 border-slate-200/75 p-8 rounded-xl shadow-xl shadow-secondary/20">
      <h1 className="text-center uppercase mb-8 font-extrabold text-xl">
        sign up
      </h1>
      <form
        className="flex flex-col gap-8"
        onSubmit={form.handleSubmit(submit)}
      >
        <article className="flex flex-col gap-8">
          <Input
            id="email"
            autoFocus
            label="email"
            type="email"
            {...form.register("email")}
            error={errors?.email?.message}
          />

          <Input
            id="password"
            type="password"
            label="password"
            {...form.register("password")}
            error={errors.password?.message}
          />

          <Input
            id="username"
            label="username"
            {...form.register("username")}
            error={errors.username?.message}
          />
        </article>

        <article className="flex flex-col gap-4">
          <Button type="submit" color="accent" loading={register.isPending}>
            Register
          </Button>

          <Button onClick={() => navigate("/auth")}>sign in</Button>
        </article>
      </form>
    </section>
  );
}

export default Register;
