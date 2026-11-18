import { PageLayout } from "./routes/PageLayout";
import Spinner from "./ui/Spinner";

export function HydrateFallback() {
  return (
    <PageLayout className="px-12">
      <Spinner size="md" />
    </PageLayout>
  );
}
