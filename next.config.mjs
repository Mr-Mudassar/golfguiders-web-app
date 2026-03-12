// import createNextIntlPlugin from 'next-intl/plugin';
// import withBundleAnalyzer from '@next/bundle-analyzer';

// const withNextIntl = createNextIntlPlugin();
// const analyze = withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   experimental: {
//     optimizePackageImports: [
//       'lucide-react',
//       'date-fns',
//       'usehooks-ts',
//       '@vis.gl/react-google-maps',
//     ],
//   },
//   images: {
//     // domains: [
//     //   'golf-app-asserts-dev.b-cdn.net',
//     //   'images.unsplash.com',
//     //   'res.cloudinary.com',
//     //   'storage.googleapis.com',
//     //   'f004.backblazeb2.com',
//     //   'golf-app-asserts.b-cdn.net',
//     //   'golfguiders.com',
//     // ],
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: '**',
//       },

//       // {
//       //   protocol: 'https',
//       //   hostname: 'golf-app-asserts-dev.b-cdn.net',
//       //   pathname: '/**',
//       // },
//       // {
//       //   protocol: 'https',
//       //   hostname: 'storage.googleapis.com',
//       //   pathname: '/**',
//       // },
//       // {
//       //   protocol: 'https',
//       //   hostname: 'storage.cloud.google.com',
//       //   pathname: '/**',
//       // },
//       // {
//       //   protocol: 'https',
//       //   hostname: 'plus.unsplash.com',
//       //   pathname: '/**',
//       // },
//       // {
//       //   protocol: 'https',
//       //   hostname: 'www.lpga.com',
//       //   pathname: '/**',
//       // },
//       // {
//       //   protocol: 'https',
//       //   hostname: 'images.livgolf.com',
//       //   pathname: '/**',
//       // },
//       // {
//       //   protocol: 'https',
//       //   hostname: 'res.cloudinary.com',
//       //   pathname: '/**',
//       // },
//       // {
//       //   protocol: 'https',
//       //   hostname: 'f004.backblazeb2.com',
//       //   pathname: '/**',
//       // },
//       // {
//       //   protocol: 'https',
//       //   hostname: 'golf-app-asserts.b-cdn.net',
//       //   pathname: '/**',
//       // },
//       // {
//       //   protocol: 'https',
//       //   hostname: 'golfguiders.com',
//       //   pathname: '/**',
//       // },
//       // {
//       //   protocol: 'https',
//       //   hostname: 'i.pinimg.com',
//       //   pathname: '/**',
//       // },
//     ],
//   },
// };

// export default analyze(withNextIntl(nextConfig));

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

// Security headers for general pages
const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
];

// Headers for logout-receiver (allows auth domain to embed in iframe)
const logoutReceiverHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Content-Security-Policy',
    value:
      "frame-ancestors 'self' https://auth-dev.golfguiders.com https://auth.golfguiders.com",
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        // Allow auth domain to embed logout-receiver in iframe
        source: '/:locale/logout-receiver',
        headers: logoutReceiverHeaders,
      },
      {
        // All other routes use strict security headers
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
