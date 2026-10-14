const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const cleanApiUrl = rawApiUrl.trim().replace(/\/+$/, '');
const normalizedApiUrl = cleanApiUrl.endsWith('/api/v1') ? cleanApiUrl : `${cleanApiUrl}/api/v1`;

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: normalizedApiUrl,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Gemelo Digital Infraestructura Verde',
  },
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${normalizedApiUrl.replace(/\/api\/v1$/, '')}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

