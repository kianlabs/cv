/** @type {import('next').NextConfig} */
const securityHeaders = [
  // Prevent the site from being framed (clickjacking).
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Stop the browser guessing content types.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Limit referrer leakage to other origins.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable powerful features the portfolio does not need.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  // Opt out of cross-origin isolation surprises for embedded assets.
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig = {
  poweredByHeader: false, // hide "X-Powered-By: Next.js"
  experimental: {
    // transformers.js is an OPTIONAL, dev-only embedding provider (lib/embed.ts
    // imports it lazily with webpackIgnore). In production the app embeds via
    // the Gemini API, so no native binary (onnxruntime-node / sharp) should ever
    // be traced into the serverless bundle.
    serverComponentsExternalPackages: ['@huggingface/transformers'],
    // Belt-and-braces: keep the heavy native packages out of the function even
    // if something references them, so the bundle stays far under Vercel's
    // 250 MB limit.
    outputFileTracingExcludes: {
      '/api/chat': [
        'node_modules/onnxruntime-node/**',
        'node_modules/@huggingface/transformers/**',
        'node_modules/sharp/**',
        'node_modules/@img/**',
      ],
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Never cache API responses (dynamic LLM output).
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
