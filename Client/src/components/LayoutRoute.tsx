import { PageLayout } from "./routes/PageLayout";
import { Outlet } from "react-router-dom";

export function LayoutRoute() {
  return (
    <PageLayout>
      <Outlet />
    </PageLayout>
  );
}
