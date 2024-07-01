'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {}
  }
  User.init({
    username: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING
    },
    phone: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true
    },
    email: {
      allowNull: true,
      type: DataTypes.STRING,
      unique: true
    },
    avatar: {
      allowNull: true,
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    underscored: true,
  });
  return User;
};