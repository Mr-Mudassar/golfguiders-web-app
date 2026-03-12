import { ApolloClient } from '@apollo/client';
import { apolloClient } from './apollo-config';

const newApolloClient = new ApolloClient({
  ...apolloClient,
  ssrMode: typeof window === 'undefined',
});

export default newApolloClient;