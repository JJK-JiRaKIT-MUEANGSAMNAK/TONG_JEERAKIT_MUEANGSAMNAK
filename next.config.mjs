/** @type {import('next').NextConfig} */
// Phase 0 remediation (2026-08-10):
// Removed eslint.ignoreDuringBuilds and typescript.ignoreBuildErrors
// so that TypeScript and ESLint errors are surfaced during builds.
// Audit items: Item 1 (ignoreBuildErrors) and Item 2 (ignoreDuringBuilds)
const nextConfig = {
  transpilePackages: [
    '@fullcalendar/react',
    '@fullcalendar/core',
    '@fullcalendar/daygrid',
    '@fullcalendar/timegrid',
    '@fullcalendar/interaction',
  ],
  experimental: {
    optimizePackageImports: ['lucide-react', '@fullcalendar/react', '@fullcalendar/core'],
  },
};

export default nextConfig;
