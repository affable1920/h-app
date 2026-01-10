import { useRef, useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import Input from "@components/common/Input";
import Button from "@components/common/Button";

import { toast } from "sonner";
import authClient from "@/services/Auth";

import { type CreateUser, UserSchema } from "@/schemas";
import type { APIError } from "@/types/errors";
import { useAuth } from "../providers/AuthProvider";

function Register() {
  const [user, setUser] = useState<CreateUser>({
    email: "",
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<keyof CreateUser, string>>({
    email: "",
    username: "",
    password: "",
  });

  const ref = useRef<HTMLInputElement | null>(null);

  const authState = useAuth();

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit() {
    const validation = UserSchema.safeParse(user);

    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        setErrors((prev) => ({ ...prev, [issue.path[0]]: issue.message }));
      });

      return;
    }

    setLoading(true);

    try {
      const createdUser = (await authClient.register(user)).data;
      authState.setUser(createdUser);

      navigate("/");
      toast.info("Successfully registered!");
    } catch (ex) {
      console.log(ex);

      const { msg, type, detail } = ex as APIError;
      const errorText = msg ?? detail?.data?.detail ?? "Registration failed";

      toast.error(type, {
        description: errorText,
      });
    } finally {
      setLoading(false);
    }
  }

  function handleChange({
    target: { name = "", value = "" },
  }: ChangeEvent<HTMLInputElement>) {
    setUser((p) => ({ ...p, [name]: value }));
  }

  return (
    <section className="box max-w-xs mx-auto gap-8">
      <h2 className="card-h2 text-center text-2xl uppercase font-extrabold">
        sign up
      </h2>
      <article className="flex flex-col gap-8">
        <Input>
          <Input.Label>Email</Input.Label>
          <Input.InputElement
            ref={ref}
            name="email"
            type="email"
            value={user.email}
            onChange={handleChange}
            aria-invalid={!!errors.email}
          />
          {errors.email && <Input.Error msg={errors.email} />}
        </Input>

        <Input>
          <Input.Label>password</Input.Label>
          <Input.InputElement
            name="password"
            type="password"
            value={user.password}
            onChange={handleChange}
            aria-invalid={!!errors.password}
          />
          {errors.password && <Input.Error msg={errors.password} />}
        </Input>

        <Input>
          <Input.Label>username</Input.Label>
          <Input.InputElement
            name="username"
            value={user.username}
            onChange={handleChange}
            aria-invalid={!!errors.username}
          />
          {errors.username && <Input.Error msg={errors.username} />}
        </Input>
      </article>

      <article className="flex flex-col gap-4">
        <Button size="md" type="submit" onClick={submit} loading={loading}>
          Register
        </Button>

        <article className="flex items-center justify-center gap-2 text-sm">
          <p className="first-letter:capitalize font-bold">
            already a member !
          </p>
          <Button variant="link">
            <Link to="/auth">Sign in</Link>
          </Button>
        </article>
      </article>
    </section>
  );
}

export default Register;
