"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("game_recipe_products", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      recipe_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "game_recipes",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      item_class_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      amount_per_cycle: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex("game_recipe_products", ["recipe_id"]);
    await queryInterface.addIndex("game_recipe_products", ["item_class_name"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("game_recipe_products");
  },
};
