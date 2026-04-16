const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['p16-sign-sg.tiktokcdn.com', 'p16-sign.tiktokcdn-us.com'],
  },
};

module.exports = withPWA(nextConfig);
