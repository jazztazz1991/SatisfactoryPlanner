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

    // Load all recipe IDs from DB to map className → id
    const dbRecipes = await queryInterface.sequelize.query(
      "SELECT id, class_name FROM game_recipes",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const recipeIdMap = {};
    for (const row of dbRecipes) {
      recipeIdMap[row.class_name] = row.id;
    }

    const ingredients = [];
    const products = [];

    for (const recipe of Object.values(raw.recipes)) {
      const recipeId = recipeIdMap[recipe.className];
      if (!recipeId) continue;

      for (const ing of recipe.ingredients || []) {
        ingredients.push({
          id: uuidv4(),
          recipe_id: recipeId,
          item_class_name: ing.item,
          amount_per_cycle: ing.amount,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      for (const prod of recipe.products || []) {
        products.push({
          id: uuidv4(),
          recipe_id: recipeId,
          item_class_name: prod.item,
          amount_per_cycle: prod.amount,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    // Insert in batches to avoid hitting parameter limits
    const BATCH = 500;
    for (let i = 0; i < ingredients.length; i += BATCH) {
      await queryInterface.bulkInsert(
        "game_recipe_ingredients",
        ingredients.slice(i, i + BATCH),
        {}
      );
    }
    for (let i = 0; i < products.length; i += BATCH) {
      await queryInterface.bulkInsert(
        "game_recipe_products",
        products.slice(i, i + BATCH),
        {}
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("game_recipe_products", null, {});
    await queryInterface.bulkDelete("game_recipe_ingredients", null, {});
  },
};
