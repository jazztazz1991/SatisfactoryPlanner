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
import { User } from "./User";

@Table({ tableName: "plan_collaborators", underscored: true, timestamps: true })
export class PlanCollaborator extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Plan)
  @Column({ type: DataType.UUID, allowNull: false })
  declare planId: string;

  @BelongsTo(() => Plan)
  declare plan: Plan;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  declare userId: string | null;

  @BelongsTo(() => User)
  declare user: User;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare email: string | null;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: "editor" })
  declare role: "editor" | "viewer";

  @Column({ type: DataType.UUID, allowNull: true })
  declare inviteToken: string | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare acceptedAt: Date | null;
}
