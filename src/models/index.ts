import sequelize from "@/lib/db";
import { User } from "./User";
import { GameItem } from "./GameItem";
import { GameBuilding } from "./GameBuilding";
import { GameRecipe } from "./GameRecipe";
import { GameRecipeIngredient } from "./GameRecipeIngredient";
import { GameRecipeProduct } from "./GameRecipeProduct";
import { Plan } from "./Plan";
import { PlanTarget } from "./PlanTarget";
import { PlanNode } from "./PlanNode";
import { PlanEdge } from "./PlanEdge";
import { PlanCollaborator } from "./PlanCollaborator";

const models = [
  User,
  GameItem,
  GameBuilding,
  GameRecipe,
  GameRecipeIngredient,
  GameRecipeProduct,
  Plan,
  PlanTarget,
  PlanNode,
  PlanEdge,
  PlanCollaborator,
];

sequelize.addModels(models);

// @HasMany was removed from parent models to break Turbopack circular import TDZ.
// @BelongsTo on child models only registers one direction; register the reverse here
// after all models are available so eager-loading includes work.
GameRecipe.hasMany(GameRecipeIngredient, { foreignKey: "recipeId", as: "ingredients" });
GameRecipe.hasMany(GameRecipeProduct, { foreignKey: "recipeId", as: "products" });
User.hasMany(Plan, { foreignKey: "userId", as: "plans" });
Plan.hasMany(PlanTarget, { foreignKey: "planId", as: "targets" });
Plan.hasMany(PlanNode, { foreignKey: "planId", as: "nodes" });
Plan.hasMany(PlanEdge, { foreignKey: "planId", as: "edges" });
PlanNode.hasMany(PlanEdge, { foreignKey: "sourceNodeId", as: "outgoingEdges" });
PlanNode.hasMany(PlanEdge, { foreignKey: "targetNodeId", as: "incomingEdges" });
Plan.hasMany(PlanCollaborator, { foreignKey: "planId", as: "collaborators" });

export {
  sequelize,
  User,
  GameItem,
  GameBuilding,
  GameRecipe,
  GameRecipeIngredient,
  GameRecipeProduct,
  Plan,
  PlanTarget,
  PlanNode,
  PlanEdge,
  PlanCollaborator,
};
