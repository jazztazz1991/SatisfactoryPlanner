"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("plans", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      view_mode: {
        type: Sequelize.ENUM("graph", "tree"),
        allowNull: false,
        defaultValue: "graph",
      },
      template_key: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      canvas_viewport: {
        type: Sequelize.JSONB,
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

    await queryInterface.addIndex("plans", ["user_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("plans");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_plans_view_mode";'
    );
  },
};
