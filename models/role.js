'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.belongsToMany(models.User, {
        through: models.UserRole,
        foreignKey: 'roleId',
        otherKey: 'userId',
        as: 'users'
      })
    }
  }
  Role.init(
    {
      name: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Role',
      tableName: 'Roles',
      underscored: true
    }
  )
  return Role
}
