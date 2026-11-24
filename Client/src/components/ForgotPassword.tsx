import Button from "./lib/button/Button";
import { Input } from "./ui/Input";
import { PageLayout } from "./routes/PageLayout";
import { useRef } from "react";
import { toast } from "sonner";
import { useRequestPasswordReset } from "@/hooks/use-auth";

export function ForgotPassword() {
  const { mutateAsync: requestResetLink, isPending: isRequestPending } =
    useRequestPasswordReset();

  const emailref = useRef<HTMLInputElement>(null);

  async function requestForgottenLink() {
    const el = emailref.current;

    if (!el) {
      return;
    }

    const email = el.value.trim();

    try {
      toast.promise(requestResetLink(email), {
        loading: "Sending password reset link ..",
        success: function () {
          el.value = "";
          return "Password reset link sent successfully ..";
        },
        error: function (err) {
          el.value = email;
          return err.message;
        },
        className: "text-sm",
      });
    } catch (ex) {
      console.log(ex);
    }
  }

  return (
    <PageLayout>
      <section className="form-box w-sm max-w-full p-8 py-6">
        <header className="mb-8">
          <h2 className="text-md text-center uppercase">Reset Your Password</h2>
        </header>

        <section className="px-4">
          <div className="space-y-6">
            <Input.Group>
              <Input.Label htmlFor="email">Email Address</Input.Label>
              <Input
                onKeyDown={function (ev) {
                  if (ev.key === "Enter") {
                    requestForgottenLink();
                  }
                }}
                type="email"
                ref={emailref}
                size="xs"
                id="email"
              />
            </Input.Group>

            <Button
              className="w-full"
              size="xs"
              color="white"
              loading={isRequestPending}
              onClick={requestForgottenLink}
            >
              Send reset link
            </Button>
          </div>
        </section>
      </section>
    </PageLayout>
  );
}
