"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("plan_nodes", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      plan_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "plans",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      recipe_class_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      building_class_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      machine_count: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 1,
      },
      overclock_percent: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 100,
      },
      use_alternate: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      position_x: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 0,
      },
      position_y: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 0,
      },
      node_type: {
        type: Sequelize.ENUM("machine", "resource", "sink"),
        allowNull: false,
        defaultValue: "machine",
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

    await queryInterface.addIndex("plan_nodes", ["plan_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("plan_nodes");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_plan_nodes_node_type";'
    );
  },
};
