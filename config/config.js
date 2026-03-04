// Load .env.local first (takes precedence), then fall back to .env
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    dialectOptions: {
      ssl: false,
    },
  },
  test: {
    url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
    dialect: "postgres",
    dialectOptions: {
      ssl: false,
    },
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
