'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui';

interface LinkMetadata {
    title?: string;
    description?: string;
    image?: string;
    url: string;
    domain?: string;
}

interface LinkPreviewProps {
    url: string;
    className?: string;
}

const metadataCache = new Map<string, LinkMetadata>();

export const LinkPreview: React.FC<LinkPreviewProps> = ({ url, className }) => {
    const [metadata, setMetadata] = useState<LinkMetadata | null>(
        () => metadataCache.get(url) ?? null
    );
    const [loading, setLoading] = useState(!metadataCache.has(url));
    const [error, setError] = useState(false);

    useEffect(() => {
        if (metadataCache.has(url)) {
            setMetadata(metadataCache.get(url)!);
            setLoading(false);
            return;
        }

        const fetchMetadata = async () => {
            try {
                setLoading(true);
                setError(false);

                const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch metadata');
                }

                const data = await response.json();
                metadataCache.set(url, data);
                setMetadata(data);
            } catch (err) {
                console.error('Error fetching link metadata:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (url) {
            fetchMetadata();
        }
    }, [url]);

    if (loading) {
        return (
            <div className={cn('mt-3 border rounded-lg overflow-hidden', className)}>
                <Skeleton className="w-full h-32" />
                <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                </div>
            </div>
        );
    }

    if (error || !metadata) {
        return null;
    }

    const domain = metadata.domain || new URL(metadata.url).hostname.replace('www.', '');

    return (
        <Link
            href={metadata.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                'mt-3 block border rounded-lg overflow-hidden hover:shadow-md transition-shadow',
                'bg-card text-card-foreground',
                className
            )}
        >
            {metadata.image && (
                <div className="w-full h-48 overflow-hidden bg-muted relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={metadata.image}
                        alt={metadata.title || 'Link preview'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Hide image on error
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </div>
            )}
            <div className="p-3">
                {metadata.title && (
                    <h4 className="font-semibold text-sm mb-1 line-clamp-2">{metadata.title}</h4>
                )}
                {metadata.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {metadata.description}
                    </p>
                )}
                <p className="text-xs text-muted-foreground truncate">{domain}</p>
            </div>
        </Link>
    );
};
