import { memo } from "react";
import Spinner from "./ui/Spinner";
import Button from "./ui/Button";
import Code from "./ui/Code";
import { RefreshCcw } from "lucide-react";

interface Props {
  isError: boolean;
  isPending: boolean;
  refetch: () => void;
  children: React.ReactNode;
}

const ProfileShell = memo(function ({
  isError,
  isPending,
  refetch,
  children,
}: Props) {
  if (isError) {
    return (
      <div>
        <h2 className="capitalize tracking-widest truncate">
          error fetching your <Code>profile</Code>. please try later ...
        </h2>
        <Button variant="ghost" onClick={refetch}>
          Try again <RefreshCcw />
        </Button>
      </div>
    );
  }

  if (isPending) return <Spinner loading />;

  return <>{children}</>;
});

export default ProfileShell;
