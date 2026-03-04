import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
} from "sequelize-typescript";

@Table({ tableName: "game_items", underscored: true, timestamps: true })
export class GameItem extends Model {
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

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare stackSize: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare sinkPoints: number | null;

  @Column({ type: DataType.DECIMAL(15, 4), allowNull: true })
  declare energyValue: number | null;

  @Column({ type: DataType.DECIMAL(10, 4), allowNull: true })
  declare radioactiveDecay: number | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare isLiquid: boolean;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare fluidColor: object | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare isRawResource: boolean;
}
