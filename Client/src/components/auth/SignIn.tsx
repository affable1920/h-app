import { useNavigate } from "react-router-dom";
import { useState, type ChangeEvent } from "react";

import AuthLayout from "./AuthLayout";
import Input from "@components/common/Input";
import Button from "@components/common/Button";

import { type paths } from "@/types/api";

import { toast } from "sonner";
import authClient from "@/services/Auth";

type LoginUser =
  paths["/auth/login"]["post"]["requestBody"]["content"]["application/json"];

type DBUser =
  paths["/auth/login"]["post"]["responses"]["200"]["content"]["application/json"];

function SignIn() {
  const [user, setUser] = useState<LoginUser>({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit() {
    setLoading(true);

    try {
      await authClient.login(user);

      navigate("/");
      toast.info("Logged in successfully!", {});
    } catch (ex) {
      console.log(ex);
      toast.error("Login failed!");
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
    <AuthLayout name="sign in" submitFn={submit}>
      <article className="flex flex-col gap-8">
        <Input
          type="email"
          name="email"
          label="email"
          onChange={handleChange}
        />
        <Input
          name="password"
          type="password"
          label="password"
          onChange={handleChange}
        />
      </article>
      <Button type="submit" size="md" loading={loading}>
        sign in
      </Button>
    </AuthLayout>
  );
}

export default SignIn;
