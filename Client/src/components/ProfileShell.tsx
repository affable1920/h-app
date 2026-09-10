import { memo } from "react";
import Spinner from "./ui/Spinner";
import Code from "./ui/Code";
import { Stack } from "./ui/Stack";

interface Props {
  isError: boolean;
  isPending: boolean;
  children: React.ReactNode;
}

const ProfileShell = memo(function ({ isError, isPending, children }: Props) {
  if (isPending) return <Spinner />;

  if (isError)
    return (
      <Stack orientation="V" justify="center">
        <h2 className="capitalize tracking-widest truncate">
          error fetching your <Code>profile</Code>. please try later ...
        </h2>
      </Stack>
    );

  return children;
});

export default ProfileShell;
