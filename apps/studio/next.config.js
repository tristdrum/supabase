const { withSentryConfig } = require('@sentry/nextjs')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// Required for nextjs standalone build
const path = require('path')

const API_URL = new URL(process.env.NEXT_PUBLIC_API_URL).origin
const SUPABASE_URL = new URL(process.env.SUPABASE_URL).origin
const SUPABASE_MISC_PROJECT_URL = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
const SUPABASE_COM_URL = 'https://supabase.com'
const CLOUDFLARE_CDN_URL = 'https://cdnjs.cloudflare.com'
const HCAPTCHA_ASSET_URL = 'https://newassets.hcaptcha.com'
const HCAPTCHA_JS_URL = 'https://js.hcaptcha.com'
const CONFIGCAT_URL = 'https://cdn-global.configcat.com'
const VERCEL_LIVE_URL = 'https://vercel.live'

const csp = [
  ...(process.env.VERCEL_ENV === 'preview'
    ? [
        `default-src 'self' ${API_URL} ${SUPABASE_URL} ${SUPABASE_MISC_PROJECT_URL} ${CONFIGCAT_URL} ${VERCEL_LIVE_URL};`,
        `script-src 'self' 'unsafe-eval' 'unsafe-inline' ${CLOUDFLARE_CDN_URL} ${HCAPTCHA_JS_URL} ${VERCEL_LIVE_URL};`,
        `frame-src 'self' ${HCAPTCHA_ASSET_URL}; ${VERCEL_LIVE_URL}`,
      ]
    : [
        `default-src 'self' ${API_URL} ${SUPABASE_URL} ${SUPABASE_MISC_PROJECT_URL} ${CONFIGCAT_URL};`,
        `script-src 'self' 'unsafe-eval' 'unsafe-inline' ${CLOUDFLARE_CDN_URL} ${HCAPTCHA_JS_URL};`,
        `frame-src 'self' ${HCAPTCHA_ASSET_URL};`,
      ]),
  `style-src 'self' 'unsafe-inline' ${CLOUDFLARE_CDN_URL};`,
  `img-src 'self' blob: data: ${SUPABASE_COM_URL};`,
  `font-src 'self' ${CLOUDFLARE_CDN_URL};`,
  `object-src 'none';`,
  `base-uri 'self';`,
  `form-action 'self';`,
  `frame-ancestors 'none';`,
  `block-all-mixed-content;`,
  ...(process.env.NEXT_PUBLIC_IS_PLATFORM === 'true' &&
  process.env.NEXT_PUBLIC_ENVIRONMENT === 'prod'
    ? [`upgrade-insecure-requests;`]
    : []),
].join(' ')

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  output: 'standalone',
  experimental: {
    // [Kevin] Next polyfills Node modules like Crypto by default, blowing up the bundle size. We use generate-password-browser (safe to use in browser) and the polyfills are not needed for us
    // Revisit on Next 14 upgrade (PR #19909)
    // [Ivan] Temporarily enable until we find a fix for breaking anon-role in the Realtime inspector
    fallbackNodePolyfills: true,
  },
  async redirects() {
    return [
      ...(process.env.NEXT_PUBLIC_IS_PLATFORM === 'true'
        ? [
            {
              source: '/',
              has: [
                {
                  type: 'query',
                  key: 'next',
                  value: 'new-project',
                },
              ],
              destination: '/new/new-project',
              permanent: false,
            },
            {
              source: '/',
              destination: '/projects',
              permanent: false,
            },
            {
              source: '/register',
              destination: '/sign-up',
              permanent: false,
            },
            {
              source: '/signup',
              destination: '/sign-up',
              permanent: false,
            },
            {
              source: '/signin',
              destination: '/sign-in',
              permanent: false,
            },
            {
              source: '/login',
              destination: '/sign-in',
              permanent: false,
            },
            {
              source: '/log-in',
              destination: '/sign-in',
              permanent: false,
            },
          ]
        : [
            {
              source: '/',
              destination: '/project/default',
              permanent: false,
            },
            {
              source: '/register',
              destination: '/project/default',
              permanent: false,
            },
            {
              source: '/signup',
              destination: '/project/default',
              permanent: false,
            },
            {
              source: '/signin',
              destination: '/project/default',
              permanent: false,
            },
            {
              source: '/login',
              destination: '/project/default',
              permanent: false,
            },
            {
              source: '/log-in',
              destination: '/project/default',
              permanent: false,
            },
          ]),
      {
        source: '/project/:ref/auth',
        destination: '/project/:ref/auth/users',
        permanent: true,
      },
      {
        source: '/project/:ref/database',
        destination: '/project/:ref/database/tables',
        permanent: true,
      },
      {
        source: '/project/:ref/database/graphiql',
        destination: '/project/:ref/api/graphiql',
        permanent: true,
      },
      {
        source: '/project/:ref/storage',
        destination: '/project/:ref/storage/buckets',
        permanent: true,
      },
      {
        source: '/project/:ref/settings',
        destination: '/project/:ref/settings/general',
        permanent: true,
      },
      {
        source: '/project/:ref/auth/settings',
        destination: '/project/:ref/auth/users',
        permanent: true,
      },
      {
        source: '/project/:ref/settings/billing/subscription',
        has: [
          {
            type: 'query',
            key: 'panel',
            value: 'subscriptionPlan',
          },
        ],
        destination: '/org/_/billing?panel=subscriptionPlan',
        permanent: true,
      },
      {
        source: '/project/:ref/settings/billing/subscription',
        has: [
          {
            type: 'query',
            key: 'panel',
            value: 'pitr',
          },
        ],
        destination: '/project/:ref/settings/addons?panel=pitr',
        permanent: true,
      },
      {
        source: '/project/:ref/settings/billing/subscription',
        has: [
          {
            type: 'query',
            key: 'panel',
            value: 'computeInstance',
          },
        ],
        destination: '/project/:ref/settings/addons?panel=computeInstance',
        permanent: true,
      },
      {
        source: '/project/:ref/settings/billing/subscription',
        has: [
          {
            type: 'query',
            key: 'panel',
            value: 'customDomain',
          },
        ],
        destination: '/project/:ref/settings/addons?panel=customDomain',
        permanent: true,
      },
      {
        source: '/project/:ref/settings/billing/subscription',
        destination: '/org/_/billing',
        permanent: true,
      },
      {
        source: '/project/:ref/database/api-logs',
        destination: '/project/:ref/logs/edge-logs',
        permanent: true,
      },
      {
        source: '/project/:ref/database/postgres-logs',
        destination: '/project/:ref/logs/postgres-logs',
        permanent: true,
      },
      {
        source: '/project/:ref/database/postgrest-logs',
        destination: '/project/:ref/logs/postgrest-logs',
        permanent: true,
      },
      {
        source: '/project/:ref/database/pgbouncer-logs',
        destination: '/project/:ref/logs/pooler-logs',
        permanent: true,
      },
      {
        source: '/project/:ref/logs/pgbouncer-logs',
        destination: '/project/:ref/logs/pooler-logs',
        permanent: true,
      },
      {
        source: '/project/:ref/database/realtime-logs',
        destination: '/project/:ref/logs/realtime-logs',
        permanent: true,
      },
      {
        source: '/project/:ref/storage/logs',
        destination: '/project/:ref/logs/storage-logs',
        permanent: true,
      },
      {
        source: '/project/:ref/auth/logs',
        destination: '/project/:ref/logs/auth-logs',
        permanent: true,
      },
      {
        source: '/project/:ref/logs-explorer',
        destination: '/project/:ref/logs/explorer',
        permanent: true,
      },
      {
        source: '/project/:ref/sql/templates',
        destination: '/project/:ref/sql',
        permanent: true,
      },
      {
        source: '/org/:slug/settings',
        destination: '/org/:slug/general',
        permanent: true,
      },
      {
        source: '/project/:ref/settings/billing/update',
        destination: '/org/_/billing',
        permanent: true,
      },
      {
        source: '/project/:ref/settings/billing/update/free',
        destination: '/org/_/billing',
        permanent: true,
      },
      {
        source: '/project/:ref/settings/billing/update/pro',
        destination: '/org/_/billing',
        permanent: true,
      },
      {
        source: '/project/:ref/settings/billing/update/team',
        destination: '/org/_/billing',
        permanent: true,
      },
      {
        source: '/project/:ref/settings/billing/update/enterprise',
        destination: '/org/_/billing',
        permanent: true,
      },
      {
        source: '/project/:ref/sql',
        destination: '/project/:ref/sql/new',
        permanent: true,
      },
      ...(process.env.NEXT_PUBLIC_BASE_PATH?.length
        ? [
            {
              source: '/',
              destination: process.env.NEXT_PUBLIC_BASE_PATH,
              basePath: false,
              permanent: false,
            },
          ]
        : []),
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*?)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'no-sniff',
          },
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/img/:slug*',
        headers: [{ key: 'cache-control', value: 'max-age=2592000' }],
      },
      {
        source: '/fonts/:slug*',
        headers: [{ key: 'cache-control', value: 'max-age=2592000' }],
      },
    ]
  },
  images: {
    // to make Vercel avatars work without issue. Vercel uses SVGs for users who don't have set avatars.
    dangerouslyAllowSVG: true,
    domains: [
      'github.com',
      'avatars.githubusercontent.com',
      'api-frameworks.vercel.sh',
      'vercel.com',
    ],
  },
  transpilePackages: ['ui', 'common', 'shared-data'],
  webpack(config) {
    config.module?.rules
      .find((rule) => rule.oneOf)
      .oneOf.forEach((rule) => {
        if (rule.issuer?.and?.[0]?.toString().includes('_app')) {
          const and = rule.issuer.and
          rule.issuer.or = [/[\\/]node_modules[\\/]monaco-editor[\\/]/, { and }]
          delete rule.issuer.and
        }
      })

    return config
  },
  onDemandEntries: {
    maxInactiveAge: 24 * 60 * 60 * 1000,
    pagesBufferLength: 100,
  },
}

// module.exports = withBundleAnalyzer(nextConfig)
// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports =
  process.env.NEXT_PUBLIC_IS_PLATFORM === 'true'
    ? withSentryConfig(
        withBundleAnalyzer(nextConfig),
        {
          silent: true,
        },
        {
          // For all available options, see:
          // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

          // Upload a larger set of source maps for prettier stack traces (increases build time)
          widenClientFileUpload: true,

          // Transpiles SDK to be compatible with IE11 (increases bundle size)
          transpileClientSDK: false,

          // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
          tunnelRoute: '/monitoring',

          // Hides source maps from generated client bundles
          hideSourceMaps: true,

          // Automatically tree-shake Sentry logger statements to reduce bundle size
          disableLogger: true,
        }
      )
    : nextConfig
