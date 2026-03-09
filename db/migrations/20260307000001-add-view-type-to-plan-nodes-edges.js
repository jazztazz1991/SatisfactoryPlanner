"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("plan_nodes", "view_type", {
      type: Sequelize.STRING(16),
      allowNull: false,
      defaultValue: "graph",
    });
    await queryInterface.addColumn("plan_edges", "view_type", {
      type: Sequelize.STRING(16),
      allowNull: false,
      defaultValue: "graph",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("plan_edges", "view_type");
    await queryInterface.removeColumn("plan_nodes", "view_type");
  },
};
