import ButtonElement from "./eventElements/Button";
import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

const ErrorBoundary = () => {
  const ex = useRouteError();

  const msg = isRouteErrorResponse(ex)
    ? "404, Invalid url, The url you entered does not exist !"
    : "An unexected error occurred, Please try again later or contact support if the issue persists";

  return (
    <div
      className="flex flex-col justify-center gap-4 font-bold text-2xl p-12 px-6 items-center justify-cenetr
    text-center"
    >
      <h1 className="text-error-dark">{msg}</h1>

      <ButtonElement className="w-fit">
        <Link to="/doctors">Go back to dashboard</Link>
      </ButtonElement>
    </div>
  );
};

export default ErrorBoundary;
