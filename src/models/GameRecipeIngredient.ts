import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { GameRecipe } from "./GameRecipe";

@Table({
  tableName: "game_recipe_ingredients",
  underscored: true,
  timestamps: true,
})
export class GameRecipeIngredient extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => GameRecipe)
  @Column({ type: DataType.UUID, allowNull: false })
  declare recipeId: string;

  @BelongsTo(() => GameRecipe)
  declare recipe: GameRecipe;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare itemClassName: string;

  @Column({ type: DataType.DECIMAL(10, 4), allowNull: false })
  declare amountPerCycle: number;
}
