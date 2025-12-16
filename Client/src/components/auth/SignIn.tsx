import { useNavigate } from "react-router-dom";
import { useState, type ChangeEvent } from "react";

import Input from "@components/common/Input";
import Button from "@components/common/Button";

import { toast } from "sonner";
import { type paths } from "@/types/api";

import authClient from "@/services/Auth";

type LoginUser =
  paths["/auth/login"]["post"]["requestBody"]["content"]["application/json"];

function SignIn() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [user, setUser] = useState<LoginUser>({
    email: "",
    password: "",
  });

  function handleChange({
    target: { name = "", value = "" },
  }: ChangeEvent<HTMLInputElement>) {
    setUser((p) => ({ ...p, [name]: value }));
  }

  async function submit() {
    setLoading(true);

    try {
      await authClient.login(user);
      navigate("/");

      toast.info("Signed in successfully!", {});
    } catch (ex) {
      console.log(ex);

      toast.error("Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <article className="flex flex-col gap-8">
        <Input
          autoFocus
          type="email"
          name="email"
          label="email"
          value={user.email}
          onChange={handleChange}
        />
        <Input
          name="password"
          type="password"
          label="password"
          value={user.password}
          onChange={handleChange}
        />
      </article>
      <article className="flex flex-col gap-3">
        <Button type="submit" size="md" onClick={submit} loading={loading}>
          sign in
        </Button>
      </article>
    </div>
  );
}

export default SignIn;
