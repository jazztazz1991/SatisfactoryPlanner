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
import { PlanNode } from "./PlanNode";

@Table({ tableName: "plan_edges", underscored: true, timestamps: true })
export class PlanEdge extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Plan)
  @Column({ type: DataType.UUID, allowNull: false })
  declare planId: string;

  @BelongsTo(() => Plan)
  declare plan: Plan;

  @ForeignKey(() => PlanNode)
  @Column({ type: DataType.UUID, allowNull: false })
  declare sourceNodeId: string;

  @BelongsTo(() => PlanNode, "sourceNodeId")
  declare sourceNode: PlanNode;

  @ForeignKey(() => PlanNode)
  @Column({ type: DataType.UUID, allowNull: false })
  declare targetNodeId: string;

  @BelongsTo(() => PlanNode, "targetNodeId")
  declare targetNode: PlanNode;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare itemClassName: string;

  @Column({ type: DataType.DECIMAL(10, 4), allowNull: false })
  declare rate: number;
}
