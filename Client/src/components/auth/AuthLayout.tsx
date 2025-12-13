import React from "react";
import { Form } from "react-router-dom";

interface AuthLayoutProps {
  name: string;
  submitFn: () => void;
  children: React.ReactNode;
}

function AuthLayout({ children, submitFn, name = "" }: AuthLayoutProps) {
  return (
    <div className="container pt-24">
      <Form
        onSubmit={submitFn}
        className="box max-w-xs md:max-w-sm mx-auto gap-8 px-8 pt-6"
      >
        <h2 className="card-h2 text-center uppercase text-xl font-extrabold">
          {name}
        </h2>
        {children}
      </Form>
    </div>
  );
}

export default AuthLayout;
