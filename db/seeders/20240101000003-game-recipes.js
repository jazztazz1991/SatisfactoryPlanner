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

    const recipes = Object.values(raw.recipes).map((r) => ({
      id: uuidv4(),
      class_name: r.className,
      slug: r.slug,
      name: r.name,
      is_alternate: r.alternate === true,
      time_seconds: r.time,
      produced_in_class:
        r.producedIn && r.producedIn.length > 0 ? r.producedIn[0] : null,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert("game_recipes", recipes, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("game_recipes", null, {});
  },
};
