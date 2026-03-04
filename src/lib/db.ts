import { Sequelize } from "sequelize-typescript";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const isProduction = process.env.NODE_ENV === "production";

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: isProduction
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
  logging: process.env.NODE_ENV === "development" ? console.log : false,
});

export default sequelize;
