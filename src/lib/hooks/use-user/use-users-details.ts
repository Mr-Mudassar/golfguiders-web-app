import type {
  GetUserDetailsType,
  GetUserDetailsVariablesType,
} from '@/app/[locale]/(app)/profile/[id]/_interface';
import { GET_USER } from '@/app/[locale]/(app)/profile/[id]/_query';
import type { User } from '@/lib/definitions';
import { useApolloClient } from '@apollo/client/react';
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

export function useGetUserDetails(ids: string[] = []) {
  const client = useApolloClient();

  // Ensure ids is always an array
  const safeIds = Array.isArray(ids) ? ids : [];

  const results = useQueries({
    queries: safeIds.map((id) => ({
      queryKey: ['user', id],
      queryFn: async (): Promise<User | undefined> => {
        const res = await client.query<
          GetUserDetailsType,
          GetUserDetailsVariablesType
        >({
          query: GET_USER,
          variables: { userId: id },
        });
        return res.data?.getUser?.[0];
      },
      enabled: Boolean(id),
    })),
  });

  const loading = results.some((r) => r.isLoading);

  const usersMap = useMemo(
    () =>
      results.reduce(
        (acc, r) => {
          const user = r.data;
          if (user && user.userid) acc[user.userid] = user;
          return acc;
        },
        {} as Record<string, User>
      ),
    [results]
  );

  const usersArray = useMemo(() => Object.values(usersMap), [usersMap]);

  return { usersMap, usersArray, loading };
}
