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

    // Build set of raw resource class names
    const rawResourceClassNames = new Set(
      Object.values(raw.resources).map((r) => r.item)
    );

    const items = Object.values(raw.items).map((item) => ({
      id: uuidv4(),
      class_name: item.className,
      slug: item.slug,
      name: item.name,
      description: item.description || null,
      stack_size: item.stackSize || null,
      sink_points: item.sinkPoints || null,
      energy_value:
        item.energyValue !== undefined ? item.energyValue : null,
      radioactive_decay:
        item.radioactiveDecay !== undefined ? item.radioactiveDecay : null,
      is_liquid: item.liquid === true,
      fluid_color:
        item.fluidColor ? JSON.stringify(item.fluidColor) : null,
      is_raw_resource: rawResourceClassNames.has(item.className),
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert("game_items", items, { ignoreDuplicates: true });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("game_items", null, {});
  },
};
