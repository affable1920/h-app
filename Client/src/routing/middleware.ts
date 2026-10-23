import { redirect, type MiddlewareFunction } from "react-router-dom";

import useAuthStore from "@/stores/auth-store";
import type { Role } from "@/types/user";

const WORKSPACE_INDEX = "/app/workspace";

const workspaceHomes = {
  doctor: WORKSPACE_INDEX + "/doctor/personal",
  patient: WORKSPACE_INDEX + "/patient/appointments",
} satisfies Record<Role, string>;

function requireStoredSession() {
  const { token, role } = useAuthStore.getState();

  if (!token || !role) {
    throw redirect("/auth");
  }

  return { token, role };
}

export const authMiddleware: MiddlewareFunction = async (_, next) => {
  requireStoredSession();
  await next();
};

export function workspaceMiddleware(expectedRole: Role): MiddlewareFunction {
  return async function (_, next) {
    const session = requireStoredSession();

    if (session.role !== expectedRole) {
      throw new Response("You cannot access this workspace", {
        status: 403,
        statusText: "Unauthorized",
      });
    }

    await next();
  };
}

export function workspaceRedirect() {
  const { role } = requireStoredSession();
  return redirect(workspaceHomes[role]);
}
