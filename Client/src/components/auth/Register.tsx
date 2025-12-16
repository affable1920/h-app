import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import Input from "@components/common/Input";
import Button from "@components/common/Button";

import { toast } from "sonner";
import authClient from "@/services/Auth";
import { type paths } from "@/types/api";

type CreateUser =
  paths["/auth/register"]["post"]["requestBody"]["content"]["application/json"];

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

      toast.info("Successfully registered!", {});
    } catch (ex) {
      toast.error("Registration failed!");
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
    <div className="flex flex-col gap-8">
      <article className="flex flex-col gap-8">
        <Input
          name="email"
          type="email"
          label="email"
          onChange={handleChange}
        />
        <Input
          name="password"
          type="password"
          label="password"
          onChange={handleChange}
        />
        <Input label="username" name="username" onChange={handleChange} />
      </article>

      <article className="flex flex-col gap-3">
        <Button type="submit" size="md" onSubmit={submit} loading={loading}>
          Register
        </Button>
      </article>
    </div>
  );
}

export default Register;
