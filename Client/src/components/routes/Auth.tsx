import React from "react";
import Button from "../common/Button";
import { Form, Link, useLocation } from "react-router-dom";
import Input from "../common/Input";

const links = [{ path: "auth" }, { path: "register" }];

const Auth = () => {
  const location = useLocation();
  const path = location.pathname.split("/").at(-1);

  return (
    <div className="box mx-auto mt-8 max-w-sm md:max-w-md flex flex-col gap-12 ring-2 ring-slate-200/50">
      <div
        className="flex items-center gap-8 border-2 rounded-md 
      font-black max-w-fit mx-auto py-0.5 px-4"
      >
        {links.map((link) => (
          <Link to={`/${link.path}`}>
            <Button variant="icon" className={"uppercase"}>
              {link.path}
            </Button>
          </Link>
        ))}
      </div>

      <section>
        <Form className="flex flex-col gap-8">
          <Input label="username" />
          <Input type="password" label="password" />

          <Button type="submit" size="md">
            Log in
          </Button>
        </Form>
      </section>
    </div>
  );
};

export default Auth;
