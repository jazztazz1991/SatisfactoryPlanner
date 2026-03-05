"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("plans", "share_token", {
      type: Sequelize.UUID,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn("plans", "share_role", {
      type: Sequelize.STRING(20),
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addIndex("plans", ["share_token"], {
      unique: true,
      where: { share_token: { [Sequelize.Op.ne]: null } },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("plans", "share_role");
    await queryInterface.removeColumn("plans", "share_token");
  },
};
