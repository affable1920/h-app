import { Link, useLocation } from "react-router-dom";
import Button from "@/components/lib/button/Button";
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

      <Stack orientation="V" className="p-4 px-8 bg-layout-raised">
        <Stack justify="center" className="text-sm font-bold" gap={16}>
          <span className="inline-flex opacity-90">
            Don't have an account ?
          </span>
          <Link
            to="register"
            state={{ role }}
            className="capitalize text-text-normal underline-offset-4 focus:underline hover:underline 
            hover:text-text transition-colors outline-none focus:text-white"
          >
            Sign up
          </Link>
        </Stack>

        <Divider
          label={{
            text: "OR",
            position: "center",
          }}
        />

        <Button
          onClick={function () {
            setRole(function (p) {
              return p === "doctor" ? "patient" : "doctor";
            });
          }}
          className="self-center"
        >
          {role === "doctor" ? "patient sign in" : "Doctor sign in"}
        </Button>
      </Stack>
    </section>
  );
}

export default SignIn;
