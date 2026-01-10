import { motion } from "motion/react";
import type { paths } from "@/types/api";
import { useLoaderData } from "react-router-dom";

import Text from "../common/Text";
import { ArrowRight } from "lucide-react";
import Button from "../common/Button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import APIClient from "@/services/ApiClient";

type User =
  paths["/auth/me"]["get"]["responses"]["200"]["content"]["application/json"];

const UserProfile = () => {
  const profile = useLoaderData<User>();
  const [view, setView] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [profile.id, "appointments"],
    async queryFn() {
      new APIClient(`users/${profile.id}/appointments`).get();
    },
  });

  function handleView() {
    try {
    } catch (error) {}
  }

  return (
    <div>
      <Text bold size="lg" content={profile.username} className="capitalize" />

      <motion.article className="flex items-center gap-4">
        <Text content="view appointments" bold />
        <Button onClick={handleView} variant="icon">
          <ArrowRight />
        </Button>

        {view && <section></section>}
      </motion.article>
    </div>
  );
};

export default UserProfile;
