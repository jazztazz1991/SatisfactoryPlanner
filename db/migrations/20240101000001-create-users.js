"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      image: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      provider: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      provider_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      password_hash: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex("users", ["email"], { unique: true });
    await queryInterface.addIndex("users", ["provider", "provider_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  },
};
