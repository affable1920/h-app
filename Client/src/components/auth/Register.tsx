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
    <section className="box max-w-xs mx-auto gap-8">
      <h2 className="card-h2 text-center text-2xl uppercase font-extrabold">
        sign up
      </h2>
      <form
        className="flex flex-col gap-8"
        onSubmit={form.handleSubmit(submit)}
      >
        <article className="flex flex-col gap-8">
          <Input>
            <Input.Label>Email</Input.Label>
            <Input.InputElement
              type="email"
              {...form.register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && <Input.Error msg={errors.email.message ?? ""} />}
          </Input>

          <Input>
            <Input.Label>password</Input.Label>
            <Input.InputElement
              type="password"
              {...form.register("password")}
              aria-invalid={!!errors.password}
            />
            {errors.password && <Input.Error msg={errors.password.message} />}
          </Input>

          <Input>
            <Input.Label>username</Input.Label>
            <Input.InputElement
              {...form.register("username")}
              aria-invalid={!!errors.username}
            />
            {errors.username && <Input.Error msg={errors.username.message} />}
          </Input>
        </article>

        <article className="flex flex-col gap-4">
          <Button size="md" type="submit" loading={register.isPending}>
            Register
          </Button>

          <article className="flex items-center justify-center gap-2 text-sm">
            <p className="first-letter:capitalize font-bold">
              already a member !
            </p>
            <Button variant="link" to="/auth">
              sign in
            </Button>
          </article>
        </article>
      </form>
    </section>
  );
}

export default Register;
