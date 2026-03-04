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

@Table({ tableName: "plan_targets", underscored: true, timestamps: true })
export class PlanTarget extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Plan)
  @Column({ type: DataType.UUID, allowNull: false })
  declare planId: string;

  @BelongsTo(() => Plan)
  declare plan: Plan;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare itemClassName: string;

  @Column({ type: DataType.DECIMAL(10, 4), allowNull: false })
  declare targetRate: number;
}
