"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("plan_targets", {
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
      item_class_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      target_rate: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
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

    await queryInterface.addIndex("plan_targets", ["plan_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("plan_targets");
  },
};
