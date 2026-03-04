"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("game_items", {
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
      stack_size: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      sink_points: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      energy_value: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      radioactive_decay: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
      },
      is_liquid: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      fluid_color: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      is_raw_resource: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    await queryInterface.addIndex("game_items", ["class_name"], {
      unique: true,
    });
    await queryInterface.addIndex("game_items", ["slug"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("game_items");
  },
};
