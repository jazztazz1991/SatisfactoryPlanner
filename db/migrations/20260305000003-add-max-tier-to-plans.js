"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("plans", "max_tier", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 9,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("plans", "max_tier");
  },
};
