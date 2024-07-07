'use strict'

const bcrypt = require('bcryptjs')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Roles', [
      { name: 'admin' },
      { name: 'viewer' },
      { name: 'user' }
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', null)
  }
}
