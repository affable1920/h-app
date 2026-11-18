import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";
import Button from "./lib/button/Button";
import { PageLayout } from "./routes/PageLayout";

export function WorkspaceBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  if (isRouteErrorResponse(error) && error.status === 403) {
    return (
      <PageLayout>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg ">
              <em>
                {error.status} - {error.statusText}
              </em>
            </h2>
            <p className="text-base text-text-normal">
              <strong>
                <em>You are not authorized to access this resource ..</em>
              </strong>
            </p>
          </div>

          <div className="flex items-center gap-3 grow [&_button]:italic">
            <Button
              size="xs"
              onClick={function () {
                navigate("/app/workspace");
              }}
              color="white"
            >
              Your Workspace
            </Button>
            <Button
              size="xs"
              color="white"
              onClick={function () {
                navigate("/app");
              }}
            >
              Home Page
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  throw error;
}
