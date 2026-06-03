import { Link, useLocation } from "react-router-dom";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { Stack } from "../ui/Stack";
import Divider from "../ui/Divider";
import { PatientSignin } from "../PatientSignin";
import { DrSignin } from "../DoctorSignin";

function SignIn() {
  const { state = {} } = useLocation();
  const [role, setRole] = useState<"doctor" | "patient">(
    state?.role ?? "patient",
  );

  return (
    <section className="form-box max-w-sm">
      <section className="px-12 p-8">
        <header>
          <h2 className="text-xl text-center uppercase mb-8">Sign In</h2>
        </header>

        {role === "doctor" ? <DrSignin /> : <PatientSignin />}
      </section>

      <Stack orientation="V" className="p-4 bg-layout-raised">
        <Stack justify="center">
          <span>Don't have an account</span>
          <Link
            to="register"
            state={{ role }}
            className="capitalize text-text-normal underline-offset-2 focus:underline hover:underline 
            hover:text-text transition-colors"
          >
            Sign up
          </Link>
        </Stack>

        <Divider
          label={{
            text: "OR",
            position: "center",
          }}
          color="secondary"
        />

        <Button
          onClick={function () {
            setRole((p) => (p === "doctor" ? "patient" : "doctor"));
          }}
          className="w-fit self-center"
        >
          {role === "doctor" ? "patient sign in" : "Doctor sign in"}
        </Button>
      </Stack>
    </section>
  );
}

export default SignIn;
