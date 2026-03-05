"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("plan_collaborators", {
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
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      role: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "editor",
      },
      invite_token: {
        type: Sequelize.UUID,
        allowNull: true,
        defaultValue: Sequelize.UUIDV4,
      },
      accepted_at: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex("plan_collaborators", ["plan_id"]);
    await queryInterface.addIndex("plan_collaborators", ["user_id"]);
    await queryInterface.addIndex("plan_collaborators", ["invite_token"], {
      unique: true,
      where: { invite_token: { [Sequelize.Op.ne]: null } },
    });
    await queryInterface.addIndex("plan_collaborators", ["plan_id", "user_id"], {
      unique: true,
      where: { user_id: { [Sequelize.Op.ne]: null } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("plan_collaborators");
  },
};
