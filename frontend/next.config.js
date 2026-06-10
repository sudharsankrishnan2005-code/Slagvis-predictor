/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["react-plotly.js", "plotly.js"],
  output: "standalone",
};

module.exports = nextConfig;
