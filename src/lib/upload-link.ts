import { ApolloLink, Observable } from '@apollo/client';
import { print } from 'graphql';
import Cookies from 'js-cookie';
import { Auth } from './constants';

/**
 * Apollo link that intercepts mutations containing File objects,
 * builds a GraphQL multipart request (per the spec), and sends
 * it directly to the backend with the auth token from cookies.
 *
 * @see https://github.com/jaydenseric/graphql-multipart-request-spec
 */

/** Normalize files from variables.files (array or record) */
function getFilesList(files: unknown): File[] | null {
    if (!files) return null;
    if (Array.isArray(files)) {
        const valid = files.every((f): f is File => f instanceof File);
        return valid && files.length > 0 ? files : null;
    }
    return null;
}

export const uploadLink = new ApolloLink((operation, forward) => {
    const files = getFilesList(operation.variables?.files);

    // No files → pass through to the next link (httpLink)
    if (!files || files.length === 0) {
        return forward(operation);
    }

    return new Observable((observer) => {
        const formData = new FormData();

        // 1. "operations" — the normal GraphQL payload with file slots set to null
        const variables = {
            ...operation.variables,
            files: files.map(() => null),
        };

        formData.append(
            'operations',
            JSON.stringify({
                operationName: operation.operationName,
                query: print(operation.query),
                variables,
            })
        );

        // 2. "map" — tells the server which FormData field maps to which variable path
        const map: Record<string, string[]> = {};
        files.forEach((_, i) => {
            map[i.toString()] = [`variables.files.${i}`];
        });
        formData.append('map', JSON.stringify(map));

        // 3. Actual file blobs keyed by their map index
        files.forEach((file, i) => {
            formData.append(i.toString(), file, file.name);
        });

        // Get auth token directly from cookies
        const token = Cookies.get(Auth.Tokens.AccessToken);

        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        // Do NOT set Content-Type — the browser must set it with the
        // correct multipart boundary when sending FormData.

        const graphqlUri = process.env.NEXT_PUBLIC_GRAPHQL_URI!;

        fetch(graphqlUri, {
            method: 'POST',
            body: formData,
            headers,
        })
            .then((res) => {
                if (!res.ok) {
                    return res.text().then((text) => {
                        throw new Error(
                            `Upload failed (${res.status}): ${text}`
                        );
                    });
                }
                return res.json();
            })
            .then((result) => {
                observer.next(result);
                observer.complete();
            })
            .catch((err) => {
                console.error('Upload link error:', err);
                observer.error(err);
            });
    });
});
