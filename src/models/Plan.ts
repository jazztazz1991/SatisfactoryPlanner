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
import { User } from "./User";

@Table({ tableName: "plans", underscored: true, timestamps: true })
export class Plan extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string | null;

  @Column({
    type: DataType.ENUM("graph", "tree"),
    allowNull: false,
    defaultValue: "graph",
  })
  declare viewMode: "graph" | "tree";

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare templateKey: string | null;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare canvasViewport: object | null;

}
