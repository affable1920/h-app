import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import Input from "@components/common/Input";
import Button from "@components/common/Button";
import AuthLayout from "@components/auth/AuthLayout";

import { toast } from "sonner";
import authClient from "@/services/Auth";
import { type paths } from "@/types/api";

type CreateUser =
  paths["/auth/register"]["post"]["requestBody"]["content"]["application/json"];

type DBUser =
  paths["/auth/login"]["post"]["responses"]["200"]["content"]["application/json"];

function Register() {
  const [user, setUser] = useState<CreateUser>({
    email: "",
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit() {
    setLoading(true);

    try {
      await authClient.register(user);
      navigate("/");

      toast.info("Logged in successfully!", {});
    } catch (ex) {
      toast.error("Login failed!");
    }
  }

  function handleChange({
    target: { name = "", value = "" },
  }: ChangeEvent<HTMLInputElement>) {
    setUser((p) => ({ ...p, [name]: value }));
  }

  return (
    <AuthLayout name="Register" submitFn={submit}>
      <article className="flex flex-col gap-8">
        <Input
          name="username"
          type="username"
          label="username"
          onChange={handleChange}
        />
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
        Register
      </Button>
    </AuthLayout>
  );
}

export default Register;
