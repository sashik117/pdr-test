import {
  QueryKey,
  UseQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  useSuspenseQuery,
  UseSuspenseQueryOptions,
  useQueryClient,
} from '@tanstack/react-query';

/**
 * Extract query options type without queryKey and queryFn
 */
export type ExtractQueryOptions<Response, Transformed = Response> = Omit<
  UseQueryOptions<Response, Error, Transformed>,
  'queryKey' | 'queryFn'
> & { queryKey?: QueryKey };

/**
 * Extract suspense query options type
 */
export type ExtractSuspenseQueryOptions<
  Response,
  Transformed = Response
> = Omit<
  UseSuspenseQueryOptions<Response, Error, Transformed>,
  'queryKey' | 'queryFn'
> & {
  queryKey?: QueryKey;
  errorResult?: Response;
};

/**
 * Extract mutation options type
 */
export type ExtractMutationOptions<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
> = Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>;

/**
 * Generic request hook for standard queries
 */
export const useRequest = <Response, Transformed = Response, Params = void>(
  queryKey: QueryKey,
  queryFn: (params?: Params) => Promise<Response>,
  options?: {
    params?: Params;
    queryOptions?: ExtractQueryOptions<Response, Transformed>;
  }
) => {
  return {
    ...useQuery({
      queryKey: options?.params
        ? [...queryKey, options.params]
        : queryKey,
      queryFn: () => queryFn(options?.params),
      ...options?.queryOptions,
    }),
    queryKey,
  };
};

/**
 * Generic suspense request hook
 */
export const useSuspenseRequest = <
  Response,
  Transformed = Response,
  Params = void
>(
  queryKey: QueryKey,
  queryFn: (params?: Params) => Promise<Response>,
  options?: {
    params?: Params;
    queryOptions?: ExtractSuspenseQueryOptions<Response, Transformed>;
  }
) => {
  const finalQueryKey = options?.queryOptions?.queryKey || (
    options?.params ? [...queryKey, options.params] : queryKey
  );

  return {
    queryKey: finalQueryKey,
    ...useSuspenseQuery({
      queryKey: finalQueryKey,
      queryFn: async () => {
        if (options?.queryOptions?.errorResult) {
          try {
            return await queryFn(options?.params);
          } catch (error) {
            console.error('Error fetching data:', error);
            return options.queryOptions.errorResult;
          }
        }
        return queryFn(options?.params);
      },
      ...options?.queryOptions,
    }),
  };
};

/**
 * Generic mutation request hook
 */
export const useMutationRequest = <Response, Params = void>(
  mutationFn: (params: Params) => Promise<Response>,
  options?: ExtractMutationOptions<Response, Error, Params, unknown>
) => {
  return useMutation({
    mutationFn,
    ...options,
  });
};

/**
 * Hook factory for creating type-safe query hooks
 */
export const createQueryHook = <Response, Transformed = Response, Params = void>(
  queryKeyFactory: (params?: Params) => QueryKey,
  queryFn: (params?: Params) => Promise<Response>
) => {
  return (options?: {
    params?: Params;
    queryOptions?: ExtractQueryOptions<Response, Transformed>;
  }) => {
    return useRequest<Response, Transformed, Params>(
      queryKeyFactory(options?.params),
      queryFn,
      options
    );
  };
};

/**
 * Hook factory for creating type-safe suspense query hooks
 */
export const createSuspenseQueryHook = <
  Response,
  Transformed = Response,
  Params = void
>(
  queryKeyFactory: (params?: Params) => QueryKey,
  queryFn: (params?: Params) => Promise<Response>
) => {
  return (options?: {
    params?: Params;
    queryOptions?: ExtractSuspenseQueryOptions<Response, Transformed>;
  }) => {
    return useSuspenseRequest<Response, Transformed, Params>(
      queryKeyFactory(options?.params),
      queryFn,
      options
    );
  };
};

/**
 * Hook factory for creating type-safe mutation hooks
 */
export const createMutationHook = <Response, Params = void>(
  mutationFn: (params: Params) => Promise<Response>
) => {
  return (
    options?: ExtractMutationOptions<Response, Error, Params, unknown>
  ) => {
    return useMutationRequest<Response, Params>(mutationFn, options);
  };
};

/**
 * Hook for invalidating queries by key pattern
 */
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  return (queryKey: QueryKey) => {
    queryClient.invalidateQueries({ queryKey });
  };
};

/**
 * Hook for prefetching queries
 */
export const usePrefetchQuery = () => {
  const queryClient = useQueryClient();

  return async <Response, Params = void>(
    queryKey: QueryKey,
    queryFn: (params?: Params) => Promise<Response>,
    params?: Params
  ) => {
    await queryClient.prefetchQuery({
      queryKey: params ? [...queryKey, params] : queryKey,
      queryFn: () => queryFn(params),
    });
  };
};
