import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
} from "sequelize-typescript";

@Table({ tableName: "users", underscored: true, timestamps: true })
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Unique
  @Column({ type: DataType.STRING(255), allowNull: false })
  declare email: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare name: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare image: string | null;

  @Column({ type: DataType.STRING(50), allowNull: true })
  declare provider: string | null;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare providerId: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare passwordHash: string | null;

}
