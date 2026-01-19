import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState, type ChangeEvent } from "react";

import Input from "@components/common/Input";
import Button from "@components/common/Button";

import { toast } from "sonner";

import authClient from "@/services/Auth";
import type { APIError } from "@/types/errors";
import { type LoginUser, LoginSchema } from "@/schemas";
import { useAuth } from "../providers/AuthProvider";

function SignIn() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const auth = useAuth();

  const [user, setUser] = useState<LoginUser>({
    email: "",
    password: "",
  });

  const [errors, setErrros] = useState<Record<keyof LoginUser, string>>({
    email: "",
    password: "",
  });

  function handleChange({
    target: { name = "", value = "" },
  }: ChangeEvent<HTMLInputElement>) {
    setUser((p) => ({ ...p, [name]: value }));
  }

  async function submit() {
    const validation = LoginSchema.safeParse(user);

    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        setErrros((p) => ({ ...p, [issue.path[0]]: issue.message }));
      });

      return;
    }

    setLoading(true);

    try {
      const authUser = (await authClient.login(user)).data;
      console.log(authUser);

      auth.setUser(authUser);

      console.log("Recieved user after signin ...", authUser);

      navigate("/");
      toast.info("Signed in successfully!");
    } catch (ex) {
      console.log(ex);

      const { type = "", msg = "", detail } = ex as APIError;
      toast.error(type ?? "Sign in failed", { description: type });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="box gap-8 max-w-xs mx-auto">
      <h2 className="card-h2 text-xl text-center uppercase font-extrabold">
        Sign In
      </h2>
      <form className="flex flex-col gap-8" onSubmit={submit}>
        <article className="flex flex-col gap-8">
          <Input>
            <Input.Label>email</Input.Label>
            <Input.InputElement
              autoFocus
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
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
            />
            {errors.password && <Input.Error msg={errors.password} />}
          </Input>
        </article>
        <article className="flex flex-col gap-2">
          <Button size="md" type="submit" onClick={submit} loading={loading}>
            sign in
          </Button>

          <article className="flex items-center justify-between text-sm">
            <p className="first-letter:capitalize font-bold">New here ?</p>
            <Button variant="link">
              <Link to="/auth/register">sign up instead</Link>
            </Button>
          </article>
        </article>
      </form>
    </div>
  );
}

export default SignIn;
