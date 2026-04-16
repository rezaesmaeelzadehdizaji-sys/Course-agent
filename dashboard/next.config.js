/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  outputFileTracingIncludes: {
    '/api/courses/[courseId]/generate-docx': ['./public/images/**/*'],
  },
}

module.exports = nextConfig
