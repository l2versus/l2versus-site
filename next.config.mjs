/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // mysql2 e bcryptjs rodam no server; garante que nao sejam bundlados no client
  serverExternalPackages: ["mysql2", "bcryptjs"],
};

export default nextConfig;
