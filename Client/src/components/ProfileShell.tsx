import { memo, useState } from "react";
import Spinner from "./ui/Spinner";
import Button from "./ui/Button";
import Code from "./ui/Code";
import { RefreshCcw } from "lucide-react";
import type { QueryObserverResult } from "@tanstack/react-query";
import Badge from "./ui/Badge";
import { Stack } from "./ui/Stack";

interface Props {
  isError: boolean;
  isPending: boolean;
  refetch: () => Promise<QueryObserverResult>;
  children: React.ReactNode;
}

const MAX_RETRY_COUNT = 2;

const ProfileShell = memo(function ({
  isError,
  isPending,
  refetch,
  children,
}: Props) {
  const [retryCount, setRetryCount] = useState(0);

  async function retry() {
    if (retryCount >= MAX_RETRY_COUNT) {
      return;
    }

    await refetch();
    setRetryCount((prev) => (prev += 1));
  }

  if (isError) {
    return (
      <Stack orientation="V" justify="center">
        <h2 className="capitalize tracking-widest truncate">
          error fetching your <Code>profile</Code>. please try later ...
        </h2>
        {retryCount < MAX_RETRY_COUNT ? (
          <Stack orientation="V" gap="xs">
            <Stack justify="center" align="center">
              <p className="text-indicator">Retries left</p>{" "}
              <Badge
                full={false}
                selected
                content={(MAX_RETRY_COUNT - retryCount).toString()}
                className="py-1"
              />
            </Stack>
            <Button variant="ghost" onClick={retry}>
              Try again <RefreshCcw />
            </Button>
          </Stack>
        ) : (
          <p className="text-red-400 text-md">All retries exhausted !</p>
        )}
      </Stack>
    );
  }

  if (isPending) return <Spinner loading />;

  return children;
});

export default ProfileShell;
