import type { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface MutationOptions<TData, TResponse = any> {
  mutationFn: (data: TData) => Promise<TResponse>;
  invalidateKeys: (string | number)[];
  successFn?: (response: TResponse) => void;
  errorFn?: (error: AxiosError) => void;
  validationFn?: (data?: any) => string | null | void;
}

export default function useMutationWithValidation<TData, TResponse = any>({
  mutationFn,
  invalidateKeys,
  successFn,
  errorFn,
  validationFn,
}: MutationOptions<TData, TResponse>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn(data: any) {
      if (validationFn) {
        const error = validationFn(data);

        if (error) {
          throw new Error(error);
        }
      }

      return mutationFn(data);
    },

    onSuccess(response) {
      queryClient.invalidateQueries({ queryKey: invalidateKeys });
      successFn?.(response);
    },

    onError(error) {
      errorFn?.(error as AxiosError);
    },
  });
}
