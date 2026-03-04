"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("game_buildings", {
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
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      power_consumption: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      power_consumption_exponent: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 1.6,
      },
      manufacturing_speed: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 1.0,
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

    await queryInterface.addIndex("game_buildings", ["class_name"], {
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("game_buildings");
  },
};
