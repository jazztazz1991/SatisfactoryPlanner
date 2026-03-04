'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Plutonium Fuel Rod energyValue = 1,500,000 which exceeds DECIMAL(10,4)
    await queryInterface.changeColumn("game_items", "energy_value", {
      type: Sequelize.DECIMAL(15, 4),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("game_items", "energy_value", {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: true,
    });
  }
};
