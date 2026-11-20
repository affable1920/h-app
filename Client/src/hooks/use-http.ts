import queryClient from "@/core/query-client";
import type { APIError } from "@/types/http";
import {
  useQuery,
  useMutation,
  type QueryKey,
  type UseQueryOptions,
  type UseMutationOptions,
  queryOptions,
} from "@tanstack/react-query";

/**
====================================================================================================
 * BUILD TIME: these two functions run ONCE, at module load, when a
resource file (e.g. doctors/hooks.ts) calls them. They never call
a React hook themselves — they just close over config and hand
back a new function. Calling them is NOT bound by Rules of Hooks.
 */

export function createQueryHook<TParams, TData, TError = APIError>(
  keyFn: (params?: TParams) => QueryKey,
  fetchFn: (params?: TParams) => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">,
) {
  // RENDER TIME: the returned function is the HOOK, The only hook-call
  // boundary in the chain.

  return function useResourceQuery(params?: TParams) {
    return useQuery<TData, TError>({
      queryKey: keyFn(params),
      queryFn() {
        return fetchFn(params);
      },
      ...options,
    });
  };
}

export function createMutationHook<
  TData = unknown,
  TVariables = void,
  TError = APIError,
  TContext = unknown,
>(
  mutationFn: (vars: TVariables) => Promise<TData>,
  // given the variables and the result, return the query keys to invalidate
  invalidateKeys?: (vars: TVariables, data: TData) => Array<QueryKey>,
  options?: Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    "mutationFn"
  >,
) {
  return function useResourceMutation() {
    return useMutation<TData, TError, TVariables, TContext>({
      mutationFn,
      ...options,
      onSuccess: async function (data, vars, onMutateResult, context) {
        if (invalidateKeys) {
          const keys = invalidateKeys(vars, data);
          await Promise.all(
            keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
          );
        }

        return options?.onSuccess?.(data, vars, onMutateResult, context);
      },
    });
  };
}

export function createQueryOptions<TParams, TData, TError = APIError>(
  keyFn: (params: TParams) => QueryKey,
  fetchFn: (params: TParams) => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">,
) {
  return function useResourceOptions(params: TParams) {
    return queryOptions({
      queryKey: keyFn(params),
      queryFn() {
        return fetchFn(params);
      },
      ...options,
    });
  };
}
