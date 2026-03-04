import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
} from "sequelize-typescript";

@Table({ tableName: "game_recipes", underscored: true, timestamps: true })
export class GameRecipe extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Unique
  @Column({ type: DataType.STRING(255), allowNull: false })
  declare className: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare slug: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare name: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare isAlternate: boolean;

  @Column({ type: DataType.DECIMAL(10, 4), allowNull: false })
  declare timeSeconds: number;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare producedInClass: string | null;

}
