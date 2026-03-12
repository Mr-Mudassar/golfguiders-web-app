import { uploadLink } from './upload-link';
import Cookies from 'js-cookie';
import { Auth } from './constants';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';


const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URI,
    fetch,
});

const authLink = new ApolloLink((operation, forward) => {
    const token = Cookies.get(Auth.Tokens.AccessToken);

    operation.setContext(({ headers = {} }) => ({
        headers: {
            ...headers,
            ...(token ? { authorization: `Bearer ${token}` } : {}),
            'apollo-require-preflight': 'true',
        },
    }));

    return forward(operation);
});

const cache = new InMemoryCache({
    typePolicies: {
        Query: {
            fields: {
                getPostMediaByPostId: {
                    // Deduplicate media queries: same postId → cache hit
                    merge(existing, incoming) {
                        return incoming;
                    },
                },
            },
        },
        Post: { keyFields: ['postid'] },
        User: { keyFields: ['userid'] },
        Comment: { keyFields: ['comment_id'] },
        PostMedia: { keyFields: ['postmediaid'] },
        BuddyPostRequest: { keyFields: ['created', 'user_id'] },
    },
});
const errorLink = new ErrorLink(({ error }) => {
    if (typeof window === 'undefined') return;

    if (CombinedGraphQLErrors.is(error)) {
        const isUnauthenticated = error.errors.some(
            (err) => err.extensions?.code === 'UNAUTHENTICATED'
        );

        if (isUnauthenticated) {
            let userId = '';
            try {
                const persistedRoot = localStorage.getItem('persist:root');
                if (persistedRoot) {
                    const parsed = JSON.parse(persistedRoot);
                    const authState = JSON.parse(parsed.auth);
                    userId = authState?.user?.userid ?? '';
                }
            } catch { /* ignore parse errors */ }

            const reason = 'session_expired';
            const logoutUrl = `${process.env.NEXT_PUBLIC_AUTH_LOGOUT_URL}&reason=${reason}&userId=${userId}`;
            window.location.href = logoutUrl;
        }
    }
});

// uploadLink must run before httpLink so it can intercept multipart uploads (File objects)
const link = errorLink.concat(ApolloLink.from([authLink, uploadLink, httpLink]));

export const apolloConfig = {
    cache,
    link,
};

export const apolloClient = new ApolloClient({
    cache,
    link,
});