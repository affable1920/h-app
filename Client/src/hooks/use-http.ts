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

export function createQueryHook<TParams, TData>(
  keyFn: (params: TParams) => QueryKey,
  fetchFn: (params: TParams) => Promise<TData>,
) {
  // RENDER TIME: the returned function is the HOOK, The only hook-call
  // boundary in the chain.

  return function useResourceQuery(
    params: TParams,
    options?: Omit<UseQueryOptions<TData>, "queryKey" | "queryFn">,
  ) {
    return useQuery({
      queryKey: keyFn(params),
      queryFn() {
        return fetchFn(params);
      },
      ...options,
    });
  };
}

export function createMutationHook<TVariables, TData>(
  mutationFn: (vars: TVariables) => Promise<TData>,
  // given the variables and the result, return the query keys to invalidate
  invalidateKeys: (vars: TVariables, data: TData) => Array<QueryKey>,
  options?: Omit<UseMutationOptions<TData, APIError, TVariables>, "mutationFn">,
) {
  return function useResourceMutation() {
    return useMutation({
      mutationFn,
      onSuccess(data, vars, onMutateResult, context) {
        invalidateKeys(vars, data).forEach(function (key) {
          queryClient.invalidateQueries({
            queryKey: key,
          });
        });

        options?.onSuccess?.(data, vars, onMutateResult, context);
      },

      onError(error, ...rest) {
        options?.onError?.(error, ...rest);
      },
      ...options,
    });
  };
}

export function createQueryOptions<TParams, TData>(
  keyFn: (params: TParams) => QueryKey,
  fetchFn: (params: TParams) => Promise<TData>,
) {
  return function useResourceOptions(params: TParams) {
    return queryOptions({
      queryKey: keyFn(params),
      queryFn() {
        return fetchFn(params);
      },
    });
  };
}
