'use client';

import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import type { RootState } from '@/lib/redux';
import { Auth } from '@/lib/constants';
import type { User } from '@/lib/definitions';
import { useLazyQuery } from '@apollo/client/react';
import { useAppDispatch, useAppSelector } from '..';
import { setError, setLoading, setUser } from '@/lib/redux/slices';
import { GET_USER } from '@/app/[locale]/(app)/profile/[id]/_query';
interface GetUserType {
  getUser: User[];
}

function useAuth() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);

  const [fetchUser] = useLazyQuery<GetUserType>(GET_USER, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    const accessToken = Cookies.get(Auth.Tokens.AccessToken);

    if (!accessToken) {
      router.push(process.env.NEXT_PUBLIC_AUTH_URL as string);
      return;
    }

    if (!isAuthenticated) {
      (async () => {
        dispatch(setLoading(true));
        try {
          const { data } = await fetchUser();
          if (!data?.getUser[0]) {
            console.log('User not found in response.');
            dispatch(setError('User not found'));
            return;
          }

          const user = data.getUser[0];
          dispatch(setUser(user));
        } catch {
          dispatch(setError('Auth failed'));
        } finally {
          dispatch(setLoading(false));
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);
}

export { useAuth };
