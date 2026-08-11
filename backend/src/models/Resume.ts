import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';
import User from './User';

export class Resume extends Model {
  public id!: string;
  public user!: string;
  public versionName!: string;
  public sectionOrder!: string[];
  public name!: string;
  public contact!: string;
  public summary!: string;
  public skills!: string[];
  public experience!: any[];
  public education!: any[];
  public projects!: any[];
  public certifications!: any[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Resume.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      }
    },
    versionName: { type: DataTypes.STRING, defaultValue: 'Base' },
    sectionOrder: { type: DataTypes.JSON, defaultValue: [] },
    name: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    contact: { type: DataTypes.STRING, defaultValue: '' },
    summary: { type: DataTypes.TEXT, defaultValue: '' },
    skills: { type: DataTypes.JSON, defaultValue: [] },
    experience: { type: DataTypes.JSON, defaultValue: [] },
    education: { type: DataTypes.JSON, defaultValue: [] },
    projects: { type: DataTypes.JSON, defaultValue: [] },
    certifications: { type: DataTypes.JSON, defaultValue: [] },
  },
  {
    sequelize,
    tableName: 'resumes',
    timestamps: true,
  }
);

// Define Associations
User.hasMany(Resume, { foreignKey: 'user', onDelete: 'CASCADE' });
Resume.belongsTo(User, { foreignKey: 'user' });

export default Resume;
