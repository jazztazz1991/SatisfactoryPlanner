"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_plan_nodes_node_type" ADD VALUE IF NOT EXISTS 'splitter';`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_plan_nodes_node_type" ADD VALUE IF NOT EXISTS 'merger';`
    );
  },

  async down(queryInterface) {
    // PostgreSQL does not support removing values from an enum type.
    // To fully revert, you would need to recreate the type without these values.
    // This is intentionally left as a no-op.
  },
};
