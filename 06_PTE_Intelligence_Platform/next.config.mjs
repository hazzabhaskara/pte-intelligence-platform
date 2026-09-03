import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['node:sqlite'],
  outputFileTracingRoot: path.resolve(process.cwd())
};

export default nextConfig;
