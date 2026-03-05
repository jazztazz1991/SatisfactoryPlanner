"use strict";

const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const dataPath = path.resolve(
      process.cwd(),
      "db/data/satisfactory-data.json"
    );
    const raw = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

    const buildings = Object.values(raw.buildings).map((b) => ({
      id: uuidv4(),
      class_name: b.className,
      slug: b.slug,
      name: b.name,
      description: b.description || null,
      power_consumption:
        b.metadata && b.metadata.powerConsumption !== undefined
          ? b.metadata.powerConsumption
          : null,
      power_consumption_exponent:
        b.metadata && b.metadata.powerConsumptionExponent
          ? b.metadata.powerConsumptionExponent
          : 1.6,
      manufacturing_speed:
        b.metadata && b.metadata.manufacturingSpeed
          ? b.metadata.manufacturingSpeed
          : 1.0,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert("game_buildings", buildings, { ignoreDuplicates: true });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("game_buildings", null, {});
  },
};
