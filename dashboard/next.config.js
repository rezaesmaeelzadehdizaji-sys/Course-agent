/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  outputFileTracingIncludes: {
    '/api/courses/[courseId]/generate-docx': ['./public/images/**/*', './public/docs/**/*'],
  },
}

module.exports = nextConfig
