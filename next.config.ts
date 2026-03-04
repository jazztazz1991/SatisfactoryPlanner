import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "sequelize",
    "sequelize-typescript",
    "pg",
    "pg-hstore",
    "bcryptjs",
  ],
  turbopack: {
    resolveAlias: {
      // sequelize-typescript has a `browser` field that Turbopack picks up
      // even on the server. Force it to the Node.js bundle.
      "sequelize-typescript": "sequelize-typescript/dist/index.js",
    },
  },
};

export default nextConfig;
