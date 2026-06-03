import { Link, useLocation } from "react-router-dom";

import Button from "@/components/ui/Button";

import { useState } from "react";
import { Stack } from "../ui/Stack";
import DrProfileSetup from "@/features/onboarding-doctor/DrProfileSetup";
import Divider from "../ui/Divider";
import { PatientRegister } from "../PatientRegister";

function Register() {
  const { state = {} } = useLocation();
  const [role, setRole] = useState<"doctor" | "patient">(
    state?.role ?? "patient",
  );

  return (
    <section
      className={`form-box mx-auto ${role === "doctor" ? "max-w-md md:max-w-xl" : "max-w-sm"}`}
    >
      <section className="p-8 px-12">
        {role === "doctor" ? <DrProfileSetup /> : <PatientRegister />}
      </section>

      <Stack className="p-4 bg-layout-raised" orientation="V">
        <Stack justify="center">
          <span>Already have an account</span>
          <Link
            to="/auth"
            state={{ role }}
            className="ml-2 text-text-normal hover:underline underline-offset-2 capitalize"
          >
            sign in
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
          className="capitalize text-text-normal w-fit self-center"
        >
          Sign up as a {role === "doctor" ? "patient" : "doctor"}
        </Button>
      </Stack>
    </section>
  );
}

export default Register;
