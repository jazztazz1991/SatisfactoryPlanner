import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
} from "sequelize-typescript";

@Table({ tableName: "game_buildings", underscored: true, timestamps: true })
export class GameBuilding extends Model {
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

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string | null;

  @Column({ type: DataType.DECIMAL(10, 4), allowNull: true })
  declare powerConsumption: number | null;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: false,
    defaultValue: 1.6,
  })
  declare powerConsumptionExponent: number;

  @Column({
    type: DataType.DECIMAL(10, 4),
    allowNull: false,
    defaultValue: 1.0,
  })
  declare manufacturingSpeed: number;
}
