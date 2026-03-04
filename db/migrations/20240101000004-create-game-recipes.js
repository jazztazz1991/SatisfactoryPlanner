"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("game_recipes", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      class_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      is_alternate: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      time_seconds: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
      },
      produced_in_class: {
        type: Sequelize.STRING(255),
        allowNull: true,
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

    await queryInterface.addIndex("game_recipes", ["class_name"], {
      unique: true,
    });
    await queryInterface.addIndex("game_recipes", ["produced_in_class"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("game_recipes");
  },
};
