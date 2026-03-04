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
import { Plan } from "./Plan";

@Table({ tableName: "plan_nodes", underscored: true, timestamps: true })
export class PlanNode extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Plan)
  @Column({ type: DataType.UUID, allowNull: false })
  declare planId: string;

  @BelongsTo(() => Plan)
  declare plan: Plan;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare recipeClassName: string | null;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare buildingClassName: string | null;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: false,
    defaultValue: 1,
  })
  declare machineCount: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: false,
    defaultValue: 100,
  })
  declare overclockPercent: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare useAlternate: boolean;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: false,
    defaultValue: 0,
  })
  declare positionX: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: false,
    defaultValue: 0,
  })
  declare positionY: number;

  @Column({
    type: DataType.ENUM("machine", "resource", "sink"),
    allowNull: false,
    defaultValue: "machine",
  })
  declare nodeType: "machine" | "resource" | "sink";

}
